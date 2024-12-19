const text = await Bun.file("day18input.txt").text();

type World = string[][];

function createWorld(width: number, height: number) {
  const world: World = [];
  for (let row = 0; row < height; row++) {
    const rowArray: string[] = [];
    for (let col = 0; col < width; col++) {
      rowArray.push(".");
    }
    world.push(rowArray);
  }

  return world;
}

function addFallenBytes(
  world: World,
  fallenBytes: { row: number; col: number }[]
) {
  for (const fallenByte of fallenBytes) {
    world[fallenByte.row][fallenByte.col] = "#";
  }
}

function width(world: World) {
  return world[0].length;
}

function height(world: World) {
  return world.length;
}

type State = {
  row: number;
  col: number;
};
type StateString = `${number},${number}`;

function stateString({ row, col }: State): StateString {
  return `${row},${col}`;
}

function state(stateString: StateString): State {
  const [row, col] = stateString.split(",");
  return {
    row: Number(row),
    col: Number(col),
  };
}

function findPaths(
  world: World,
  start: State,
  goal: State
): {
  minCost: number;
  paths: State[][];
} {
  const costTo = new Map<StateString, number>();
  const prev = new Map<StateString, Set<StateString>>();
  const visited = new Set<StateString>();

  costTo.set(stateString(start), 0);

  const queue: State[] = [start];

  function updateWithEdge(u: State, v: State, uToV: number) {
    const alt = (costTo.get(stateString(u)) ?? Infinity) + uToV;
    if (alt <= (costTo.get(stateString(v)) ?? Infinity)) {
      costTo.set(stateString(v), alt);
      prev.set(
        stateString(v),
        (prev.get(stateString(v)) ?? new Set()).add(stateString(u))
      );
    }
  }

  while (queue.length > 0) {
    const u = queue.splice(0, 1)[0];

    const neighborStates = [
      { row: u.row - 1, col: u.col },
      { row: u.row + 1, col: u.col },
      { row: u.row, col: u.col - 1 },
      { row: u.row, col: u.col + 1 },
    ].filter(
      (state) =>
        state.row >= 0 &&
        state.row < height(world) &&
        state.col >= 0 &&
        state.col < width(world) &&
        world[state.row][state.col] !== "#" &&
        !visited.has(stateString(state))
    );

    for (const neighbor of neighborStates) {
      visited.add(stateString(neighbor));
      queue.push(neighbor);

      updateWithEdge(u, neighbor, 1);
    }
  }

  const minCost = costTo.get(stateString(goal)) ?? Infinity;

  function buildPaths(toState: State, pathSoFar: State[] = []): State[][] {
    if (stateString(toState) === stateString(start))
      return [[...pathSoFar, toState]];

    const previousStates = prev.get(stateString(toState));
    if (!previousStates || previousStates.size === 0) return [];

    return previousStates
      .values()
      .toArray()
      .flatMap((previousState) =>
        buildPaths(state(previousState), [...pathSoFar, toState])
      );
  }

  const paths = buildPaths(goal);

  return { minCost, paths };
}

function printWorld(world: World) {
  for (let row = 0; row < height(world); row++) {
    console.log(world[row].join(""));
  }
}

const fallenBytes = text
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split(",").map(Number))
  .map(([col, row]) => ({ row, col }));

{
  const world = createWorld(71, 71);
  addFallenBytes(world, fallenBytes.slice(0, 1024));
  // printWorld(world);

  const startTile = { row: 0, col: 0 };
  const endTile = { row: height(world) - 1, col: width(world) - 1 };

  const { minCost } = findPaths(world, startTile, endTile);
  console.log("part1Cost", minCost);
}

{
  const world = createWorld(71, 71);

  const startTile = { row: 0, col: 0 };
  const endTile = { row: height(world) - 1, col: width(world) - 1 };

  for (let i = 0; i < fallenBytes.length; i++) {
    addFallenBytes(world, [fallenBytes[i]]);
    const { minCost } = findPaths(world, startTile, endTile);
    if (minCost === Infinity) {
      console.log("part2Byte", i, {
        x: fallenBytes[i].col,
        y: fallenBytes[i].row,
      });
      break;
    }
  }
}
