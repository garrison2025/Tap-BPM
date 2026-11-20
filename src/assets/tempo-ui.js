import { createTempoState, registerTap, displayBpm, consistencyLabel, PAUSE_RESET_MS } from '../core/tempo.mjs';
import { notify, copyText } from './shared.js';

const $ = (selector) => document.querySelector(selector);
const tapButton = $('#tap-button');
const tapBpm = $('#bpm-value');
const status = $('#tempo-status');
const hint = $('#tempo-hint');
const count = $('#tap-count');
const consistency = $('#consistency');
const interval = $('#avg-interval');
const live = $('#tempo-live');
const visual = $('#tap-visual');
const meter = $('#consistency-bar');
const factorButtons = [...document.querySelectorAll('[data-bpm-factor]')];
let state = createTempoState();
let factor = 1;
let idleTimer;
let audioContext;
let clickEnabled = false;
const history = [];

function render() {
  const value = displayBpm(state.bpm, factor);
  tapBpm.textContent = value == null ? '--' : Number.isInteger(value) ? String(value) : value.toFixed(1);
  count.textContent = state.tapCount;
  consistency.textContent = consistencyLabel(state.consistency, state.tapCount);
  interval.textContent = state.medianInterval == null ? '—' : `${Math.round(state.medianInterval)} ms`;
  meter.style.width = `${state.consistency ?? 0}%`;
  status.textContent = state.status === 'ready' ? 'READY TO TAP' : state.status === 'paused' ? 'PAUSED' : state.status === 'measuring' ? 'LOCKING IN' : state.status === 'calibrating' ? 'FINDING YOUR RHYTHM' : 'LISTENING';
  hint.textContent = state.status === 'paused' ? 'Tap again to start a fresh measurement.' : state.tapCount === 0 ? 'Tap at least twice to calculate your BPM.' : state.tapCount < 4 ? 'Keep a steady beat for a better reading.' : 'Great. Keep tapping to refine the estimate.';
  live.textContent = value === null ? 'Waiting for taps' : `${value} beats per minute. ${state.tapCount} taps.`;
  $('#copy-bpm').disabled = value === null;
  $('#open-delay').href = value === null ? '/delay-reverb-calculator/' : `/delay-reverb-calculator/?bpm=${encodeURIComponent(value)}`;
}

function beep() {
  if (!clickEnabled) return;
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') void audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.value = 740;
    gain.gain.setValueAtTime(0.065, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.08);
  } catch { clickEnabled = false; $('#sound-toggle').setAttribute('aria-pressed', 'false'); }
}

function register() {
  const result = registerTap(state, performance.now());
  if (result.event === 'ignored') return;
  state = result.state;
  beep();
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (state.tapCount > 0) { state = { ...state, status: 'paused' }; render(); }
  }, PAUSE_RESET_MS + 100);
  visual.classList.remove('pulse');
  void visual.offsetWidth;
  visual.classList.add('pulse');
  if (state.bpm) {
    try { sessionStorage.setItem('tempo-lab-last-bpm', String(displayBpm(state.bpm, factor))); } catch { /* optional */ }
  }
  history.push(Date.now());
  if (history.length > 50) history.shift();
  render();
}

tapButton.addEventListener('click', register);
document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
  const active = document.activeElement;
  if (active && (active.matches('input, textarea, select, [contenteditable="true"]') || (active.matches('button, a') && active !== tapButton))) return;
  e.preventDefault();
  register();
});

$('#reset-taps').addEventListener('click', () => {
  clearTimeout(idleTimer);
  state = createTempoState();
  factor = 1;
  factorButtons.forEach((b) => { b.classList.toggle('selected', b.dataset.bpmFactor === '1'); b.setAttribute('aria-pressed', String(b.dataset.bpmFactor === '1')); });
  render();
  notify('Measurement reset');
});

factorButtons.forEach((button) => button.addEventListener('click', () => {
  factor = Number(button.dataset.bpmFactor);
  factorButtons.forEach((item) => { item.classList.toggle('selected', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  if (state.bpm) {
    try { sessionStorage.setItem('tempo-lab-last-bpm', String(displayBpm(state.bpm, factor))); } catch {}
  }
  render();
}));

$('#copy-bpm').addEventListener('click', async () => {
  const value = displayBpm(state.bpm, factor);
  if (value != null) notify(await copyText(`${value} BPM`) ? 'BPM copied to clipboard' : 'Could not copy. Select the BPM manually.');
});

$('#sound-toggle').addEventListener('click', (event) => {
  clickEnabled = !clickEnabled;
  event.currentTarget.setAttribute('aria-pressed', String(clickEnabled));
  event.currentTarget.querySelector('.toggle-label').textContent = clickEnabled ? 'Click sound on' : 'Click sound off';
  notify(clickEnabled ? 'Sound on. Volume is kept low.' : 'Click sound turned off');
});

window.addEventListener('pagehide', () => { clearTimeout(idleTimer); if (audioContext?.state === 'running') void audioContext.suspend(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.tapCount > 0) { clearTimeout(idleTimer); state = { ...state, status: 'paused' }; render(); }
});
render();
