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

type State = `${number},${number},${Direction}`;

function state({
  row,
  col,
  direction,
}: {
  row: number;
  col: number;
  direction: Direction;
}): State {
  return `${row},${col},${direction}`;
}

function minCost(
  world: World,
  start: { row: number; col: number; direction: Direction },
  goal: { row: number; col: number }
): number {
  const costTo = new Map<State, number>();
  const prev = new Map<State, State>();
  const visited = new Set<State>();

  costTo.set(state(start), 0);

  const moveQueue: { row: number; col: number; direction: Direction }[] = [
    start,
  ];
  const rotateQueue: { row: number; col: number; direction: Direction }[] = [];

  function updateWithEdge(
    u: { row: number; col: number; direction: Direction },
    v: { row: number; col: number; direction: Direction },
    uToV: number
  ) {
    const alt = (costTo.get(state(u)) ?? Infinity) + uToV;
    if (alt < (costTo.get(state(v)) ?? Infinity)) {
      costTo.set(state(v), alt);
      prev.set(state(v), state(u));
    }
  }

  while (moveQueue.length > 0 || rotateQueue.length > 0) {
    const u = (moveQueue.length > 0 ? moveQueue : rotateQueue).splice(0, 1)[0];
    visited.add(state(u));

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

    if (world[moved.row][moved.col] !== "#" && !visited.has(state(moved)))
      moveQueue.push(moved);

    if (
      world[rotatedCw.row][rotatedCw.col] !== "#" &&
      !visited.has(state(rotatedCw))
    ) {
      rotateQueue.push(rotatedCw);
    }

    if (
      world[rotatedCcw.row][rotatedCcw.col] !== "#" &&
      !visited.has(state(rotatedCcw))
    ) {
      rotateQueue.push(rotatedCcw);
    }

    updateWithEdge(u, moved, 1);
    updateWithEdge(u, rotatedCw, 1000);
    updateWithEdge(u, rotatedCcw, 1000);
  }

  return Math.min(
    costTo.get(state({ ...goal, direction: "north" })) ?? Infinity,
    costTo.get(state({ ...goal, direction: "east" })) ?? Infinity,
    costTo.get(state({ ...goal, direction: "south" })) ?? Infinity,
    costTo.get(state({ ...goal, direction: "west" })) ?? Infinity
  );
}

const world = readWorld(text.split("\n"));

const startTile = findTile(world, "S");
const endTile = findTile(world, "E");

console.log(minCost(world, { ...startTile, direction: "east" }, endTile));
