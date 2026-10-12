# Afterglow Ridge
Delegated design, 2026-10-12. No interactive interview occurred. Recommended choices are adopted under the user's explicit delegation.

Original rider: Noor Vale, a courier following the evening light across the fictional Halcyon massif. Rear-view projected Canvas mountain; analogue lateral inertia, automatic downhill acceleration, brake/carve, ramps and manual ollies. This is an arcade abstraction, not a snow physics simulation. No SSX assets, tracks, characters or music.

Three 40–65 second challenges: Blue Hour time trial; Copper Chute freestyle score; Aurora Traverse combined summit challenge. First completion unlocks the next challenge. Failure always allows retry. Repeat completed events to improve independent score/time records.

Public testing seams: exported run creation/update/action functions and save normalization; visible DOM controls and HUD. These seams are chosen under the delegated testing authority. Frame-independent simulation, bounded boost, one action per input edge, unique tricks per jump, timed landing readiness, obstacle collision, finish gating, pause and restart isolation, sanitized storage and progression must be tested.

Tricks take time; starting another too close to snow causes wipeout. Clean landings bank a chain; consecutive clean jumps multiply points. Crashes lose the chain and slow the rider. Repeated held/repeated key events cannot create new tricks. Boost is earned through clean tricks and drains while held. Ramp lanes and safer snow lanes offer route choices.

Accessible named keyboard and pointer controls; visible timing cues, pause on blur/hidden, reduced-motion option, audio opt-in, responsive HUD and menus. Keyboard: arrows/A,D carve; down/S brake; Space jump; J spin; K grab; Shift boost; P/Escape pause; R restart. All actions also have pointer buttons.

Delivery: private GitHub, documented local launcher on a verified free port, CI typecheck/test/build/audit, independent standards and spec review, visible Mac Chrome gameplay evidence and honest hardware/audio limits.
