const text = await Bun.file("day23input.txt").text();
const lines = text.split("\n").filter(Boolean);

const connections = lines.map(
  (line) => line.split("-").toSorted() as [string, string]
);

const nodes = new Set<string>();
for (const connection of connections) {
  nodes.add(connection[0]);
  nodes.add(connection[1]);
}

function getConnections(node: string) {
  return connectionsMap.get(node) ?? new Set();
}

const connectionsMap = new Map<string, Set<string>>();
for (const [a, b] of connections) {
  connectionsMap.set(a, getConnections(a).add(b));
  connectionsMap.set(b, getConnections(b).add(a));
}

const triangles = new Set<`${string},${string},${string}`>();

// https://stackoverflow.com/questions/10193228/how-to-find-a-triangle-inside-a-graph/10193372#10193372
for (const [u, v] of connections) {
  for (const w of nodes) {
    if (getConnections(v).has(w) && getConnections(w).has(u)) {
      triangles.add(
        [u, v, w].sort().join(",") as `${string},${string},${string}`
      );
    }
  }
}

const tTriangles = triangles
  .values()
  .filter((triangleString) => {
    const [u, v, w] = triangleString.split(",");
    return u.startsWith("t") || v.startsWith("t") || w.startsWith("t");
  })
  .toArray();

console.log("tTriangles", tTriangles.length);
