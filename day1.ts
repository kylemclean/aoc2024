const text = await Bun.file("day1input.txt").text();
const lines = text.split("\n").filter(Boolean);
const pairs = lines.map(
  (line) => line.split(" ").filter(Boolean).map(Number) as [number, number]
);

const left = pairs.map(([a, b]) => a);
const right = pairs.map(([a, b]) => b);
left.sort();
right.sort();

let totalDistance = 0;
for (let i = 0; i < left.length; i++) {
  totalDistance += Math.abs(left[i] - right[i]);
}

console.log("totalDistance", totalDistance);

const rightCounts = new Map<number, number>();
for (const x of right) rightCounts.set(x, (rightCounts.get(x) ?? 0) + 1);

let similarity = 0;

for (const x of left) similarity += x * (rightCounts.get(x) ?? 0);

console.log("similarity", similarity);
