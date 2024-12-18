const text = await Bun.file("day11input.txt").text();
const stones = text.split(" ").filter(Boolean).map(Number);

function blinkStone(stone: number) {
  if (stone === 0) return [1];

  const numberOfDigits = 1 + Math.floor(Math.log10(stone));
  if (numberOfDigits % 2 === 0) {
    const leftDigits = Math.floor(stone / 10 ** (numberOfDigits / 2));
    const rightDigits = stone % 10 ** (numberOfDigits / 2);
    return [leftDigits, rightDigits];
  }

  return [stone * 2024];
}

function blink(stones: number[], times = 1) {
  for (let i = 0; i < times; ++i) {
    stones = stones.flatMap(blinkStone);
  }
  return stones;
}

console.log("part1", blink(stones, 25).length);

const cache = new Map<`${number},${number}`, number>();

function blinkStoneOptimized(stone: number, times: number) {
  if (times <= 0) return 1;

  const cachedResult = cache.get(`${stone},${times}`);
  if (cachedResult !== undefined) return cachedResult;

  const resultingStones = blinkStone(stone);
  let sum = 0;
  for (const resultingStone of resultingStones) {
    sum += blinkStoneOptimized(resultingStone, times - 1);
  }

  cache.set(`${stone},${times}`, sum);

  return sum;
}

function blinkOptimized(stones: number[], times: number) {
  return stones.reduce(
    (acc, stone) => acc + blinkStoneOptimized(stone, times),
    0
  );
}

console.log("part2", blinkOptimized(stones, 75));
