import { describe, expect, it } from 'vitest';
import { createMountain, stepMountain, FINISH, normalizeMountainBest, type MountainInput } from '../src/mountain';
function ride() { const m = createMountain(); m.status = 'running'; return m; }
function hold(m: ReturnType<typeof ride>, seconds: number, input: MountainInput = {}) { for (let t = 0; t < seconds - 1e-6; t += 1 / 120) stepMountain(m, Math.min(1 / 120, seconds - t), input); }
describe('headed mountain input and scoring contract', () => {
  it('changes heading and travels across the slope rather than sliding a lane', () => { const m=ride(); hold(m,.65,{turn:1}); expect(m.heading).toBeGreaterThan(.6); expect(m.x).toBeGreaterThan(3); hold(m,1.4,{turn:1,brake:true}); expect(m.heading).toBeGreaterThan(Math.PI/2); const z=m.z;hold(m,.4);expect(m.z).toBeLessThan(z); });
  it('crouches on snow and jumps only on release, longer hold gives more airtime', () => { const a=ride(), b=ride(); hold(a,.1,{crouch:true}); expect(a.air).toBe(false);hold(a,.01);expect(a.air).toBe(true);hold(b,.7,{crouch:true});hold(b,.01);expect(b.vy).toBeGreaterThan(a.vy+4); });
  it('directional prewind accelerates controlled airborne rotation', () => { const a=ride(),b=ride();hold(a,.6,{crouch:true,spin:1});hold(b,.6,{crouch:true});hold(a,.3,{spin:1});hold(b,.3,{spin:1});expect(a.rotated).toBeGreaterThan(b.rotated*1.5); });
  it('requires held grabs to be released before touchdown', () => { const m=ride();hold(m,.7,{turn:1});hold(m,.7,{turn:-1});hold(m,.7,{crouch:true});hold(m,2.8,{grab:1});expect(m.wipeouts).toBeGreaterThan(0);expect(m.score).toBe(0); });
  it('banks a released grab after a clean landing and spends earned boost', () => { const m=ride();hold(m,.7,{turn:1});hold(m,.7,{turn:-1});hold(m,.8,{crouch:true});hold(m,.6,{grab:1});hold(m,4);expect(m.cleanLandings).toBeGreaterThan(0);expect(m.score).toBeGreaterThan(180);expect(m.boost).toBeGreaterThan(0);const reserve=m.boost;hold(m,.25,{boost:true});expect(m.boost).toBeLessThan(reserve); });
  it('supports a real jump onto an elevated rail, with score linked to a press', () => { const m=ride();hold(m,.65);hold(m,.35,{crouch:true});hold(m,1.7);expect(m.rails).toBeGreaterThan(0);expect(m.combo).toBeGreaterThan(0);for(let i=0;i<600&&m.pressTime<=.35;i++)hold(m,.01,{press:1});expect(m.pressTime).toBeGreaterThan(.35);expect(m.comboClock).toBeGreaterThan(1.5); });
  it('loses the whole pending combo when a long press tips over', () => { const m=ride();hold(m,2.4,{press:1});expect(m.wipeouts).toBe(1);expect(m.combo).toBe(0);expect(m.score).toBe(0); });
  it('freezes simulation in pause and rejects nonfinite time', () => {const m=ride();hold(m,1);m.status='paused';const before=structuredClone(m);hold(m,1,{crouch:true});expect(m).toEqual(before);m.status='running';const time=m.time;stepMountain(m,NaN);expect(m.time).toBe(time);});
  it('finishes a connected descent without forced lane choices', () => {const m=ride();for(let i=0;i<80&&m.status==='running';i++)hold(m,1);expect(m.status).toBe('finished');expect(m.z).toBe(FINISH);expect(m.time).toBeGreaterThan(25);expect(m.rivalZ).toBeGreaterThan(700);});
  it('is stable across coarse and fine frame updates', () => {const a=ride(),b=ride();for(let i=0;i<40;i++)stepMountain(a,.05,{tuck:true});hold(b,2,{tuck:true});expect(a.z).toBeCloseTo(b.z,6);expect(a.speed).toBeCloseTo(b.speed,6);});
});

describe('untrusted input boundaries', () => {
 it('rejects malformed best records', () => { for (const v of ['Infinity', '-5', '4.5', '100000001', {}, null, '']) expect(normalizeMountainBest(v)).toBe(0); expect(normalizeMountainBest('1234')).toBe(1234); });
 it('contains nonfinite and excessive numeric controls', () => {const m=ride();hold(m,.5,{turn:NaN,spin:Infinity,press:Infinity,balance:-Infinity,grab:NaN});expect(Number.isFinite(m.x+m.y+m.z+m.heading+m.combo)).toBe(true);});
 it('consumes prewind at takeoff', () => {const m=ride();hold(m,.6,{crouch:true,spin:1});hold(m,.02);expect(m.preSpin).toBe(0);expect(m.flightSpin).toBe(1);});
});

describe('safe orientation and advanced grab gating', () => {
 it('rejects a near-half-flip touchdown', () => {const m=ride();hold(m,.7,{turn:1});hold(m,.7,{turn:-1});hold(m,.8,{crouch:true});hold(m,1.56);hold(m,.775,{flip:1});hold(m,1/120);expect(m.wipeouts).toBeGreaterThan(0);expect(m.cleanLandings).toBe(0);});
 it('does not grant advanced tricks from the Super unlock alone', () => {const m=ride();m.ubers=4;hold(m,.7,{turn:1});hold(m,.7,{turn:-1});hold(m,.8,{crouch:true});hold(m,.9,{grab:1,boost:true});expect(m.uberDone).toBe(false);});
});
