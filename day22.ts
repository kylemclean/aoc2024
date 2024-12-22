const text = await Bun.file("day22input.txt").text();
const initialSecrets = text.split("\n").filter(Boolean).map(BigInt);

function nextSecret(secret: bigint): bigint {
  secret ^= secret * 64n;
  secret %= 16777216n;
  secret ^= secret / 32n;
  secret %= 16777216n;
  secret ^= secret * 2048n;
  secret %= 16777216n;
  return secret;
}

function nthSecret(initialSecret: bigint, n: number): bigint {
  if (n === 0) return initialSecret;
  return nthSecret(nextSecret(initialSecret), n - 1);
}

const sum = initialSecrets.reduce(
  (acc, secret) => acc + nthSecret(secret, 2000),
  0n
);
console.log("part1", sum.toString());
