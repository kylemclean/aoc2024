const text = await Bun.file("day6input.txt").text();
const grid = text.split("\n").filter(Boolean);
const width = grid[0].length;
const height = grid.length;

function g(row: number, col: number) {
  return grid[row]?.[col];
}

const distinctPositions = new Set<`${number},${number}`>();

interface Guard {
  row: number;
  col: number;
  direction: "^" | "v" | "<" | ">";
}

let guard: Readonly<Guard> = {
  row: 0,
  col: 0,
  direction: "^",
};

function moveGuard(guard: Guard): Guard {
  let desiredRow = guard.row;
  let desiredCol = guard.col;

  if (guard.direction === "^") desiredRow -= 1;
  else if (guard.direction === "v") desiredRow += 1;
  else if (guard.direction === ">") desiredCol += 1;
  else if (guard.direction === "<") desiredCol -= 1;

  if (g(desiredRow, desiredCol) === "#") {
    let newDirection: typeof guard.direction;
    if (guard.direction === "^") newDirection = ">";
    else if (guard.direction === ">") newDirection = "v";
    else if (guard.direction === "v") newDirection = "<";
    else newDirection = "^";
    return { row: guard.row, col: guard.col, direction: newDirection };
  } else {
    return { row: desiredRow, col: desiredCol, direction: guard.direction };
  }
}

for (let row = 0; row < height; row++) {
  for (let col = 0; col < width; col++) {
    if (
      g(row, col) === "^" ||
      g(row, col) === "v" ||
      g(row, col) === ">" ||
      g(row, col) === "<"
    ) {
      guard = {
        row,
        col,
        direction: g(row, col) as typeof guard.direction,
      };
      break;
    }
  }
}

while (true) {
  distinctPositions.add(`${guard.row},${guard.col}`);

  guard = moveGuard(guard);

  if (
    guard.row < 0 ||
    guard.row >= height ||
    guard.col < 0 ||
    guard.col >= width
  )
    break;
}

const distinctPositionCount = distinctPositions.size;
console.log("distinctPositionCount", distinctPositionCount);
