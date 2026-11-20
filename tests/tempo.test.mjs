import test from 'node:test';
import assert from 'node:assert/strict';
import { createTempoState, registerTap, computeTempo, displayBpm, consistencyLabel } from '../src/core/tempo.mjs';

const tapSeries = (interval, count = 5) => {
  let s = createTempoState();
  for(let i=0; i<count;i++) s = registerTap(s, 1000 + interval*i).state;
  return s;
};

test('first tap never generates a false BPM', () => {
  const {state,event} = registerTap(createTempoState(), 1000);
  assert.equal(event,'new'); assert.equal(state.bpm,null); assert.equal(state.tapCount,1);
});
for (const [ms,bpm] of [[500,120],[600,100],[750,80]]) test(`${ms} ms steady taps yield ${bpm} BPM`,()=>{
  const state = tapSeries(ms);
  assert.equal(state.bpm,bpm); assert.equal(state.tapCount,5);
});
test('reject accidental double taps with no duplicate count',()=>{
  let state = registerTap(createTempoState(), 1000).state;
  const dropped=registerTap(state,1050);assert.equal(dropped.event,'ignored');assert.deepEqual(dropped.state,state);
  state=registerTap(state,1500).state;assert.equal(state.tapCount,2);assert.equal(state.bpm,120);
});
test('restart after 3 seconds rather than mixing long pauses',()=>{
  let state=tapSeries(500);
  state=registerTap(state, 8000).state;
  assert.equal(state.bpm,null); assert.equal(state.tapCount,1);assert.equal(state.intervals.length,0);
});
test('median resists one missed beat outlier',()=>{
  const result=computeTempo([500,500,1000,500,500]);assert.equal(result.bpm,120);
  assert.equal(result.acceptedIntervals.length,4);
});
test('keeps sliding history bounded to twelve intervals',()=>{
  let state=createTempoState();for(let i=0;i<21;i++) state=registerTap(state,1000+i*500).state;
  assert.equal(state.tapCount,21);assert.equal(state.intervals.length,12);
});
test('half and double BPM controls have numeric precision',()=>{
  assert.equal(displayBpm(120,0.5),60);assert.equal(displayBpm(120,2),240);
  assert.equal(displayBpm(null,1),null);
});
test('negative or time-reversed timestamp creates new measurement',()=>{
  let state=tapSeries(500);
  state=registerTap(state,10).state;assert.equal(state.tapCount,1);assert.equal(state.bpm,null);
});
test('consistency is calibrating before enough accepted taps',()=>{
  assert.equal(consistencyLabel(100,2),'Calibrating');assert.equal(consistencyLabel(100,5),'Very steady');
});
