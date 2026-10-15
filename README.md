# Afterglow Ridge

An original compact downhill snowboarding arcade, inspired by the broad idea of mountain racing and freestyle trick chains. Ride as Noor Vale through the fictional Halcyon massif. Original procedural artwork, writing, and synthesized sound cues; no commercial game assets or music.

## Play locally

```sh
npm ci
npm run build
node scripts/launch.mjs 5201
```

Open http://127.0.0.1:5201. The launcher checks availability and detaches a session-only Node server; it has no login/boot autostart. Logs go to `server.log`; the owned PID is in `.server.pid`. If the recorded process still exists the launcher refuses a duplicate. Restart after that process exits with the same command. Preserve unrelated servers; choose another port if occupied. Development: `npm run dev -- --port 5201 --strictPort` on a free port. Served HTTP is required; double-clicking source HTML is not supported.

## Default mountain controls

The root URL opens one 1,000 m headed 3D descent, with a rear-following perspective camera. The original event circuit is available at `?mode=classic`.

| Input | Mountain action |
| --- | --- |
| A / D | Steer world heading; balance on a rail |
| W / S | Tuck / brake |
| Hold Space, then release | Crouch and jump |
| Left / Right arrows | Prewind while crouched; spin in air |
| Up / Down arrows | Prewind / rotate flips |
| Hold Q / E | Grabs; combine both for another grab |
| N / M, J / L | Nose / tail press, counterbalance |
| Shift | Spend earned boost; full meter + airborne grab holds an advanced trick |
| P / Escape, R | Pause / resume, retry |

Release grabs and rotations before snow. Clean landings, rails and balanced presses link an at-risk combo; two safe seconds bank it, while a crash loses it. This sample uses desktop keyboard controls. Its optional `afterglow-mountain-v2-best` record is separate from the original v1 circuit save. [Full contract and research](docs/mountain-sample.md) · [completed native acceptance and 37-test/build result](docs/LOCAL_ACCEPTANCE_2026-10-15.md).

## Original circuit controls (`?mode=classic`)

| Input          | Action               |
| -------------- | -------------------- |
| ← / → or A / D | Carve left / right   |
| ↓ or S         | Brake                |
| Space          | Ollie                |
| J              | Orbit spin           |
| K              | Starlight grab       |
| Shift          | Consume earned boost |
| P / Escape     | Pause / resume       |
| R              | Restart challenge    |

Every ride action has a named pointer button. Carve, brake and boost buttons can be held. Jump and trick buttons activate once per click. Pause on tab/window interruption clears held inputs. Calm view suppresses boost streaks and defaults on for reduced-motion preference. Sound is opt-in. UI has visible timing cues and screen-reader announcements, but visually navigating the terrain remains required.

Cross colored jump lips for long airtime. Short ollies can also carry a trick if started early. Each trick is allowed once per jump and must settle before landing; the meter and READY TO LAND cue show safety. A late trick causes a wipeout. Clean trick jumps bank `trick points × chain`, with chain capped at five. Spin earns 300 and grab 180 base points. Banked points earn boost up to 100; boosting drains 22 units/second. Wipeouts lose pending points and chain, preserve banked score, and briefly reduce speed. Side lanes can bypass ramps and hazards; Aurora has outer lips for an alternate airborne route.

Blue Hour is a 65-second time trial. Copper Chute needs 900 banked points within 85 seconds. Aurora Traverse needs 1,400 within 85 seconds. A medal unlocks the next challenge. Failures still record personal bests; replay any unlocked event. Crossing the finish airborne waits for the actual landing, and time continues until touchdown. Score and time records are independent bests, not necessarily from the same run.

## Original circuit physics and saves (`?mode=classic`)

Distance-based 2.5D rear-view projection, not a 3D snow/contact simulation. Automatic downhill speed approaches a target; steering has lateral inertia; braking lowers the target. Ballistic jump height uses a constant gravity scalar. Tricks use a settling timer rather than physical angular momentum. Obstacles collide at their distance crossing within a lateral radius; sufficiently high jumps clear them. Trees/rocks do not deform; no grind rails, multiplayer or full open mountain. Challenges last roughly 45–65 seconds without braking.

Records and unlocks save at finish in this browser's localStorage under `afterglow-ridge-v1`. Malformed/unsupported data falls back safely. Storage failure leaves gameplay available and reports save unavailable. Reload returns to the menu; in-progress descents are intentionally not resumed. No accounts, telemetry, paid services or public deployment.

## Verification

`npm run check` runs TypeScript, Vitest public-engine/save tests and a production build. `npm audit --audit-level=moderate` audits development dependencies too. GitHub Actions repeats these checks on pushes and pull requests. See [design spec](docs/SPEC.md), [independent reviews](docs/REVIEW.md), [QA evidence](docs/QA.md), and [domain glossary](CONTEXT.md).

## Local mountain sample

The default preview now offers one continuous headed 3D mountain slice with crouch/release jumps, prewind, held grabs and rotations, rails, balanced presses, bankable combos and earned boost. [Controls, scope and verification](docs/mountain-sample.md). The original circuit and its save remain at `?mode=classic`. This is a bounded vertical slice, not a full SSX 3 recreation.
