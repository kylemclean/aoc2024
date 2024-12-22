const text = await Bun.file("day22input.txt").text();
const initialSecrets = text.split("\n").filter(Boolean).map(Number);

function nextSecret(secret: number): number {
  let secretN = BigInt(secret);
  secretN ^= secretN * 64n;
  secretN %= 16777216n;
  secretN ^= secretN / 32n;
  secretN %= 16777216n;
  secretN ^= secretN * 2048n;
  secretN %= 16777216n;
  return Number(secretN);
}

function getSequence(secret: number, n: number) {
  const sequence: number[] = [secret];
  while (sequence.length <= n) {
    secret = nextSecret(secret);
    sequence.push(secret);
  }
  return sequence;
}

const secretSequences = initialSecrets.map((secret) =>
  getSequence(secret, 2000)
);

const sum = secretSequences.reduce(
  (acc, secretSequence) => acc + secretSequence.at(-1)!,
  0
);
console.log("part1", sum.toString());

function price(secret: number) {
  return secret % 10;
}

const changeSequencePrices = new Map<string, number>();

for (const secretSequence of secretSequences) {
  const seenChangeSequencesForThisSecretSequence = new Set<string>();

  const changeSequence: number[] = [];
  for (let i = 1; i < secretSequence.length; i++) {
    changeSequence.push(
      price(secretSequence[i]) - price(secretSequence[i - 1])
    );
    if (changeSequence.length > 4) changeSequence.shift();
    if (changeSequence.length < 4) continue;

    const changeSequenceString = changeSequence.join(",");
    if (seenChangeSequencesForThisSecretSequence.has(changeSequenceString))
      continue;
    seenChangeSequencesForThisSecretSequence.add(changeSequenceString);

    changeSequencePrices.set(
      changeSequenceString,
      (changeSequencePrices.get(changeSequenceString) ?? 0) +
        price(secretSequence[i])
    );
  }
}

const sortedChangeSequencePrices = changeSequencePrices
  .entries()
  .toArray()
  .toSorted((a, b) => b[1] - a[1]);
console.log("sortedChangeSequencePrices", sortedChangeSequencePrices[0]);
