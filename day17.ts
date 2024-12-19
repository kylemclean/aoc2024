const text = await Bun.file("day17input.txt").text();
const lines = text.split("\n");

function parseRegister(line: string) {
  return BigInt(line.match(/Register .: (?<value>[0-9]+)/)?.groups?.value ?? 0);
}

function parseProgram(line: string) {
  return line.slice(9).split(",").map(BigInt);
}

const registerLines = lines.slice(0, lines.indexOf(""));
const initialRegisters = {
  A: parseRegister(registerLines[0]),
  B: parseRegister(registerLines[1]),
  C: parseRegister(registerLines[2]),
};
type Registers = typeof initialRegisters;

const programLine = lines[lines.indexOf("") + 1];
const program = parseProgram(programLine);

const Opcode: Readonly<Record<string, bigint>> = {
  ADV: 0n,
  BXL: 1n,
  BST: 2n,
  JNZ: 3n,
  BXC: 4n,
  OUT: 5n,
  BDV: 6n,
  CDV: 7n,
};

function comboOperandValue(registers: Registers, operand: bigint) {
  if (operand === 4n) return registers.A;
  else if (operand === 5n) return registers.B;
  else if (operand === 6n) return registers.C;

  return operand;
}

function divideInstruction(registers: Registers, operandData: bigint) {
  const operandValue = comboOperandValue(registers, operandData);
  const denominator = 2n ** operandValue;
  return registers.A / denominator;
}

function executeProgram(program: bigint[], registers: Registers) {
  registers = { ...registers };
  const output: bigint[] = [];
  let instructionPointer = 0;

  while (instructionPointer < program.length) {
    const opcode = program[instructionPointer];
    const operandData = program[instructionPointer + 1];

    if (opcode === Opcode.ADV) {
      registers.A = divideInstruction(registers, operandData);
    } else if (opcode === Opcode.BXL) {
      const operandValue = operandData;
      registers.B = registers.B ^ operandValue;
    } else if (opcode === Opcode.BST) {
      const operand = comboOperandValue(registers, operandData);
      registers.B = operand % 8n;
    } else if (opcode === Opcode.JNZ) {
      const operand = operandData;
      if (registers.A !== 0n) instructionPointer = Number(operand - 2n);
    } else if (opcode === Opcode.BXC) {
      registers.B = registers.B ^ registers.C;
    } else if (opcode === Opcode.OUT) {
      const operand = comboOperandValue(registers, operandData);
      output.push(operand % 8n);
    } else if (opcode === Opcode.BDV) {
      registers.B = divideInstruction(registers, operandData);
    } else if (opcode === Opcode.CDV) {
      registers.C = divideInstruction(registers, operandData);
    }

    instructionPointer += 2;
  }

  return output;
}

console.log("part1", executeProgram(program, initialRegisters).join(","));

function aThatProduces(desiredOutput: bigint[], existingA: bigint) {
  const candidates: bigint[] = [];

  for (let i = 0n; i < 2n ** 3n; i++) {
    const programOutput = executeProgram(program, {
      ...initialRegisters,
      A: existingA + i,
    });

    let matches = true;

    for (
      let j = 0;
      j < Math.max(desiredOutput.length, programOutput.length);
      j++
    ) {
      if (desiredOutput[j] !== programOutput[j]) {
        matches = false;
        break;
      }
    }

    if (matches) candidates.push(i);
  }

  return candidates;
}

function findA(bytesOfProgram = 1, existingA = 0n): bigint[] {
  if (bytesOfProgram > program.length) return [existingA / 2n ** 3n];

  const slice = program.slice(program.length - bytesOfProgram);
  const aThatProducesNumber = aThatProduces(slice, existingA);
  const results = aThatProducesNumber.flatMap((a) =>
    findA(bytesOfProgram + 1, existingA * 2n ** 3n + a * 2n ** 3n)
  );
  return results;
}

const as = findA();
if (as.length === 0) throw new Error("no A");
const A = as.toSorted()[0];

console.log(
  "part2",
  A.toString(),
  executeProgram(program, { ...initialRegisters, A })
);
