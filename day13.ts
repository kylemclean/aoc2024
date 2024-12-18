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

const machines: Machine[] = [];

for (let i = 0; i + 4 <= lines.length; i += 4) {
  const buttonA = xy(buttonRegex, lines[i]);
  const buttonB = xy(buttonRegex, lines[i + 1]);
  const prize = xy(prizeRegex, lines[i + 2]);
  machines.push({ buttonA, buttonB, prize });
}

const aCost = 3;
const bCost = 1;

function cost(presses: { a: number; b: number } | undefined) {
  return !presses ? 0 : presses.a * aCost + presses.b * bCost;
}

function getPresses(machine: Machine) {
  let best: { a: number; b: number } | undefined = undefined;

  for (let a = 0; a <= 100; a++) {
    for (let b = 0; b <= 100; b++) {
      if (
        a * machine.buttonA.x + b * machine.buttonB.x === machine.prize.x &&
        a * machine.buttonA.y + b * machine.buttonB.y === machine.prize.y &&
        (!best || cost({ a, b }) < cost(best))
      ) {
        best = { a, b };
      }
    }
  }

  return best;
}

const totalCost = machines.reduce(
  (acc, machine) => acc + cost(getPresses(machine)),
  0
);
console.log("totalCost", totalCost);
