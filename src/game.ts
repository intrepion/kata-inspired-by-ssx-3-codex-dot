export const courses = [
  {
    name: "Blue Hour",
    subtitle: "The first light falls behind you.",
    length: 1050,
    time: 65,
    target: 0,
    color: "#67e4ee",
    kind: "TIME TRIAL",
  },
  {
    name: "Copper Chute",
    subtitle: "Write your signature in the sky.",
    length: 1200,
    time: 85,
    target: 900,
    color: "#ffb879",
    kind: "FREESTYLE",
  },
  {
    name: "Aurora Traverse",
    subtitle: "One last line above the clouds.",
    length: 1450,
    time: 85,
    target: 1400,
    color: "#bba5ff",
    kind: "SUMMIT COMBINED",
  },
];
export type Feature = {
  z: number;
  x: number;
  type: "ramp" | "rock" | "tree";
  width: number;
};
export function terrain(course: number): Feature[] {
  const out: Feature[] = [];
  const spacing = [130, 115, 155][course];
  let index = 0;
  for (let z = 140; z < courses[course].length - 70; z += spacing) {
    out.push({ z, x: 0, type: "ramp", width: course === 2 ? 0.24 : 0.3 });
    out.push({
      z: z + 55,
      x: index % 2 ? 0.62 : -0.62,
      type: "tree",
      width: 0.12,
    });
    if (course === 1)
      out.push({
        z: z + 85,
        x: index % 2 ? 0.45 : -0.45,
        type: "rock",
        width: 0.12,
      });
    if (course === 2) {
      out.push({
        z: z + 95,
        x: index % 2 ? -0.22 : 0.22,
        type: "rock",
        width: 0.11,
      });
      out.push({
        z: z + 110,
        x: index % 2 ? 0.68 : -0.68,
        type: "tree",
        width: 0.14,
      });
      // A wide outer jump is a genuine alternate freestyle line.
      out.push({
        z: z + 35,
        x: index % 2 ? -0.68 : 0.68,
        type: "ramp",
        width: 0.18,
      });
    }
    index++;
  }
  return out;
}
export type Run = {
  course: number;
  x: number;
  vx: number;
  distance: number;
  speed: number;
  time: number;
  height: number;
  vy: number;
  trickTimeRemaining: number;
  tricks: string[];
  pending: number;
  score: number;
  chain: number;
  boost: number;
  wipeouts: number;
  recovery: number;
  status: "running" | "paused" | "finished";
  message: string;
  medal: boolean;
  seen: Set<number>;
};
export const createRun = (course: number): Run => ({
  course,
  x: 0,
  vx: 0,
  distance: 0,
  speed: 16,
  time: 0,
  height: 0,
  vy: 0,
  trickTimeRemaining: 0,
  tricks: [],
  pending: 0,
  score: 0,
  chain: 0,
  boost: 0,
  wipeouts: 0,
  recovery: 0,
  status: "running",
  message: "Find your line.",
  medal: false,
  seen: new Set(),
});
export function wipeout(r: Run) {
  r.wipeouts++;
  r.chain = 0;
  r.pending = 0;
  r.tricks = [];
  r.trickTimeRemaining = 0;
  r.height = 0;
  r.vy = 0;
  r.speed = 8;
  r.recovery = 1.1;
  r.message = "Wipeout · chain lost";
}
export function action(r: Run, a: "jump" | "spin" | "grab") {
  if (r.status !== "running" || r.recovery > 0) return;
  if (a === "jump") {
    if (r.height === 0) {
      r.height = 0.01;
      r.vy = 7;
      r.tricks = [];
      r.message = "Ollie · short airtime";
    }
    return;
  }
  if (r.height <= 0 || r.trickTimeRemaining > 0 || r.tricks.includes(a)) return;
  r.tricks.push(a);
  r.trickTimeRemaining = a === "spin" ? 0.65 : 0.4;
  r.pending += a === "spin" ? 300 : 180;
  r.message =
    a === "spin"
      ? "Orbit 360 · let it settle"
      : "Starlight grab · let it settle";
}
export type RunInput = { steer?: number; brake?: boolean; boost?: boolean };
export function step(r: Run, dt: number, input: RunInput = {}) {
  if (r.status !== "running") return;
  dt = Math.min(Math.max(dt, 0), 1);
  for (let left = dt; left > 1e-7 && r.status === "running"; left -= 1 / 120)
    tick(r, Math.min(left, 1 / 120), input);
}
function tick(r: Run, dt: number, input: RunInput) {
  r.time += dt;
  r.recovery = Math.max(0, r.recovery - dt);
  r.trickTimeRemaining = Math.max(0, r.trickTimeRemaining - dt);
  const boosting = input.boost && r.boost > 0 && r.recovery === 0;
  const target = r.recovery > 0 ? 11 : input.brake ? 12 : boosting ? 38 : 25;
  r.speed += (target - r.speed) * Math.min(1, dt * 2);
  if (boosting) r.boost = Math.max(0, r.boost - dt * 22);
  r.vx += ((input.steer ?? 0) * 1.1 - r.vx) * Math.min(1, dt * 5);
  r.x = Math.max(-0.94, Math.min(0.94, r.x + r.vx * dt));
  const before = r.distance;
  r.distance += r.speed * dt;
  if (r.height > 0) {
    r.vy -= 9 * dt;
    r.height += r.vy * dt;
    if (r.height <= 0) {
      r.height = 0;
      r.vy = 0;
      if (r.trickTimeRemaining > 0.04) wipeout(r);
      else if (r.pending > 0) {
        r.chain = Math.min(5, r.chain + 1);
        const points = r.pending * r.chain;
        r.score += points;
        r.boost = Math.min(100, r.boost + points / 18);
        r.message = `Clean +${points} · chain ×${r.chain}`;
        r.pending = 0;
        r.tricks = [];
      } else r.message = "Clean landing";
    }
  }
  terrain(r.course).forEach((f, i) => {
    if (f.z > before && f.z <= r.distance && !r.seen.has(i)) {
      r.seen.add(i);
      if (Math.abs(r.x - f.x) < f.width) {
        if (f.type === "ramp" && r.height === 0 && r.recovery === 0) {
          r.height = 0.01;
          r.vy = 11;
          r.tricks = [];
          r.message = "Big air · J spin / K grab";
        } else if (f.type !== "ramp" && r.height < 1.4 && r.recovery === 0)
          wipeout(r);
      }
    }
  });
  if (r.distance >= courses[r.course].length) {
    r.distance = courses[r.course].length;
    if (r.height > 0) return; // Cross the line, then resolve the actual touchdown.
    r.status = "finished";
    const c = courses[r.course];
    r.medal = r.time <= c.time && r.score >= c.target;
    r.message = r.medal
      ? "Medal earned. The ridge is yours."
      : "Finish · try a cleaner line";
  }
}
export type Save = {
  version: 1;
  unlocked: number;
  records: Record<string, { score: number; time: number }>;
};
export const freshSave = (): Save => ({ version: 1, unlocked: 0, records: {} });
export function normalizeSave(raw: unknown): Save {
  const s = freshSave();
  if (!raw || typeof raw !== "object") return s;
  const v = raw as Partial<Save>;
  if (v.version !== 1) return s;
  s.unlocked = Number.isInteger(v.unlocked)
    ? Math.max(0, Math.min(2, v.unlocked!))
    : 0;
  for (let i = 0; i < 3; i++) {
    const r = v.records?.[i];
    if (
      r &&
      Number.isFinite(r.score) &&
      r.score >= 0 &&
      r.score < 1e8 &&
      Number.isFinite(r.time) &&
      r.time > 0 &&
      r.time < 1e5
    )
      s.records[i] = { score: r.score, time: r.time };
  }
  return s;
}
export function record(save: Save, r: Run) {
  if (r.status !== "finished") return;
  const old = save.records[r.course];
  save.records[r.course] = {
    score: Math.max(old?.score ?? 0, r.score),
    time: Math.min(old?.time ?? Infinity, r.time),
  };
  if (r.medal)
    save.unlocked = Math.min(2, Math.max(save.unlocked, r.course + 1));
}
