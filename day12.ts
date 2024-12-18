const text = await Bun.file("day12input.txt").text();
const grid = text.split("\n").filter(Boolean);
const width = grid[0].length;
const height = grid.length;

function g(row: number, col: number) {
  return grid[row]?.[col];
}

/**
 * Returns the perimeter of the region at (row, col).
 * The plots of the region are added to the plots set.
 * The edges of the region are added to the edges map.
 */
function process(
  row: number,
  col: number,
  type: string,
  plots: Set<`${number},${number}`>,
  edges: Map<`${number},${number}`, number>,
  sourceRow: number = row,
  sourceCol: number = col
): number {
  if (
    row < 0 ||
    row >= height ||
    col < 0 ||
    col >= width ||
    g(row, col) !== type
  ) {
    const edgeDirection = `${row - sourceRow},${col - sourceCol}`;
    const edgeDirectionIndex = ["-1,0", "1,0", "0,-1", "0,1"].indexOf(
      edgeDirection
    );
    edges.set(
      `${sourceRow},${sourceCol}`,
      (edges.get(`${sourceRow},${sourceCol}`) ?? 0) | (1 << edgeDirectionIndex)
    );
    return 1;
  }

  if (plots.has(`${row},${col}`)) return 0;

  plots.add(`${row},${col}`);

  return (
    process(row - 1, col, type, plots, edges, row, col) +
    process(row + 1, col, type, plots, edges, row, col) +
    process(row, col - 1, type, plots, edges, row, col) +
    process(row, col + 1, type, plots, edges, row, col)
  );
}

function getSideCount(edges: Map<`${number},${number}`, number>) {
  let totalSideCount = 0;

  for (let i = 0; i < 4; i++) {
    const edgesFacingThisDirection = new Map(
      edges
        .entries()
        .filter(([position, edgesHere]) => (edgesHere & (1 << i)) !== 0)
    );

    const seen = new Set<`${number},${number}`>();

    function visit(position: `${number},${number}`) {
      if (!edgesFacingThisDirection.has(position) || seen.has(position))
        return 0;

      seen.add(position);
      const [row, col] = position.split(",").map(Number);

      visit(`${row - 1},${col}`);
      visit(`${row + 1},${col}`);
      visit(`${row},${col - 1}`);
      visit(`${row},${col + 1}`);

      return 1;
    }

    for (const [position, edgesHere] of edgesFacingThisDirection) {
      totalSideCount += visit(position);
    }
  }

  return totalSideCount;
}

function produceRegion(row: number, col: number) {
  const type = g(row, col);
  const plots = new Set<`${number},${number}`>();
  const edges = new Map<`${number},${number}`, number>();
  const perimeter = process(row, col, type, plots, edges);
  const sideCount = getSideCount(edges);
  return { type, plots, perimeter, edges, sideCount };
}

function getRegions() {
  let visited = new Set<`${number},${number}`>();
  const regions: ReturnType<typeof produceRegion>[] = [];

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

function calculatePart1TotalPrice() {
  return getRegions().reduce(
    (acc, region) => acc + region.plots.size * region.perimeter,
    0
  );
}

console.log("part1TotalPrice", calculatePart1TotalPrice());

function calculatePart2TotalPrice() {
  return getRegions().reduce(
    (acc, region) => acc + region.plots.size * region.sideCount,
    0
  );
}

console.log("part2TotalPrice", calculatePart2TotalPrice());
