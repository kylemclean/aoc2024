const text = await Bun.file("day6input.txt").text();
const grid = text.split("\n").filter(Boolean);
const width = grid[0].length;
const height = grid.length;

function g(row: number, col: number) {
  return grid[row]?.[col];
}

interface Guard {
  row: number;
  col: number;
  direction: "^" | "v" | "<" | ">";
}

function serializeGuard(guard: Guard) {
  return `${guard.row},${guard.col},${guard.direction}` as const;
}

function desiredPosition(guard: Guard) {
  let desiredRow = guard.row;
  let desiredCol = guard.col;

  if (guard.direction === "^") desiredRow -= 1;
  else if (guard.direction === "v") desiredRow += 1;
  else if (guard.direction === ">") desiredCol += 1;
  else if (guard.direction === "<") desiredCol -= 1;

  return { desiredRow, desiredCol };
}

function moveGuard(
  guard: Guard,
  { additionalObstruction } = {
    additionalObstruction: undefined as
      | undefined
      | { row: number; col: number },
  }
): Guard {
  const { desiredRow, desiredCol } = desiredPosition(guard);

  if (
    g(desiredRow, desiredCol) === "#" ||
    (additionalObstruction &&
      additionalObstruction.row === desiredRow &&
      additionalObstruction.col === desiredCol)
  ) {
    let newDirection: typeof guard.direction;
    if (guard.direction === "^") newDirection = ">";
    else if (guard.direction === ">") newDirection = "v";
    else if (guard.direction === "v") newDirection = "<";
    else newDirection = "^";
    return { row: guard.row, col: guard.col, direction: newDirection };
  } else {
    return { row: desiredRow, col: desiredCol, direction: guard.direction };
  }
}

function moveGuardUntilDone(
  guard: Guard,
  { additionalObstruction } = {
    additionalObstruction: undefined as
      | undefined
      | { row: number; col: number },
  }
) {
  const guardStates = new Set<ReturnType<typeof serializeGuard>>();

  while (true) {
    guardStates.add(serializeGuard(guard));
    const newGuard = moveGuard(guard, { additionalObstruction });

    if (
      newGuard.row < 0 ||
      newGuard.row >= height ||
      newGuard.col < 0 ||
      newGuard.col >= width
    )
      return {
        terminalGuard: guard,
        guardStates,
        reason: "leftGrid" as const,
      };

    if (guardStates.has(serializeGuard(newGuard)))
      return {
        terminalGuard: guard,
        guardStates,
        reason: "alreadyWasHere" as const,
      };

    guard = newGuard;
  }
}

function findGuard(): Guard {
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (
        g(row, col) === "^" ||
        g(row, col) === "v" ||
        g(row, col) === ">" ||
        g(row, col) === "<"
      ) {
        return {
          row,
          col,
          direction: g(row, col) as Guard["direction"],
        };
      }
    }
  }
  throw new Error("No guard found");
}

const initialGuard = findGuard();

const result = moveGuardUntilDone(initialGuard);
if (result.reason === "alreadyWasHere") throw new Error("There is a loop");

const distinctPositions = new Set(
  result.guardStates
    .values()
    .map((guard) => guard.slice(0, guard.lastIndexOf(",")))
);

const distinctPositionCount = distinctPositions.size;
console.log("distinctPositionCount", distinctPositionCount);

let addedObstructionCount = 0;

for (let row = 0; row < height; row++) {
  for (let col = 0; col < width; col++) {
    if (row === initialGuard.row && col === initialGuard.col) continue;
    if (
      moveGuardUntilDone(initialGuard, { additionalObstruction: { row, col } })
        .reason === "alreadyWasHere"
    ) {
      addedObstructionCount += 1;
    }
  }
}

console.log("addedObstructionCount", addedObstructionCount);
