const text = await Bun.file("day15input.txt").text();
const lines = text.split("\n");

const grid: string[][] = [];
type Move = "^" | "v" | "<" | ">";
const moves: Move[] = [];

let robotRow = 0;
let robotCol = 0;

let finishedGrid = false;

for (let row = 0; row < lines.length; row++) {
  if (!finishedGrid) {
    if (lines[row]) {
      grid.push(lines[row].split(""));
      const robotIndexInLine = lines[row].indexOf("@");
      if (robotIndexInLine >= 0) {
        robotRow = row;
        robotCol = robotIndexInLine;
      }
    } else {
      finishedGrid = true;
    }
  } else {
    for (const char of lines[row]) moves.push(char as Move);
  }
}

const width = grid[0].length;
const height = grid.length;

function g(row: number, col: number) {
  return grid[row]?.[col];
}

function findFreeSpace(row: number, col: number, dRow: number, dCol: number) {
  if (
    row < 0 ||
    row >= height ||
    col < 0 ||
    col >= width ||
    g(row, col) === "#"
  )
    return undefined;
  if (g(row, col) === ".") return { row, col };
  return findFreeSpace(row + dRow, col + dCol, dRow, dCol);
}

function moveRobot(move: Move) {
  const [dRow, dCol] =
    move === "^"
      ? [-1, 0]
      : move === "v"
      ? [1, 0]
      : move === ">"
      ? [0, 1]
      : [0, -1];
  const freeSpace = findFreeSpace(robotRow + dRow, robotCol + dCol, dRow, dCol);
  if (freeSpace) {
    grid[freeSpace.row][freeSpace.col] = grid[robotRow + dRow][robotCol + dCol];
    grid[robotRow + dRow][robotCol + dCol] = grid[robotRow][robotCol];
    grid[robotRow][robotCol] = ".";
    robotRow = robotRow + dRow;
    robotCol = robotCol + dCol;
  }

  // console.log("\n" + move);
  // printGrid();
}

function executeMoves(moves: Move[]) {
  for (const move of moves) moveRobot(move);
}

function gps(row: number, col: number) {
  return 100 * row + col;
}

function totalBoxGps() {
  let total = 0;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (g(row, col) === "O") total += gps(row, col);
    }
  }

  return total;
}

function printGrid() {
  for (let row = 0; row < height; row++) {
    let line = "";
    for (let col = 0; col < width; col++) {
      line += g(row, col);
    }
    console.log(line);
  }
}

// printGrid();
executeMoves(moves);

console.log("totalBoxGps", totalBoxGps());
