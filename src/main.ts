import "./style.css";
import {
  action,
  courses,
  createRun,
  normalizeSave,
  record,
  step,
  terrain,
  type Run,
} from "./game";
import { render } from "./render";
const el = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const canvas = el<HTMLCanvasElement>("mountain"),
  ctx = canvas.getContext("2d")!;
let run: Run | null = null,
  save = normalizeSave(null),
  storageOk = true;
try {
  save = normalizeSave(
    JSON.parse(localStorage.getItem("afterglow-ridge-v1") ?? "null"),
  );
} catch {
  storageOk = false;
}
let calm = matchMedia("(prefers-reduced-motion: reduce)").matches,
  sound = false,
  audio: AudioContext | undefined,
  last = performance.now(),
  clock = 0,
  lastMessage = "";
const held = new Set<string>(),
  pointerHeld = new Map<number, string>();
const keyMap: Record<string, string> = {
  ArrowLeft: "left",
  a: "left",
  ArrowRight: "right",
  d: "right",
  ArrowDown: "brake",
  s: "brake",
  Shift: "boost",
  " ": "jump",
  j: "spin",
  k: "grab",
};
function tone(kind: string) {
  if (!sound) return;
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(
      kind.includes("Clean") ? 660 : kind.includes("Wipeout") ? 110 : 330,
      audio.currentTime,
    );
    o.frequency.exponentialRampToValueAtTime(
      kind.includes("Wipeout") ? 45 : 440,
      audio.currentTime + 0.18,
    );
    g.gain.setValueAtTime(0.07, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.25);
    o.connect(g).connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.26);
  } catch {
    sound = false;
    el("sound").textContent = "Audio unavailable";
  }
}
function clearInput() {
  held.clear();
  pointerHeld.clear();
  document
    .querySelectorAll(".active")
    .forEach((e) => e.classList.remove("active"));
}
function showCourses() {
  el("courses").innerHTML = courses
    .map((c, i) => {
      const rec = save.records[i];
      return `<button class="course-card" data-course="${i}" style="--accent:${c.color}" ${i > save.unlocked ? "disabled" : ""}><span class="number">0${i + 1}</span><span><small>${c.kind} · ${c.time}s ${c.target ? ` / ${c.target} pts` : ""}</small><b>${c.name}</b><small>${i > save.unlocked ? "EARN THE PREVIOUS MEDAL" : rec ? `BEST ${rec.score.toLocaleString()} PTS / ${rec.time.toFixed(1)}s` : "CHOOSE YOUR LINE"}</small></span><span class="arrow">${i > save.unlocked ? "◇" : "↗"}</span></button>`;
    })
    .join("");
  document
    .querySelectorAll<HTMLButtonElement>("[data-course]")
    .forEach((b) => (b.onclick = () => start(Number(b.dataset.course))));
}
function start(course: number) {
  if (course > save.unlocked) return;
  clearInput();
  run = createRun(course);
  last = performance.now();
  lastMessage = "";
  el("menu").hidden = true;
  el("footer").hidden = true;
  el("overlay").hidden = true;
  el("hud").hidden = false;
  el("controls").hidden = false;
  el("pause").hidden = false;
  el("course-label").textContent = courses[course].name;
  el("event-label").textContent = courses[course].kind;
  el("pause").textContent = "Pause · P";
}
function menu() {
  clearInput();
  run = null;
  el("menu").hidden = false;
  el("footer").hidden = false;
  el("hud").hidden = true;
  el("controls").hidden = true;
  el("overlay").hidden = true;
  el("pause").hidden = true;
  showCourses();
}
function overlay(finished: boolean) {
  if (!run) return;
  clearInput();
  el("overlay").hidden = false;
  el("resume").hidden = finished;
  el("result-kicker").textContent = finished
    ? courses[run.course].kind
    : "TAKE A BREATH";
  el("result-title").textContent = finished
    ? run.medal
      ? "Ridge claimed."
      : "Another line awaits."
    : "On the ridge.";
  el("result-copy").textContent = finished
    ? run.medal
      ? run.course === 2
        ? "All three ridges complete. Ride again for a personal best."
        : "Medal earned. Your next ridge is unlocked."
      : `Reach the finish within ${courses[run.course].time}s${courses[run.course].target ? ` with ${courses[run.course].target} banked points` : ""}. Early tricks and clean landings help.`
    : "Your run is held here. Resume when you’re ready.";
  el("result-stats").textContent = finished
    ? `${run.score.toLocaleString()} pts · ${run.time.toFixed(1)}s · ${run.wipeouts} wipeouts${storageOk ? "" : " · Save unavailable"}`
    : "";
  el("pause").textContent = finished ? "Finished" : "Resume · P";
  el("announcer").textContent = el("result-title").textContent;
  el(finished ? "retry" : "resume").focus();
}
function pause() {
  if (!run || run.status === "finished") return;
  if (run.status === "running") {
    run.status = "paused";
    overlay(false);
  } else {
    run.status = "running";
    el("overlay").hidden = true;
    el("pause").textContent = "Pause · P";
    last = performance.now();
    clearInput();
  }
}
el("pause").onclick = pause;
el("resume").onclick = pause;
el("retry").onclick = () => {
  if (run) start(run.course);
};
el("return").onclick = menu;
el("home").onclick = (e) => {
  e.preventDefault();
  menu();
};
el("sound").onclick = () => {
  sound = !sound;
  el("sound").textContent = `Sound ${sound ? "on" : "off"}`;
  el("sound").setAttribute("aria-pressed", String(sound));
  tone("Ready");
};
el("motion").onclick = () => {
  calm = !calm;
  el("motion").setAttribute("aria-pressed", String(calm));
  el("motion").textContent = calm ? "Calm view on" : "Calm view";
};
window.addEventListener("keydown", (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (!run) return;
  if (["p", "Escape"].includes(key)) {
    if (!e.repeat) pause();
    e.preventDefault();
    return;
  }
  if (key === "r") {
    if (!e.repeat) start(run.course);
    e.preventDefault();
    return;
  }
  const mapped = keyMap[key];
  if (!mapped) return;
  if (e.target instanceof HTMLButtonElement && key === " ") return;
  e.preventDefault();
  if (e.repeat || held.has(key) || run.status !== "running") return;
  held.add(key);
  if (["jump", "spin", "grab"].includes(mapped))
    action(run, mapped as "jump" | "spin" | "grab");
});
window.addEventListener("keyup", (e) =>
  held.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key),
);
for (const button of document.querySelectorAll<HTMLButtonElement>(
  "[data-hold]",
)) {
  button.addEventListener("pointerdown", (e) => {
    if (run?.status !== "running") return;
    e.preventDefault();
    button.setPointerCapture(e.pointerId);
    pointerHeld.set(e.pointerId, button.dataset.hold!);
    button.classList.add("active");
  });
  const release = (e: PointerEvent) => {
    pointerHeld.delete(e.pointerId);
    button.classList.remove("active");
  };
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
}
for (const button of document.querySelectorAll<HTMLButtonElement>(
  "[data-action]",
))
  button.onclick = () => {
    if (run) action(run, button.dataset.action as "jump" | "spin" | "grab");
  };
