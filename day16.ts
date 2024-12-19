const text = await Bun.file("day16input.txt").text();

type World = string[];
type Direction = "north" | "south" | "west" | "east";

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

type State = {
  row: number;
  col: number;
  direction: Direction;
};
type StateString = `${number},${number},${Direction}`;

function stateString({ row, col, direction }: State): StateString {
  return `${row},${col},${direction}`;
}

function state(stateString: StateString): State {
  const [row, col, direction] = stateString.split(",");
  return {
    row: Number(row),
    col: Number(col),
    direction: direction as Direction,
  };
}

function findPaths(
  world: World,
  start: State,
  goal: { row: number; col: number }
): {
  minCost: number;
  paths: State[][];
} {
  const costTo = new Map<StateString, number>();
  const prev = new Map<StateString, Set<StateString>>();
  const visited = new Set<StateString>();

  costTo.set(stateString(start), 0);

  const moveQueue: State[] = [start];
  const rotateQueue: State[] = [];

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

  while (moveQueue.length > 0 || rotateQueue.length > 0) {
    const u = (moveQueue.length > 0 ? moveQueue : rotateQueue).splice(0, 1)[0];
    visited.add(stateString(u));

    const moved = {
      north: { row: u.row - 1, col: u.col, direction: u.direction },
      east: { row: u.row, col: u.col + 1, direction: u.direction },
      south: { row: u.row + 1, col: u.col, direction: u.direction },
      west: { row: u.row, col: u.col - 1, direction: u.direction },
    }[u.direction];

    const rotatedCw = {
      north: { row: u.row, col: u.col, direction: "east" as const },
      east: { row: u.row, col: u.col, direction: "south" as const },
      south: { row: u.row, col: u.col, direction: "west" as const },
      west: { row: u.row, col: u.col, direction: "north" as const },
    }[u.direction];

    const rotatedCcw = {
      north: { row: u.row, col: u.col, direction: "west" as const },
      east: { row: u.row, col: u.col, direction: "north" as const },
      south: { row: u.row, col: u.col, direction: "east" as const },
      west: { row: u.row, col: u.col, direction: "south" as const },
    }[u.direction];

    if (world[moved.row][moved.col] !== "#" && !visited.has(stateString(moved)))
      moveQueue.push(moved);

    if (
      world[rotatedCw.row][rotatedCw.col] !== "#" &&
      !visited.has(stateString(rotatedCw))
    ) {
      rotateQueue.push(rotatedCw);
    }

    if (
      world[rotatedCcw.row][rotatedCcw.col] !== "#" &&
      !visited.has(stateString(rotatedCcw))
    ) {
      rotateQueue.push(rotatedCcw);
    }

    updateWithEdge(u, moved, 1);
    updateWithEdge(u, rotatedCw, 1000);
    updateWithEdge(u, rotatedCcw, 1000);
  }

  const goalStates = [
    { ...goal, direction: "north" as const },
    { ...goal, direction: "east" as const },
    { ...goal, direction: "south" as const },
    { ...goal, direction: "west" as const },
  ];

  const minCost = Math.min(
    ...goalStates.map((state) => costTo.get(stateString(state)) ?? Infinity)
  );

  const minCostGoalStates = goalStates.filter(
    (state) => costTo.get(stateString(state)) === minCost
  );

  function buildPaths(toState: State, pathSoFar: State[] = []): State[][] {
    if (stateString(toState) === stateString(start))
      return [[...pathSoFar, toState]];

    const previousStates = prev.get(stateString(toState));
    if (!previousStates || previousStates.size === 0) throw new Error("Uh-oh!");

    return previousStates
      .values()
      .toArray()
      .flatMap((previousState) =>
        buildPaths(state(previousState), [...pathSoFar, toState])
      );
  }

  const paths = minCostGoalStates.flatMap((goalState) => buildPaths(goalState));

  return { minCost, paths };
}

function tilesInPath(path: State[]) {
  return new Set(path.map((state) => `${state.row},${state.col}`));
}

function tilesInAnyPath(paths: State[][]) {
  return paths.map(tilesInPath).reduce((acc, tileSet) => acc.union(tileSet));
}

const world = readWorld(text.split("\n"));

const startTile = findTile(world, "S");
const endTile = findTile(world, "E");

const { minCost, paths } = findPaths(
  world,
  { ...startTile, direction: "east" },
  endTile
);

console.log("minCost", minCost);
console.log("tilesInAnyPathCount", tilesInAnyPath(paths).size);
