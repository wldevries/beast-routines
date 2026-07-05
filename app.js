'use strict';

const ACCENT_MAP = { prepare: '#e2a33e', hang: '#5fb36b', rest: '#5b90c7', done: '#e2a33e', idle: '#e2a33e' };

// ---- Beastmaker 1000 board geometry ----
// Traced from the real board artwork (mm-accurate). viewBox 0..210 x 0..62.
const BOARD = (() => {
  const mk = (id, x, y, w, h, label, desc) => ({ id, x, y, w, h, r: h / 2, cx: x + w / 2, ty: y + h / 2 + 1.05, label, desc });
  return [
    // row 1 (top) — 4F 15mm edges (outer) · 3F 30mm pockets (inner)
    mk('r1_0', 14.70, 16.81, 26.60, 6.77, '15', '4-Finger Edge · Row 1'), mk('r1_1', 80.97, 17.09, 19.99, 6.94, '30', '3-Finger Pocket · Row 1'),
    mk('r1_2', 107.83, 17.09, 20.08, 6.94, '30', '3-Finger Pocket · Row 1'), mk('r1_3', 167.94, 16.45, 26.24, 7.22, '15', '4-Finger Edge · Row 1'),
    // row 2 (middle) — 4F 45mm edges · 2F 50mm pockets · center 4F 53mm edge
    mk('r2_0', 11.97, 29.04, 28.29, 7.39, '45', '4-Finger Edge · Row 2'), mk('r2_1', 45.29, 29.22, 14.39, 7.03, '50', '2-Finger Pocket · Row 2'),
    mk('r2_2', 64.49, 29.22, 20.34, 7.03, '45', '4-Finger Edge · Row 2'), mk('r2_3', 89.44, 29.22, 30.18, 7.03, '53', '4-Finger Edge (deepest) · Row 2'),
    mk('r2_4', 124.05, 29.22, 20.70, 7.03, '45', '4-Finger Edge · Row 2'), mk('r2_5', 149.12, 29.31, 14.48, 6.94, '50', '2-Finger Pocket · Row 2'),
    mk('r2_6', 168.71, 28.95, 28.20, 7.39, '45', '4-Finger Edge · Row 2'),
    // row 3 (bottom) — 4F 20mm edges · 2F 25mm pockets
    mk('r3_0', 27.64, 42.94, 29.83, 7.57, '20', '4-Finger Edge · Row 3'), mk('r3_1', 62.68, 42.94, 14.21, 7.57, '25', '2-Finger Pocket · Row 3'),
    mk('r3_2', 81.98, 42.94, 20.06, 7.57, '20', '4-Finger Edge · Row 3'), mk('r3_3', 107.12, 42.94, 19.88, 7.57, '20', '4-Finger Edge · Row 3'),
    mk('r3_4', 132.17, 42.94, 14.21, 7.57, '25', '2-Finger Pocket · Row 3'), mk('r3_5', 151.60, 42.94, 29.92, 7.57, '20', '4-Finger Edge · Row 3'),
  ];
})();