window.addEventListener("blur", () => {
  clearInput();
  if (run?.status === "running") pause();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInput();
    if (run?.status === "running") pause();
  }
});
function has(value: string) {
  return (
    [...held].some((k) => keyMap[k] === value) ||
    [...pointerHeld.values()].includes(value)
  );
}
function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  clock += dt;
  if (run) {
    const previous = run.status;
    step(run, dt, {
      steer: Number(has("right")) - Number(has("left")),
      brake: has("brake"),
      boost: has("boost"),
    });
    if (run.message !== lastMessage) {
      lastMessage = run.message;
      if (
        lastMessage.startsWith("Clean") ||
        lastMessage.startsWith("Wipeout")
      ) {
        tone(lastMessage);
        el("announcer").textContent = lastMessage;
      }
    }
    if (previous === "running" && run.status === "finished") {
      record(save, run);
      try {
        localStorage.setItem("afterglow-ridge-v1", JSON.stringify(save));
        storageOk = true;
      } catch {
        storageOk = false;
      }
      overlay(true);
    }
    const c = courses[run.course];
    el("speed").textContent = String(Math.round(run.speed * 3.6));
    el("time").textContent = `${run.time.toFixed(1)} / ${c.time}s`;
    el("score").textContent =
      `${run.score.toLocaleString()} / ${c.target || "—"}`;
    el("message").textContent = run.message;
    el("chain").textContent =
      run.height > 0
        ? `AIR ${run.height.toFixed(1)} · ${run.trickTimeRemaining > 0.04 ? "SETTLING" : "READY TO LAND"}`
        : `CHAIN ×${run.chain}`;
    el<HTMLMeterElement>("boost").value = run.boost;
    el<HTMLMeterElement>("busy").value = run.trickTimeRemaining;
    el("air-label").style.opacity = run.height > 0 ? "1" : ".5";
    el("progress").style.width = `${(run.distance / c.length) * 100}%`;
    const next = terrain(run.course).find(
      (f) => f.type === "ramp" && f.z > run!.distance,
    );
    el("next").textContent = next
      ? `↑ CENTER LIP · ${Math.ceil(next.z - run.distance)} m · side lanes are safer`
      : "↓ FINISH AHEAD";
  }
  const dpr = Math.min(devicePixelRatio, 2),
    w = innerWidth,
    h = innerHeight;
  if (
    canvas.width !== Math.floor(w * dpr) ||
    canvas.height !== Math.floor(h * dpr)
  ) {
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  render(ctx, w, h, run, clock, calm);
  requestAnimationFrame(frame);
}
menu();
requestAnimationFrame(frame);
