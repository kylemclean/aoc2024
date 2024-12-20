const text = await Bun.file("day20input.txt").text();
const lines = text.split("\n").filter(Boolean);

type World = string[];

function readWorld(lines: string[]) {
  const world = lines.filter(Boolean) as World;
  return world;
}

function width(world: World) {
  return world[0].length;
}

function height(world: World) {
  return world.length;
}

function findTile(world: World, tile: string) {
  for (let row = 0; row < height(world); row++) {
    for (let col = 0; col < width(world); col++) {
      if (world[row][col] === tile) return { row, col };
    }
  }
  throw new Error(`No ${tile} found`);
}

function findCosts(world: World, goal: { row: number; col: number }) {
  const costs = new Map<`${number},${number}`, number>();
  const visited = new Set<`${number},${number}`>();

  costs.set(`${goal.row},${goal.col}`, 0);

  const queue: { row: number; col: number }[] = [goal];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentString = `${current.row},${current.col}` as const;

    for (const [rowChange, colChange] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      if (world[current.row + rowChange][current.col + colChange] === "#")
        continue;

      const neighbor = {
        row: current.row + rowChange,
        col: current.col + colChange,
      };
      const neighborString = `${current.row + rowChange},${
        current.col + colChange
      }` as const;
      if (visited.has(neighborString)) continue;

      visited.add(neighborString);
      queue.push(neighbor);

      const alt = costs.get(currentString)! + 1;
      if (alt < (costs.get(neighborString) ?? Infinity)) {
        costs.set(neighborString, alt);
      }
    }
  }

  return costs;
}

function printWorld(world: World, costs?: Map<`${number},${number}`, number>) {
  const maxCost = costs ? Math.max(...costs.values()) : 0;
  const costCharacters = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  for (let row = 0; row < height(world); row++) {
    let line = "";
    for (let col = 0; col < width(world); col++) {
      const cost = costs?.get(`${row},${col}`);
      line +=
        cost !== undefined && world[row][col] === "."
          ? costCharacters[
              Math.floor((cost / (maxCost + 1)) * costCharacters.length)
            ]
          : world[row][col];
    }
    console.log(line);
  }
}

const world = readWorld(lines);
const startTile = findTile(world, "S");
const endTile = findTile(world, "E");

function neighbors(row: number, col: number) {
  return [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]
    .map(([rowChange, colChange]) => ({
      row: row + rowChange,
      col: col + colChange,
    }))
    .filter(
      ({ row, col }) =>
        row >= 0 && col >= 0 && row < height(world) && col < width(world)
    );
}

function nextAdjacent(
  row: number,
  col: number,
  costs: Map<`${number},${number}`, number>
) {
  return neighbors(row, col)
    .filter(({ row, col }) => world[row][col] !== "#")
    .toSorted(
      (a, b) =>
        costs.get(`${a.row},${a.col}`)! - costs.get(`${b.row},${b.col}`)!
    )[0];
}

function nextByCheating(
  row: number,
  col: number,
  cheatTimeLeft: number,
  costs: Map<`${number},${number}`, number>
): { row: number; col: number; cheatTimeLeft: number }[] {
  const queue = [{ row, col, cheatTimeLeft }];
  const seen = new Set<`${number},${number}`>();
  const nextOptions = [];

  while (queue.length > 0) {
    const item = queue.shift()!;

    if (seen.has(`${item.row},${item.col}`)) continue;
    seen.add(`${item.row},${item.col}`);

    if (item.cheatTimeLeft > 0) {
      queue.push(
        ...neighbors(item.row, item.col).map((x) => ({
          ...x,
          cheatTimeLeft: item.cheatTimeLeft - 1,
        }))
      );
    }

    nextOptions.push(item);
  }

  return nextOptions
    .map((x) => ({
      ...x,
      cost: costs.get(`${x.row},${x.col}`),
    }))
    .filter((x) => x.cost !== undefined)
    .toSorted((a, b) => a.cost! - b.cost!);
}

function findCheatCount(
  cheatLength: number,
  row: number,
  col: number,
  costs: Map<`${number},${number}`, number>,
  maxCost: number
) {
  let timeElapsed = 0;
  let cheatCountUnderThreshold = 0;

  while (true) {
    const cost = costs.get(`${row},${col}`);
    if (cost === undefined) throw new Error(`no cost for ${row},${col}`);

    if (cost === 0) break;

    const whereToCheatTo = nextByCheating(row, col, cheatLength, costs);

    for (const {
      row: neighborRow,
      col: neighborCol,
      cheatTimeLeft,
    } of whereToCheatTo) {
      const costToCheatHere =
        timeElapsed +
        cheatLength -
        cheatTimeLeft +
        costs.get(`${neighborRow},${neighborCol}`)!;
      if (costToCheatHere <= maxCost) {
        cheatCountUnderThreshold++;
      }
    }

    ({ row, col } = nextAdjacent(row, col, costs));
    timeElapsed++;
  }

  return cheatCountUnderThreshold;
}

const costs = findCosts(world, endTile);
// printWorld(world, costs);

const bestDurationWithoutCheating = costs.get(
  `${startTile.row},${startTile.col}`
)!;

console.log(
  "part1",
  findCheatCount(
    2,
    startTile.row,
    startTile.col,
    costs,
    bestDurationWithoutCheating - 100
  )
);

console.log(
  "part2",
  findCheatCount(
    20,
    startTile.row,
    startTile.col,
    costs,
    bestDurationWithoutCheating - 100
  )
);