// Decorative, non-interactive top profile (slopers + jugs) traced from the same artwork.
const TOP_PROFILE = {
  boardOutline: "m -32.962129,82.490377 c -28.39943,0 -51.262498,22.863063 -51.262498,51.262503 0,28.39943 22.863068,51.2625 51.262498,51.2625 H 268.2956 c 28.39944,0 51.26251,-22.86307 51.26251,-51.2625 0,-28.39944 -22.86307,-51.262503 -51.26251,-51.262503 h -22.83256 c -1.8191,0.185035 -4.59553,0.533287 -5.45608,1.167124 -1.47731,1.088106 -1.19744,3.410012 -1.1463,5.242371 0.0446,1.597596 -0.0847,2.823052 -1.70407,2.534166 -3.47669,-0.62022 -7.67747,-2.225309 -14.73202,-6.467698 -2.20388,-1.325342 -5.16578,-2.070214 -8.14881,-2.475963 H 21.057714 c -2.982958,0.405754 -5.944462,1.15065 -8.148291,2.475963 -7.0545549,4.242389 -11.2553248,5.847473 -14.7320301,6.467698 -3.4767057,0.620223 -1.2063773,-5.739734 -3.9717075,-7.776537 -0.8605524,-0.633841 -2.5156311,-0.982089 -4.3347324,-1.167124 z",
  slopers: [
    { id: 'slopeL', label: '35° Sloper', d: "m 45.79925,9.1778459 c 0,0 0.001,5.4421401 2e-6,8.0981001 -2.62e-4,0.674008 0.135911,1.0226 0.809809,1.034757 6.539942,0.117977 23.848094,0.04497 31.807535,-0.04499 0.491889,-0.0056 0.762839,-0.587829 0.76482,-1.079746 0.01519,-3.772131 10e-7,-11.3373397 10e-7,-11.3373397" },
    { id: 'slopeR', label: '35° Sloper', d: "m 129.56959,5.6686695 c 0,0 -0.23799,8.0077145 -0.17996,11.6972555 0.008,0.483562 0.55114,0.990386 1.03476,0.989767 6.63281,-0.0085 24.75704,0.0018 31.65773,0.07159 0.36878,0.0037 0.81937,-0.372566 0.82465,-0.746435 0.0385,-2.724645 0.09,-8.907909 0.09,-8.907909" },
  ],
  jugs: [
    { id: 'jugL', label: 'Jug', d: "M 32.09,5.66 L 31.29,5.68 30.49,5.72 29.69,5.78 28.89,5.87 28.1,5.98 27.31,6.12 26.52,6.29 25.75,6.48 24.97,6.7 24.21,6.94 23.45,7.21 22.7,7.5 21.97,7.82 21.24,8.16 20.52,8.52 19.82,8.91 19.13,9.32 18.46,9.75 17.79,10.2 17.15,10.68 16.52,11.17 15.9,11.69 15.3,12.23 14.72,12.78 15.03,12.6 45.71,12.6 45.8,9.18 46.41,9.83 46.03,8.78 45.88,7.65 45.51,6.58 44.59,5.95 43.48,5.71 42.34,5.66 41.2,5.66 40.06,5.66 38.92,5.66 37.78,5.66 36.65,5.66 35.51,5.66 34.37,5.66 33.23,5.66 32.09,5.66 Z" },
    { id: 'jugR', label: 'Jug', d: "M 176.92,5.66 L 177.73,5.67 178.54,5.7 179.36,5.76 180.17,5.85 180.97,5.96 181.78,6.1 182.57,6.26 183.37,6.45 184.15,6.67 184.93,6.91 185.7,7.18 186.46,7.47 187.21,7.79 187.94,8.14 188.67,8.5 189.38,8.9 190.09,9.31 190.77,9.75 191.44,10.21 192.1,10.69 192.74,11.2 193.36,11.72 193.97,12.27 194.55,12.83 193.99,12.6 162.86,12.6 163,8.77 162.88,9.64 162.97,8.91 162.94,8.17 162.96,7.43 163.13,6.71 163.62,6.16 164.32,5.93 165.05,5.8 165.78,5.7 166.52,5.66 167.27,5.66 168.01,5.66 168.75,5.66 169.49,5.66 170.24,5.66 170.98,5.66 171.72,5.66 172.46,5.66 173.2,5.66 173.95,5.66 174.69,5.66 175.43,5.66 176.17,5.66 176.92,5.66 Z" },
  ],
  center: { id: 'center', label: '20° Sloper', d: "M 79.181,5.849 L 79.184,7.204 79.185,8.56 79.187,9.916 79.188,11.272 79.188,12.628 79.188,13.984 79.18,14.04 129.39,14.04 129.394,13.921 129.413,12.546 129.437,11.17 129.465,9.795 129.497,8.419 129.532,7.044 129.57,5.669 Z" },
  grooves: [
    "M 79.181417,14.036706 H 129.38963",
    "m 45.709273,12.597044 h -30.6828",
    "m 162.86178,12.597044 h 31.13269",
  ],
  labels: [
    { x: 26.6, y: 9, text: 'jug' }, { x: 62.5, y: 12.4, text: '35°' }, { x: 104.3, y: 9, text: '20°' },
    { x: 146.2, y: 12.4, text: '35°' }, { x: 182.4, y: 9, text: 'jug' },
  ],
};

const ZONE_META = {
  slopeL: { x: 62.5, y: 5.7, label: '35° Sloper', sub: 'Two-hand sloper shelf — not used for this routine' },
  slopeR: { x: 146.2, y: 5.7, label: '35° Sloper', sub: 'Two-hand sloper shelf — not used for this routine' },
  jugL: { x: 27.4, y: 5.85, label: 'Jug', sub: 'Deep jug, mainly for pull-ups / mounting — not used for this routine' },
  jugR: { x: 182.4, y: 5.67, label: 'Jug', sub: 'Deep jug, mainly for pull-ups / mounting — not used for this routine' },
  center: { x: 104.3, y: 5.7, label: '20° Sloper', sub: 'Full-width sloper rail — not used for this routine' },
};

// ---- grip hold groups (which board holds each named grip lights up) ----
const DEFAULT_ASSIGN = {
  bigEdge: ['r2_0', 'r2_6'],
  deepJug: ['r1_1', 'r1_2'],
  topPocket: ['r2_1', 'r2_5'],
  smallEdge: ['r1_0', 'r1_3'],
  repEdge: ['r3_0', 'r3_5'],
};

const GROUP_META = [
  { key: 'bigEdge', label: '4F Half-Crimp', color: '#e2a33e' },
  { key: 'deepJug', label: '3F Open Drag', color: '#5fb36b' },
  { key: 'topPocket', label: '2F Pocket', color: '#5b90c7' },
  { key: 'smallEdge', label: '2F Small Crimp', color: '#d98a5b' },
  { key: 'repEdge', label: '4F Half-Crimp (20mm)', color: '#c75b5b' },
];

