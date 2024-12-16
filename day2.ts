const text = await Bun.file("day2input.txt").text();
const lines = text.split("\n").filter(Boolean);
const reports = lines.map((line) =>
  line.split(" ").filter(Boolean).map(Number)
);

let safeReportCount = 0;

for (const report of reports) {
  const direction = report[1] > report[0] ? "increasing" : "decreasing";
  let safe = true;
  for (let i = 1; i < report.length; i++) {
    if (
      (direction === "increasing" && report[i] <= report[i - 1]) ||
      (direction === "decreasing" && report[i] >= report[i - 1]) ||
      Math.abs(report[i] - report[i - 1]) > 3
    ) {
      safe = false;
      break;
    }
  }
  if (safe) safeReportCount += 1;
}

console.log("safeReportCount", safeReportCount);

let safeReportCountWithProblemDampener = 0;

for (const report of reports) {
  const permutations = [];
  permutations.push(report);
  for (let i = 0; i < report.length; i++) {
    permutations.push([...report.slice(0, i), ...report.slice(i + 1)]);
  }

  const safe = permutations.some((permutation) => {
    const direction =
      permutation[1] > permutation[0] ? "increasing" : "decreasing";
    let safe = true;

    for (let i = 1; i < permutation.length; i++) {
      if (
        (direction === "increasing" && permutation[i] <= permutation[i - 1]) ||
        (direction === "decreasing" && permutation[i] >= permutation[i - 1]) ||
        Math.abs(permutation[i] - permutation[i - 1]) > 3
      ) {
        safe = false;
        break;
      }
    }

    return safe;
  });

  if (safe) safeReportCountWithProblemDampener += 1;
}

console.log(
  "safeReportCountWithProblemDampener",
  safeReportCountWithProblemDampener
);
