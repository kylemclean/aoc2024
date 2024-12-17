const input = await Bun.file("day9input.txt").text();

const disk: number[] = [];

for (let i = 0, fileId = 0; i < input.length; i += 2, fileId++) {
  for (let j = 0; j < Number(input[i]); j++) disk.push(fileId);
  for (let j = 0; j < Number(input[i + 1]); j++) disk.push(-1);
}

function moveBlocks(disk: number[]) {
  disk = [...disk];

  let firstEmptyIndex = 0;
  let lastFullIndex = disk.length - 1;

  while (true) {
    while (firstEmptyIndex < disk.length && disk[firstEmptyIndex] >= 0)
      firstEmptyIndex++;

    if (firstEmptyIndex === disk.length) break;

    while (lastFullIndex >= 0 && disk[lastFullIndex] < 0) lastFullIndex--;

    if (lastFullIndex <= firstEmptyIndex) break;

    disk[firstEmptyIndex] = disk[lastFullIndex];
    disk[lastFullIndex] = -1;
  }

  return disk;
}

function findSlot(
  disk: number[],
  startPredicate: (fileId: number) => boolean,
  start: number,
  direction: 1 | -1,
  stop: number,
  minSize?: number
) {
  while (
    start >= 0 &&
    start < disk.length &&
    start !== stop &&
    !startPredicate(disk[start])
  )
    start += direction;

  if (start < 0 || start >= disk.length || start === stop) return null;

  let end = start + direction;
  while (
    end >= 0 &&
    end < disk.length &&
    start !== stop &&
    disk[start] === disk[end]
  )
    end += direction;
  end -= direction;

  if (minSize !== undefined && Math.abs(end - start) + 1 < minSize)
    return findSlot(
      disk,
      startPredicate,
      end + direction,
      direction,
      stop,
      minSize
    );

  return { left: Math.min(start, end), right: Math.max(start, end) };
}

function moveFiles(disk: number[]) {
  disk = [...disk];

  let r = disk.length - 1;

  while (r >= 0) {
    const lastFile = findSlot(disk, (fileId) => fileId >= 0, r, -1, 0);
    if (!lastFile) break;

    const firstEmpty = findSlot(
      disk,
      (fileId) => fileId < 0,
      0,
      1,
      lastFile.left,
      lastFile.right - lastFile.left + 1
    );

    if (firstEmpty) {
      disk = [
        ...disk.slice(0, firstEmpty.left),
        ...disk.slice(lastFile.left, lastFile.right + 1),
        ...disk.slice(
          firstEmpty.left + lastFile.right - lastFile.left + 1,
          lastFile.left
        ),
        ...Array(lastFile.right - lastFile.left + 1).fill(-1),
        ...disk.slice(lastFile.right + 1),
      ];
    }

    r = lastFile.left - 1;
  }

  return disk;
}

function calculateChecksum(disk: number[]) {
  let checksum = 0;

  for (let i = 0; i < disk.length; i++) {
    if (disk[i] >= 0) checksum += i * disk[i];
  }

  return checksum;
}

console.log("moveBlocksChecksum", calculateChecksum(moveBlocks(disk)));
console.log("moveFilesChecksum", calculateChecksum(moveFiles(disk)));

function printDisk(disk: number[]) {
  console.log(disk.map((x) => (x >= 0 ? x.toString()[0] : ".")).join(""));
}
