const text = await Bun.file("day4input.txt").text();
const grid = text.split("\n").filter(Boolean);
const width = grid[0].length;
const height = grid.length;

function g(row: number, col: number) {
  return grid[row]?.[col];
}

let part1Matches = 0;

for (let row = 0; row < height; row++) {
  for (let col = 0; col < width; col++) {
    if (g(row, col) === "X") {
      if (
        g(row, col + 1) === "M" &&
        g(row, col + 2) === "A" &&
        g(row, col + 3) === "S"
      )
        part1Matches += 1;

      if (
        g(row, col - 1) === "M" &&
        g(row, col - 2) === "A" &&
        g(row, col - 3) === "S"
      )
        part1Matches += 1;

      if (
        g(row + 1, col) === "M" &&
        g(row + 2, col) === "A" &&
        g(row + 3, col) === "S"
      )
        part1Matches += 1;

      if (
        g(row - 1, col) === "M" &&
        g(row - 2, col) === "A" &&
        g(row - 3, col) === "S"
      )
        part1Matches += 1;

      if (
        g(row + 1, col + 1) === "M" &&
        g(row + 2, col + 2) === "A" &&
        g(row + 3, col + 3) === "S"
      )
        part1Matches += 1;

      if (
        g(row - 1, col - 1) === "M" &&
        g(row - 2, col - 2) === "A" &&
        g(row - 3, col - 3) === "S"
      )
        part1Matches += 1;

      if (
        g(row + 1, col - 1) === "M" &&
        g(row + 2, col - 2) === "A" &&
        g(row + 3, col - 3) === "S"
      )
        part1Matches += 1;

      if (
        g(row - 1, col + 1) === "M" &&
        g(row - 2, col + 2) === "A" &&
        g(row - 3, col + 3) === "S"
      )
        part1Matches += 1;
    }
  }
}

console.log("part1Matches", part1Matches);

let part2Matches = 0;

for (let row = 1; row < height - 1; row++) {
  for (let col = 1; col < width - 1; col++) {
    if (
      g(row, col) === "A" &&
      ((g(row - 1, col - 1) === "M" && g(row + 1, col + 1) === "S") ||
        (g(row - 1, col - 1) === "S" && g(row + 1, col + 1) === "M")) &&
      ((g(row - 1, col + 1) === "M" && g(row + 1, col - 1) === "S") ||
        (g(row - 1, col + 1) === "S" && g(row + 1, col - 1) === "M"))
    )
      part2Matches += 1;
  }
}

console.log("part2Matches", part2Matches);
