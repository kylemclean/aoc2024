const text = await Bun.file("day7input.txt").text();
const lines = text.split("\n").filter(Boolean);
const equations = lines.map((line) => {
  const [left, right] = line.split(":");
  const result = Number(left);
  const operands = right.split(" ").filter(Boolean).map(Number);
  return { result, operands };
});

// https://stackoverflow.com/a/24257996
function permutation<T>(
  options: T[],
  permutationLength: number,
  index: number
) {
  const output: T[] = [];

  for (let i = 0; i < permutationLength; i++) {
    const option = options[index % options.length];
    index = Math.floor(index / options.length);
    output.push(option);
  }

  return output;
}

function calculateSum(
  equations: { result: number; operands: number[] }[],
  allowedOperators: ("+" | "*" | "||")[]
) {
  let sum = 0;

  for (const equation of equations) {
    for (
      let i = 0;
      i < allowedOperators.length ** (equation.operands.length - 1);
      i++
    ) {
      const operators = permutation(
        allowedOperators,
        equation.operands.length - 1,
        i
      );
      let acc = equation.operands[0];

      for (let j = 0; j < operators.length; j++) {
        const operator = operators[j];
        const operand = equation.operands[j + 1];
        acc =
          operator === "+"
            ? acc + operand
            : operator === "*"
            ? acc * operand
            : Number(`${acc}${operand}`);
      }

      if (acc === equation.result) {
        sum += acc;
        break;
      }
    }
  }

  return sum;
}

console.log("sum", calculateSum(equations, ["+", "*"]));
console.log("sumWithConcatenation", calculateSum(equations, ["+", "*", "||"]));
