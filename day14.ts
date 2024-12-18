const text = await Bun.file("day14input.txt").text();
const lines = text.split("\n").filter(Boolean);

type Robot = Readonly<{
  position: Readonly<{ x: number; y: number }>;
  velocity: Readonly<{ x: number; y: number }>;
}>;

const lineRegex =
  /p=(?<px>[0-9]+),(?<py>[0-9]+) v=(?<vx>-?[0-9]+),(?<vy>-?[0-9]+)/;

const robots: Robot[] = lines.map((line) => {
  const match = line.match(lineRegex);
  if (!match?.groups) throw new Error(`invalid line: ${line}`);

  return {
    position: { x: Number(match.groups.px), y: Number(match.groups.py) },
    velocity: { x: Number(match.groups.vx), y: Number(match.groups.vy) },
  };
});

function simulateRobot(
  robot: Robot,
  world: { width: number; height: number },
  seconds = 1
): Robot {
  return {
    position: {
      x:
        (((robot.position.x + robot.velocity.x * seconds) % world.width) +
          world.width) %
        world.width,
      y:
        (((robot.position.y + robot.velocity.y * seconds) % world.height) +
          world.height) %
        world.height,
    },
    velocity: robot.velocity,
  };
}

function simulateRobots(
  robots: ReadonlyArray<Robot>,
  world: { width: number; height: number },
  seconds = 1
) {
  return robots.map((robot) => simulateRobot(robot, world, seconds));
}

function safetyFactor(
  robots: ReadonlyArray<Robot>,
  world: { width: number; height: number }
) {
  const q0 = robots.filter(
    (robot) =>
      robot.position.x < Math.floor(world.width / 2) &&
      robot.position.y < Math.floor(world.height / 2)
  );
  const q1 = robots.filter(
    (robot) =>
      robot.position.x < Math.floor(world.width / 2) &&
      robot.position.y > Math.floor(world.height / 2)
  );
  const q2 = robots.filter(
    (robot) =>
      robot.position.x > Math.floor(world.width / 2) &&
      robot.position.y < Math.floor(world.height / 2)
  );
  const q3 = robots.filter(
    (robot) =>
      robot.position.x > Math.floor(world.width / 2) &&
      robot.position.y > Math.floor(world.height / 2)
  );

  return q0.length * q1.length * q2.length * q3.length;
}

const world = { width: 101, height: 103 };
console.log("part1", safetyFactor(simulateRobots(robots, world, 100), world));

function printWorld(
  robots: ReadonlyArray<Robot>,
  world: { width: number; height: number }
) {
  for (let y = 0; y < world.height; y++) {
    let line = "";
    for (let x = 0; x < world.width; x++) {
      const count = robots.reduce(
        (acc, robot) =>
          acc + (robot.position.x === x && robot.position.y === y ? 1 : 0),
        0
      );
      line += count > 0 ? count.toString()[0] : " ";
    }
    console.log(line);
  }
}

function computeEntropy(
  robots: ReadonlyArray<Robot>,
  world: { width: number; height: number }
) {
  const array = new Uint8Array(world.width * world.height);
  for (let y = 0; y < world.height; y++) {
    for (let x = 0; x < world.width; x++) {
      const count = robots.reduce(
        (acc, robot) =>
          acc + (robot.position.x === x && robot.position.y === y ? 1 : 0),
        0
      );
      array[y * world.width + x] = count > 0 ? 0xff : 0x00;
    }
  }
  return (Bun.gzipSync(array).length / (world.width * world.height)) * 8;
}

let minEntropy = Infinity;
let minEntropySeconds = -1;

for (let seconds = 0; seconds < 1_000_000; seconds++) {
  const simulated = simulateRobots(robots, world, seconds);
  const entropy = computeEntropy(simulated, world);
  if (entropy < minEntropy) {
    minEntropy = entropy;
    minEntropySeconds = seconds;
  }
  if (entropy < 0.4) {
    console.log(
      "seconds",
      seconds,
      "entropy",
      entropy,
      "minEntropy",
      minEntropy,
      "minEntropySeconds",
      minEntropySeconds
    );
    printWorld(simulated, world);
  } else if (seconds % 1000 === 0) {
    console.log(
      "seconds",
      seconds,
      "entropy",
      entropy,
      "minEntropy",
      minEntropy,
      "minEntropySeconds",
      minEntropySeconds
    );
  }
}
