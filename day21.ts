const text = await Bun.file("day21input.txt").text();
const codes = text.split("\n").filter(Boolean);

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

const codeTransitions: Record<string, Record<string, string[]>> = {
  "0": {
    "0": [""],
    "1": ["^<"],
    "2": ["^"],
    "3": ["^>", ">^"],
    "4": ["^^<"],
    "5": ["^^"],
    "6": ["^^>", ">^^"],
    "7": ["^^^<"],
    "8": ["^^^"],
    "9": ["^^^>", ">^^^"],
    A: [">"],
  },
  "1": {
    "0": [">v"],
    "1": [""],
    "2": [">"],
    "3": [">>"],
    "4": ["^"],
    "5": ["^>", ">^"],
    "6": ["^>>", ">>^"],
    "7": ["^^"],
    "8": ["^^>", ">^^"],
    "9": ["^^>>", ">>^^"],
    A: [">>v"],
  },
  "2": {
    "0": ["v"],
    "1": ["<"],
    "2": [""],
    "3": [">"],
    "4": ["^<", "<^"],
    "5": ["^"],
    "6": ["^>", ">^"],
    "7": ["^^<", "<^^"],
    "8": ["^^"],
    "9": ["^^>", ">^^"],
    A: [">v", "v>"],
  },
  "3": {
    "0": ["<v", "v<"],
    "1": ["<<"],
    "2": ["<"],
    "3": [""],
    "4": ["^<<", "<<^"],
    "5": ["^<", "<^"],
    "6": ["^"],
    "7": ["^^<<", "<<^^"],
    "8": ["^^<", "<^^"],
    "9": ["^^"],
    A: ["v"],
  },
  "4": {
    "0": [">vv"],
    "1": ["v"],
    "2": [">v", "v>"],
    "3": [">>v", "v>>"],
    "4": [""],
    "5": [">"],
    "6": [">>"],
    "7": ["^"],
    "8": ["^>", ">^"],
    "9": ["^>>", ">>^"],
    A: [">>vv"],
  },
  "5": {
    "0": ["vv"],
    "1": ["<v", "v<"],
    "2": ["v"],
    "3": [">v", "v>"],
    "4": ["<"],
    "5": [""],
    "6": [">"],
    "7": ["^<", "<^"],
    "8": ["^"],
    "9": ["^>", ">^"],
    A: [">vv", "vv>"],
  },
  "6": {
    "0": ["<vv", "vv<"],
    "1": ["<<v", "v<<"],
    "2": ["<v", "v<"],
    "3": ["v"],
    "4": ["<<"],
    "5": ["<"],
    "6": [""],
    "7": ["^<<", "<<^"],
    "8": ["^<", "<^"],
    "9": ["^"],
    A: ["vv"],
  },
  "7": {
    "0": [">vvv"],
    "1": ["vv"],
    "2": [">vv", "vv>"],
    "3": [">>vv", "vv>>"],
    "4": ["v"],
    "5": [">v", "v>"],
    "6": [">>v", "v>>"],
    "7": [""],
    "8": [">"],
    "9": [">>"],
    A: [">>vvv"],
  },
  "8": {
    "0": ["vvv"],
    "1": ["<vv", "vv<"],
    "2": ["vv"],
    "3": [">vv", "vv>"],
    "4": ["<v", "v<"],
    "5": ["v"],
    "6": [">v", "v>"],
    "7": ["<"],
    "8": [""],
    "9": [">"],
    A: [">vvv", "vvv>"],
  },
  "9": {
    "0": ["<vvv", "vvv<"],
    "1": ["<<vv", "vv<<"],
    "2": ["<vv", "vv<"],
    "3": ["vv"],
    "4": ["<<v", "v<<"],
    "5": ["<v", "v<"],
    "6": ["v"],
    "7": ["<<"],
    "8": ["<"],
    "9": [""],
    A: ["vvv"],
  },
  A: {
    "0": ["<"],
    "1": ["^<<"],
    "2": ["^<", "<^"],
    "3": ["^"],
    "4": ["^^<<"],
    "5": ["^^<", "<^^"],
    "6": ["^^"],
    "7": ["^^^<<"],
    "8": ["^^^<", "<^^^"],
    "9": ["^^^"],
    A: [""],
  },
};

const directionalTransitions: Record<string, Record<string, string[]>> = {
  "^": {
    "^": [""],
    v: ["v"],
    "<": ["v<"],
    ">": ["v>", ">v"],
    A: [">"],
  },
  v: {
    "^": ["^"],
    v: [""],
    "<": ["<"],
    ">": [">"],
    A: [">^", "^>"],
  },
  "<": {
    "^": [">^"],
    v: [">"],
    "<": [""],
    ">": [">>"],
    A: [">>^"],
  },
  ">": {
    "^": ["<^", "^<"],
    v: ["<"],
    "<": ["<<"],
    ">": [""],
    A: ["^"],
  },
  A: {
    "^": ["<"],
    v: ["v<", "<v"],
    "<": ["v<<"],
    ">": ["v"],
    A: [""],
  },
};

const countPresses = memoize((current: string, goal: string, depth: number) => {
  const transitions = directionalTransitions[current][goal];

  function f(transition: string) {
    if (depth === 0) {
      return transition.length;
    }

    let total = 0;
    for (let i = 0; i < transition.length; i++) {
      total += countPresses(
        i > 0 ? transition[i - 1] : "A",
        transition[i],
        depth - 1
      );
    }
    return total;
  }

  return transitions.reduce((acc, transition) => {
    const ff = f(transition + "A");
    if (ff < acc) return ff;
    return acc;
  }, Infinity);
});

function calculateTotalComplexity(codes: string[], robotCount: number) {
  let totalComplexity = 0;

  for (const code of codes) {
    let presses = 0;
    for (let i = 0; i < code.length; i++) {
      const transitions = codeTransitions[i > 0 ? code[i - 1] : "A"][code[i]];

      function f(transition: string) {
        let c = 0;
        for (let j = 0; j < transition.length; j++) {
          c += countPresses(
            j > 0 ? transition[j - 1] : "A",
            transition[j],
            robotCount - 1
          );
        }
        return c;
      }

      presses += transitions.reduce((acc, transition) => {
        const ff = f(transition + "A");
        if (ff < acc) return ff;
        return acc;
      }, Infinity);
    }

    const complexity = presses * Number(code.split("A")[0]);
    totalComplexity += complexity;
  }

  return totalComplexity;
}

console.log("totalComplexity2", calculateTotalComplexity(codes, 2));
console.log("totalComplexity25", calculateTotalComplexity(codes, 25));
