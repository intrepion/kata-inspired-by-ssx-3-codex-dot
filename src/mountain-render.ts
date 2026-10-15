import { FINISH, ramps, rails, snowHeight, trees, type Mountain } from './mountain';
type Point = { x: number; y: number; z: number };
export function renderMountain(ctx: CanvasRenderingContext2D, w: number, h: number, m: Mountain) {
  const yaw = m.cameraHeading, sin = Math.sin(yaw), cos = Math.cos(yaw);
  const camera = { x: m.x - sin * 11, y: m.y + 5.5, z: m.z - cos * 11 };
  const focal = Math.min(w, h * 1.7) * .8, pitch = .18;
  function project(p: Point) {
    const dx = p.x - camera.x, dy = p.y - camera.y, dz = p.z - camera.z;
    const forward = dx * sin + dz * cos, right = dx * cos - dz * sin;
    const depth = forward * Math.cos(pitch) - dy * Math.sin(pitch);
    return { x: w / 2 + right * focal / depth, y: h * .44 - (dy * Math.cos(pitch) + forward * Math.sin(pitch)) * focal / depth, depth, scale: focal / depth };
  }
  const sky = ctx.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#122e53'); sky.addColorStop(.5, '#f6a98f'); sky.addColorStop(1, '#d3e8f0'); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffe6ba'; ctx.beginPath(); ctx.arc(w * .78 - yaw * 70, h * .2, 27, 0, 7); ctx.fill();
  for (let layer = 0; layer < 3; layer++) { ctx.fillStyle = ['#3e597b', '#6b8caa', '#a3c2d2'][layer]; ctx.beginPath(); ctx.moveTo(0, h * .6); for (let i = 0; i <= 20; i++) ctx.lineTo(i * w / 20, h * (.35 + layer * .03) - Math.sin(i * 2.3 + layer) * 50); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill(); }
  const faces: { points: Point[]; color: string; depth: number }[] = [];
  const start = Math.floor((m.z - 24) / 8) * 8;
  function face(points: Point[], color: string) { const projected = points.map(project); if (projected.some(p => p.depth < .7)) return; faces.push({ points, color, depth: projected.reduce((s, p) => s + p.depth, 0) / projected.length }); }
  for (let z = start; z < m.z + 260; z += 8) for (let x = -60; x < 60; x += 6) {
    const points = [{ x, z, y: snowHeight(x, z) }, { x: x + 6, z, y: snowHeight(x + 6, z) }, { x: x + 6, z: z + 8, y: snowHeight(x + 6, z + 8) }, { x, z: z + 8, y: snowHeight(x, z + 8) }];
    const bank = Math.abs(x) > 36; face(points, bank ? '#abc6d0' : ((Math.floor(z / 8) + Math.floor(x / 6)) % 2 ? '#e2f2f5' : '#d4e9ee'));
  }
  faces.sort((a, b) => b.depth - a.depth);
  for (const f of faces) { ctx.fillStyle = f.color; ctx.beginPath(); f.points.forEach((v, i) => { const p = project(v); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.closePath(); ctx.fill(); }
  function line(a: Point, b: Point, color: string, width: number) { const p = project(a), q = project(b); if (p.depth < .8 || q.depth < .8) return; ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, width * (p.scale + q.scale) * .5); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
  function label(x: number, z: number, text: string, color: string) { const y = snowHeight(x, z), p = project({ x, y: y + 3.8, z }); if (p.depth < 2 || p.depth > 180) return; line({ x, y, z }, { x, y: y + 3, z }, color, .1); ctx.font = `bold ${Math.max(8, Math.min(18, p.scale * .65))}px system-ui`; ctx.textAlign = 'center'; ctx.fillStyle = '#0d3044'; ctx.fillText(text, p.x, p.y); }
  const objects = trees.filter(t => Math.abs(t.z - m.z) < 250).sort((a, b) => b.z - a.z);
  for (const t of objects) { const y = snowHeight(t.x, t.z); line({ x: t.x, y, z: t.z }, { x: t.x, y: y + 7, z: t.z }, '#315a60', 1.5); for (let i = 0; i < 3; i++) line({ x: t.x - 1.8 + i * .4, y: y + 2 + i * 1.8, z: t.z }, { x: t.x + 1.8 - i * .4, y: y + 2 + i * 1.8, z: t.z }, '#285765', 1.4); }
  for (const rail of rails) { for (let z = rail.z; z < rail.end; z += 4) { line({ x: rail.x, y: snowHeight(rail.x, z) + .8, z }, { x: rail.x, y: snowHeight(rail.x, z + 4) + .8, z: z + 4 }, '#f2a15e', .14); line({ x: rail.x, y: snowHeight(rail.x, z), z }, { x: rail.x, y: snowHeight(rail.x, z) + .8, z }, '#36556d', .12); } label(rail.x + 2, rail.z, 'JUMP ON → RAIL', '#d78540'); }
  for (const ramp of ramps) { const z = ramp.z - 1; line({ x: ramp.x - ramp.width, y: snowHeight(ramp.x, z) + .06, z }, { x: ramp.x + ramp.width, y: snowHeight(ramp.x, z) + .06, z }, '#4aafbe', .25); label(ramp.x + ramp.width + 1, ramp.z - 10, 'LIP · RELEASE SPACE', '#4aafbe'); }
  for (const z of [0, 260, 560, FINISH]) { line({ x: -30, y: snowHeight(-30, z) + 5, z }, { x: 30, y: snowHeight(30, z) + 5, z }, '#254b64', .2); label(0, z, z === 0 ? 'SUMMIT / RAIL PARK' : z === 260 ? 'BACKCOUNTRY · TWO LINES' : z === 560 ? 'LOWER RIDGE / VILLAGE' : 'HALCYON / FINISH', '#eea76e'); }
  function rider(x: number, y: number, z: number, color: string, heading: number, spin = 0, flip = 0, crouch = 0) {
    const p = project({ x, y, z }); if (p.depth < 1) return;
    const boardYaw = heading + spin, bx = Math.cos(boardYaw) * .65, bz = -Math.sin(boardYaw) * .65;
    const bodyY = y + 1.25 - crouch * .35;
    line({ x: x - bx, y: y + .1, z: z - bz }, { x: x + bx, y: y + .1, z: z + bz }, '#13364d', .15);
    const top = { x: x + Math.sin(flip) * .5, y: bodyY + Math.cos(flip) * .35, z };
    line({ x, y: y + .2, z }, { x, y: bodyY, z }, color, .5); line({ x, y: bodyY, z }, top, '#163c54', .32);
    line({ x: x - .55, y: bodyY - .15, z }, { x: x + .55, y: bodyY - .15, z }, color, .14);
    if (x === m.x && z === m.z && m.grabRelease < .14) line({ x: x + .4, y: bodyY - .2, z }, { x: x + bx, y: y + .2, z: z + bz }, color, .14);
  }
  rider(Math.sin(m.time * .3) * 3, snowHeight(0, m.rivalZ), m.rivalZ, '#af7add', .1);
  rider(m.x, m.y, m.z, m.recovery ? '#ffdddd' : '#ed835b', m.heading, m.air ? m.spin : 0, m.air ? m.flip : 0, m.charge);
  // A route map shows actual heading and the separated backcountry choices.
  const mx = w - 87, my = h - 178; ctx.fillStyle = '#0b2a40ce'; ctx.fillRect(mx - 48, my - 10, 96, 153); ctx.strokeStyle = '#91b8c8'; ctx.lineWidth = 1; ctx.strokeRect(mx - 35, my, 70, 130);
  ctx.strokeStyle = '#efae76'; for (const r of rails) { ctx.beginPath(); ctx.moveTo(mx + r.x * .65, my + r.z / FINISH * 130); ctx.lineTo(mx + r.x * .65, my + r.end / FINISH * 130); ctx.stroke(); }
  ctx.fillStyle = '#ed835b'; ctx.beginPath(); ctx.arc(mx + m.x * .65, my + m.z / FINISH * 130, 3, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(mx + m.x * .65, my + m.z / FINISH * 130); ctx.lineTo(mx + m.x * .65 + Math.sin(m.heading) * 10, my + m.z / FINISH * 130 + Math.cos(m.heading) * 10); ctx.stroke();
}
