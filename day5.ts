const text = await Bun.file("day5input.txt").text();
const lines = text.split("\n");

const pageOrderingRules: [number, number][] = [];
const updates: number[][] = [];

let finishedAddingPageOrderingRules = false;
for (const line of lines) {
  if (!finishedAddingPageOrderingRules) {
    if (line === "") {
      finishedAddingPageOrderingRules = true;
    } else {
      pageOrderingRules.push(line.split("|").map(Number) as [number, number]);
    }
  } else {
    if (line !== "") updates.push(line.split(",").map(Number));
  }
}

let part1 = 0;
let part2 = 0;

function violatesRule(
  earlierPage: number,
  laterPage: number,
  rule: [number, number]
) {
  if (rule[0] === laterPage && rule[1] === earlierPage) return true;
  return false;
}

for (const update of updates) {
  let correctlyOrdered = true;

  for (let i = 1; i < update.length; i++) {
    for (let j = 0; j < i; j++) {
      if (
        pageOrderingRules.some((rule) =>
          violatesRule(update[j], update[i], rule)
        )
      ) {
        correctlyOrdered = false;
        break;
      }
    }
  }

  if (correctlyOrdered) {
    part1 += update[Math.floor(update.length / 2)];
  } else {
    let reordered = [...update];

    for (let i = 1; i < reordered.length; i++) {
      for (let j = 0; j < i; j++) {
        if (
          pageOrderingRules.some((rule) =>
            violatesRule(reordered[j], reordered[i], rule)
          )
        ) {
          const temp = reordered[i];
          reordered[i] = reordered[j];
          reordered[j] = temp;
        }
      }
    }

    part2 += reordered[Math.floor(reordered.length / 2)];
  }
}

console.log("part1", part1);
console.log("part2", part2);