const HOLDS_STORAGE_KEY = 'abrahangs_holds_v2';
const MODE_STORAGE_KEY = 'abrahangs_mode_v1';

// ---- protocols ----
const ABRAHANGS_SETS = (() => {
  const crimp = { name: '4-Finger Half-Crimp', target: '45 mm edge · row 2', intensity: '70–80% effort', cue: 'Both hands on a comfy large edge in a relaxed half-crimp. Pull up smoothly until you reach the target effort, hold, then ease off.', holds: 'bigEdge' };
  const drag = { name: '3-Finger Open Drag', target: '30 mm pocket · row 1', intensity: '70–80% effort', cue: 'Index–middle–ring fingers in an open drag, thumb relaxed off the board. No crimping — let the fingers extend slightly.', holds: 'deepJug' };
  const midPocket = { name: 'Middle 2-Finger Pocket', target: '50 mm pocket · row 2', intensity: '50–60% effort', cue: 'Middle and ring fingers only. Drop the intensity — you should feel loaded but nowhere near failure.', holds: 'topPocket' };
  const frontPocket = { name: 'Front 2-Finger Pocket', target: '50 mm pocket · row 2', intensity: '50–60% effort', cue: 'Index and middle fingers only. Keep the pull light and controlled.', holds: 'topPocket' };
  const midCrimp = { name: 'Middle 2-Finger Half-Crimp', target: '15 mm edge · row 1', intensity: '30–40% effort', cue: 'Middle and ring on a smaller edge — very light load. Stretch your pinkies out during the rest.', holds: 'smallEdge' };
  const frontCrimp = { name: 'Front 2-Finger Half-Crimp', target: '15 mm edge · row 1', intensity: '30–40% effort', cue: 'Index and middle on a smaller edge — very light load. Stretch your pinkies out during the rest.', holds: 'smallEdge' };
  return [crimp, crimp, crimp, drag, drag, drag, midPocket, frontPocket, midCrimp, frontCrimp];
})();

const REPEATERS_GRIP = {
  name: '4-Finger Half-Crimp',
  target: '20 mm edge · row 3',
  intensity: 'Near-max effort (RPE 8–9)',
  cue: 'Full bodyweight through a straight arm. Load hard through the last third of each rep — by rep 5–6 this should feel genuinely hard.',
  holds: 'repEdge',
};

const PROTOCOLS = {
  abrahangs: {
    key: 'abrahangs', label: 'Abrahangs',
    tagline: 'Beastmaker 1000 · 10 min × 2/day',
    sessionNote: '6h+ between sessions',
    prepareSeconds: 8, hangSeconds: 10, repRestSeconds: 50, setRestSeconds: 50, repsPerSet: 1,
    sets: ABRAHANGS_SETS,
    footNote: { tag: 'No-hang', text: 'Feet stay on the floor — pull through your fingers to the target effort, never to failure.' },
    doneTitle: '10 sets done.',
    doneBody: "That's your ~10 minutes of low-intensity loading. Come back in <strong>6+ hours</strong> for round two, and repeat every day. Strength shows up after a few weeks of consistency — trust the easy days.",
    idlePreview: '10', idleUnit: 'min',
    labels: {
      prepare: 'First grip coming up',
      hang: 'Pull to target effort',
      restShort: 'Shake out · breathe',
      restLong: 'Shake out · breathe',
    },
  },
  repeaters: {
    key: 'repeaters', label: 'Repeaters',
    tagline: 'Beastmaker 1000 · 7:3 × 6 · near-max',
    sessionNote: '48h+ between sessions',
    prepareSeconds: 5, hangSeconds: 7, repRestSeconds: 3, setRestSeconds: 180, repsPerSet: 6,
    sets: Array.from({ length: 6 }, () => REPEATERS_GRIP),
    footNote: { tag: 'Full hang', text: 'Both feet off the ground, straight arm — this is a real hang at real intensity, not a submax load.' },
    doneTitle: '6 sets done.',
    doneBody: "That's 6 sets of 7:3 repeaters in the books. Rest at least <strong>48 hours</strong> before your next finger session — repeaters load the tendons harder than Abrahangs, so recovery matters more here.",
    idlePreview: '6', idleUnit: 'sets',
    labels: {
      prepare: 'First rep coming up',
      hang: 'Hold near-max effort',
      restShort: 'Shake out · stay loose',
      restLong: 'Long rest · shake out fully',
    },
  },
};

