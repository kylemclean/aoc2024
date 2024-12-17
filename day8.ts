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
    if (/[a-zA-Z0-9]/.test(frequency))
      nodes.set(frequency, [...(nodes.get(frequency) ?? []), { row, col }]);
  }
}

const antinodes = new Set<`${number},${number}`>();
const antinodesWithHarmonics = new Set<`${number},${number}`>();

for (const [frequency, frequencyNodes] of nodes.entries()) {
  for (let i = 1; i < frequencyNodes.length; i++) {
    for (let j = 0; j < i; j++) {
      const dr = frequencyNodes[i].row - frequencyNodes[j].row;
      const dc = frequencyNodes[i].col - frequencyNodes[j].col;

      for (
        let row = frequencyNodes[i].row, col = frequencyNodes[i].col;
        row >= 0 && row < height && col >= 0 && col < width;
        row += dr, col += dc
      ) {
        antinodesWithHarmonics.add(`${row},${col}`);
        if (
          ((row - frequencyNodes[j].row) / (row - frequencyNodes[i].row) ===
            2 &&
            (col - frequencyNodes[j].col) / (col - frequencyNodes[i].col) ===
              2) ||
          ((row - frequencyNodes[i].row) / (row - frequencyNodes[j].row) ===
            2 &&
            (col - frequencyNodes[i].col) / (col - frequencyNodes[j].col) === 2)
        )
          antinodes.add(`${row},${col}`);
      }

      for (
        let row = frequencyNodes[j].row, col = frequencyNodes[j].col;
        row >= 0 && row < height && col >= 0 && col < width;
        row -= dr, col -= dc
      ) {
        antinodesWithHarmonics.add(`${row},${col}`);
        if (
          ((row - frequencyNodes[j].row) / (row - frequencyNodes[i].row) ===
            2 &&
            (col - frequencyNodes[j].col) / (col - frequencyNodes[i].col) ===
              2) ||
          ((row - frequencyNodes[i].row) / (row - frequencyNodes[j].row) ===
            2 &&
            (col - frequencyNodes[i].col) / (col - frequencyNodes[j].col) === 2)
        )
          antinodes.add(`${row},${col}`);
      }
    }
  }
}

for (let row = 0; row < height; row++) {
  let line = "";
  for (let col = 0; col < width; col++) {
    let char = g(row, col);
    if (char === "." && antinodesWithHarmonics.has(`${row},${col}`)) char = "#";
    line += char;
  }
  console.log(line);
}

console.log("antinodeCount", antinodes.size);
console.log("antinodeCountWithHarmonics", antinodesWithHarmonics.size);
