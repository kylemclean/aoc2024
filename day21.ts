const text = await Bun.file("day21input.txt").text();
const codes = text
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("")) as ReadonlyArray<ReadonlyArray<CodeButton>>;

type Keypad = ReadonlyArray<ReadonlyArray<string>>;

const codeKeypad: Keypad = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  ["", "0", "A"],
];

type CodeButton =
  | "7"
  | "8"
  | "9"
  | "4"
  | "5"
  | "6"
  | "1"
  | "2"
  | "3"
  | "0"
  | "A";

const directionalKeypad: Keypad = [
  ["", "^", "A"],
  ["<", "v", ">"],
];

type DirectionalButton = "^" | "<" | ">" | "v" | "A";

type KeypadState = Readonly<{ keypad: Keypad; row: number; col: number }>;
type State = Readonly<[KeypadState, KeypadState, KeypadState]>;
type StateString =
  `${number},${number}|${number},${number}|${number},${number}`;

function find(keypad: Keypad, button: string) {
  for (let row = 0; row < keypad.length; row++) {
    for (let col = 0; col < keypad[row].length; col++) {
      if (keypad[row][col] === button) return { row, col };
    }
  }

  throw new Error(`No ${button} found`);
}

function stateString(state: State) {
  return state
    .map((keypadState) => `${keypadState.row},${keypadState.col}`)
    .join("|") as StateString;
}

function stateFromString(stateString: StateString) {
  const [row1, col1, row2, col2, row3, col3] = stateString
    .split("|")
    .map(Number);
  return [
    { keypad: codeKeypad, row: row1, col: col1 },
    { keypad: directionalKeypad, row: row2, col: col2 },
    { keypad: directionalKeypad, row: row3, col: col3 },
  ] as State;
}

function validKeypadState({ keypad, row, col }: KeypadState) {
  return (
    row >= 0 &&
    row < keypad.length &&
    col >= 0 &&
    col < keypad[row].length &&
    keypad[row][col]
  );
}

function nextState(
  keypadStates: ReadonlyArray<KeypadState>,
  button: DirectionalButton,
  didCodeButtonPress?: (codeButton: CodeButton) => void
): ReadonlyArray<KeypadState> | undefined {
  const lastState = keypadStates.at(-1);
  if (!lastState) return keypadStates;

  const change = {
    "^": [-1, 0],
    "<": [0, -1],
    ">": [0, 1],
    v: [1, 0],
    A: [0, 0],
  }[button];

  const newLastState = {
    ...lastState,
    row: lastState.row + change[0],
    col: lastState.col + change[1],
  };

  if (!validKeypadState(newLastState)) return undefined;

  if (button === "A") {
    if (newLastState.keypad === codeKeypad) {
      didCodeButtonPress?.(
        newLastState.keypad[newLastState.row][newLastState.col] as CodeButton
      );
    }

    const buttonToPressOnPreviousKeypad = newLastState.keypad[newLastState.row][
      newLastState.col
    ] as DirectionalButton;
    const nextPreviousStates = nextState(
      keypadStates.slice(0, -1),
      buttonToPressOnPreviousKeypad,
      didCodeButtonPress
    );
    if (!nextPreviousStates) return undefined;
    return [...nextPreviousStates, newLastState];
  }

  return [...keypadStates.slice(0, -1), newLastState];
}

function dijkstra(start: State, goal: State) {
  const costTo = new Map<StateString, number>();
  const visited = new Set<StateString>();
  const prev = new Map<
    StateString,
    { state: State; byPressingButton: DirectionalButton }
  >();

  const queue: State[] = [start];
  costTo.set(stateString(start), 0);

  while (queue.length > 0) {
    const current = queue.shift()!;

    const neighborStates = (["^", "<", ">", "v", "A"] as const)
      .map((button) => ({
        button,
        state: nextState(current, button) as State,
      }))
      .filter(
        ({ state }) => state !== undefined && !visited.has(stateString(state))
      );

    for (const neighbor of neighborStates) {
      visited.add(stateString(neighbor.state));
      queue.push(neighbor.state);

      const alt = (costTo.get(stateString(current)) ?? Infinity) + 1;
      if (alt < (costTo.get(stateString(neighbor.state)) ?? Infinity)) {
        costTo.set(stateString(neighbor.state), alt);

        prev.set(stateString(neighbor.state), {
          state: current,
          byPressingButton: neighbor.button,
        } as const);
      }
    }
  }

  const minCost = costTo.get(stateString(goal)) ?? Infinity;

  const path: DirectionalButton[] = [];

  let current = goal;
  while (current !== start) {
    const x = prev.get(stateString(current));
    if (!x) break;
    path.push(x.byPressingButton);
    current = x.state;
  }
  path.reverse();

  return { minCost, path };
}

function doPresses(state: State, buttons: DirectionalButton[] | string) {
  for (const c of buttons)
    state = nextState(state, c as DirectionalButton) as State;
  return state;
}

function complexity(code: ReadonlyArray<CodeButton>) {
  let state: State = [
    { keypad: codeKeypad, row: 3, col: 2 },
    { keypad: directionalKeypad, row: 0, col: 2 },
    { keypad: directionalKeypad, row: 0, col: 2 },
  ];

  const sequence: DirectionalButton[] = [];
  for (const c of code) {
    const { path } = dijkstra(state, [
      { keypad: codeKeypad, ...find(codeKeypad, c) },
      { keypad: directionalKeypad, row: 0, col: 2 },
      { keypad: directionalKeypad, row: 0, col: 2 },
    ]);
    state = doPresses(state, path);
    sequence.push(...path, "A");
    state = doPresses(state, "A");
  }

  console.log(code, sequence.length, sequence.join(""));

  return (
    sequence.length * parseInt(code.slice(0, code.length - 1).join(""), 10)
  );
}

const complexitySum = codes.reduce((acc, code) => acc + complexity(code), 0);
console.log("complexitySum", complexitySum);
