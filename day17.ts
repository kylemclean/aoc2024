const text = await Bun.file("day17input.txt").text();
const lines = text.split("\n");

function parseRegister(line: string) {
  return Number(line.match(/Register .: (?<value>[0-9]+)/)?.groups?.value ?? 0);
}

function parseProgram(line: string) {
  return line.slice(9).split(",").map(Number);
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

const Opcode: Readonly<Record<string, number>> = {
  ADV: 0,
  BXL: 1,
  BST: 2,
  JNZ: 3,
  BXC: 4,
  OUT: 5,
  BDV: 6,
  CDV: 7,
};

function comboOperandValue(registers: Registers, operand: number) {
  if (operand === 4) return registers.A;
  else if (operand === 5) return registers.B;
  else if (operand === 6) return registers.C;

  return operand;
}

function divideInstruction(registers: Registers, operandData: number) {
  const operandValue = comboOperandValue(registers, operandData);
  const denominator = 1 << operandValue;
  return Math.floor(registers.A / denominator);
}

function executeProgram(
  program: number[],
  registers: { A: number; B: number; C: number }
) {
  registers = { ...registers };
  const output: number[] = [];
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
      registers.B = operand % 8;
    } else if (opcode === Opcode.JNZ) {
      const operand = operandData;
      if (registers.A !== 0) instructionPointer = operand - 2;
    } else if (opcode === Opcode.BXC) {
      registers.B = registers.B ^ registers.C;
    } else if (opcode === Opcode.OUT) {
      const operand = comboOperandValue(registers, operandData);
      output.push(operand % 8);
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

for (let a = 1; ; a++) {
  // console.log(a);
  const registers = { ...initialRegisters, A: a };
  const output = executeProgram(program, registers);

  let outputMatchesProgram = true;
  for (let i = 0; i < Math.max(output.length, program.length); i++) {
    11;
    if (output[i] !== program[i]) {
      outputMatchesProgram = false;
      break;
    }
  }

  if (outputMatchesProgram) {
    console.log("part2", a);
    break;
  }
}
