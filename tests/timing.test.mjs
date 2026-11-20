import test from 'node:test';
import assert from 'node:assert/strict';
import {NOTE_VALUES, quarterNoteMs, noteDurationMs, timingTable, validateBpm, millisecondsToHertz, formatMs} from '../src/core/timing.mjs';
for(const [bpm,ms] of [[120,500],[100,600],[80,750],[60,1000]]) test(`quarter note at ${bpm} BPM = ${ms} ms`,()=>assert.equal(quarterNoteMs(bpm),ms));
test('straight, dotted, triplet note values at 120 BPM',()=>{
  assert.equal(noteDurationMs(120,0.5),250);
  assert.equal(noteDurationMs(120,0.5,'dotted'),375);
  assert.ok(Math.abs(noteDurationMs(120,0.5,'triplet')-166.6666667)<.0001);
  assert.equal(noteDurationMs(120,4),2000);
  assert.equal(noteDurationMs(120,0.25),125);
  assert.equal(noteDurationMs(120,0.25,'dotted'),187.5);
});
test('table contains all 6 note types x 3 modifiers = 18 values',()=>{
  const rows=timingTable(120);assert.equal(rows.length,6);assert.equal(rows.length*3,18);
  rows.forEach(row=>{assert.ok(row.straight>0&&row.dotted>row.straight&&row.triplet<row.straight)});
});
test('invalid BPM is rejected without fake outputs',()=>{
  for(const value of [0,19,301,'oops',Infinity,NaN,-120,'']){
    assert.equal(validateBpm(value),null);
    assert.equal(timingTable(value),null);
  }
});
test('frequency and milliseconds formatting',()=>{
  assert.equal(millisecondsToHertz(500),2);assert.equal(formatMs(125),'125.0 ms');
  assert.equal(millisecondsToHertz(0),null);assert.equal(formatMs(null),'—');
});
test('invalid variation gives null instead of silently returning straight',()=>{
  assert.equal(noteDurationMs(120,0.5,'unknown'),null);
});
