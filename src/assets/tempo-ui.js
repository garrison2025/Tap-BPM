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
const instrument = $('#tempo-tool');
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
  instrument.dataset.state = state.status;
  status.textContent = state.status === 'ready' ? 'READY TO TAP' : state.status === 'paused' ? 'PAUSED' : state.status === 'measuring' ? 'LOCKING IN' : state.status === 'calibrating' ? 'FINDING YOUR RHYTHM' : 'LISTENING';
  hint.textContent = state.status === 'paused' ? 'Tap again to start a fresh measurement.' : state.tapCount === 0 ? 'Tap at least twice to calculate your BPM.' : state.tapCount < 4 ? 'Keep a steady beat for a better reading.' : 'Great. Keep tapping to refine the estimate.';
  // Avoid queuing a long screen-reader announcement on every rapid tap.
  if (state.tapCount === 0 || state.tapCount === 2 || (state.tapCount >= 4 && state.tapCount % 4 === 0) || state.status === 'paused') {
    live.textContent = value === null ? 'Waiting for taps' : `${value} beats per minute. ${state.tapCount} taps.`;
  }
  $('#copy-bpm').disabled = value === null;
  const delayLink = $('#open-delay');
  const transferable = value !== null && value >= 20 && value <= 300;
  delayLink.href = transferable ? `/delay-reverb-calculator/?bpm=${encodeURIComponent(value)}` : '/delay-reverb-calculator/';
  delayLink.innerHTML = `${transferable ? 'Use this BPM' : 'Open calculator'} <span aria-hidden="true">↗</span>`;
  if (value !== null && !transferable) {
    delayLink.title = 'The delay calculator accepts 20–300 BPM. Enter a supported value manually.';
    delayLink.setAttribute('aria-label', `Measured ${value} BPM is outside the calculator range of 20 to 300. Open calculator without transferring this tempo.`);
  } else {
    delayLink.removeAttribute('title');
    delayLink.removeAttribute('aria-label');
  }
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
  try {
    const selected = displayBpm(state.bpm, factor);
    if (selected !== null && selected >= 20 && selected <= 300) sessionStorage.setItem('tempo-lab-last-bpm', String(selected));
    else sessionStorage.removeItem('tempo-lab-last-bpm');
  } catch { /* optional */ }
  history.push(Date.now());
  if (history.length > 50) history.shift();
  render();
}

tapButton.addEventListener('click', register);
document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
  const active = document.activeElement;
  // Space should activate focused controls (FAQ summaries, menu items, links), not tap BPM.
  // The tap button remains a supported keyboard target.
  if (active && active !== tapButton && active !== document.body && active !== document.documentElement &&
      (active.closest('input, textarea, select, button, a, summary, [role="button"], [role="switch"], [role="checkbox"], [role="radio"], [contenteditable], [contenteditable="true"]') || active.isContentEditable)) return;
  e.preventDefault();
  register();
});

$('#reset-taps').addEventListener('click', () => {
  clearTimeout(idleTimer);
  state = createTempoState();
  try { sessionStorage.removeItem('tempo-lab-last-bpm'); } catch { /* optional */ }
  factor = 1;
  factorButtons.forEach((b) => { b.classList.toggle('selected', b.dataset.bpmFactor === '1'); b.setAttribute('aria-pressed', String(b.dataset.bpmFactor === '1')); });
  render();
  notify('Measurement reset');
});

factorButtons.forEach((button) => button.addEventListener('click', () => {
  factor = Number(button.dataset.bpmFactor);
  factorButtons.forEach((item) => { item.classList.toggle('selected', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  try {
    const selected = displayBpm(state.bpm, factor);
    if (selected !== null && selected >= 20 && selected <= 300) sessionStorage.setItem('tempo-lab-last-bpm', String(selected));
    else sessionStorage.removeItem('tempo-lab-last-bpm');
  } catch { /* optional */ }
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