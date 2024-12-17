const text = await Bun.file("day10input.txt").text();
const lines = text.split("\n").filter(Boolean);
const grid = lines.map((line) => line.split("").map(Number));
const width = grid[0].length;
const height = grid.length;

function g(row: number, col: number) {
  return grid[row]?.[col];
}

type PosString = `${number},${number}`;
const trailheads = new Map<PosString, Set<PosString>>();

function addToMapSet<T, U>(map: Map<T, Set<U>>, key: T, value: U) {
  if (!map.has(key)) map.set(key, new Set<U>());
  map.get(key)?.add(value);
}

function explore(
  trailheadRow: number,
  trailheadCol: number,
  sourceRow: number,
  sourceCol: number,
  row: number,
  col: number,
  seen: Set<PosString> = new Set()
) {
  if (
    row >= 0 &&
    row < height &&
    col >= 0 &&
    col < width &&
    !seen.has(`${row},${col}`) &&
    ((trailheadRow === row && trailheadCol === col) ||
      g(row, col) === g(sourceRow, sourceCol) + 1)
  ) {
    if (g(row, col) === 9) {
      addToMapSet(
        trailheads,
        `${trailheadRow},${trailheadCol}`,
        `${row},${col}`
      );
    }
    seen.add(`${row},${col}`);
    explore(trailheadRow, trailheadCol, row, col, row + 1, col, seen);
    explore(trailheadRow, trailheadCol, row, col, row - 1, col, seen);
    explore(trailheadRow, trailheadCol, row, col, row, col + 1, seen);
    explore(trailheadRow, trailheadCol, row, col, row, col - 1, seen);
  }
}

for (let row = 0; row < height; row++) {
  for (let col = 0; col < width; col++) {
    if (g(row, col) === 0) explore(row, col, row, col, row, col);
  }
}

console.log("trailheads", trailheads);

console.log(
  "totalScore",
  trailheads.values().reduce((total, set) => total + set.size, 0)
);
