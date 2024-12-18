const text = await Bun.file("day12input.txt").text();
const grid = text.split("\n").filter(Boolean);
const width = grid[0].length;
const height = grid.length;

function g(row: number, col: number) {
  return grid[row]?.[col];
}

type Region = Readonly<{
  type: string;
  plots: ReadonlySet<`${number},${number}`>;
  perimeter: number;
}>;

function getPerimeterContribution(
  row: number,
  col: number,
  type: string,
  plots: Set<`${number},${number}`>
): number {
  if (row < 0 || row >= height || col < 0 || col >= width) return 1;

  if (g(row, col) !== type) return 1;

  if (plots.has(`${row},${col}`)) return 0;

  plots.add(`${row},${col}`);

  return (
    getPerimeterContribution(row - 1, col, type, plots) +
    getPerimeterContribution(row + 1, col, type, plots) +
    getPerimeterContribution(row, col - 1, type, plots) +
    getPerimeterContribution(row, col + 1, type, plots)
  );
}

function produceRegion(row: number, col: number): Region {
  const type = g(row, col);
  const plots = new Set<`${number},${number}`>();
  const perimeter = getPerimeterContribution(row, col, type, plots);
  return { type, plots, perimeter };
}

function getRegions() {
  let visited = new Set<`${number},${number}`>();
  const regions: Region[] = [];

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (visited.has(`${row},${col}`)) continue;

      const region = produceRegion(row, col);
      regions.push(region);
      visited = visited.union(region.plots);
    }
  }

  return regions;
}

function calculatePrice() {
  return getRegions().reduce(
    (acc, region) => acc + region.plots.size * region.perimeter,
    0
  );
}

console.log("totalPrice", calculatePrice());