function formatSeconds(sec) {
  const s = Math.max(0, Math.ceil(sec));
  if (s < 60) return String(s);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

class AbrahangsTimer {
  constructor() {
    const protocolKey = this.loadMode();
    const P = PROTOCOLS[protocolKey];
    this.state = {
      protocolKey, status: 'idle', phase: 'prepare', setIndex: 0, repIndex: 0, isLongRest: false,
      remaining: P.prepareSeconds, phaseTotal: P.prepareSeconds,
      soundOn: true, editHolds: false, editGroup: this.groupsForProtocol(P)[0].key,
      assignments: null, hoverHold: null, hoverZone: null,
    };
    this.timer = null;
    this.actx = null;
    this.lastTs = 0;

    this.queryDom();
    this.loadAssignments();
    this.bindEvents();
    this.render();
  }

  protocol() { return PROTOCOLS[this.state.protocolKey]; }
  groupsForProtocol(P) {
    const keys = [...new Set(P.sets.map(s => s.holds))];
    return GROUP_META.filter(m => keys.includes(m.key));
  }

  queryDom() {
    this.brandSub = document.getElementById('brandSub');
    this.sessionPill = document.getElementById('sessionPill');
    this.modeTabsEl = document.getElementById('modeTabs');
    this.soundBtn = document.getElementById('soundBtn');
    this.primaryBtn = document.getElementById('primaryBtn');
    this.skipBtn = document.getElementById('skipBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.editBtn = document.getElementById('editBtn');
    this.ringGlow = document.getElementById('ringGlow');
    this.ring = document.getElementById('ring');
    this.phaseLabelEl = document.getElementById('phaseLabel');
    this.displayTextEl = document.getElementById('displayText');
    this.unitTextEl = document.getElementById('unitText');
    this.sublabelEl = document.getElementById('sublabel');
    this.pipsEl = document.getElementById('pips');
    this.gripCardEl = document.getElementById('gripCard');
    this.boardSvg = document.getElementById('boardSvg');
    this.tooltipEl = document.getElementById('tooltip');
    this.editPanelEl = document.getElementById('editPanel');
    this.notEditingHintEl = document.getElementById('notEditingHint');
  }

  bindEvents() {
    this.soundBtn.addEventListener('click', () => this.toggleSound());
    this.primaryBtn.addEventListener('click', () => this.primary());
    this.skipBtn.addEventListener('click', () => this.skip());
    this.resetBtn.addEventListener('click', () => this.reset());
    this.editBtn.addEventListener('click', () => this.toggleEdit());

    this.modeTabsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-mode]');
      if (btn) this.setProtocol(btn.dataset.mode);
    });

    this.pipsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-pip-index]');
      if (btn) this.jumpTo(Number(btn.dataset.pipIndex));
    });

    this.editPanelEl.addEventListener('click', (e) => {
      const groupBtn = e.target.closest('[data-group-key]');
      if (groupBtn) { this.setEditGroup(groupBtn.dataset.groupKey); return; }
      if (e.target.id === 'resetHoldsBtn') this.resetHolds();
    });

    this.boardSvg.addEventListener('mousemove', (e) => {
      const holdEl = e.target.closest('[data-hold-id]');
      if (holdEl) { this.enterHold(holdEl.dataset.holdId); return; }
      const zoneEl = e.target.closest('[data-zone-id]');
      if (zoneEl) { this.enterZone(zoneEl.dataset.zoneId); return; }
      this.leaveHold();
      this.leaveZone();
    });
    this.boardSvg.addEventListener('mouseleave', () => { this.leaveHold(); this.leaveZone(); });
    this.boardSvg.addEventListener('click', (e) => {
      const holdEl = e.target.closest('[data-hold-id]');
      if (holdEl) this.toggleHold(holdEl.dataset.holdId);
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') { e.preventDefault(); this.primary(); }
      else if (e.key === 'ArrowRight') { this.skip(); }
      else if (e.key && e.key.toLowerCase() === 'r') { this.reset(); }
    });
  }

  // ---- persistence ----
  loadMode() {
    try {
      const m = localStorage.getItem(MODE_STORAGE_KEY);
      if (m && PROTOCOLS[m]) return m;
    } catch (e) {}
    return 'abrahangs';
  }
  persistMode(key) { try { localStorage.setItem(MODE_STORAGE_KEY, key); } catch (e) {} }

  loadAssignments() {
    let saved = null;
    try { const r = localStorage.getItem(HOLDS_STORAGE_KEY); if (r) saved = JSON.parse(r); } catch (e) {}
    const valid = new Set(BOARD.map(h => h.id));
    const clean = {};
    for (const k of Object.keys(DEFAULT_ASSIGN)) {
      const arr = (saved && Array.isArray(saved[k])) ? saved[k].filter(id => valid.has(id)) : null;
      clean[k] = (arr && arr.length) ? arr : [...DEFAULT_ASSIGN[k]];
    }
    this.state.assignments = clean;
  }
  persist(a) { try { localStorage.setItem(HOLDS_STORAGE_KEY, JSON.stringify(a)); } catch (e) {} }

  // ---- state ----
  setState(patch) {
    Object.assign(this.state, typeof patch === 'function' ? patch(this.state) : patch);
    this.render();
  }

  getAccent() {
    const { status, phase } = this.state;
    if (status === 'done') return ACCENT_MAP.done;
    if (status === 'idle') return ACCENT_MAP.idle;
    return ACCENT_MAP[phase] || ACCENT_MAP.idle;
  }

  // ---- audio ----
  ensureAudio() {
    try {
      if (!this.actx) this.actx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.actx && this.actx.state === 'suspended') this.actx.resume();
    } catch (e) {}
  }
  beep(freq, dur = 0.09, type = 'sine', vol = 0.18) {
    if (!this.state.soundOn || !this.actx) return;
    const t = this.actx.currentTime;
    const o = this.actx.createOscillator();
    const g = this.actx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.actx.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }
  tickBeep() { this.beep(720, 0.07, 'square', 0.12); }
  goBeep() { this.beep(880, 0.20, 'sine', 0.22); this.beep(1180, 0.18, 'sine', 0.10); }
  restBeep() { this.beep(440, 0.18, 'sine', 0.16); }
  doneBeep() { [0, 170, 340].forEach((ms, i) => setTimeout(() => this.beep(620 + i * 150, 0.18, 'sine', 0.18), ms)); }

  // ---- timer engine ----
  stop() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  run() { this.lastTs = performance.now(); this.stop(); this.timer = setInterval(() => this.onTick(), 100); }

  onTick() {
    const now = performance.now();
    const dt = (now - this.lastTs) / 1000;
    this.lastTs = now;
    const rem = this.state.remaining - dt;
    const prevSec = Math.ceil(this.state.remaining);
    const newSec = Math.ceil(rem);
    if (rem > 0 && newSec !== prevSec && newSec >= 1 && newSec <= 3 && (this.state.phase === 'prepare' || this.state.phase === 'rest')) {
      this.tickBeep();
    }
    if (rem <= 0) { this.advance(); return; }
    this.state.remaining = rem;
    this.paintTick();
  }

  enterPrepare() {
    const P = this.protocol();
    this.lastTs = performance.now();
    this.setState({ phase: 'prepare', setIndex: 0, repIndex: 0, isLongRest: false, remaining: P.prepareSeconds, phaseTotal: P.prepareSeconds });
  }
  enterHang(setIdx, repIdx) {
    const P = this.protocol();
    this.lastTs = performance.now();
    this.setState({ phase: 'hang', setIndex: setIdx, repIndex: repIdx, remaining: P.hangSeconds, phaseTotal: P.hangSeconds });
  }
  enterRest(setIdx, repIdx, isLongRest) {
    const P = this.protocol();
    const dur = isLongRest ? P.setRestSeconds : P.repRestSeconds;
    this.lastTs = performance.now();
    this.setState({ phase: 'rest', setIndex: setIdx, repIndex: repIdx, isLongRest, remaining: dur, phaseTotal: dur });
  }

  advance() {
    const P = this.protocol();
    const ph = this.state.phase;
    const { setIndex, repIndex } = this.state;
    if (ph === 'prepare') { this.enterHang(0, 0); this.goBeep(); }
    else if (ph === 'hang') {
      const lastRepInSet = repIndex >= P.repsPerSet - 1;
      const lastSet = setIndex >= P.sets.length - 1;
      if (lastRepInSet && lastSet) { this.finish(); }
      else if (lastRepInSet) { this.enterRest(setIndex + 1, 0, true); this.restBeep(); }
      else { this.enterRest(setIndex, repIndex + 1, false); this.restBeep(); }
    } else {
      this.enterHang(setIndex, repIndex); this.goBeep();
    }
  }

  finish() { this.stop(); this.setState({ status: 'done' }); this.doneBeep(); }

  primary() {
    const s = this.state.status;
    if (s === 'running') this.pause();
    else if (s === 'paused') this.resume();
    else this.startRoutine();
  }
  startRoutine() {
    this.ensureAudio();
    const P = this.protocol();
    this.setState({ status: 'running', phase: 'prepare', setIndex: 0, repIndex: 0, isLongRest: false, remaining: P.prepareSeconds, phaseTotal: P.prepareSeconds });
    this.beep(520, 0.10, 'sine', 0.16);
    this.run();
  }
  pause() { this.stop(); this.setState({ status: 'paused' }); }
  resume() { this.ensureAudio(); this.setState({ status: 'running' }); this.run(); }
  reset() {
    this.stop();
    const P = this.protocol();
    this.setState({ status: 'idle', phase: 'prepare', setIndex: 0, repIndex: 0, isLongRest: false, remaining: P.prepareSeconds, phaseTotal: P.prepareSeconds });
  }
  skip() {
    if (this.state.status === 'idle' || this.state.status === 'done') return;
    this.advance();
    if (this.state.status === 'running') this.run();
  }
  jumpTo(i) {
    this.ensureAudio();
    this.enterHang(i, 0);
    this.setState({ status: 'running' });
    this.run();
  }
  toggleSound() { this.ensureAudio(); this.setState(s => ({ soundOn: !s.soundOn })); }

  setProtocol(key) {
    if (!PROTOCOLS[key] || this.state.protocolKey === key) return;
    this.stop();
    const P = PROTOCOLS[key];
    this.setState({
      protocolKey: key, status: 'idle', phase: 'prepare', setIndex: 0, repIndex: 0, isLongRest: false,
      remaining: P.prepareSeconds, phaseTotal: P.prepareSeconds,
      editHolds: false, editGroup: this.groupsForProtocol(P)[0].key,
    });
    this.persistMode(key);
  }

  // ---- board editing ----
  toggleEdit() { this.setState(s => ({ editHolds: !s.editHolds })); }
  setEditGroup(k) { this.setState({ editGroup: k, editHolds: true }); }
  toggleHold(id) {
    if (!this.state.editHolds) return;
    const grp = this.state.editGroup;
    const base = this.state.assignments || DEFAULT_ASSIGN;
    const cur = base[grp] || [];
    const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
    const a = { ...base, [grp]: next };
    this.setState({ assignments: a });
    this.persist(a);
  }
  resetHolds() {
    const a = { ...DEFAULT_ASSIGN };
    this.setState({ assignments: a });
    this.persist(a);
  }
  enterHold(id) { if (this.state.hoverHold === id) return; this.setState({ hoverHold: id, hoverZone: null }); }
  leaveHold() { if (this.state.hoverHold === null) return; this.setState({ hoverHold: null }); }
  enterZone(id) { if (this.state.hoverZone === id) return; this.setState({ hoverZone: id, hoverHold: null }); }
  leaveZone() { if (this.state.hoverZone === null) return; this.setState({ hoverZone: null }); }

  // ---- rendering ----
  computeCountdown() {
    const { status, remaining, phaseTotal } = this.state;
    const P = this.protocol();
    let displayText, unitText;
    if (status === 'idle') { displayText = P.idlePreview; unitText = P.idleUnit; }
    else if (status === 'done') { displayText = '✓'; unitText = ''; }
    else {
      const secs = Math.max(0, Math.ceil(remaining));
      displayText = formatSeconds(remaining);
      unitText = secs < 60 ? 'sec' : '';
    }
    const frac = (status === 'idle' || status === 'done') ? 1 : Math.max(0, Math.min(1, remaining / phaseTotal));
    return { displayText, unitText, frac };
  }

  paintTick() {
    const { displayText, frac } = this.computeCountdown();
    this.displayTextEl.textContent = displayText;
    const deg = frac * 360;
    const accent = this.getAccent();
    this.ring.style.background = `conic-gradient(${accent} ${deg}deg, rgba(255,255,255,0.06) ${deg}deg)`;
  }

  renderModeTabs() {
    const active = this.state.protocolKey;
    this.modeTabsEl.querySelectorAll('[data-mode]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === active);
    });
  }

  repProgress() {
    const { phase, repIndex, isLongRest } = this.state;
    if (phase === 'hang') return { completed: repIndex, active: repIndex };
    if (phase === 'rest' && !isLongRest) return { completed: repIndex, active: -1 };
    return { completed: 0, active: -1 };
  }

  renderPips() {
    const { status, setIndex } = this.state;
    const P = this.protocol();
    const accent = this.getAccent();
    const progress = this.repProgress();
    this.pipsEl.innerHTML = P.sets.map((_, i) => {
      const st = status === 'done' ? 'done' : i < setIndex ? 'done' : i === setIndex ? 'current' : 'future';
      if (st === 'current' && P.repsPerSet > 1) {
        const ticks = Array.from({ length: P.repsPerSet }, (_, r) => {
          if (r < progress.completed) return `<span class="pip-micro" style="width:4px; background:rgba(226,163,62,0.55);"></span>`;
          if (r === progress.active) return `<span class="pip-micro" style="width:6px; background:${accent}; box-shadow:0 0 7px ${accent};"></span>`;
          return `<span class="pip-micro" style="width:4px; background:rgba(255,255,255,0.14);"></span>`;
        }).join('');
        return `<button type="button" class="pip pip-multi" data-pip-index="${i}" title="Jump to set">${ticks}</button>`;
      }
      const bg = st === 'current' ? accent : st === 'done' ? 'rgba(226,163,62,0.55)' : 'rgba(255,255,255,0.10)';
      const width = st === 'current' ? '30px' : '16px';
      const shadow = st === 'current' ? `0 0 14px ${accent}` : 'none';
      return `<button type="button" class="pip" data-pip-index="${i}" title="Jump to set" style="width:${width}; background:${bg}; box-shadow:${shadow};"></button>`;
    }).join('');
  }

  renderGripCard() {
    const { status, phase, setIndex, repIndex, isLongRest } = this.state;
    const P = this.protocol();
    if (status === 'done') {
      this.gripCardEl.innerHTML = `
        <div class="done-card">
          <div class="done-label">Session complete</div>
          <div class="done-title">${P.doneTitle}</div>
          <p class="done-body">${P.doneBody}</p>
        </div>`;
      return;
    }
    const g = P.sets[Math.min(setIndex, P.sets.length - 1)];
    const accent = this.getAccent();
    const isRest = phase === 'rest';
    const gripLabel = isRest && isLongRest ? 'Up Next' : 'Current Grip';
    const setNumber = Math.min(setIndex + 1, P.sets.length);
    const repSuffix = P.repsPerSet > 1 ? ` · Rep ${Math.min(repIndex + 1, P.repsPerSet)}/${P.repsPerSet}` : '';
    this.gripCardEl.innerHTML = `
      <div class="grip-card">
        <div class="grip-card-top">
          <div class="grip-label" style="color:${accent}">${gripLabel}</div>
          <div class="set-number">Set ${setNumber} / ${P.sets.length}${repSuffix}</div>
        </div>
        <div class="grip-name">${g.name}</div>
        <div class="grip-tags">
          <span class="tag-target">${g.target}</span>
          <span class="tag-intensity">${g.intensity}</span>
        </div>
        <p class="grip-cue">${g.cue}</p>
        <div class="nohang-note">
          <span class="tag">${P.footNote.tag}</span>
          <span>${P.footNote.text}</span>
        </div>
      </div>`;
  }

  renderBoard() {
    const { status, editHolds, editGroup, setIndex } = this.state;
    const P = this.protocol();
    const accent = this.getAccent();
    const assign = this.state.assignments || DEFAULT_ASSIGN;
    const g = P.sets[Math.min(setIndex, P.sets.length - 1)];
    const activeIds = status === 'done' ? [] : (assign[g.holds] || []);
    const editColor = (GROUP_META.find(m => m.key === editGroup) || {}).color || '#e2a33e';
    const editIds = assign[editGroup] || [];

    const holdsMarkup = BOARD.map(h => {
      let fill, stroke, sw, labelColor;
      if (editHolds) {
        const on = editIds.includes(h.id);
        fill = on ? editColor : '#c2a87d';
        stroke = on ? '#1a140e' : 'rgba(0,0,0,0.22)';
        sw = on ? 0.42 : 0.26;
        labelColor = on ? '#1a140e' : '#7a6a52';
      } else {
        const on = activeIds.includes(h.id);
        fill = on ? accent : '#c2a87d';
        stroke = on ? '#15110d' : 'rgba(0,0,0,0.22)';
        sw = on ? 0.55 : 0.26;
        labelColor = on ? '#15110d' : '#7a6a52';
      }
      return `<g data-hold-id="${h.id}">
        <rect x="${h.x}" y="${h.y}" width="${h.w}" height="${h.h}" rx="${h.r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"></rect>
        <text x="${h.cx}" y="${h.ty}" text-anchor="middle" font-family="Archivo, sans-serif" font-size="3.1" font-weight="700" fill="${labelColor}" style="pointer-events:none;">${h.label}</text>
      </g>`;
    }).join('');

    const zoneFill = (id, base, hoverColor) => {
      const hovered = this.state.hoverZone === id;
      return {
        fill: hovered ? hoverColor : base,
        stroke: hovered ? '#15110d' : 'rgba(0,0,0,0.22)',
        sw: hovered ? 0.55 : 0.3,
      };
    };

    const slopersMarkup = TOP_PROFILE.slopers.map(s => {
      const zf = zoneFill(s.id, '#ceb887', '#dcc79c');
      return `<path data-zone-id="${s.id}" d="${s.d}" fill="${zf.fill}" stroke="${zf.stroke}" stroke-width="${zf.sw}"></path>`;
    }).join('');

    const jugsMarkup = TOP_PROFILE.jugs.map(j => {
      const zf = zoneFill(j.id, '#c3a575', '#d3b689');
      return `<path data-zone-id="${j.id}" d="${j.d}" fill="${zf.fill}" stroke="${zf.stroke}" stroke-width="${zf.sw}"></path>`;
    }).join('');

    const centerZf = zoneFill('center', '#d9c194', '#e6d3a8');
    const centerMarkup = `<path data-zone-id="center" d="${TOP_PROFILE.center.d}" fill="${centerZf.fill}" stroke="${centerZf.stroke}" stroke-width="${centerZf.sw}"></path>`;

    const groovesMarkup = TOP_PROFILE.grooves.map(d => `<path d="${d}" fill="none" stroke="rgba(0,0,0,0.22)" stroke-width="0.35" style="pointer-events:none;"></path>`).join('');

    const labelsMarkup = TOP_PROFILE.labels.map(lb => `<text x="${lb.x}" y="${lb.y}" text-anchor="middle" font-family="Archivo, sans-serif" font-size="2.9" font-weight="700" fill="#6b5a44" style="pointer-events:none;">${lb.text}</text>`).join('');

    this.boardSvg.innerHTML = `
      <g transform="matrix(0.48144766,0,0,0.48148624,47.963938,-34.0533)">
        <path d="${TOP_PROFILE.boardOutline}" fill="#d8c39c" stroke="rgba(0,0,0,0.16)" stroke-width="0.4"></path>
      </g>
      ${slopersMarkup}
      ${centerMarkup}
      ${jugsMarkup}
      ${groovesMarkup}
      ${labelsMarkup}
      ${holdsMarkup}
    `;

    this.renderTooltip();
  }

  renderTooltip() {
    const { hoverHold, hoverZone } = this.state;
    const P = this.protocol();
    const assign = this.state.assignments || DEFAULT_ASSIGN;
    const relevantGroups = this.groupsForProtocol(P);
    let tooltip = null;
    if (hoverHold) {
      const h = BOARD.find(b => b.id === hoverHold);
      if (h) {
        const usedBy = relevantGroups.filter(m => (assign[m.key] || []).includes(h.id)).map(m => m.label);
        tooltip = {
          left: (h.cx / 210 * 100) + '%',
          top: (h.y / 62 * 100) + '%',
          title: `${h.label}mm · ${h.desc.split(' · ')[0]}`,
          sub: usedBy.length ? `Used in ${usedBy.join(', ')}` : 'Not part of current routine',
        };
      }
    } else if (hoverZone) {
      const zm = ZONE_META[hoverZone];
      if (zm) {
        tooltip = { left: (zm.x / 210 * 100) + '%', top: (zm.y / 62 * 100) + '%', title: zm.label, sub: zm.sub };
      }
    }
    if (tooltip) {
      this.tooltipEl.style.left = tooltip.left;
      this.tooltipEl.style.top = tooltip.top;
      this.tooltipEl.innerHTML = `<div class="tooltip-title">${tooltip.title}</div><div class="tooltip-sub">${tooltip.sub}</div>`;
      this.tooltipEl.hidden = false;
    } else {
      this.tooltipEl.hidden = true;
    }
  }

  renderEditPanel() {
    const { editHolds, editGroup } = this.state;
    const P = this.protocol();
    const groups = this.groupsForProtocol(P);
    if (!editHolds) {
      this.editPanelEl.innerHTML = '';
      this.notEditingHintEl.hidden = false;
      return;
    }
    this.notEditingHintEl.hidden = true;
    const groupsMarkup = groups.map(m => {
      const active = m.key === editGroup;
      const bg = active ? m.color : 'rgba(255,255,255,0.05)';
      const fg = active ? '#15110d' : '#c8bcab';
      const bd = active ? m.color : 'rgba(255,255,255,0.12)';
      return `<button type="button" class="edit-group-btn" data-group-key="${m.key}" style="background:${bg}; color:${fg}; border-color:${bd};">${m.label}</button>`;
    }).join('');
    this.editPanelEl.innerHTML = `
      <div class="edit-panel-hint">Pick a grip, then tap the holds you use for it. Saved on this device.</div>
      <div class="edit-groups">${groupsMarkup}</div>
      <button type="button" class="reset-holds-btn" id="resetHoldsBtn">Reset to defaults</button>
    `;
  }

  render() {
    const { status, phase, soundOn, editHolds, isLongRest } = this.state;
    const P = this.protocol();
    const accent = this.getAccent();

    this.brandSub.textContent = P.tagline;
    this.sessionPill.textContent = P.sessionNote;
    this.renderModeTabs();

    this.soundBtn.textContent = soundOn ? 'Sound on' : 'Sound off';
    this.primaryBtn.textContent = status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : status === 'done' ? 'Restart' : 'Start';
    this.primaryBtn.style.background = accent;
    this.primaryBtn.style.boxShadow = `0 8px 24px ${accent}3a`;
    this.ringGlow.style.background = `radial-gradient(circle, ${accent}44 0%, transparent 68%)`;
    this.phaseLabelEl.style.color = accent;

    let phaseLabel, sublabel;
    if (status === 'idle') { phaseLabel = 'Ready'; sublabel = 'Press start'; }
    else if (status === 'done') { phaseLabel = 'Complete'; sublabel = 'Nice work'; }
    else if (phase === 'prepare') { phaseLabel = 'Get Ready'; sublabel = P.labels.prepare; }
    else if (phase === 'hang') { phaseLabel = 'Hang'; sublabel = P.labels.hang; }
    else { phaseLabel = 'Rest'; sublabel = isLongRest ? P.labels.restLong : P.labels.restShort; }
    this.phaseLabelEl.textContent = phaseLabel;
    this.sublabelEl.textContent = sublabel;

    this.editBtn.textContent = editHolds ? 'Done' : 'Edit holds';

    this.renderPips();
    this.renderGripCard();
    this.renderBoard();
    this.renderEditPanel();
    this.paintTick();
    this.unitTextEl.textContent = this.computeCountdown().unitText;
  }
}

document.addEventListener('DOMContentLoaded', () => new AbrahangsTimer());
