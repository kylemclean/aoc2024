const text = await Bun.file("day24input.txt").text();
const lines = text.split("\n");

const literalWireValueLines = lines.slice(0, lines.indexOf("")).filter(Boolean);
const literalWireValues = new Map(
  literalWireValueLines.map((line) => {
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

const wireValue = memoize((wire: string): boolean => {
  const literal = literalWireValues.get(wire);
  if (literal !== undefined) return literal;

  const gate = gates.get(wire);
  if (!gate) throw new Error(`No gate or literal for wire ${wire}`);

  if (gate.operator === "AND") {
    return wireValue(gate.lhs) && wireValue(gate.rhs);
  } else if (gate.operator === "OR") {
    return wireValue(gate.lhs) || wireValue(gate.rhs);
  } else if (gate.operator === "XOR") {
    return wireValue(gate.lhs) !== wireValue(gate.rhs);
  }

  throw new Error(`Unknown operator ${gate.operator} for wire ${wire}`);
});

const zWires = gates
  .keys()
  .filter((wire) => wire.startsWith("z"))
  .toArray();
zWires.sort().reverse();

let z = 0;
for (const wire of zWires) {
  z *= 2;
  z += wireValue(wire) ? 1 : 0;
}

console.log("z", z);
