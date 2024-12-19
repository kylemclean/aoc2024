const text = await Bun.file("day19input.txt").text();
const lines = text.split("\n").filter(Boolean);

const patterns = lines[0].split(",").map((s) => s.trim());
const designs = lines.slice(1);

const cache = new Map<string, string[] | null>();

function getDesignPatterns(design: string): string[] | null {
  if (design === "") return [];

  const cached = cache.get(design);
  if (cached !== undefined) return cached;

  const result = (() => {
    for (const pattern of patterns) {
      if (design.startsWith(pattern)) {
        const restPatterns = getDesignPatterns(design.slice(pattern.length));
        if (restPatterns) return [pattern, ...restPatterns];
      }
    }

    return null;
  })();

  cache.set(design, result);
  return result;
}

console.log("possibleDesigns", designs.filter(getDesignPatterns).length);
