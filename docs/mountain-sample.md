# Mountain sample — local fidelity correction

> Final local native acceptance completed on 2026-10-15. See [final acceptance](LOCAL_ACCEPTANCE_2026-10-15.md) for current browser evidence; pending entries below describe the earlier source handoff.


Scope: one continuous 1,000m downhill segment from rail park through a split backcountry ridge to a village finish. Original event circuit remains at `?mode=classic`; the new default has a separate optional best-score key (`afterglow-mountain-v2-best`). Original v1 data is untouched.

## Baseline and decisions

EA's original SSX 3 GameCube manual, visually inspected raster scan, printed pp6–8 and12–15: https://www.gamesdatabase.org/Media/SYSTEM/Nintendo_GameCube/manual/Formated/SSX_3_-_2003_-_Electronic_Arts.pdf . This establishes release-to-jump with crouch height, directional prewind, held grabs/tweak/release, board presses, physical rails and linking combos, four ÜBERs to Super and temporary full meter after spelling SUPER ÜBER. Original camera is rear-following through actual 3D terrain. No exact commercial tuning or controller parity claimed.

Grill with Docs and Implement used with the user's recommended-default authority: skip optional interview, keep deterministic simulation separate from renderer and input, review against clean recorded HEAD, no commits. Default new mode instead of modifying event records avoids retroactively invalidating medals.

## Public contract and controls

A/D steer a world heading (rail: balance); W tuck; S brake. Hold Space to crouch, release to jump. Arrow directions prewind while crouched and continuously rotate in air. Q/E held grabs, both for combination. Release rotations/grabs before snow. N/M nose/tail press, J/L counterbalance, release before tipping. Shift spends trick-earned adrenaline on snow; full meter + grab + Shift in air holds an advanced trick. Four completed ÜBERs unlock Super; nine grant 15 seconds unlimited boost. P/Escape pause, R retry. Blur/hidden pauses and clears all held controls/crouch state.

Landing banks nothing immediately: clean tricks, rails and balanced presses keep an at-risk combo alive. Two seconds of safe snow without a press banks it; crash loses all pending points. Repeated identical airborne combinations reduce value. Public simulation seam is `createMountain`/`stepMountain` plus sampled held `MountainInput`.

## Acceptance

Unit coverage exercises headed traversal including uphill heading, hold/release, prewind speed, held-grab crash, clean-bank/boost, jump-on rail, balance crash, pause/invalid dt, connected finish, and frame stability. Build and independent review results are recorded in delivery evidence. Browser acceptance must use ordinary controls to complete a descent and demonstrate landing/bank, rail, press, boost and pause. No browser completion is claimed until recorded separately.

Limitations: original procedural art; keyboard-only desktop sample (old circuit retains its pointer UI). Software perspective projection, simple point/body collision, authored broad slope and raised fork, one scripted rival. No commercial mountain, full campaign, halfpipe/handplants, crowd/AI field, licensed assets/music, gamepad or exact camera/physics replication.
