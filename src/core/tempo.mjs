/** Pure timing model. Timestamp source is performance.now() in the UI. */
export const MIN_INTERVAL_MS = 120;
export const PAUSE_RESET_MS = 3000;
export const MAX_INTERVALS = 12;

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

export function createTempoState() {
  return { lastTap: null, tapCount: 0, intervals: [], bpm: null, consistency: null, medianInterval: null, status: 'ready' };
}

export function computeTempo(intervals) {
  if (!intervals.length) return { bpm: null, consistency: null, medianInterval: null, acceptedIntervals: [] };
  const center = median(intervals);
  // Filter isolated misses/double-time errors without inflating BPM.
  const filtered = intervals.filter((x) => Math.abs(x - center) <= center * 0.25);
  const sample = filtered.length ? filtered : intervals;
  const estimate = median(sample);
  const mad = median(sample.map((x) => Math.abs(x - estimate)));
  const cvLike = mad / estimate;
  const consistency = sample.length < 2 ? null : Math.round(Math.max(0, Math.min(100, 100 - cvLike * 350)));
  return { bpm: 60000 / estimate, consistency, medianInterval: estimate, acceptedIntervals: sample };
}

export function registerTap(previous, timestamp) {
  if (!Number.isFinite(timestamp)) return { state: previous, event: 'invalid' };
  if (previous.lastTap === null || timestamp - previous.lastTap > PAUSE_RESET_MS || timestamp < previous.lastTap) {
    return { state: { ...createTempoState(), lastTap: timestamp, tapCount: 1, status: 'listening' }, event: 'new' };
  }
  const gap = timestamp - previous.lastTap;
  if (gap < MIN_INTERVAL_MS) return { state: previous, event: 'ignored' };
  const intervals = [...previous.intervals, gap].slice(-MAX_INTERVALS);
  const result = computeTempo(intervals);
  return {
    state: {
      lastTap: timestamp,
      tapCount: previous.tapCount + 1,
      intervals,
      bpm: result.bpm,
      consistency: result.consistency,
      medianInterval: result.medianInterval,
      status: intervals.length < 3 ? 'calibrating' : 'measuring'
    },
    event: 'accepted'
  };
}

export function displayBpm(bpm, factor = 1) {
  return Number.isFinite(bpm) && bpm > 0 ? Math.round(bpm * factor * 10) / 10 : null;
}

export function consistencyLabel(value, tapCount) {
  if (tapCount < 4 || value == null) return 'Calibrating';
  if (value >= 94) return 'Very steady';
  if (value >= 80) return 'Steady';
  return 'Keep tapping';
}
