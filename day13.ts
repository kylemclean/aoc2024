const text = await Bun.file("day13input.txt").text();
const lines = text.split("\n");

interface Machine {
  buttonA: { x: number; y: number };
  buttonB: { x: number; y: number };
  prize: { x: number; y: number };
}

function xy(regex: RegExp, line: string) {
  const match = line.match(regex);
  if (!match?.groups) throw new Error(`invalid line: ${line}`);

  return {
    x: Number(match.groups.x),
    y: Number(match.groups.y),
  };
}

const buttonRegex = /Button [AB]: X\+(?<x>[0-9]+), Y\+(?<y>[0-9]+)/;
const prizeRegex = /Prize: X=(?<x>[0-9]+), Y=(?<y>[0-9]+)/;

const part1Machines: Machine[] = [];

for (let i = 0; i + 4 <= lines.length; i += 4) {
  const buttonA = xy(buttonRegex, lines[i]);
  const buttonB = xy(buttonRegex, lines[i + 1]);
  const prize = xy(prizeRegex, lines[i + 2]);
  part1Machines.push({ buttonA, buttonB, prize });
}

const aCost = 3;
const bCost = 1;

function cost(presses: { a: number; b: number } | undefined) {
  return !presses ? 0 : presses.a * aCost + presses.b * bCost;
}

function getPart1Presses(machine: Machine) {
  for (let a = 0; a <= 100; a++) {
    for (let b = 0; b <= 100; b++) {
      if (
        a * machine.buttonA.x + b * machine.buttonB.x === machine.prize.x &&
        a * machine.buttonA.y + b * machine.buttonB.y === machine.prize.y
      ) {
        return { a, b };
      }
    }
  }
}

const part1TotalCost = part1Machines.reduce(
  (acc, machine) => acc + cost(getPart1Presses(machine)),
  0
);
console.log("part1TotalCost", part1TotalCost);

function getPart2Presses(machine: Machine) {
  // aPresses * machine.buttonA.x + bPresses * machine.buttonB.x === machine.prize.x
  // aPresses * machine.buttonA.y + bPresses * machine.buttonB.y === machine.prize.y
  //
  // Cramer's rule
  //
  // dc = | machine.buttonA.x   machine.buttonB.x |
  //      | machine.buttonA.y   machine.buttonB.y |
  //
  // aPresses * dc = | machine.prize.x   machine.buttonB.x |
  //                 | machine.prize.y   machine.buttonB.y |
  //
  // bPresses * dc = | machine.buttonA.x   machine.prize.x |
  //                 | machine.buttonA.y   machine.prize.y |
  //
  // This simple solution works because the button vectors are never collinear or negative on the axes,
  // so if there is a solution, it must be unique.
  //
  // Were this not the case, perhaps solving a system of linear Diophantine equations would work.
  // https://en.wikipedia.org/wiki/Diophantine_equation#System_of_linear_Diophantine_equations

  const dc =
    machine.buttonA.x * machine.buttonB.y -
    machine.buttonB.x * machine.buttonA.y;

  const aPresses =
    (machine.prize.x * machine.buttonB.y -
      machine.buttonB.x * machine.prize.y) /
    dc;
  const bPresses =
    (machine.buttonA.x * machine.prize.y -
      machine.prize.x * machine.buttonA.y) /
    dc;

  if (Number.isInteger(aPresses) && Number.isInteger(bPresses))
    return { a: aPresses, b: bPresses };

  return undefined;
}

const part2Machines = part1Machines.map((machine) => ({
  ...machine,
  prize: {
    x: machine.prize.x + 10000000000000,
    y: machine.prize.y + 10000000000000,
  },
}));

const part2TotalCost = part2Machines.reduce(
  (acc, machine) => acc + cost(getPart2Presses(machine)),
  0
);
console.log("part2TotalCost", part2TotalCost);
