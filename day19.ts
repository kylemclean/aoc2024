const text = await Bun.file("day19input.txt").text();
const lines = text.split("\n").filter(Boolean);

const patterns = lines[0].split(",").map((s) => s.trim());
const designs = lines.slice(1);

const waysCache = new Map<string, number>();

function getDesignPatternWays(design: string): number {
  if (design === "") return 1;

  const cached = waysCache.get(design);
  if (cached !== undefined) return cached;

  let ways = 0;

  for (const pattern of patterns) {
    if (!design.startsWith(pattern)) continue;
    const restWays = getDesignPatternWays(design.slice(pattern.length));
    ways += restWays;
  }

  waysCache.set(design, ways);
  return ways;
}

console.log(
  "part1PossibleDesigns",
  designs.filter((design) => getDesignPatternWays(design) > 0).length
);

console.log(
  "part2PossibleDesigns",
  designs.reduce((acc, design) => acc + getDesignPatternWays(design), 0)
);

const sequenceCache = new Map<string, string[][]>();

function getDesignPatternSequences(design: string): string[][] {
  console.log(design);
  if (design === "") return [[]];

  const cached = sequenceCache.get(design);
  if (cached !== undefined) return cached;

  const sequences: string[][] = [];

  for (const pattern of patterns) {
    if (!design.startsWith(pattern)) continue;
    const restPatterns = getDesignPatternSequences(
      design.slice(pattern.length)
    );
    for (const restPattern of restPatterns) {
      sequences.push([pattern, ...restPattern]);
    }
  }

  sequenceCache.set(design, sequences);
  return sequences;
}
