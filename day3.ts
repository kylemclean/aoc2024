const text = await Bun.file("day3input.txt").text();

let i = 0;
let total = 0;
let totalWithControlFlow = 0;

let mulEnabled = true;
let state:
  | { type: "nothing" }
  | { type: "gotMul" }
  | { type: "gotFirstArgDigit"; startIndex: number }
  | { type: "gotFirstArgComma"; firstArg: number }
  | { type: "gotSecondArgDigit"; firstArg: number; startIndex: number } = {
  type: "nothing",
};

while (i < text.length) {
  if (state.type === "nothing") {
    if (text.slice(i, i + 4) === "mul(") {
      state = { type: "gotMul" };
      i += 4;
    } else if (text.slice(i, i + 4) === "do()") {
      mulEnabled = true;
      i += 4;
    } else if (text.slice(i, i + 7) === "don't()") {
      mulEnabled = false;
      i += 7;
    } else {
      i += 1;
    }
  } else if (state.type === "gotMul") {
    if (text[i] >= "0" && text[i] <= "9") {
      state = { type: "gotFirstArgDigit", startIndex: i };
      i += 1;
    } else {
      state = { type: "nothing" };
      i += 1;
    }
  } else if (state.type === "gotFirstArgDigit") {
    if (text[i] >= "0" && text[i] <= "9") {
      i += 1;
    } else if (text[i] === ",") {
      state = {
        type: "gotFirstArgComma",
        firstArg: Number(text.slice(state.startIndex, i)),
      };
      i += 1;
    } else {
      state = { type: "nothing" };
      i += 1;
    }
  } else if (state.type === "gotFirstArgComma") {
    if (text[i] >= "0" && text[i] <= "9") {
      state = {
        type: "gotSecondArgDigit",
        firstArg: state.firstArg,
        startIndex: i,
      };
      i += 1;
    } else {
      state = { type: "nothing" };
      i += 1;
    }
  } else if (state.type === "gotSecondArgDigit") {
    if (text[i] >= "0" && text[i] <= "9") {
      i += 1;
    } else if (text[i] === ")") {
      const secondArg = Number(text.slice(state.startIndex, i));

      const product = state.firstArg * secondArg;
      total += product;
      if (mulEnabled) totalWithControlFlow += product;

      state = { type: "nothing" };
      i += 1;
    } else {
      state = { type: "nothing" };
      i += 1;
    }
  }
}

console.log("total", total);
console.log("totalWithControlFlow", totalWithControlFlow);
