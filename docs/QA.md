# Validation evidence

2026-10-12. Actual Mac Chrome session at http://127.0.0.1:5201, operated using named visible controls and keyboard through the computer-use tools. No game state injection, accelerated clock, hidden test unlocks or autoplay were used for these runs.

## Browser gameplay

| Challenge       | Observed result                                                                                                                                                                                                                                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blue Hour       | 300 pts, 42.2s, 0 wipeouts; medal and Copper unlock; early spin clean landing. Record and unlock persisted on reload. This original completion preceded the finish review fix. A later native Chrome replay on the final engine also earned a medal at 42.2s with 0 points and 0 wipeouts.                                             |
| Copper Chute    | First run: 0 pts, 49.1s, 1 wipeout, failure panel and retry. After review fixes: 900 pts, 47.7s, 0 wipeouts; two clean spin jumps banked 300 then 600 with chain ×2; earned boost consumed, pace observed 120 km/h; medal unlocked Aurora.                                                                                             |
| Aurora Traverse | After review fixes: 1,800 pts, 62.4s, 4 obstacle wipeouts; medal and all-ridges-complete panel. Three clean spin jumps, chain ×3, boost capped at 100. Brake observed reducing pace to 55 km/h; side route bypasses center lips and encounters trees. Further replay used the right outer lip at 175m and a clean grab banked 180 pts. |

Pause/resume, menu return, multiple replays/restarts, clean/failed landings, ground tricks doing nothing, record reload, scoring, progression, side route, obstacle loss of chain and preserved banked points were observed. Phone viewport 390×844: readable HUD, all pointer controls, and pause panel inspected. Pointer hold carving and named trick-button clicks were exercised. Native and tool-routed keyboard steering, braking, boost and pause were exercised.

Saved screenshots: [final Blue Hour medal](screenshots/blue-hour-final-medal.jpg), [native interruption pause](screenshots/native-interruption-paused.jpg), [Copper medal](screenshots/copper-medal.jpg), [Aurora medal](screenshots/aurora-medal.jpg), [outer jump](screenshots/aurora-outer-jump.jpg), [outer route](screenshots/aurora-outer-line.jpg), [phone ride](screenshots/mobile-ride.jpg), [phone pause](screenshots/mobile-paused.jpg). Images were visually inspected.

Browser log inspection showed Chrome-extension warnings from a password-manager content script, and no observed application error. Those extension messages are unrelated to this repository.

## Automated checks

22 Vitest public simulation/storage tests: movement and braking, frame-rate stability, airborne trick timing, duplicate trick suppression, clean/unsafe landings, chain/boost bounds, collision and obstacle clearance, ramp bypass/alternate lip, pause/resume, fresh restart, finish/deadline safety, progression, best records, corrupt saves, and all-three-medal circuit. Full-circuit tests are simulations, separate from Chrome gameplay above.

TypeScript strict checking, production Vite build, dependency audit (0 vulnerabilities), git whitespace checks. GitHub Actions runs typecheck, tests, build and audit on the pushed final commit. The delivery response links its exact run.

## Independent review

Separate standards/spec reviewers examined the implementation, identified finish defects and course similarity, then rechecked the fix commit. Both found no remaining blockers; see REVIEW.md. Two finish regressions were confirmed failing before correction.

## Local server

The launcher verified free port 5201 and detached Node PID 9189 from the task terminal. HTTP 200 and actual Chrome load were verified after detaching. It binds only loopback, has no boot/login autostart, and preserves existing repositories/servers. The final response includes restart instructions; launcher won't start another server on an occupied port.

## Remaining boundaries

The earlier Mac-lock blocker was cleared during a delegated follow-up on 2026-10-12; no unlock or restriction bypass was performed. Native Chrome completed the final-engine Blue Hour replay. Native Cmd+T / Cmd+W interruption initially appeared to leave the game running because the browser test harness emulated focus: read-only CDP inspection reported `hidden:false`, `visibility:visible`, `focus:true` even with another tab selected. Temporarily disabling that harness emulation via supported `Emulation.setFocusEmulationEnabled` restored normal browser events. Repeating native tab interruption then automatically paused at 0.3s, remained frozen across observations, and resumed to 0.6s through the native Resume button. No gameplay regression was found and no gameplay code changed. [Native interruption screenshot](screenshots/native-interruption-paused.jpg) records the paused state. The temporary harness override was restored and the test tab closed after verification.

No physical touchscreen, gamepad, or audio listening test occurred. Sound synthesis is original and opt-in, but listening quality is unverified. Responsive viewport checks are not physical-device tests. Save/records persist; in-progress runs intentionally do not survive reload. The compact 2.5D abstraction has no full open-mountain exploration, mesh contact physics, rails or opponents.
