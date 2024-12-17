const text = await Bun.file("day8input.txt").text();
const grid = text.split("\n").filter(Boolean);
const width = grid[0].length;
const height = grid.length;

function g(row: number, col: number) {
  return grid[row]?.[col];
}

const nodes: Map<string, { row: number; col: number }[]> = new Map();

for (let row = 0; row < height; row++) {
  for (let col = 0; col < width; col++) {
    const frequency = g(row, col);
    if (frequency === ".") continue;

    if (frequency !== ".")
      nodes.set(frequency, [...(nodes.get(frequency) ?? []), { row, col }]);
  }
}

const antinodes = new Set<`${number},${number}`>();

for (let row = 0; row < height; row++) {
  for (let col = 0; col < width; col++) {
    for (const [frequency, frequencyNodes] of nodes.entries()) {
      const frequencyNodeVectors = frequencyNodes.map((node) => ({
        row: node.row - row,
        col: node.col - col,
      }));
      for (let i = 1; i < frequencyNodeVectors.length; i++) {
        for (let j = 0; j < i; j++) {
          if (
            (frequencyNodeVectors[i].row / frequencyNodeVectors[j].row === 2 &&
              frequencyNodeVectors[i].col / frequencyNodeVectors[j].col ===
                2) ||
            (frequencyNodeVectors[i].row / frequencyNodeVectors[j].row ===
              0.5 &&
              frequencyNodeVectors[i].col / frequencyNodeVectors[j].col === 0.5)
          ) {
            antinodes.add(`${row},${col}`);
          }
        }
      }
    }
  }
}

const antinodeCount = antinodes.size;
console.log("antinodeCount", antinodeCount);
