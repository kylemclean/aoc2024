const text = await Bun.file("day7input.txt").text();
const lines = text.split("\n").filter(Boolean);
const equations = lines.map((line) => {
  const [left, right] = line.split(":");
  const result = Number(left);
  const operands = right.split(" ").filter(Boolean).map(Number);
  return { result, operands };
});

let sum = 0;

for (const equation of equations) {
  for (let i = 0; i < 2 ** (equation.operands.length - 1); i++) {
    let acc = equation.operands[0];

    for (let j = 1; j < equation.operands.length; j++) {
      const operator = (i >> (j - 1)) & 1 ? "+" : "*";
      const operand = equation.operands[j];
      acc = operator === "+" ? acc + operand : acc * operand;
    }

    if (acc === equation.result) {
      sum += acc;
      break;
    }
  }
}

console.log("sum", sum);
