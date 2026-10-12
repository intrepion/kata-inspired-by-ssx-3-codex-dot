import { describe, it, expect } from "vitest";
import { createRun, step } from "../src/game";
describe("downhill movement", () => {
  it("accelerates and carves right under input", () => {
    const r = createRun(0);
    step(r, 1, { steer: 1 });
    expect(r.distance).toBeGreaterThan(0);
    expect(r.x).toBeGreaterThan(0);
  });
});
import {
  action,
  wipeout,
  record,
  normalizeSave,
  freshSave,
  courses,
  terrain,
} from "../src/game";
function advance(r: ReturnType<typeof createRun>, seconds: number, input = {}) {
  for (let t = 0; t < seconds; t += 1 / 60) step(r, 1 / 60, input);
}
describe("air timing and earned score", () => {
  it("does not score grounded tricks", () => {
    const r = createRun(0);
    action(r, "spin");
    expect(r.pending).toBe(0);
  });
  it("banks one spin once after a clean ollie", () => {
    const r = createRun(0);
    action(r, "jump");
    action(r, "spin");
    action(r, "spin");
    advance(r, 1.7);
    expect(r.score).toBe(300);
    expect(r.chain).toBe(1);
    expect(r.boost).toBeGreaterThan(0);
  });
  it("wipes out a late trick and loses a chain", () => {
    const r = createRun(0);
    action(r, "jump");
    advance(r, 1.3);
    action(r, "spin");
    advance(r, 0.4);
    expect(r.wipeouts).toBe(1);
    expect(r.score).toBe(0);
    expect(r.chain).toBe(0);
  });
  it("multiplies consecutive clean jumps without banking on key repeat", () => {
    const r = createRun(0);
    for (let i = 0; i < 2; i++) {
      action(r, "jump");
      action(r, "grab");
      advance(r, 1.7);
    }
    expect(r.score).toBe(540);
    expect(r.chain).toBe(2);
    wipeout(r);
    expect(r.chain).toBe(0);
    expect(r.pending).toBe(0);
  });
  it("launches only in a ramp lane and can bypass it", () => {
    const r = createRun(0);
    r.distance = 139;
    step(r, 0.1);
    expect(r.height).toBeGreaterThan(0);
    const side = createRun(0);
    side.x = 0.8;
    side.distance = 139;
    step(side, 0.1);
    expect(side.height).toBe(0);
  });
});
describe("boost, collision and run lifecycle", () => {
  it("bounds reserve and drains it, with no boost from nothing", () => {
    const r = createRun(0);
    advance(r, 2, { boost: true });
    expect(r.speed).toBeLessThan(26);
    r.boost = 5;
    advance(r, 1, { boost: true });
    expect(r.boost).toBe(0);
    expect(r.speed).toBeLessThan(38);
  });
  it("caps earned boost at 100", () => {
    const r = createRun(0);
    r.boost = 99;
    action(r, "jump");
    action(r, "spin");
    advance(r, 1.7);
    expect(r.boost).toBe(100);
  });
  it("collides once with a tree and can clear obstacles in air", () => {
    const f = terrain(0).find((f) => f.type === "tree")!;
    const r = createRun(0);
    r.distance = f.z - 1;
    r.x = f.x;
    step(r, 0.1);
    expect(r.wipeouts).toBe(1);
    step(r, 0.1);
    expect(r.wipeouts).toBe(1);
    const air = createRun(0);
    air.distance = f.z - 1;
    air.x = f.x;
    air.height = 4;
    step(air, 0.1);
    expect(air.wipeouts).toBe(0);
  });
  it("pause freezes physics, time and held boost", () => {
    const r = createRun(0);
    r.status = "paused";
    r.boost = 50;
    step(r, 1, { steer: 1, boost: true });
    action(r, "jump");
    expect(r.time).toBe(0);
    expect(r.x).toBe(0);
    expect(r.boost).toBe(50);
    expect(r.height).toBe(0);
  });
  it("stops at the finish, records completion and unlocks only medals", () => {
    const r = createRun(0);
    advance(r, 60);
    expect(r.status).toBe("finished");
    expect(r.distance).toBe(courses[0].length);
    const time = r.time;
    step(r, 1);
    expect(r.time).toBe(time);
    const s = freshSave();
    record(s, r);
    expect(s.unlocked).toBe(1);
    expect(s.records[0].time).toBeGreaterThan(0);
    const fail = createRun(1);
    advance(fail, 70);
    record(s, fail);
    expect(fail.medal).toBe(false);
    expect(s.unlocked).toBe(1);
  });
  it("restarts with clean input-independent state", () => {
    const r = createRun(0);
    wipeout(r);
    const fresh = createRun(0);
    expect(fresh.wipeouts).toBe(0);
    expect(fresh.seen.size).toBe(0);
    expect(fresh.score).toBe(0);
    expect(fresh.status).toBe("running");
  });
  it("steering and braking respond in both directions, stable across frame rates", () => {
    const a = createRun(0),
      b = createRun(0);
    advance(a, 1, { steer: -1, brake: true });
    for (let i = 0; i < 30; i++) step(b, 1 / 30, { steer: -1, brake: true });
    expect(a.x).toBeLessThan(0);
    expect(a.speed).toBeLessThan(16);
    expect(a.distance).toBeCloseTo(b.distance, 1);
    expect(a.x).toBeCloseTo(b.x, 1);
  });
});
describe("save and records", () => {
  it("round trips finished progression and independent records", () => {
    const s = freshSave(),
      r = createRun(0);
    advance(r, 50);
    record(s, r);
    r.score = 500;
    r.time = 60;
    record(s, r);
    expect(s.records[0].score).toBe(500);
    expect(s.records[0].time).toBeLessThan(60);
    expect(normalizeSave(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });
  it("rejects malformed and unsupported saves", () => {
    expect(normalizeSave(null)).toEqual(freshSave());
    expect(normalizeSave({ version: 4, unlocked: 2 })).toEqual(freshSave());
    expect(
      normalizeSave({
        version: 1,
        unlocked: 99,
        records: { 0: { score: -1, time: NaN } },
      }),
    ).toEqual({ version: 1, unlocked: 2, records: {} });
  });
  it("cannot record an unfinished run", () => {
    const s = freshSave();
    record(s, createRun(0));
    expect(s).toEqual(freshSave());
  });
});
describe("finish adjudication regressions", () => {
  it("freezes at the actual crossing near a deadline", () => {
    const r = createRun(0);
    r.distance = 1049.9;
    r.time = 64.9;
    step(r, 1);
    expect(r.medal).toBe(true);
    expect(r.time).toBeLessThan(65);
  });
  it("waits for a real clean landing before banking airborne finish points", () => {
    const r = createRun(0);
    r.distance = 1049.9;
    r.height = 4;
    r.vy = 0;
    r.pending = 480;
    r.chain = 1;
    step(r, 0.1);
    expect(r.status).toBe("running");
    expect(r.score).toBe(0);
    advance(r, 1);
    expect(r.status).toBe("finished");
    expect(r.score).toBe(960);
    expect(r.boost).toBeGreaterThan(0);
  });
  it("uses normal wipeout adjudication at an airborne finish", () => {
    const r = createRun(0);
    r.distance = 1049.9;
    r.height = 0.01;
    r.vy = -1;
    r.trickTimeRemaining = 0.4;
    r.pending = 300;
    step(r, 0.1);
    expect(r.status).toBe("finished");
    expect(r.wipeouts).toBe(1);
    expect(r.score).toBe(0);
  });
});
