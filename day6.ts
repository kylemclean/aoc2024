const text = await Bun.file("day6input.txt").text();
const grid = text.split("\n").filter(Boolean);
const width = grid[0].length;
const height = grid.length;

function g(row: number, col: number) {
  return grid[row]?.[col];
}

const distinctPositions = new Set<`${number},${number}`>();

let guardRow = 0;
let guardCol = 0;
let guardDirection: "^" | "v" | "<" | ">" = "^";

function moveGuard(row: number, col: number) {
  if (g(row, col) === "#") {
    if (guardDirection === "^") guardDirection = ">";
    else if (guardDirection === ">") guardDirection = "v";
    else if (guardDirection === "v") guardDirection = "<";
    else if (guardDirection === "<") guardDirection = "^";
  } else {
    guardRow = row;
    guardCol = col;
  }
}

for (let row = 0; row < height; row++) {
  for (let col = 0; col < width; col++) {
    if (
      g(row, col) === "^" ||
      g(row, col) === "v" ||
      g(row, col) === ">" ||
      g(row, col) === "<"
    ) {
      guardRow = row;
      guardCol = col;
      guardDirection = g(row, col) as typeof guardDirection;
      break;
    }
  }
}

while (true) {
  distinctPositions.add(`${guardRow},${guardCol}`);

  if (guardDirection === "^") moveGuard(guardRow - 1, guardCol);
  else if (guardDirection === "v") moveGuard(guardRow + 1, guardCol);
  else if (guardDirection === ">") moveGuard(guardRow, guardCol + 1);
  else if (guardDirection === "<") moveGuard(guardRow, guardCol - 1);

  if (guardRow < 0 || guardRow >= height || guardCol < 0 || guardCol >= width)
    break;
}

const distinctPositionCount = distinctPositions.size;
console.log("distinctPositionCount", distinctPositionCount);
