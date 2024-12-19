const text = await Bun.file("day15input.txt").text();
const lines = text.split("\n");

type World = ReadonlyArray<ReadonlyArray<string>>;
type MutableWorld = string[][];
type Move = "^" | "v" | "<" | ">";

function readWorld(lines: string[]): World {
  const world: string[][] = [];

  for (let row = 0; row < lines.length; row++) {
    world.push(lines[row].split(""));
  }

  return world;
}

function readMoves(lines: string[]): ReadonlyArray<Move> {
  const moves: Move[] = [];
  for (const line of lines) {
    for (const char of line) {
      moves.push(char as Move);
    }
  }
  return moves;
}

function copyWorld(world: World): MutableWorld {
  return world.map((row) => [...row]);
}

function widenWorld(sourceWorld: World): World {
  const widenedWorld: string[][] = [];

  for (let row = 0; row < height(sourceWorld); row++) {
    const rowArray: string[] = [];
    for (let col = 0; col < width(sourceWorld); col++) {
      if (sourceWorld[row][col] === "#") {
        rowArray.push("#");
        rowArray.push("#");
      } else if (sourceWorld[row][col] === "O") {
        rowArray.push("[");
        rowArray.push("]");
      } else if (sourceWorld[row][col] === ".") {
        rowArray.push(".");
        rowArray.push(".");
      } else if (sourceWorld[row][col] === "@") {
        rowArray.push("@");
        rowArray.push(".");
      }
    }
    widenedWorld.push(rowArray);
  }

  return widenedWorld;
}

function width(world: World) {
  return world[0].length;
}

function height(world: World) {
  return world.length;
}

function findRobot(world: World) {
  for (let row = 0; row < height(world); row++) {
    for (let col = 0; col < width(world); col++) {
      if (world[row][col] === "@") return { row, col };
    }
  }
  throw new Error("No robot found");
}

function findFreeSpace(
  world: World,
  row: number,
  col: number,
  dRow: number,
  dCol: number
) {
  if (
    row < 0 ||
    row >= height(world) ||
    col < 0 ||
    col >= width(world) ||
    world[row][col] === "#"
  ) {
    return undefined;
  }

  if (world[row][col] === ".") return { row, col };

  return findFreeSpace(world, row + dRow, col + dCol, dRow, dCol);
}

function moveBoxes(
  world: World,
  row: number,
  col: number,
  dRow: number,
  dCol: number
) {
  if (dCol !== 0 && dRow === 0) {
    if (world[row + dRow][col + dCol] === "#") return world;

    if (world[row + dRow][col + dCol] !== ".")
      world = moveBoxes(world, row + dRow, col + dCol, dRow, dCol);

    const newWorld = copyWorld(world);
    newWorld[row + dRow][col + dCol] = world[row][col];
    newWorld[row + dRow][col] = world[row][col - dCol];
    newWorld[row][col] = ".";
    return newWorld;
  } else if (dCol === 0 && dRow !== 0) {
    const originalWorld = world;
    const otherBoxPartColOffset = world[row][col] === "[" ? 1 : -1;

    if (
      world[row + dRow][col + dCol] === "#" ||
      world[row + dRow][col + dCol + otherBoxPartColOffset] === "#"
    ) {
      return world;
    }

    if (world[row + dRow][col + dCol] !== ".")
      world = moveBoxes(world, row + dRow, col + dCol, dRow, dCol);

    if (world[row + dRow][col + dCol + otherBoxPartColOffset] !== ".")
      world = moveBoxes(
        world,
        row + dRow,
        col + dCol + otherBoxPartColOffset,
        dRow,
        dCol
      );

    if (
      world[row + dRow][col + dCol] !== "." ||
      world[row + dRow][col + dCol + otherBoxPartColOffset] !== "."
    ) {
      return originalWorld;
    }

    const newWorld = copyWorld(world);
    newWorld[row + dRow][col + dCol] = world[row][col];
    newWorld[row + dRow][col + dCol + otherBoxPartColOffset] =
      world[row][col + otherBoxPartColOffset];
    newWorld[row][col] = ".";
    newWorld[row][col + otherBoxPartColOffset] = ".";
    return newWorld;
  }

  throw new Error("not implemented");
}

function moveRobot(world: World, move: Move) {
  const [dRow, dCol] =
    move === "^"
      ? [-1, 0]
      : move === "v"
      ? [1, 0]
      : move === ">"
      ? [0, 1]
      : [0, -1];
  const { row: robotRow, col: robotCol } = findRobot(world);

  const freeSpace = findFreeSpace(
    world,
    robotRow + dRow,
    robotCol + dCol,
    dRow,
    dCol
  );

  if (!freeSpace) return world;

  if (freeSpace.row !== robotRow + dRow || freeSpace.col !== robotCol + dCol) {
    world = moveBoxes(world, robotRow + dRow, robotCol + dCol, dRow, dCol);
  }

  if (world[robotRow + dRow][robotCol + dCol] !== ".") return world;

  let newWorld = copyWorld(world);
  newWorld[robotRow + dRow][robotCol + dCol] = newWorld[robotRow][robotCol];
  newWorld[robotRow][robotCol] = ".";

  return newWorld;
}

function executeMoves(world: World, moves: ReadonlyArray<Move>) {
  for (const move of moves) {
    world = moveRobot(world, move);
    // console.log("\n" + move);
    // printWorld(world);
  }

  return world;
}

function gps(row: number, col: number) {
  return 100 * row + col;
}

function totalBoxGps(world: World) {
  let total = 0;

  for (let row = 0; row < height(world); row++) {
    for (let col = 0; col < width(world); col++) {
      if (world[row][col] === "O" || world[row][col] === "[") {
        total += gps(row, col);
      }
    }
  }

  return total;
}

function printWorld(world: World) {
  for (let row = 0; row < height(world); row++) {
    let line = "";
    for (let col = 0; col < width(world); col++) {
      line += world[row][col];
    }
    console.log(line);
  }
}

let world = readWorld(lines.slice(0, lines.indexOf("")));
const moves = readMoves(lines.slice(lines.indexOf("") + 1));

// printWorld(world);

// world = executeMoves(world, moves);

// console.log("totalBoxGps", totalBoxGps(world));

let widenedWorld = widenWorld(world);

// printWorld(widenWorld(world));

widenedWorld = executeMoves(widenedWorld, moves);

console.log("widenedTotalBoxGps", totalBoxGps(widenedWorld));
