# Independent review

Reviewed baseline `86b3c6d` through implementation `d31694f` in two independent agents, using Matt Pocock's local code-review skill.

## Standards

Two functional defects: simulation substeps continued after finish, allowing deadline medals to be revoked; finish used a different trick settling threshold from normal landings. Heuristic findings: duplicated landing banking, repeated input data shape, and unclear `busy` naming.

Resolution: stop substeps on status transition; wait for real touchdown at the finish so the single ordinary landing rule adjudicates it; introduce RunInput; rename to trickTimeRemaining. Added three finish regression tests, two confirmed red before the fix.

## Spec

Finish prematurely banked airborne tricks; progression wording said completion while implementation required a medal; courses repeated similar layouts.

Resolution: actual landing adjudication; specification explicitly records delegated medal gating; distinct course spacing and obstacle arrangements, narrower summit center lips and alternate outer jumps.

The two axes found no scope creep or security defect. Browser evidence and delivery checks are tracked separately in QA.md.
