// ===== DOM REFS =====
const bypassBtn = document.getElementById('bypassBtn');
const btnLabel = document.getElementById('btnLabel');
const urlInput = document.getElementById('urlInput');
const resultBox = document.getElementById('resultBox');
const resultLink = document.getElementById('resultLink');
const resultNote = document.getElementById('resultNote');
const pasteBtn = document.getElementById('pasteBtn');
const apiToggle = document.getElementById('apiToggle');
const soundToggle = document.getElementById('soundToggle');
const soundIcon = document.getElementById('soundIcon');

const statTotal = document.getElementById('statTotal');
const statOk = document.getElementById('statOk');
const statFail = document.getElementById('statFail');
const okCount = document.getElementById('okCount');
const failCount = document.getElementById('failCount');
const barFill = document.getElementById('barFill');

// ===== STATE =====
let stats = { total: 0, ok: 0, fail: 0 };
let apiMode = false;
let soundOn = true;
let audioCtx = null;

// ===== SOUND ENGINE =====
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone({ freq = 440, duration = 0.12, type = 'sine', gain = 0.18, glideTo = null, delay = 0 }) {
  if (!soundOn) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    const t0 = ctx.currentTime + delay;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  } catch (e) { /* silent fail */ }
}

function playClick() { tone({ freq: 620, glideTo: 380, duration: 0.09, type: 'square', gain: 0.12 }); }
function playProcessTick(i) { tone({ freq: 500 + i * 60, duration: 0.05, type: 'sine', gain: 0.06, delay: i * 0.18 }); }
function playSuccess() {
  tone({ freq: 523, duration: 0.1, type: 'triangle', gain: 0.16 });
  tone({ freq: 659, duration: 0.12, type: 'triangle', gain: 0.16, delay: 0.1 });
  tone({ freq: 880, duration: 0.18, type: 'triangle', gain: 0.16, delay: 0.2 });
}
function playError() { tone({ freq: 220, glideTo: 140, duration: 0.22, type: 'sawtooth', gain: 0.12 }); }

// ===== SOUND TOGGLE =====
soundToggle.addEventListener('click', () => {
  soundOn = !soundOn;
  soundToggle.classList.toggle('muted', !soundOn);
  soundIcon.innerHTML = soundOn
    ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>'
    : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
  if (soundOn) playClick();
});

// ===== UI HELPERS =====
function spawnRipple(btn, evt) {
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.4;
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const x = (evt.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2;
  const y = (evt.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2;
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

function updateStats() {
  statTotal.textContent = stats.total;
  const pOk = stats.total === 0 ? 0 : Math.round((stats.ok / stats.total) * 100);
  const pFail = stats.total === 0 ? 0 : Math.round((stats.fail / stats.total) * 100);
  statOk.textContent = pOk + '%';
  statFail.textContent = pFail + '%';
  okCount.textContent = stats.ok;
  failCount.textContent = stats.fail;
  barFill.style.width = pOk + '%';
}

// ===== PASTE =====
pasteBtn.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) urlInput.value = text;
  } catch (e) { urlInput.focus(); }
});

// ===== API TOGGLE (cosmetic) =====
apiToggle.addEventListener('click', () => {
  apiMode = !apiMode;
  apiToggle.style.background = apiMode ? 'rgba(232,121,249,0.22)' : 'rgba(232,121,249,0.08)';
  urlInput.placeholder = apiMode ? 'https://... (mode API key aktif)' : 'https://link-terkunci.xyz/...';
});

// ===== CORE BYPASS LOGIC =====
async function handleBypass(evt) {
  if (bypassBtn.classList.contains('loading')) return;
  const url = urlInput.value.trim();
  if (!url) {
    playError();
    urlInput.parentElement.style.borderColor = 'rgba(251,113,133,0.6)';
    urlInput.parentElement.style.animation = 'shake 0.4s ease';
    setTimeout(() => {
      urlInput.parentElement.style.borderColor = 'rgba(168,85,247,0.3)';
      urlInput.parentElement.style.animation = '';
    }, 500);
    return;
  }

  // UI loading state
  spawnRipple(bypassBtn, evt);
  bypassBtn.classList.add('pulse');
  setTimeout(() => bypassBtn.classList.remove('pulse'), 700);
  playClick();
  bypassBtn.classList.add('loading');
  btnLabel.textContent = 'Memproses...';
  resultBox.classList.remove('show');
  resultBox.classList.remove('error');

  // Ticking sounds
  for (let i = 0; i < 3; i++) playProcessTick(i);

  try {
    // Panggil backend serverless kita
    const response = await fetch(`/api/bypass?url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (!response.ok || data.status === 'error') {
      throw new Error(data.message || 'Gagal bypass link.');
    }

    // Sukses
    const destination = data.destination || data.result || '#'; // tergantung format API
    if (destination && destination !== '#') {
      resultLink.textContent = destination;
      resultNote.textContent = '✅ Bypass berhasil! Link asli berhasil diekstrak.';
      resultBox.classList.remove('error');
      resultBox.classList.add('show');
      stats.total++;
      stats.ok++;
      playSuccess();
    } else {
      throw new Error('API mengembalikan hasil kosong.');
    }

  } catch (err) {
    // Gagal
    resultLink.textContent = 'Gagal bypass: ' + err.message;
    resultNote.textContent = '⚠️ Coba cek link atau API sedang sibuk.';
    resultBox.classList.add('show', 'error');
    stats.total++;
    stats.fail++;
    playError();
  } finally {
    bypassBtn.classList.remove('loading');
    bypassBtn.classList.add('success-flash');
    setTimeout(() => bypassBtn.classList.remove('success-flash'), 500);
    btnLabel.textContent = 'Bypass';
    updateStats();
  }
}

bypassBtn.addEventListener('click', handleBypass);

// ===== INIT STATS =====
updateStats();