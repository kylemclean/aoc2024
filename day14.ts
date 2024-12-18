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
