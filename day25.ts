const text = await Bun.file("day25input.txt").text();
const locksAndKeys = text
  .split("\n\n")
  .filter(Boolean)
  .map((lockOrKey) => lockOrKey.split("\n"));

const locks = locksAndKeys.filter((lockOrKey) =>
  lockOrKey[0].startsWith("#####")
);
const keys = locksAndKeys.filter((lockOrKey) =>
  lockOrKey[0].startsWith(".....")
);

let fitsWithoutOverlappingCount = 0;

for (const lock of locks) {
  for (const key of keys) {
    let fitsWithoutOverlapping = true;
    for (let i = 0; i < lock.length; i++) {
      for (let j = 0; j < lock[i].length; j++) {
        if (lock[i][j] === "#" && key[i][j] === "#") {
          fitsWithoutOverlapping = false;
          break;
        }
      }
    }

    if (fitsWithoutOverlapping) fitsWithoutOverlappingCount += 1;
  }
}

console.log("fitsWithoutOverlappingCount", fitsWithoutOverlappingCount);
