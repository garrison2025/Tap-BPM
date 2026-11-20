import { timingTable, quarterNoteMs, validateBpm, millisecondsToHertz, formatMs, barDurationMs, validateMeter } from '../core/timing.mjs';
import { notify, copyText } from './shared.js';
const bpmInput = document.querySelector('#delay-bpm');
const meterSelect = document.querySelector('#time-signature');
const urlParams = new URLSearchParams(location.search);
const preset = urlParams.get('bpm');
const requestedMeter = validateMeter(urlParams.get('meter'));
if (requestedMeter !== null) meterSelect.value = requestedMeter;
let lastBpm = null;
try { lastBpm = sessionStorage.getItem('tempo-lab-last-bpm'); } catch { /* optional */ }
if (validateBpm(preset) !== null) bpmInput.value = String(validateBpm(preset));
else if (validateBpm(lastBpm) !== null) bpmInput.value = String(validateBpm(lastBpm));

function rowMarkup(note) {
  const format = (duration, variation) => {
    const rounded = duration.toFixed(1);
    return `<button class="timing-copy" type="button" data-copy-ms="${rounded}" aria-label="Copy ${variation} ${note.label}: ${rounded} milliseconds" title="Copy ${rounded} ms"><span class="timing-number">${duration.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}</span><span class="unit-inline">ms</span><span class="copy-glyph" aria-hidden="true">↗</span></button>`;
  };
  return `<tr><th scope="row"><span class="note-symbol">${note.symbol}</span><span class="note-label">${note.label}</span></th><td>${format(note.straight, 'straight')}</td><td>${format(note.dotted, 'dotted')}</td><td>${format(note.triplet, 'triplet')}</td></tr>`;
}

function render() {
  const bpm = validateBpm(bpmInput.value);
  const meter = validateMeter(meterSelect.value) ?? '4/4';
  document.querySelectorAll('[data-preset]').forEach((button) => {
    button.setAttribute('aria-pressed', String(bpm !== null && Number(button.dataset.preset) === bpm));
  });
  const error = document.querySelector('#bpm-error');
  error.hidden = bpm !== null || bpmInput.value === '';
  bpmInput.setAttribute('aria-invalid', String(bpm === null && bpmInput.value !== ''));
  const output = document.querySelector('#delay-results');
  const placeholder = document.querySelector('#delay-invalid');
  output.hidden = bpm === null;
  placeholder.hidden = bpm !== null;
  const share = document.querySelector('#share-delay');
  const copyTable = document.querySelector('#copy-timing');
  share.disabled = bpm === null;
  copyTable.disabled = bpm === null;
  if (bpm === null) {
    delete share.dataset.shareUrl;
    ['#predelay', '#reverb-short', '#reverb-long'].forEach((id) => {
      document.querySelector(id).textContent = '—';
    });
    document.querySelector('#delay-summary').textContent = 'Enter a valid BPM to see the note duration and related studio references.';
    return;
  }
  const quarter = quarterNoteMs(bpm);
  const table = timingTable(bpm);
  document.querySelector('#quarter-ms').textContent = formatMs(quarter);
  document.querySelector('#quarter-hz').textContent = `${millisecondsToHertz(quarter).toFixed(2)} Hz`;
  document.querySelector('#one-bar').textContent = formatMs(barDurationMs(bpm, meter));
  document.querySelector('#bar-metric-label').textContent = `ONE BAR · ${meter}`;
  document.querySelector('#timing-table tbody').innerHTML = table.map(rowMarkup).join('');
  document.querySelector('#predelay').textContent = `${Math.round(quarter / 4)}–${Math.round(quarter / 2)} ms`;
  document.querySelector('#reverb-short').textContent = formatMs(barDurationMs(bpm, meter) / 2);
  document.querySelector('#reverb-long').textContent = formatMs(barDurationMs(bpm, meter));
  document.querySelector('#reverb-short-help').textContent = `Half a ${meter} bar. A musical reference, not measured RT60.`;
  document.querySelector('#reverb-long-help').textContent = `One ${meter} bar. Tune by ear for your arrangement.`;
  document.querySelector('#meter-help').textContent = meter.endsWith('/8') ? `At quarter-note BPM, ${meter.split('/')[0]} eighths equal ${Number(meter.split('/')[0]) / 2} quarter notes. For dotted-quarter BPM, multiply by 1.5 before entering.` : 'Quarter-note BPM: bar duration follows your selected time signature.';
  document.querySelector('#delay-summary').textContent = `At ${bpm} beats per minute, a quarter note lasts ${quarter.toFixed(1)} milliseconds.`;
  const href = new URL(location.pathname, location.origin);
  href.searchParams.set('bpm', String(bpm));
  href.searchParams.set('meter', meter);
  document.querySelector('#share-delay').dataset.shareUrl = href.toString();
  try { sessionStorage.setItem('tempo-lab-last-bpm', String(bpm)); } catch {}
}

bpmInput.addEventListener('input', render);
meterSelect.addEventListener('change', render);
document.querySelector('#timing-table tbody').addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-copy-ms]');
  if (!button || validateBpm(bpmInput.value) === null) return;
  const text = `${button.dataset.copyMs} ms`;
  notify(await copyText(text) ? `${text} copied` : 'Could not copy this timing value.');
});
document.querySelectorAll('[data-bpm-step]').forEach((button) => button.addEventListener('click', () => {
  const current = validateBpm(bpmInput.value) ?? 120;
  bpmInput.value = String(Math.max(20, Math.min(300, current + Number(button.dataset.bpmStep))));
  render();
}));
document.querySelectorAll('[data-preset]').forEach((button) => button.addEventListener('click', () => {
  bpmInput.value = button.dataset.preset;
  render();
}));
document.querySelector('#share-delay').addEventListener('click', async (event) => {
  const url = event.currentTarget.dataset.shareUrl;
  notify(url && await copyText(url) ? 'Shareable BPM link copied' : 'Could not copy the link.');
});
document.querySelector('#copy-timing').addEventListener('click', async () => {
  const bpm = validateBpm(bpmInput.value);
  if (bpm === null) return;
  const rows = timingTable(bpm);
  const text = [`Quarter-note BPM: ${bpm}`, `Time signature: ${validateMeter(meterSelect.value) ?? '4/4'}`, 'Note\tStraight ms\tDotted ms\tTriplet ms', ...rows.map((r) => `${r.label}\t${r.straight.toFixed(1)}\t${r.dotted.toFixed(1)}\t${r.triplet.toFixed(1)}`)].join('\n');
  notify(await copyText(text) ? 'Timing table copied' : 'Could not copy table.');
});
render();
