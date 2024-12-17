const input = await Bun.file("day9input.txt").text();

const disk: number[] = [];

for (let i = 0, fileId = 0; i < input.length; i += 2, fileId++) {
  for (let j = 0; j < Number(input[i]); j++) disk.push(fileId);
  for (let j = 0; j < Number(input[i + 1]); j++) disk.push(-1);
}

let firstEmptyIndex = 0;
let lastFullIndex = disk.length - 1;

while (true) {
  // console.log(disk.map((x) => (x >= 0 ? x : ".")).join(""));

  while (firstEmptyIndex < disk.length && disk[firstEmptyIndex] >= 0)
    firstEmptyIndex++;

  if (firstEmptyIndex === disk.length) break;

  while (lastFullIndex >= 0 && disk[lastFullIndex] < 0) lastFullIndex--;

  if (lastFullIndex <= firstEmptyIndex) break;

  disk[firstEmptyIndex] = disk[lastFullIndex];
  disk[lastFullIndex] = -1;
}

let checksum = 0;

for (let i = 0; i < disk.length; i++) {
  if (disk[i] >= 0) checksum += i * disk[i];
}

console.log("checksum", checksum);
