/** One connected, headed downhill slice. No browser or storage dependencies. */
export type MountainInput = { turn?: number; tuck?: boolean; brake?: boolean; crouch?: boolean; spin?: number; flip?: number; grab?: number; press?: number; balance?: number; boost?: boolean };
export type Mountain = {
  x: number; z: number; y: number; vy: number; speed: number; heading: number; cameraHeading: number;
  time: number; charge: number; wasCrouched: boolean; preSpin: number; preFlip: number; flightSpin: number; flightFlip: number;
  air: boolean; spin: number; flip: number; rotated: number; flipped: number; grabTime: number; grabRelease: number; grabKinds: number;
  rail: number; balance: number; pressTime: number; combo: number; comboCount: number; comboClock: number; score: number;
  boost: number; ubers: number; superTime: number; uberTime: number; uberDone: boolean; lastTrick: string; repeats: number;
  wipeouts: number; recovery: number; status: 'ready' | 'running' | 'paused' | 'finished'; message: string; rivalZ: number;
  jumps: number; rails: number; cleanLandings: number; bestCombo: number; medal: boolean;
};
export const FINISH = 1000;
export const ramps = [{ x: 0, z: 90, width: 6 }, { x: -18, z: 285, width: 7 }, { x: 18, z: 430, width: 7 }, { x: 0, z: 600, width: 6 }, { x: -12, z: 800, width: 8 }];
export const rails = [{ x: 0, z: 32, end: 65 }, { x: 0, z: 155, end: 205 }, { x: -18, z: 340, end: 395 }, { x: 18, z: 480, end: 535 }, { x: 0, z: 670, end: 730 }];
export const trees = Array.from({ length: 45 }, (_, i) => ({ x: i % 3 === 0 ? -42 : i % 3 === 1 ? 42 : (i % 2 ? -9 : 9), z: 125 + i * 19 }));
export function snowHeight(x: number, z: number): number {
  let y = -z * .22 + Math.max(0, Math.abs(x) - 31) ** 2 * .035;
  for (const ramp of ramps) {
    if (Math.abs(x - ramp.x) > ramp.width) continue;
    const d = z - ramp.z;
    if (d > -16 && d < 0) y += (d + 16) * .23;
    if (d >= 0 && d < 5) y += (5 - d) * .736;
  }
  // Split backcountry lines around a raised central wooded ridge.
  if (z > 260 && z < 560) y += Math.max(0, 1 - Math.abs(x) / 12) * Math.sin((z - 260) / 300 * Math.PI) * 9;
  return y;
}
export function createMountain(): Mountain {
  return { x: 0, z: 0, y: 0, vy: 0, speed: 16, heading: 0, cameraHeading: 0, time: 0, charge: 0, wasCrouched: false, preSpin: 0, preFlip: 0, flightSpin: 0, flightFlip: 0, air: false, spin: 0, flip: 0, rotated: 0, flipped: 0, grabTime: 0, grabRelease: 1, grabKinds: 0, rail: -1, balance: 0, pressTime: 0, combo: 0, comboCount: 0, comboClock: 0, score: 0, boost: 0, ubers: 0, superTime: 0, uberTime: 0, uberDone: false, lastTrick: '', repeats: 0, wipeouts: 0, recovery: 0, status: 'ready', message: 'Summit rail park → split backcountry → village. Make your line.', rivalZ: 0, jumps: 0, rails: 0, cleanLandings: 0, bestCombo: 0, medal: false };
}
const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, n));
const alignment = (angle: number) => Math.abs(angle - Math.round(angle / Math.PI) * Math.PI);
function trick(m: Mountain, points: number, label: string) {
  m.combo += points; m.comboCount++; m.comboClock = 2;
  m.message = `${label} · link with a press or rail`;
}
function bank(m: Mountain) {
  if (!m.combo) return;
  const points = Math.round(m.combo * (1 + Math.min(m.comboCount, 20) * .08));
  m.score += points; m.bestCombo = Math.max(m.bestCombo, points);
  m.boost = clamp(m.boost + points / 18, 0, 100);
  m.combo = 0; m.comboCount = 0; m.comboClock = 0; m.message = `Banked +${points} · adrenaline earned`;
}
function crash(m: Mountain, reason: string) {
  m.wipeouts++; m.combo = 0; m.comboCount = 0; m.comboClock = 0; m.boost *= .5; m.ubers = Math.max(0, m.ubers - 1);
  m.recovery = 1.1; m.speed = 7; m.air = false; m.rail = -1; m.balance = 0; m.heading *= .3; m.y = snowHeight(m.x, m.z); m.vy = 0;
  m.charge = 0; m.wasCrouched = false; m.pressTime = 0; m.message = `Wipeout: ${reason} · unbanked combo lost`;
}
function takeoff(m: Mountain) {
  m.flightSpin = m.preSpin; m.flightFlip = m.preFlip; m.preSpin = 0; m.preFlip = 0;
  m.air = true; m.rail = -1; m.vy = 4.5 + m.charge * 6.5;
  m.y += .03; m.jumps++; m.spin = 0; m.flip = 0; m.rotated = 0; m.flipped = 0;
  m.grabTime = 0; m.grabKinds = 0; m.grabRelease = 1; m.uberTime = 0; m.uberDone = false;
  m.message = `Takeoff · ${Math.round(m.charge * 100)}% crouch · release tricks to land`; m.charge = 0;
}
function touchdown(m: Mountain, input: MountainInput) {
  m.air = false; m.y = snowHeight(m.x, m.z); m.vy = 0;
  if (alignment(m.spin) > .48 || Math.abs(m.flip - Math.round(m.flip / (Math.PI * 2)) * Math.PI * 2) > .42 || m.grabRelease < .14 || input.spin || input.flip) {
    crash(m, 'release and level the board before snow'); return;
  }
  m.cleanLandings++;
  const turns = Math.floor((m.rotated + .35) / Math.PI), flips = Math.floor((m.flipped + .35) / (Math.PI * 2));
  let points = turns * 140 + flips * 350 + (m.grabTime > .18 ? 180 + Math.round(m.grabTime * 70) : 0) + (m.uberDone ? 700 : 0);
  const signature = `${turns}/${flips}/${m.grabKinds}/${m.uberDone}`;
  if (points) {
    m.repeats = signature === m.lastTrick ? m.repeats + 1 : 0; m.lastTrick = signature;
    points = Math.round(points / (1 + Math.min(3, m.repeats)));
    trick(m, points, `Clean ${turns * 180}°${flips ? ` / ${flips} flip` : ''}${m.grabTime > .18 ? ' + grab' : ''}${m.uberDone ? ' + ÜBER' : ''}${m.repeats ? ' · repeat reduced' : ''}`);
    if (m.uberDone) { m.ubers++; if (m.ubers >= 9) { m.superTime = 15; m.ubers = 0; m.message = 'SUPER ÜBER · 15 seconds unlimited adrenaline'; } }
  } else m.message = 'Clean landing · crouch longer or catch a lip for airtime';
}
export function stepMountain(m: Mountain, seconds: number, input: MountainInput = {}) {
  if (m.status !== 'running') return;
  const unit = (n: number | undefined) => Number.isFinite(n) ? clamp(n!, -1, 1) : 0;
  input = { ...input, turn: unit(input.turn), spin: unit(input.spin), flip: unit(input.flip), press: unit(input.press), balance: unit(input.balance), grab: Number.isFinite(input.grab) ? clamp(Math.floor(input.grab!), 0, 3) : 0 };
  for (let left = clamp(Number.isFinite(seconds) ? seconds : 0, 0, 1); left > 1e-7 && m.status === 'running'; left -= 1 / 120) tick(m, Math.min(left, 1 / 120), input);
}
function tick(m: Mountain, dt: number, input: MountainInput) {
  const turn = clamp(input.turn ?? 0, -1, 1), spin = clamp(input.spin ?? 0, -1, 1), flip = clamp(input.flip ?? 0, -1, 1);
  m.time += dt; m.rivalZ = Math.min(FINISH, m.rivalZ + (23 + Math.sin(m.time * .5) * 1.4) * dt);
  m.superTime = Math.max(0, m.superTime - dt); m.recovery = Math.max(0, m.recovery - dt);
  if (m.recovery > 0) { m.z += m.speed * dt; m.y = snowHeight(m.x, m.z); return; }
  if (!m.air && input.crouch) { m.charge = Math.min(1, m.charge + dt * 1.3); m.preSpin = spin; m.preFlip = flip; }
  if (!input.crouch && m.wasCrouched && (!m.air || m.rail >= 0)) takeoff(m);
  m.wasCrouched = !!input.crouch;
  const previousY = snowHeight(m.x, m.z);
  if (m.rail < 0) {
    if (!m.air) m.heading = clamp(m.heading + turn * dt * (input.crouch ? .45 : 1.2), -1.8, 1.8);
    else m.heading = clamp(m.heading + turn * dt * .28, -1.8, 1.8);
  }
  const boosting = input.boost && !m.air && (m.boost > 0 || m.superTime > 0);
  const slopeForce = 7 * Math.cos(m.heading);
  m.speed = clamp(m.speed + (slopeForce + (input.tuck ? 3 : 0) + (boosting ? 12 : 0) - (input.brake ? 16 : 0) - m.speed * m.speed * .009) * dt, 2, 43);
  if (boosting && !m.superTime) m.boost = Math.max(0, m.boost - dt * 20);
  m.x += Math.sin(m.heading) * m.speed * dt; m.z += Math.cos(m.heading) * m.speed * dt;
  m.z = Math.max(0, m.z);
  const ground = snowHeight(m.x, m.z);
  m.cameraHeading += (m.heading - m.cameraHeading) * Math.min(1, dt * 3);
  if (Math.abs(m.x) > 48) { m.x = clamp(m.x, -45, 45); crash(m, 'mountain boundary'); return; }
  if (m.air) {
    const sr = spin * (3.5 + Math.abs(m.flightSpin) * 3), fr = flip * (4 + Math.abs(m.flightFlip) * 2.5);
    m.spin += sr * dt; m.flip += fr * dt; m.rotated += Math.abs(sr) * dt; m.flipped += Math.abs(fr) * dt;
    if (!spin) m.spin += (Math.round(m.spin / Math.PI) * Math.PI - m.spin) * Math.min(1, dt * 7);
    if (!flip) m.flip += (Math.round(m.flip / (Math.PI * 2)) * Math.PI * 2 - m.flip) * Math.min(1, dt * 7);
    if (input.grab) { m.grabTime += dt; m.grabKinds |= input.grab; m.grabRelease = 0; }
    else m.grabRelease += dt;
    if (input.grab && input.boost && (m.boost >= 99 || m.superTime > 0)) {
      m.uberTime += dt; if (m.uberTime >= .85) m.uberDone = true;
      m.message = m.ubers >= 4 ? 'SUPER grab · release before landing' : 'ÜBER grab · hold .85s, then release';
    }
    m.vy -= 14 * dt; m.y += m.vy * dt;
    // Rails are physical elevated targets: jump onto one while aligned.
    const rail = rails.findIndex(r => m.z >= r.z && m.z <= r.end && Math.abs(m.x - r.x) < 1.2 && Math.abs(m.y - ground - .8) < .45 && m.vy <= 2 && Math.abs(m.heading) < .3);
    if (rail >= 0) { m.air = false; m.rail = rail; m.rails++; m.x = rails[rail].x; m.heading = 0; m.balance = 0; m.y = ground + .8; trick(m, 120, 'Rail locked · A/D balance'); }
    else if (m.y <= ground) touchdown(m, input);
  } else if (m.rail >= 0) {
    const rail = rails[m.rail]; m.x = rail.x; m.heading = 0; m.y = ground + .8;
    m.balance += (Math.sin(m.time * 3) * .35 + .22 + turn * 1.5) * dt;
    m.combo += dt * 100; m.comboClock = 2;
    if (Math.abs(m.balance) > 1) { crash(m, 'rail balance'); return; }
    if (m.z > rail.end) { m.rail = -1; takeoff(m); m.vy = 3; m.message = 'Rail exit · link a press after landing'; }
  } else {
    m.y = ground;
    // Leaving a physical lip launches even without a charged ollie.
    if (ground - previousY < -m.speed * dt * .65) { takeoff(m); m.vy = 4 + m.speed * .13; m.y = previousY; }
    if (input.press && m.speed > 8 && !input.crouch) {
      m.pressTime += dt; m.balance += (input.press * .48 + (input.balance ?? 0) * 1.2) * dt;
      m.combo += dt * 75; m.comboClock = 2;
      if (m.pressTime > .35 && m.pressTime - dt <= .35) { m.comboCount++; m.message = 'Board press · J/L counterbalance · release before tipping'; }
      if (Math.abs(m.balance) > 1) { crash(m, 'press balance'); return; }
    } else { m.pressTime = 0; m.balance *= Math.max(0, 1 - dt * 4); }
  }
  if (!m.air && m.rail < 0 && trees.some(t => Math.hypot(m.x - t.x, m.z - t.z) < 1.6)) { crash(m, 'tree'); return; }
  if (m.combo > 0 && m.rail < 0 && !m.air && !input.press) { m.comboClock -= dt; if (m.comboClock <= 0) bank(m); }
  if (m.z >= FINISH && !m.air) { bank(m); m.z = FINISH; m.status = 'finished'; m.medal = m.score >= 1000 && m.time < 48; m.message = m.medal ? 'Mountain sample cleared · 1,000 points inside 48s' : 'Descent complete · target 1,000 points inside 48s'; }
}

export function normalizeMountainBest(raw: unknown): number {
  const value = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : raw;
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= 100000000 ? value : 0;
}
