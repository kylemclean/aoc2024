const text = await Bun.file("day24input.txt").text();
const lines = text.split("\n");

const inputLines = lines.slice(0, lines.indexOf("")).filter(Boolean);
const inputs = new Map(
  inputLines.map((line) => {
    const [wire, value] = line.split(": ");
    return [wire, value === "0" ? false : true];
  })
);

type Gate = {
  operator: "AND" | "OR" | "XOR";
  lhs: string;
  rhs: string;
};

const gateLines = lines.slice(lines.indexOf("") + 1).filter(Boolean);
const gates = new Map(
  gateLines.map((line) => {
    const [lhs, operator, rhs, _, wire] = line.split(" ");
    return [wire, { operator, lhs, rhs } as Gate];
  })
);

function memoize<T extends (...args: any[]) => any>(f: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;

    const result = f(...args);
    cache.set(key, result);
    return result;
  } as T;
}

const wireValue = (wire: string): [string[], boolean] => {
  const literal = inputs.get(wire);
  if (literal !== undefined) return [[wire], literal];

  const gate = gates.get(wire);
  if (!gate) throw new Error(`No gate or literal for wire ${wire}`);

  const lhsValue = wireValue(gate.lhs);
  const rhsValue = wireValue(gate.rhs);
  const outValue =
    gate.operator === "AND"
      ? lhsValue[1] && rhsValue[1]
      : gate.operator === "OR"
      ? lhsValue[1] || rhsValue[1]
      : lhsValue[1] !== rhsValue[1];

  return [[...lhsValue[0], ...rhsValue[0], gate.operator], outValue];
};

const zWires = gates
  .keys()
  .filter((wire) => wire.startsWith("z"))
  .toArray();
zWires.sort().reverse();

let z = 0;
for (const wire of zWires) {
  const v = wireValue(wire);
  z *= 2;
  z += v[1] ? 1 : 0;
}

console.log("z", z);

class Tester {
  constructor(private gates: ReadonlyMap<string, Gate>) {}

  prevBitIndex = memoize((bitIndex: string) => {
    const n = parseInt(bitIndex);
    const prev = `${n - 1}`.padStart(bitIndex.length, "0");
    return prev;
  });

  // https://electronics.stackexchange.com/q/492236

  checkZ = memoize((wire: string): string[] => {
    if (!wire.startsWith("z")) return [wire];

    const bitIndex = wire.slice(1);

    if (wire === "z45")
      return this.checkCarry(wire, this.prevBitIndex(bitIndex));

    const gate = this.gates.get(wire);
    if (!gate || gate.operator !== "XOR") return [wire];

    if (bitIndex === "00") {
      if (
        (gate.lhs === "x00" && gate.rhs === "y00") ||
        (gate.rhs === "x00" && gate.lhs === "y00")
      ) {
        return [];
      }

      return [wire];
    }

    const possibilities = [
      [
        ...this.checkXor1(gate.lhs, bitIndex),
        ...this.checkCarry(gate.rhs, this.prevBitIndex(bitIndex)),
      ],
      [
        ...this.checkXor1(gate.rhs, bitIndex),
        ...this.checkCarry(gate.lhs, this.prevBitIndex(bitIndex)),
      ],
    ];

    return possibilities[0].length < possibilities[1].length
      ? possibilities[0]
      : possibilities[1];
  });

  checkXor1 = memoize((wire: string, bitIndex: string): string[] => {
    const gate = this.gates.get(wire);
    if (!gate || gate.operator !== "XOR") return [wire];

    if (
      (gate.lhs === `x${bitIndex}` && gate.rhs === `y${bitIndex}`) ||
      (gate.rhs === `x${bitIndex}` && gate.lhs === `y${bitIndex}`)
    ) {
      return [];
    }

    return [wire];
  });

  checkCarry = memoize((wire: string, bitIndex: string): string[] => {
    if (bitIndex === "00") return this.checkAnd1(wire, bitIndex);

    const gate = this.gates.get(wire);
    if (!gate || gate.operator !== "OR") return [wire];

    if (!this.checkZ(`z${bitIndex}`)) return [];

    const possibilities = [
      [
        ...this.checkAnd2(gate.lhs, bitIndex),
        ...this.checkAnd1(gate.rhs, bitIndex),
      ],
      [
        ...this.checkAnd2(gate.rhs, bitIndex),
        ...this.checkAnd1(gate.lhs, bitIndex),
      ],
    ];

    return possibilities[0].length < possibilities[1].length
      ? possibilities[0]
      : possibilities[1];
  });

  checkAnd2 = memoize((wire: string, bitIndex: string): string[] => {
    const gate = this.gates.get(wire);
    if (!gate || gate.operator !== "AND") return [wire];

    const possibilities = [
      [
        ...this.checkXor1(gate.lhs, bitIndex),
        ...this.checkCarry(gate.rhs, this.prevBitIndex(bitIndex)),
      ],
      [
        ...this.checkXor1(gate.rhs, bitIndex),
        ...this.checkCarry(gate.lhs, this.prevBitIndex(bitIndex)),
      ],
    ];

    return possibilities[0].length < possibilities[1].length
      ? possibilities[0]
      : possibilities[1];
  });

  checkAnd1 = memoize((wire: string, bitIndex: string): string[] => {
    const gate = this.gates.get(wire);
    if (!gate || gate.operator !== "AND") return [wire];

    if (
      (gate.lhs === `x${bitIndex}` && gate.rhs === `y${bitIndex}`) ||
      (gate.rhs === `x${bitIndex}` && gate.lhs === `y${bitIndex}`)
    ) {
      return [];
    }

    return [wire];
  });
}

const swaps: [string, string][] = [];
const swappedGates = new Set<string>();

for (let i = 0; i < zWires.length; i++) {
  const wire = zWires[zWires.length - i - 1];
  const tester = new Tester(gates);
  const bad = tester.checkZ(wire);
  console.log(wire, bad);

  checkSwaps: for (const b of bad) {
    if (swappedGates.has(b)) continue;

    for (const g of gates.keys()) {
      if (g === b) continue;
      if (swappedGates.has(g)) continue;

      const newGates = new Map(gates);
      const bGate = newGates.get(b)!;
      const gGate = newGates.get(g)!;
      newGates.set(b, gGate);
      newGates.set(g, bGate);

      if (new Tester(newGates).checkZ(wire).length === 0) {
        gates.set(b, gGate);
        gates.set(g, bGate);
        swaps.push([b, g]);
        swappedGates.add(b);
        swappedGates.add(g);
        break checkSwaps;
      }
    }
  }
}

console.log("swaps", swaps);
console.log("swappedNodes", swaps.flat().sort().join(","));

let newZ = 0;
for (const wire of zWires) {
  const v = wireValue(wire);
  newZ *= 2;
  newZ += v[1] ? 1 : 0;
}

const xWires = inputs
  .keys()
  .filter((wire) => wire.startsWith("x"))
  .toArray();
xWires.sort().reverse();

let x = 0;
for (const wire of xWires) {
  const v = wireValue(wire);
  x *= 2;
  x += v[1] ? 1 : 0;
}

const yWires = inputs
  .keys()
  .filter((wire) => wire.startsWith("y"))
  .toArray();
yWires.sort().reverse();

let y = 0;
for (const wire of yWires) {
  const v = wireValue(wire);
  y *= 2;
  y += v[1] ? 1 : 0;
}

console.log("newZ", x, "+", y, "===", newZ);
