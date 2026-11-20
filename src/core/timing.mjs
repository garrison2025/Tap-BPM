export const NOTE_VALUES = Object.freeze([
  { label: 'Whole note', symbol: '1/1', multiplier: 4 },
  { label: 'Half note', symbol: '1/2', multiplier: 2 },
  { label: 'Quarter note', symbol: '1/4', multiplier: 1 },
  { label: 'Eighth note', symbol: '1/8', multiplier: 0.5 },
  { label: 'Sixteenth note', symbol: '1/16', multiplier: 0.25 },
  { label: 'Thirty-second note', symbol: '1/32', multiplier: 0.125 }
]);

export function validateBpm(bpm) {
  const parsed = Number(bpm);
  return Number.isFinite(parsed) && parsed >= 20 && parsed <= 300 ? parsed : null;
}

export function quarterNoteMs(bpm) {
  const value = validateBpm(bpm);
  return value === null ? null : 60000 / value;
}

export function noteDurationMs(bpm, multiplier, variation = 'straight') {
  const base = quarterNoteMs(bpm);
  if (base === null || !Number.isFinite(multiplier) || multiplier <= 0) return null;
  const factor = variation === 'dotted' ? 1.5 : variation === 'triplet' ? 2 / 3 : variation === 'straight' ? 1 : null;
  return factor === null ? null : base * multiplier * factor;
}

export function timingTable(bpm) {
  if (validateBpm(bpm) === null) return null;
  return NOTE_VALUES.map((note) => ({
    ...note,
    straight: noteDurationMs(bpm, note.multiplier),
    dotted: noteDurationMs(bpm, note.multiplier, 'dotted'),
    triplet: noteDurationMs(bpm, note.multiplier, 'triplet')
  }));
}

export const millisecondsToHertz = (ms) => Number.isFinite(ms) && ms > 0 ? 1000 / ms : null;

export function formatMs(value) {
  return value === null || !Number.isFinite(value) ? '—' : `${value.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} ms`;
}
