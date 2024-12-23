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

function getMaximalCliques(nodes: ReadonlySet<string>) {
  const cliques: ReadonlySet<string>[] = [];

  // https://en.wikipedia.org/wiki/Bron%E2%80%93Kerbosch_algorithm
  function bronKerbosch(
    clique: ReadonlySet<string>,
    candidates: ReadonlySet<string>,
    excluded: ReadonlySet<string>
  ) {
    if (candidates.size === 0 && excluded.size === 0) {
      if (cliques.length > 0 && clique.size > cliques[0].size) {
        cliques.length = 0;
      }
      if (cliques.length === 0 || clique.size >= cliques[0].size) {
        cliques.push(clique);
      }
    }

    for (const node of candidates) {
      bronKerbosch(
        clique.union(new Set([node])),
        candidates.intersection(getConnections(node)),
        excluded.intersection(getConnections(node))
      );
      candidates = candidates.difference(new Set([node]));
      excluded = excluded.union(new Set([node]));
    }
  }

  bronKerbosch(new Set(), nodes, new Set());

  return cliques;
}

const largestCliques = getMaximalCliques(nodes);
const password = largestCliques[0].values().toArray().sort().join(",");
console.log("password", password);
