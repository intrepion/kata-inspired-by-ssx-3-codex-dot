import { courses, terrain, type Run } from "./game";
const snow = ["#d3edf1", "#c5e4eb"];
export function render(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  r: Run | null,
  clock: number,
  calm: boolean,
) {
  const course = r?.course ?? 0;
  const distance = r?.distance ?? clock * 7;
  const x = r?.x ?? 0.18;
  const horizon = h * 0.37;
  const color = courses[course].color;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon + 80);
  sky.addColorStop(0, "#102d48");
  sky.addColorStop(0.65, course === 1 ? "#ab737e" : "#567d9f");
  sky.addColorStop(1, "#ffb896");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#ffe3b8";
  ctx.beginPath();
  ctx.arc(w * 0.78, h * 0.23, 29, 0, Math.PI * 2);
  ctx.fill();
  for (let layer = 0; layer < 3; layer++) {
    ctx.fillStyle = ["#2d4f70", "#547a91", "#91b8c6"][layer];
    ctx.beginPath();
    ctx.moveTo(0, horizon + 60);
    for (let i = 0; i <= 12; i++) {
      const px = (i * w) / 12;
      const py = horizon - 30 - layer * 12 - Math.sin(i * 2.4 + layer) * 45;
      ctx.lineTo(px, py);
      ctx.lineTo(px + w / 24, py - 40 - Math.cos(i) * 20);
    }
    ctx.lineTo(w, horizon + 130);
    ctx.lineTo(0, horizon + 130);
    ctx.fill();
  }
  const project = (lane: number, z: number) => {
    const f = 1 / (1 + Math.max(0, z) / 32);
    return {
      x:
        w / 2 +
        (lane - x * 0.62) * w * 0.46 * f +
        Math.sin((distance + z) / 200) * w * 0.09 * f,
      y: horizon + h * 0.44 * f,
      scale: f,
    };
  };
  ctx.fillStyle = "#cee8ee";
  ctx.fillRect(0, horizon + 30, w, h);
  for (let z = 320; z >= 0; z -= 8) {
    const p = project(-1, z),
      q = project(1, z),
      p2 = project(-1, z + 8),
      q2 = project(1, z + 8);
    ctx.fillStyle = snow[Math.floor((distance + z) / 24) % 2];
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
    ctx.lineTo(q2.x, q2.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.fill();
    ctx.fillStyle = "#8baeba";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - 100 * p.scale, p.y);
    ctx.lineTo(p2.x - 100 * p2.scale, p2.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(q.x, q.y);
    ctx.lineTo(q.x + 100 * q.scale, q.y);
    ctx.lineTo(q2.x + 100 * q2.scale, q2.y);
    ctx.lineTo(q2.x, q2.y);
    ctx.fill();
  }
  for (let i = 0; i < 30; i++) {
    const z = i * 21 - (distance % 21);
    if (z < 0) continue;
    const p = project(i % 2 ? -1.15 : 1.15, z);
    ctx.strokeStyle = "#789ba9";
    ctx.lineWidth = Math.max(1, p.scale * 3);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, p.y - 26 * p.scale);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fillRect(p.x, p.y - 26 * p.scale, 15 * p.scale, 7 * p.scale);
  }
  const features = terrain(course)
    .filter((f) => f.z - distance > -10 && f.z - distance < 400)
    .sort((a, b) => b.z - a.z);
  for (const f of features) {
    const p = project(f.x, f.z - distance);
    const s = p.scale;
    if (f.type === "ramp") {
      const half = w * 0.46 * f.width * s;
      ctx.fillStyle = "#4995a3";
      ctx.beginPath();
      ctx.moveTo(p.x - half, p.y);
      ctx.lineTo(p.x + half, p.y);
      ctx.lineTo(p.x + half, p.y - 15 * s);
      ctx.lineTo(p.x - half, p.y - 15 * s);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(p.x - half, p.y - 17 * s, half * 2, 5 * s);
      ctx.fillStyle = "#f0ffff";
      ctx.font = `bold ${Math.max(7, 13 * s)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText("AIR", p.x, p.y - 24 * s);
    } else if (f.type === "tree") {
      ctx.fillStyle = "#2b5364";
      ctx.fillRect(p.x - 4 * s, p.y - 70 * s, 8 * s, 70 * s);
      for (let j = 0; j < 3; j++) {
        ctx.fillStyle = j % 2 ? "#316875" : "#20495c";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - (115 - j * 23) * s);
        ctx.lineTo(p.x - (29 + j * 5) * s, p.y - (48 - j * 17) * s);
        ctx.lineTo(p.x + (29 + j * 5) * s, p.y - (48 - j * 17) * s);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = "#54758b";
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - 9 * s, 28 * s, 19 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f3fbfb";
      ctx.beginPath();
      ctx.ellipse(
        p.x - 5 * s,
        p.y - 18 * s,
        18 * s,
        8 * s,
        -0.2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  const end = courses[course].length - distance;
  if (end < 340 && end > -20) {
    const p = project(0, end),
      a = project(-0.95, end),
      b = project(0.95, end);
    ctx.strokeStyle = color;
    ctx.lineWidth = 5 * p.scale;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(a.x, a.y - 110 * p.scale);
    ctx.lineTo(b.x, b.y - 110 * p.scale);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.fillStyle = "#14374b";
    ctx.fillRect(a.x, a.y - 110 * p.scale, b.x - a.x, 30 * p.scale);
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${20 * p.scale}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("HALCYON / FINISH", p.x, p.y - 87 * p.scale);
  }
  const rx = project(x, 0).x,
    ry = h * 0.81 - (r?.height ?? 0) * h * 0.027;
  ctx.fillStyle = "#49748055";
  ctx.beginPath();
  ctx.ellipse(rx, h * 0.81, 38, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(rx, ry);
  const spin =
    r?.tricks.includes("spin") && r.trickTimeRemaining > 0
      ? r.trickTimeRemaining * 9
      : 0;
  ctx.rotate(
    spin + (r?.vx ?? 0) * 0.28 + (r?.recovery ? Math.sin(clock * 30) * 0.6 : 0),
  );
  ctx.strokeStyle = color;
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-31, 15);
  ctx.lineTo(31, 15);
  ctx.stroke();
  ctx.strokeStyle = "#263b54";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-15, 8);
  ctx.lineTo(-10, -10);
  ctx.lineTo(8, -10);
  ctx.lineTo(17, 8);
  ctx.stroke();
  ctx.fillStyle = "#ed835b";
  ctx.beginPath();
  ctx.roundRect(-16, -48, 32, 36, 9);
  ctx.fill();
  ctx.strokeStyle = "#ed835b";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-12, -36);
  ctx.lineTo(-34, -22);
  ctx.moveTo(12, -36);
  ctx.lineTo(r?.trickTimeRemaining && r.tricks.includes("grab") ? 23 : 34, -20);
  ctx.stroke();
  ctx.fillStyle = "#20364e";
  ctx.beginPath();
  ctx.arc(0, -57, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9ceaf0";
  ctx.fillRect(-11, -59, 22, 6);
  ctx.restore();
  if (!calm && r && r.speed > 27) {
    ctx.strokeStyle = "#efffff70";
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const px = (i * 113 + clock * 200) % w;
      ctx.beginPath();
      ctx.moveTo(px, h * 0.58);
      ctx.lineTo(px + (px - w / 2) * 0.12, h * 0.68);
      ctx.stroke();
    }
  }
}
