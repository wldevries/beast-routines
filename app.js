'use strict';

const ACCENT_MAP = { prepare: '#e2a33e', hang: '#5fb36b', rest: '#5b90c7', done: '#e2a33e', idle: '#e2a33e' };

function lightenHex(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 255) + amt);
  const g = Math.min(255, ((n >> 8) & 255) + amt);
  const b = Math.min(255, (n & 255) + amt);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// Boards are laid out at a width tuned for the Beastmaker's wide/flat aspect ratio.
// Squarer boards get capped narrower (and centered) so they render at a comparable
// height instead of ballooning to fill the full card width.
const LAYOUT_REFERENCE_ASPECT = 210 / 62;
function boardMaxWidthPct(board) {
  const aspect = board.viewBox.w / board.viewBox.h;
  return Math.min(100, Math.round(100 * aspect / LAYOUT_REFERENCE_ASPECT));
}

// =====================================================================
// Beastmaker 1000 — traced from the real board artwork (mm-accurate).
// =====================================================================
const BEASTMAKER_1000 = (() => {
  const mkRect = (id, x, y, w, h, label, typeDesc) => {
    const cx = x + w / 2, ty = y + h / 2 + 1.05;
    return {
      id, group: 'main', tag: 'rect', attrs: { x, y, w, h, rx: h / 2 },
      label, labelPos: { x: cx, y: ty }, tooltipPos: { x: cx, y },
      tooltipTitle: `${label}mm · ${typeDesc}`, shortDesc: `${label}mm ${typeDesc.toLowerCase()}`,
      baseFill: '#c2a87d', clip: false,
    };
  };
  const mkZone = (id, d, baseFill, tooltipTitle, shortDesc, tooltipPos, labelPos, label, idleNote) => ({
    id, group: 'main', tag: 'path', attrs: { d }, label, labelPos, tooltipPos,
    tooltipTitle, shortDesc, baseFill, clip: true, idleNote,
  });

  const holds = [
    // row 1 (top) — 4F 15mm edges (outer) · 3F 30mm pockets (inner)
    mkRect('r1_0', 14.70, 16.81, 26.60, 6.77, '15', '4-Finger Edge'),
    mkRect('r1_1', 80.97, 17.09, 19.99, 6.94, '30', '3-Finger Pocket'),
    mkRect('r1_2', 107.83, 17.09, 20.08, 6.94, '30', '3-Finger Pocket'),
    mkRect('r1_3', 167.94, 16.45, 26.24, 7.22, '15', '4-Finger Edge'),
    // row 2 (middle) — 4F 45mm edges · 2F 50mm pockets · center 4F 53mm edge
    mkRect('r2_0', 11.97, 29.04, 28.29, 7.39, '45', '4-Finger Edge'),
    mkRect('r2_1', 45.29, 29.22, 14.39, 7.03, '50', '2-Finger Pocket'),
    mkRect('r2_2', 64.49, 29.22, 20.34, 7.03, '45', '4-Finger Edge'),
    mkRect('r2_3', 89.44, 29.22, 30.18, 7.03, '53', '4-Finger Edge (deepest)'),
    mkRect('r2_4', 124.05, 29.22, 20.70, 7.03, '45', '4-Finger Edge'),
    mkRect('r2_5', 149.12, 29.31, 14.48, 6.94, '50', '2-Finger Pocket'),
    mkRect('r2_6', 168.71, 28.95, 28.20, 7.39, '45', '4-Finger Edge'),
    // row 3 (bottom) — 4F 20mm edges · 2F 25mm pockets
    mkRect('r3_0', 27.64, 42.94, 29.83, 7.57, '20', '4-Finger Edge'),
    mkRect('r3_1', 62.68, 42.94, 14.21, 7.57, '25', '2-Finger Pocket'),
    mkRect('r3_2', 81.98, 42.94, 20.06, 7.57, '20', '4-Finger Edge'),
    mkRect('r3_3', 107.12, 42.94, 19.88, 7.57, '20', '4-Finger Edge'),
    mkRect('r3_4', 132.17, 42.94, 14.21, 7.57, '25', '2-Finger Pocket'),
    mkRect('r3_5', 151.60, 42.94, 29.92, 7.57, '20', '4-Finger Edge'),
    // decorative, non-interactive top profile (slopers + jugs), still tappable for Repeaters
    mkZone('slopeL', "m 45.79925,9.1778459 c 0,0 0.001,5.4421401 2e-6,8.0981001 -2.62e-4,0.674008 0.135911,1.0226 0.809809,1.034757 6.539942,0.117977 23.848094,0.04497 31.807535,-0.04499 0.491889,-0.0056 0.762839,-0.587829 0.76482,-1.079746 0.01519,-3.772131 10e-7,-11.3373397 10e-7,-11.3373397 L 79.181417,-10 L 45.79925,-10 Z",
      '#ceb887', '35° Sloper', '35° sloper', { x: 62.5, y: 5.7 }, { x: 62.5, y: 12.4 }, '35°',
      'Two-hand sloper shelf — not used for this routine'),
    mkZone('slopeR', "m 129.56959,5.6686695 c 0,0 -0.23799,8.0077145 -0.17996,11.6972555 0.008,0.483562 0.55114,0.990386 1.03476,0.989767 6.63281,-0.0085 24.75704,0.0018 31.65773,0.07159 0.36878,0.0037 0.81937,-0.372566 0.82465,-0.746435 0.0385,-2.724645 0.09,-8.907909 0.09,-8.907909 L 162.99677,-10 L 129.56959,-10 Z",
      '#ceb887', '35° Sloper', '35° sloper', { x: 146.2, y: 5.7 }, { x: 146.2, y: 12.4 }, '35°',
      'Two-hand sloper shelf — not used for this routine'),
    mkZone('jugL', "M 32.09,5.66 L 31.29,5.68 30.49,5.72 29.69,5.78 28.89,5.87 28.1,5.98 27.31,6.12 26.52,6.29 25.75,6.48 24.97,6.7 24.21,6.94 23.45,7.21 22.7,7.5 21.97,7.82 21.24,8.16 20.52,8.52 19.82,8.91 19.13,9.32 18.46,9.75 17.79,10.2 17.15,10.68 16.52,11.17 15.9,11.69 15.3,12.23 14.72,12.78 15.03,12.6 45.71,12.6 45.8,9.18 46.41,9.83 46.03,8.78 45.88,7.65 45.51,6.58 44.59,5.95 43.48,5.71 42.34,5.66 41.2,5.66 40.06,5.66 38.92,5.66 37.78,5.66 36.65,5.66 35.51,5.66 34.37,5.66 33.23,5.66 32.09,5.66 Z",
      '#c3a575', 'Jug', 'jug', { x: 27.4, y: 5.85 }, { x: 28.5, y: 9.8 }, 'jug',
      'Deep jug, mainly for pull-ups / mounting — not used for this routine'),
    mkZone('jugR', "M 176.92,5.66 L 177.73,5.67 178.54,5.7 179.36,5.76 180.17,5.85 180.97,5.96 181.78,6.1 182.57,6.26 183.37,6.45 184.15,6.67 184.93,6.91 185.7,7.18 186.46,7.47 187.21,7.79 187.94,8.14 188.67,8.5 189.38,8.9 190.09,9.31 190.77,9.75 191.44,10.21 192.1,10.69 192.74,11.2 193.36,11.72 193.97,12.27 194.55,12.83 193.99,12.6 162.86,12.6 163,8.77 162.88,9.64 162.97,8.91 162.94,8.17 162.96,7.43 163.13,6.71 163.62,6.16 164.32,5.93 165.05,5.8 165.78,5.7 166.52,5.66 167.27,5.66 168.01,5.66 168.75,5.66 169.49,5.66 170.24,5.66 170.98,5.66 171.72,5.66 172.46,5.66 173.2,5.66 173.95,5.66 174.69,5.66 175.43,5.66 176.17,5.66 176.92,5.66 Z",
      '#c3a575', 'Jug', 'jug', { x: 182.4, y: 5.67 }, { x: 180.5, y: 9.8 }, 'jug',
      'Deep jug, mainly for pull-ups / mounting — not used for this routine'),
    mkZone('center', "M 79.181,5.849 L 79.184,7.204 79.185,8.56 79.187,9.916 79.188,11.272 79.188,12.628 79.188,13.984 79.18,14.04 129.39,14.04 129.394,13.921 129.413,12.546 129.437,11.17 129.465,9.795 129.497,8.419 129.532,7.044 129.57,5.669 Z",
      '#d9c194', '20° Sloper', '20° sloper', { x: 104.3, y: 5.7 }, { x: 104.3, y: 9.8 }, '20°',
      'Full-width sloper rail — not used for this routine'),
  ];

  const GROUP_META = [
    { key: 'bigEdge', label: '4F Half-Crimp', color: '#e2a33e' },
    { key: 'deepJug', label: '3F Open Drag', color: '#5fb36b' },
    { key: 'topPocket', label: '2F Pocket', color: '#5b90c7' },
    { key: 'smallEdge', label: '2F Small Crimp', color: '#d98a5b' },
  ];
  const DEFAULT_ASSIGN = {
    bigEdge: ['r2_0', 'r2_6'],
    deepJug: ['r1_1', 'r1_2'],
    topPocket: ['r2_1', 'r2_5'],
    smallEdge: ['r1_0', 'r1_3'],
  };
  const ABRAHANGS_SETS = (() => {
    const crimp = { name: '4-Finger Half-Crimp', target: '45 mm edge · row 2', intensity: '70–80% effort', cue: 'Both hands on a comfy large edge in a relaxed half-crimp. Pull up smoothly until you reach the target effort, hold, then ease off.', holds: 'bigEdge' };
    const drag = { name: '3-Finger Open Drag', target: '30 mm pocket · row 1', intensity: '70–80% effort', cue: 'Index–middle–ring fingers in an open drag, thumb relaxed off the board. No crimping — let the fingers extend slightly.', holds: 'deepJug' };
    const midPocket = { name: 'Middle 2-Finger Pocket', target: '50 mm pocket · row 2', intensity: '50–60% effort', cue: 'Middle and ring fingers only. Drop the intensity — you should feel loaded but nowhere near failure.', holds: 'topPocket' };
    const frontPocket = { name: 'Front 2-Finger Pocket', target: '50 mm pocket · row 2', intensity: '50–60% effort', cue: 'Index and middle fingers only. Keep the pull light and controlled.', holds: 'topPocket' };
    const midCrimp = { name: 'Middle 2-Finger Half-Crimp', target: '15 mm edge · row 1', intensity: '30–40% effort', cue: 'Middle and ring on a smaller edge — very light load. Stretch your pinkies out during the rest.', holds: 'smallEdge' };
    const frontCrimp = { name: 'Front 2-Finger Half-Crimp', target: '15 mm edge · row 1', intensity: '30–40% effort', cue: 'Index and middle on a smaller edge — very light load. Stretch your pinkies out during the rest.', holds: 'smallEdge' };
    return [crimp, crimp, crimp, drag, drag, drag, midPocket, frontPocket, midCrimp, frontCrimp];
  })();

  return {
    key: 'beastmaker_1000', label: 'Beastmaker 1000',
    viewBox: { w: 210, h: 62 }, outerTransform: null,
    outline: {
      d: "m -32.962129,82.490377 c -28.39943,0 -51.262498,22.863063 -51.262498,51.262503 0,28.39943 22.863068,51.2625 51.262498,51.2625 H 268.2956 c 28.39944,0 51.26251,-22.86307 51.26251,-51.2625 0,-28.39944 -22.86307,-51.262503 -51.26251,-51.262503 h -22.83256 c -1.8191,0.185035 -4.59553,0.533287 -5.45608,1.167124 -1.47731,1.088106 -1.19744,3.410012 -1.1463,5.242371 0.0446,1.597596 -0.0847,2.823052 -1.70407,2.534166 -3.47669,-0.62022 -7.67747,-2.225309 -14.73202,-6.467698 -2.20388,-1.325342 -5.16578,-2.070214 -8.14881,-2.475963 H 21.057714 c -2.982958,0.405754 -5.944462,1.15065 -8.148291,2.475963 -7.0545549,4.242389 -11.2553248,5.847473 -14.7320301,6.467698 -3.4767057,0.620223 -1.2063773,-5.739734 -3.9717075,-7.776537 -0.8605524,-0.633841 -2.5156311,-0.982089 -4.3347324,-1.167124 z",
      transform: 'matrix(0.48144766,0,0,0.48148624,47.963938,-34.0533)',
      fill: '#d8c39c', stroke: 'rgba(0,0,0,0.16)', strokeWidth: 0.4, clip: true,
    },
    decor: [
      "M 79.181417,14.036706 H 129.38963",
      "m 45.709273,12.597044 h -30.6828",
      "m 162.86178,12.597044 h 31.13269",
    ],
    groups: [{ key: 'main', transform: '' }],
    holds,
    baseStroke: 'rgba(0,0,0,0.22)', onStroke: '#15110d',
    strokeWidthOn: 0.5, strokeWidthOff: 0.26,
    labelFontSize: 3.1, labelYOffsetExtra: 0, labelColor: '#7a6a52',
    repeatersDefaultHoldIds: ['r3_0', 'r3_5'],
    abrahangs: { groups: GROUP_META, defaultAssign: DEFAULT_ASSIGN, sets: ABRAHANGS_SETS },
  };
})();

// =====================================================================
// Simond Ballsy Board — traced from github.com/gitaaron/boards
// (boards/board_svg/simond_ballsy_board/board.svg + boards_metadata/boards_v2.json)
// =====================================================================
const SIMOND_BALLSY_BOARD = (() => {
  const mkHold = (id, group, tag, attrs, transform, center, depth, sloperSize) => {
    const isEdge = depth != null;
    const tooltipTitle = isEdge ? `${depth}mm Edge` : (sloperSize ? `${sloperSize} Sloper` : 'Sloper');
    const shortDesc = isEdge ? `${depth}mm edge` : 'sloper';
    return {
      id, group, tag, attrs, transform,
      label: isEdge ? String(depth) : '',
      labelPos: center, tooltipPos: center,
      tooltipTitle, shortDesc,
      baseFill: isEdge ? '#524d47' : '#3d3a37',
      clip: false,
      idleNote: isEdge ? undefined : 'Sloper — not used in this routine by default',
    };
  };

  const holds = [
    mkHold('1', 'left', 'path', { d: "M0,101.336511 C1.27076854,89.596313 2.53509145,81.3762609 3.79296875,76.6763543 C6.51551247,66.5038984 11.1099407,58.7128346 13.8125,53.6626824 C24.2830556,34.0968214 41.3316619,21.8011547 53.1816406,15.5806512 C64.9514265,9.40224392 84.3714863,0.615146764 111.365234,0.324791784 C118.517071,0.247863915 131.299377,-0.797492735 145.109375,1.32479178 C149.813813,2.04775758 160.754488,2.16889125 178.808594,9.74023437 C182.736723,11.3875725 189.486072,15.5653069 199.056641,22.2734375 L0,101.336511 Z" }, null, { x: 99.5, y: 50.3 }, null, 'Large'),
    mkHold('2', 'left', 'path', { d: "M268.753906,46.3384637 L338.458984,46.3384637 C349.99621,45.8520248 362.229283,47.2608789 375.158203,50.5650262 C382.816649,52.5222378 395.205985,60.2177961 406.376953,64.2779168 C409.124758,65.2766145 411.563242,67.2370989 415.692405,68.1593698 C417.072762,68.4676801 371.452312,67.9853576 278.831055,66.7124023 L268.753906,46.3384637 Z" }, null, { x: 342.9, y: 57.2 }, null, 'Small'),
    mkHold('3', 'left', 'path', { d: "M207.056641,160.421875 C225.194757,172.657229 215.823114,183.272331 207.056641,190.585938 C201.212325,195.461675 188.745528,197.795008 169.65625,197.585938 C123.627604,197.585938 99.0104167,196.585938 95.8046875,194.585938 C90.9960938,191.585938 88.5685925,177.208329 89.3417969,170.344616 C90.4162996,160.806287 99.4304677,153.273793 103.550781,149.677734 C110.636042,143.493978 124.714818,141.6639 145.787109,144.1875 C174.541386,146.853514 194.964563,152.264973 207.056641,160.421875 Z" }, null, { x: 156.9, y: 169.7 }, 42),
    mkHold('4', 'left', 'ellipse', { cx: 297.5, cy: 117.5, rx: 41, ry: 14 }, null, { x: 297.5, y: 117.5 }, 12),
    mkHold('5', 'left', 'ellipse', { cx: 311, cy: 187.5, rx: 41.5, ry: 20 }, null, { x: 311, y: 187.5 }, 22),
    mkHold('6', 'left', 'polygon', { points: "255.640625 290.660156 83.9960938 290.660156 56.4921875 249.660156 255.640625 249.660156" }, null, { x: 156.1, y: 270.2 }, 22),
    mkHold('7', 'left', 'ellipse', { cx: 188, cy: 345.5, rx: 34.5, ry: 25 }, null, { x: 188, y: 345.5 }, 25),
    mkHold('18', 'left', 'polygon', { points: "269 290.660156 269 320 416 320 416 305.330078" }, null, { x: 342.5, y: 305.3 }, 12),

    mkHold('11', 'right', 'path', { d: "M218.359375,101.336511 C219.630144,89.596313 220.894466,81.3762609 222.152344,76.6763543 C224.874887,66.5038984 229.469316,58.7128346 232.171875,53.6626824 C242.642431,34.0968214 259.691037,21.8011547 271.541016,15.5806512 C283.310802,9.40224392 302.730861,0.615146764 329.724609,0.324791784 C336.876446,0.247863915 349.658752,-0.797492735 363.46875,1.32479178 C368.173188,2.04775758 379.113863,2.16889125 397.167969,9.74023438 C401.096098,11.3875725 407.845447,15.5653069 417.416016,22.2734375 L218.359375,101.336511 Z" }, 'translate(317.887695, 50.668255) scale(-1, 1) translate(-317.887695, -50.668255)', { x: 317.9, y: 50.7 }, null, 'Large'),
    mkHold('12', 'right', 'path', { d: "M2.11328125,46.3384637 L71.8183594,46.3384637 C83.3555852,45.8520248 95.5886582,47.2608789 108.517578,50.5650262 C116.176024,52.5222378 128.56536,60.2177961 139.736328,64.2779168 C142.484133,65.2766145 144.922617,67.2370989 149.05178,68.1593698 C150.432137,68.4676801 104.811687,67.9853576 12.1904297,66.7124023 L2.11328125,46.3384637 Z" }, 'translate(75.597733, 57.247184) scale(-1, 1) translate(-75.597733, -57.247184)', { x: 75.6, y: 57.2 }, null, 'Small'),
    mkHold('13', 'right', 'path', { d: "M315.416016,160.421875 C333.554132,172.657229 324.182489,183.272331 315.416016,190.585938 C309.5717,195.461675 297.104903,197.795008 278.015625,197.585938 C231.986979,197.585938 207.369792,196.585938 204.164063,194.585938 C199.355469,191.585938 196.927968,177.208329 197.701172,170.344616 C198.775675,160.806287 207.789843,153.273793 211.910156,149.677734 C218.995417,143.493978 233.074193,141.6639 254.146484,144.1875 C282.900761,146.853514 303.323938,152.264973 315.416016,160.421875 Z" }, 'translate(261.677233, 170.344616) scale(-1, 1) translate(-261.677233, -170.344616)', { x: 261.7, y: 170.3 }, 42),
    mkHold('14', 'right', 'ellipse', { cx: 118.859375, cy: 117.5, rx: 41, ry: 14 }, null, { x: 118.9, y: 117.5 }, 12),
    mkHold('15', 'right', 'ellipse', { cx: 104.359375, cy: 187.5, rx: 41.5, ry: 20 }, null, { x: 104.4, y: 187.5 }, 22),
    mkHold('16', 'right', 'polygon', { points: "360 290.660156 188.355469 290.660156 160.851562 249.660156 360 249.660156" }, 'translate(260.425781, 270.160156) scale(-1, 1) translate(-260.425781, -270.160156)', { x: 260.4, y: 270.2 }, 22),
    mkHold('17', 'right', 'ellipse', { cx: 226.359375, cy: 345.5, rx: 34.5, ry: 25 }, null, { x: 226.4, y: 345.5 }, 25),
    mkHold('19', 'right', 'polygon', { points: "0 290.660156 0 320 149 320 149 305.330078" }, 'translate(74.500000, 305.330078) scale(-1, 1) translate(-74.500000, -305.330078)', { x: 74.5, y: 305.3 }, 12),

    mkHold('8', 'center', 'polygon', { points: "16 0 16 16 135.615081 16 135.615081 0" }, null, { x: 75.8, y: 8 }, null, 'Center'),
    mkHold('9', 'center', 'ellipse', { cx: 75.5, cy: 62.5, rx: 75, ry: 12 }, null, { x: 75.5, y: 62.5 }, 27),
    mkHold('10', 'center', 'ellipse', { cx: 75.5, cy: 136, rx: 75, ry: 23.5 }, null, { x: 75.5, y: 136 }, 35),
  ];

  const GROUP_META = [
    { key: 'bigEdge', label: '4F Half-Crimp', color: '#e2a33e' },
    { key: 'secondaryEdge', label: '4F Half-Crimp (mid)', color: '#5fb36b' },
    { key: 'lightEdge', label: '2F Half-Crimp', color: '#5b90c7' },
    { key: 'smallEdge', label: '2F Small Crimp', color: '#d98a5b' },
  ];
  const DEFAULT_ASSIGN = {
    bigEdge: ['3', '13'],
    secondaryEdge: ['7', '17'],
    lightEdge: ['5', '15'],
    smallEdge: ['4', '14'],
  };
  const ABRAHANGS_SETS = (() => {
    const bigCrimp = { name: '4-Finger Half-Crimp', target: '42 mm edge', intensity: '70–80% effort', cue: 'Both hands on the biggest edge in a relaxed half-crimp. Pull up smoothly until you reach the target effort, hold, then ease off.', holds: 'bigEdge' };
    const midCrimp = { name: '4-Finger Half-Crimp', target: '25 mm edge', intensity: '70–80% effort', cue: 'Same half-crimp, one size down. Keep the pull smooth through the shoulders — no jerking onto the edge.', holds: 'secondaryEdge' };
    const lightMiddle = { name: 'Middle 2-Finger Half-Crimp', target: '22 mm edge', intensity: '50–60% effort', cue: 'Middle and ring fingers only. Drop the intensity — you should feel loaded but nowhere near failure.', holds: 'lightEdge' };
    const lightFront = { name: 'Front 2-Finger Half-Crimp', target: '22 mm edge', intensity: '50–60% effort', cue: 'Index and middle fingers only. Keep the pull light and controlled.', holds: 'lightEdge' };
    const smallMiddle = { name: 'Middle 2-Finger Half-Crimp', target: '12 mm edge', intensity: '30–40% effort', cue: 'Middle and ring on the smallest edge — very light load. Stretch your pinkies out during the rest.', holds: 'smallEdge' };
    const smallFront = { name: 'Front 2-Finger Half-Crimp', target: '12 mm edge', intensity: '30–40% effort', cue: 'Index and middle on the smallest edge — very light load. Stretch your pinkies out during the rest.', holds: 'smallEdge' };
    return [bigCrimp, bigCrimp, bigCrimp, midCrimp, midCrimp, midCrimp, lightMiddle, lightFront, smallMiddle, smallFront];
  })();

  return {
    key: 'simond_ballsy_board', label: 'Simond Ballsy Board',
    viewBox: { w: 958, h: 409 }, outerTransform: 'translate(1.992188, 1.000000)',
    outline: {
      d: "M477.007812,68.1593698 L524.039062,68.4673699 C531.169749,68.7939952 535.925927,68.6913285 538.307595,68.1593698 C542.436758,67.2370989 544.875242,65.2766145 547.623047,64.2779168 C558.794015,60.2177961 571.183351,52.5222378 578.841797,50.5650262 C591.770717,47.2608789 604.00379,45.8520248 615.541016,46.3384637 L615.541016,46.3384637 L685.246094,46.3384637 C701.080478,45.6152195 713.952222,43.2604018 723.861328,39.2740105 C733.770434,35.2876193 744.133715,29.6207616 754.951172,22.2734375 C764.52174,15.5653069 771.271089,11.3875725 775.199219,9.74023438 C793.253324,2.16889125 804.194,2.04775758 808.898438,1.32479178 C822.708435,-0.797492735 835.490741,0.247863915 842.642578,0.324791784 C869.636326,0.615146764 889.056386,9.40224392 900.826172,15.5806512 C912.676151,21.8011547 929.724757,34.0968214 940.195312,53.6626824 C942.897872,58.7128346 947.4923,66.5038984 950.214844,76.6763543 C951.472721,81.3762609 952.737044,89.596313 954.007812,101.336511 L954.007812,101.336511 L950.214844,184.457604 C947.865841,197.604344 945.421831,207.901219 942.882812,215.348229 C940.343794,222.795239 935.419315,234.110343 928.109375,249.293542 C919.404005,259.78809 913.377312,268.020512 910.029297,273.990807 C906.681282,279.961103 903.613573,287.946129 900.826172,297.945886 L900.826172,297.945886 L891.345703,313.59237 C880.989819,328.599741 872.94685,339.602346 867.216797,346.600182 C861.486744,353.598019 853.295337,362.421672 842.642578,373.071141 C830.435249,385.730578 820.243843,393.976586 812.068359,397.809167 C803.892876,401.641747 789.936496,404.715966 770.199219,407.031823 C750.6177,406.212216 735.171736,404.033831 723.861328,400.496667 C702.277187,393.746543 680.81137,380.861163 660.639725,374.071141 C638.995039,366.785275 621.685463,364.412178 607.782778,361.683505 C570.739444,354.413026 527.145184,350.812914 477,350.883168 L477.007812,350.883168 L477,350.883168 C426.862628,350.812914 383.268369,354.413026 346.225034,361.683505 C332.32235,364.412178 315.012773,366.785275 293.368087,374.071141 C273.196442,380.861163 251.730626,393.746543 230.146484,400.496667 C218.836076,404.033831 203.390113,406.212216 183.808594,407.031823 C164.071317,404.715966 150.114937,401.641747 141.939453,397.809167 C133.76397,393.976586 123.572563,385.730578 111.365234,373.071141 C100.712475,362.421672 92.5210689,353.598019 86.7910156,346.600182 C81.0609623,339.602346 73.0179936,328.599741 62.6621094,313.59237 L53.1816406,297.945886 C50.3942392,287.946129 47.3265309,279.961103 43.9785156,273.990807 C40.6305004,268.020512 34.6038077,259.78809 25.8984375,249.293542 C18.5884977,234.110343 13.6640185,222.795239 11.125,215.348229 C8.58598148,207.901219 6.14197106,197.604344 3.79296875,184.457604 L0,101.336511 C1.27076854,89.596313 2.53509145,81.3762609 3.79296875,76.6763543 C6.51551247,66.5038984 11.1099407,58.7128346 13.8125,53.6626824 C24.2830556,34.0968214 41.3316619,21.8011547 53.1816406,15.5806512 C64.9514265,9.40224392 84.3714863,0.615146764 111.365234,0.324791784 C118.517071,0.247863915 131.299377,-0.797492735 145.109375,1.32479178 C149.813813,2.04775758 160.754488,2.16889125 178.808594,9.74023438 C182.736723,11.3875725 189.486072,15.5653069 199.056641,22.2734375 C209.874097,29.6207616 220.237379,35.2876193 230.146484,39.2740105 C240.05559,43.2604018 252.927335,45.6152195 268.761719,46.3384637 L338.466797,46.3384637 C350.004023,45.8520248 362.237096,47.2608789 375.166016,50.5650262 C382.824461,52.5222378 395.213798,60.2177961 406.384766,64.2779168 C409.132571,65.2766145 411.571054,67.2370989 415.700217,68.1593698 C418.081886,68.6913285 422.838063,68.7939952 429.96875,68.4673699 L477,68.1593698 L477.007812,68.1593698 Z",
      transform: '', fill: '#241f19', stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1.5, clip: false,
    },
    decor: [],
    groups: [
      { key: 'left', transform: '' },
      { key: 'right', transform: 'translate(536.640625, -0.000000)' },
      { key: 'center', transform: 'translate(400.500000, 68.000000)' },
    ],
    holds,
    baseStroke: 'rgba(255,255,255,0.16)', onStroke: '#15110d',
    strokeWidthOn: 2.3, strokeWidthOff: 1.2,
    labelFontSize: 14, labelYOffsetExtra: 5, labelColor: '#c8bcab',
    repeatersDefaultHoldIds: ['5', '15'],
    abrahangs: { groups: GROUP_META, defaultAssign: DEFAULT_ASSIGN, sets: ABRAHANGS_SETS },
  };
})();

const DEFAULT_BOARD_KEY = 'beastmaker_1000';
const BOARDS = { beastmaker_1000: BEASTMAKER_1000, simond_ballsy_board: SIMOND_BALLSY_BOARD };
const BOARD_LIST = [BEASTMAKER_1000, SIMOND_BALLSY_BOARD];

const HOLDS_STORAGE_PREFIX = 'abrahangs_holds_v2_';
const REPEATERS_SETUP_STORAGE_PREFIX = 'abrahangs_repeaters_setup_v1_';
const BOARD_STORAGE_KEY = 'abrahangs_board_v1';
const SESSIONS_STORAGE_KEY = 'abrahangs_sessions_v1';
const MAX_STORED_SESSIONS = 100;
const LEGACY_HOLDS_KEY = 'abrahangs_holds_v2';
const LEGACY_REPEATERS_SETUP_KEY = 'abrahangs_repeaters_setup_v1';

// ---- timing-only protocol scaffolding (board-agnostic) ----
const DEFAULT_REPEATERS_TIMING = { hangSeconds: 7, repRestSeconds: 3, repsPerSet: 6, setsCount: 6, setRestSeconds: 180, weightKg: 0 };

const REPEATERS_PRESETS = [
  { label: 'Classic · 7:3 × 6', hangSeconds: 7, repRestSeconds: 3, repsPerSet: 6, setsCount: 6, setRestSeconds: 180 },
  { label: 'Long hang · 10:5 × 5', hangSeconds: 10, repRestSeconds: 5, repsPerSet: 5, setsCount: 5, setRestSeconds: 180 },
  { label: 'High volume · 5:5 × 8', hangSeconds: 5, repRestSeconds: 5, repsPerSet: 8, setsCount: 5, setRestSeconds: 150 },
];

const SETUP_FIELDS = [
  { key: 'hangSeconds', label: 'Hang', min: 3, max: 20, step: 1, suffix: 's' },
  { key: 'repRestSeconds', label: 'Rest between reps', min: 1, max: 15, step: 1, suffix: 's' },
  { key: 'repsPerSet', label: 'Reps per set', min: 2, max: 12, step: 1, suffix: '' },
  { key: 'setsCount', label: 'Sets', min: 1, max: 10, step: 1, suffix: '' },
  { key: 'setRestSeconds', label: 'Rest between sets', min: 60, max: 300, step: 15, suffix: '', formatDuration: true },
  { key: 'weightKg', label: 'Added weight', min: 0, max: 50, step: 1, suffix: ' kg' },
];

const PROTOCOLS = {
  abrahangs: {
    key: 'abrahangs', label: 'Abrahangs',
    sessionNote: '6h+ between sessions',
    prepareSeconds: 8, hangSeconds: 10, repRestSeconds: 50, setRestSeconds: 50, repsPerSet: 1,
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
};

const REPEATERS_TEMPLATE = {
  key: 'repeaters', label: 'Repeaters',
  sessionNote: '48h+ between sessions',
  prepareSeconds: 5,
  footNote: { tag: 'Full hang', text: 'Both feet off the ground, straight arm — this is a real hang at real intensity, not a submax load.' },
  idleUnit: 'sets',
  labels: {
    prepare: 'First rep coming up',
    hang: 'Hold near-max effort',
    restShort: 'Shake out · stay loose',
    restLong: 'Long rest · shake out fully',
  },
};

// Selecting holds always models 2 hands: keep 1-2 selected, swapping out the
// oldest pick once a 3rd is tapped, and refusing to drop below the last one.
function toggleCappedSelection(list, id, max = 2) {
  if (list.includes(id)) {
    if (list.length <= 1) return list;
    return list.filter(x => x !== id);
  }
  if (list.length >= max) return [...list.slice(1), id];
  return [...list, id];
}

function formatSeconds(sec) {
  const s = Math.max(0, Math.ceil(sec));
  if (s < 60) return String(s);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

class AbrahangsTimer {
  constructor() {
    this.state = {
      screen: 'home', protocolKey: 'abrahangs', status: 'idle', phase: 'prepare', setIndex: 0, repIndex: 0, isLongRest: false,
      boardKey: DEFAULT_BOARD_KEY, remaining: 0, phaseTotal: 0,
      soundOn: true, editHolds: false, editGroup: null,
      assignments: null, hoverHold: null, repeatersSetup: null,
    };
    this.timer = null;
    this.actx = null;
    this.lastTs = 0;

    this.queryDom();
    this.migrateLegacyStorage();
    this.loadBoardKey();
    this.loadAssignments();
    this.loadRepeatersSetup();
    const P = this.protocol();
    this.state.editGroup = this.groupsForProtocol(P)[0].key;
    this.state.remaining = P.prepareSeconds;
    this.state.phaseTotal = P.prepareSeconds;
    this.bindEvents();
    this.render();
  }

  board() { return BOARDS[this.state.boardKey] || BOARDS[DEFAULT_BOARD_KEY]; }

  protocol() {
    if (this.state.protocolKey === 'repeaters') return this.buildRepeatersProtocol();
    return this.buildAbrahangsProtocol();
  }
  buildAbrahangsProtocol() {
    const board = this.board();
    return { ...PROTOCOLS.abrahangs, tagline: `${board.label} · 10 min × 2/day`, sets: board.abrahangs.sets, groupMeta: board.abrahangs.groups };
  }
  buildRepeatersProtocol() {
    const board = this.board();
    const cfg = this.state.repeatersSetup;
    const session = this.state.session;
    const liveHolds = (session && session.protocolKey === 'repeaters') ? session.setHolds : null;
    const sets = Array.from({ length: cfg.setsCount }, (_, i) => {
      const holdIds = (liveHolds && liveHolds[i]) ? liveHolds[i] : cfg.holdIds;
      return { name: '4-Finger Half-Crimp', intensity: 'Near-max effort (RPE 8–9)', cue: 'Full bodyweight through a straight arm. Load hard through the last third of each rep — by rep 5–6 this should feel genuinely hard.', target: this.describeHolds(holdIds), holds: holdIds };
    });
    const weightTag = cfg.weightKg ? ` · +${cfg.weightKg}kg` : '';
    return {
      ...REPEATERS_TEMPLATE,
      tagline: `${board.label} · ${cfg.hangSeconds}:${cfg.repRestSeconds} × ${cfg.setsCount}${weightTag} · near-max`,
      hangSeconds: cfg.hangSeconds, repRestSeconds: cfg.repRestSeconds,
      setRestSeconds: cfg.setRestSeconds, repsPerSet: cfg.repsPerSet, weightKg: cfg.weightKg,
      sets,
      doneTitle: `${cfg.setsCount} sets done.`,
      doneBody: `That's ${cfg.setsCount} sets of ${cfg.hangSeconds}:${cfg.repRestSeconds} repeaters in the books. Rest at least <strong>48 hours</strong> before your next finger session — repeaters load the tendons harder than Abrahangs, so recovery matters more here.`,
      idlePreview: String(cfg.setsCount),
    };
  }
  describeHolds(holdIds, board = this.board()) {
    const descs = holdIds.map(id => { const h = board.holds.find(b => b.id === id); return h ? h.shortDesc : null; }).filter(Boolean);
    const uniqueDescs = [...new Set(descs)];
    return uniqueDescs.length ? uniqueDescs.join(' + ') : 'Selected edge';
  }
  resolveSetHoldIds(set) {
    if (Array.isArray(set.holds)) return [...set.holds];
    const assign = this.state.assignments || this.board().abrahangs.defaultAssign;
    return [...(assign[set.holds] || this.board().abrahangs.defaultAssign[set.holds] || [])];
  }
  groupsForProtocol(P) {
    const keys = [...new Set(P.sets.map(s => s.holds))];
    return P.groupMeta.filter(m => keys.includes(m.key));
  }

  queryDom() {
    this.brandSub = document.getElementById('brandSub');
    this.sessionPill = document.getElementById('sessionPill');
    this.backBtn = document.getElementById('backBtn');
    this.homeScreenEl = document.getElementById('homeScreen');
    this.logbookScreenEl = document.getElementById('logbookScreen');
    this.logbookListEl = document.getElementById('logbookList');
    this.logbookClearBtn = document.getElementById('logbookClearBtn');
    this.logbookBtn = document.getElementById('logbookBtn');
    this.setupScreenEl = document.getElementById('setupScreen');
    this.timerScreenEl = document.getElementById('timerScreen');
    this.boardPickerOptionsEl = document.getElementById('boardPickerOptions');
    this.abrahangsCardSubEl = document.getElementById('abrahangsCardSub');
    this.repeatersCardSubEl = document.getElementById('repeatersCardSub');
    this.setupBoardSvg = document.getElementById('setupBoardSvg');
    this.setupPresetsEl = document.getElementById('setupPresets');
    this.setupFieldsEl = document.getElementById('setupFields');
    this.setupStartBtn = document.getElementById('setupStartBtn');
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
    this.repsFeedbackCardEl = document.getElementById('repsFeedbackCard');
    this.gripCardEl = document.getElementById('gripCard');
    this.boardCardEl = document.querySelector('.board-card');
    this.boardMapTitleEl = document.getElementById('boardMapTitle');
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

    this.backBtn.addEventListener('click', () => this.goHome());
    this.logbookBtn.addEventListener('click', () => this.goLogbook());
    this.logbookListEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-session-id]');
      if (btn) this.deleteSession(btn.dataset.sessionId);
    });
    this.logbookClearBtn.addEventListener('click', () => this.clearSessions());

    this.homeScreenEl.addEventListener('click', (e) => {
      const modeBtn = e.target.closest('[data-mode]');
      if (modeBtn) { this.selectMode(modeBtn.dataset.mode); return; }
    });
    this.boardPickerOptionsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-board-key]');
      if (btn) this.selectBoard(btn.dataset.boardKey);
    });

    this.setupBoardSvg.addEventListener('click', (e) => {
      const holdEl = e.target.closest('[data-hold-id]');
      if (holdEl) this.toggleSetupHold(holdEl.dataset.holdId);
    });
    this.setupPresetsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-preset-index]');
      if (btn) this.applyPreset(Number(btn.dataset.presetIndex));
    });
    this.setupFieldsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-field]');
      if (btn) this.adjustSetupField(btn.dataset.field, Number(btn.dataset.delta));
    });
    this.setupStartBtn.addEventListener('click', () => this.startFromSetup());

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
      this.leaveHold();
    });
    this.boardSvg.addEventListener('mouseleave', () => this.leaveHold());
    this.boardSvg.addEventListener('click', (e) => {
      const holdEl = e.target.closest('[data-hold-id]');
      if (!holdEl) return;
      if (this.canEditNextHold()) { this.toggleNextSetHold(holdEl.dataset.holdId); return; }
      this.toggleHold(holdEl.dataset.holdId);
    });

    this.repsFeedbackCardEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-reps-delta]');
      if (btn) this.adjustSetReps(Number(btn.dataset.repsIndex), Number(btn.dataset.repsDelta));
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') { e.preventDefault(); this.primary(); }
      else if (e.key === 'ArrowRight') { this.skip(); }
      else if (e.key && e.key.toLowerCase() === 'r') { this.reset(); }
    });
  }

  // ---- persistence ----
  migrateLegacyStorage() {
    try {
      const oldHolds = localStorage.getItem(LEGACY_HOLDS_KEY);
      const newHoldsKey = HOLDS_STORAGE_PREFIX + DEFAULT_BOARD_KEY;
      if (oldHolds && !localStorage.getItem(newHoldsKey)) localStorage.setItem(newHoldsKey, oldHolds);
      const oldSetup = localStorage.getItem(LEGACY_REPEATERS_SETUP_KEY);
      const newSetupKey = REPEATERS_SETUP_STORAGE_PREFIX + DEFAULT_BOARD_KEY;
      if (oldSetup && !localStorage.getItem(newSetupKey)) localStorage.setItem(newSetupKey, oldSetup);
    } catch (e) {}
  }
  loadBoardKey() {
    let saved = null;
    try { saved = localStorage.getItem(BOARD_STORAGE_KEY); } catch (e) {}
    this.state.boardKey = (saved && BOARDS[saved]) ? saved : DEFAULT_BOARD_KEY;
  }
  persistBoardKey(key) { try { localStorage.setItem(BOARD_STORAGE_KEY, key); } catch (e) {} }

  loadRepeatersSetup() {
    const board = this.board();
    let saved = null;
    try { const r = localStorage.getItem(REPEATERS_SETUP_STORAGE_PREFIX + board.key); if (r) saved = JSON.parse(r); } catch (e) {}
    const valid = new Set(board.holds.map(h => h.id));
    const holdIds = (saved && Array.isArray(saved.holdIds)) ? saved.holdIds.filter(id => valid.has(id)) : null;
    this.state.repeatersSetup = {
      holdIds: (holdIds && holdIds.length) ? holdIds : [...board.repeatersDefaultHoldIds],
      hangSeconds: Number(saved && saved.hangSeconds) || DEFAULT_REPEATERS_TIMING.hangSeconds,
      repRestSeconds: Number(saved && saved.repRestSeconds) || DEFAULT_REPEATERS_TIMING.repRestSeconds,
      repsPerSet: Number(saved && saved.repsPerSet) || DEFAULT_REPEATERS_TIMING.repsPerSet,
      setsCount: Number(saved && saved.setsCount) || DEFAULT_REPEATERS_TIMING.setsCount,
      setRestSeconds: Number(saved && saved.setRestSeconds) || DEFAULT_REPEATERS_TIMING.setRestSeconds,
      weightKg: Number(saved && saved.weightKg) || DEFAULT_REPEATERS_TIMING.weightKg,
    };
  }
  persistRepeatersSetup(cfg) { try { localStorage.setItem(REPEATERS_SETUP_STORAGE_PREFIX + this.board().key, JSON.stringify(cfg)); } catch (e) {} }

  loadAssignments() {
    const board = this.board();
    let saved = null;
    try { const r = localStorage.getItem(HOLDS_STORAGE_PREFIX + board.key); if (r) saved = JSON.parse(r); } catch (e) {}
    const valid = new Set(board.holds.map(h => h.id));
    const defaultAssign = board.abrahangs.defaultAssign;
    const clean = {};
    for (const k of Object.keys(defaultAssign)) {
      const arr = (saved && Array.isArray(saved[k])) ? saved[k].filter(id => valid.has(id)) : null;
      clean[k] = (arr && arr.length) ? arr : [...defaultAssign[k]];
    }
    this.state.assignments = clean;
  }
  persist(a) { try { localStorage.setItem(HOLDS_STORAGE_PREFIX + this.board().key, JSON.stringify(a)); } catch (e) {} }

  // ---- session recording ----
  snapshotParams(P) {
    const boardKey = this.state.boardKey;
    if (P.key === 'repeaters') {
      const cfg = this.state.repeatersSetup;
      return {
        boardKey, hangSeconds: cfg.hangSeconds, repRestSeconds: cfg.repRestSeconds, repsPerSet: cfg.repsPerSet,
        setsCount: cfg.setsCount, setRestSeconds: cfg.setRestSeconds, holdIds: [...cfg.holdIds], weightKg: cfg.weightKg,
      };
    }
    return {
      boardKey, hangSeconds: P.hangSeconds, repRestSeconds: P.repRestSeconds, repsPerSet: P.repsPerSet,
      setsCount: P.sets.length, setRestSeconds: P.setRestSeconds,
    };
  }
  startSession(P) {
    return {
      id: `${Date.now()}`,
      protocolKey: P.key,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      params: this.snapshotParams(P),
      setHolds: P.sets.map(s => this.resolveSetHoldIds(s)),
      setReps: new Array(P.sets.length).fill(null),
    };
  }
  buildSessionRecord(session, P) {
    return {
      id: session.id,
      protocolKey: session.protocolKey,
      startedAt: session.startedAt,
      finishedAt: session.finishedAt,
      params: session.params,
      sets: P.sets.map((s, i) => ({
        index: i,
        holdIds: session.setHolds[i],
        targetReps: P.repsPerSet,
        actualReps: session.setReps[i] == null ? P.repsPerSet : session.setReps[i],
      })),
    };
  }
  persistSessionRecord(record) {
    try {
      let list = [];
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (raw) list = JSON.parse(raw);
      if (!Array.isArray(list)) list = [];
      const idx = list.findIndex(s => s.id === record.id);
      if (idx >= 0) list[idx] = record; else list.push(record);
      while (list.length > MAX_STORED_SESSIONS) list.shift();
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }
  loadSessions() {
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }
  saveSessions(list) {
    try { localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
  }
  deleteSession(id) {
    this.saveSessions(this.loadSessions().filter(s => s.id !== id));
    this.render();
  }
  clearSessions() {
    if (!confirm("Delete all logged sessions? This can't be undone.")) return;
    this.saveSessions([]);
    this.render();
  }

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

  finish() {
    this.stop();
    const P = this.protocol();
    const session = this.state.session ? { ...this.state.session, finishedAt: new Date().toISOString() } : null;
    this.setState({ status: 'done', session });
    if (session) this.persistSessionRecord(this.buildSessionRecord(session, P));
    this.doneBeep();
  }

  primary() {
    const s = this.state.status;
    if (s === 'running') this.pause();
    else if (s === 'paused') this.resume();
    else this.startRoutine();
  }
  startRoutine() {
    this.ensureAudio();
    this.state.session = null; // clear any finished session so protocol() builds fresh from setup defaults, not stale overrides
    const P = this.protocol();
    const session = this.startSession(P);
    this.setState({ status: 'running', phase: 'prepare', setIndex: 0, repIndex: 0, isLongRest: false, remaining: P.prepareSeconds, phaseTotal: P.prepareSeconds, session });
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

  // ---- screen navigation ----
  goHome() {
    this.stop();
    this.setState({ screen: 'home', status: 'idle' });
  }
  goLogbook() {
    this.stop();
    this.setState({ screen: 'logbook' });
  }
  selectMode(key) {
    this.stop();
    if (key === 'abrahangs') {
      const P = this.buildAbrahangsProtocol();
      this.setState({
        protocolKey: 'abrahangs', screen: 'timer', status: 'idle', phase: 'prepare', setIndex: 0, repIndex: 0, isLongRest: false,
        remaining: P.prepareSeconds, phaseTotal: P.prepareSeconds,
        editHolds: false, editGroup: this.groupsForProtocol(P)[0].key,
      });
    } else if (key === 'repeaters') {
      this.setState({ protocolKey: 'repeaters', screen: 'setup', editHolds: false });
    }
  }
  selectBoard(key) {
    if (!BOARDS[key] || key === this.state.boardKey) return;
    this.persistBoardKey(key);
    this.state.boardKey = key;
    this.loadAssignments();
    this.loadRepeatersSetup();
    const P = this.protocol();
    this.setState({ editGroup: this.groupsForProtocol(this.buildAbrahangsProtocol())[0].key });
  }
  startFromSetup() {
    if (!this.state.repeatersSetup.holdIds.length) return;
    this.persistRepeatersSetup(this.state.repeatersSetup);
    this.setState({ screen: 'timer', editHolds: false });
    this.startRoutine();
  }

  // ---- board editing ----
  toggleEdit() { this.setState(s => ({ editHolds: !s.editHolds })); }
  setEditGroup(k) { this.setState({ editGroup: k, editHolds: true }); }
  toggleHold(id) {
    if (!this.state.editHolds) return;
    const grp = this.state.editGroup;
    const base = this.state.assignments || this.board().abrahangs.defaultAssign;
    const cur = base[grp] || [];
    const next = toggleCappedSelection(cur, id);
    if (next === cur) return;
    const a = { ...base, [grp]: next };
    this.setState({ assignments: a });
    this.persist(a);
  }
  resetHolds() {
    const a = { ...this.board().abrahangs.defaultAssign };
    this.setState({ assignments: a });
    this.persist(a);
  }
  enterHold(id) { if (this.state.hoverHold === id) return; this.setState({ hoverHold: id }); }
  leaveHold() { if (this.state.hoverHold === null) return; this.setState({ hoverHold: null }); }

  // ---- repeaters setup ----
  toggleSetupHold(id) {
    const cur = this.state.repeatersSetup.holdIds;
    const next = toggleCappedSelection(cur, id);
    if (next === cur) return;
    const repeatersSetup = { ...this.state.repeatersSetup, holdIds: next };
    this.setState({ repeatersSetup });
    this.persistRepeatersSetup(repeatersSetup);
  }
  adjustSetupField(key, delta) {
    const field = SETUP_FIELDS.find(f => f.key === key);
    if (!field) return;
    const next = Math.min(field.max, Math.max(field.min, this.state.repeatersSetup[key] + delta));
    if (next === this.state.repeatersSetup[key]) return;
    const repeatersSetup = { ...this.state.repeatersSetup, [key]: next };
    this.setState({ repeatersSetup });
    this.persistRepeatersSetup(repeatersSetup);
  }
  applyPreset(index) {
    const preset = REPEATERS_PRESETS[index];
    if (!preset) return;
    const repeatersSetup = {
      ...this.state.repeatersSetup,
      hangSeconds: preset.hangSeconds, repRestSeconds: preset.repRestSeconds,
      repsPerSet: preset.repsPerSet, setsCount: preset.setsCount, setRestSeconds: preset.setRestSeconds,
    };
    this.setState({ repeatersSetup });
    this.persistRepeatersSetup(repeatersSetup);
  }

  // ---- next-set hold change (prospective — always about the set that hasn't started yet) ----
  canEditNextHold() {
    const { status, phase, isLongRest } = this.state;
    if (status !== 'running' && status !== 'paused') return false;
    if (phase !== 'rest' || !isLongRest) return false;
    return this.protocol().key === 'repeaters';
  }
  toggleNextSetHold(id) {
    if (!this.canEditNextHold()) return;
    const session = this.state.session;
    if (!session) return;
    const idx = this.state.setIndex;
    const cur = session.setHolds[idx] || [];
    const next = toggleCappedSelection(cur, id);
    if (next === cur) return;
    const setHolds = session.setHolds.map((h, k) => (k >= idx ? next : h));
    this.setState({ session: { ...session, setHolds } });
  }

  // ---- reps feedback (retrospective — always about the set that just finished) ----
  adjustSetReps(setIdx, delta) {
    const session = this.state.session;
    if (!session) return;
    const P = this.protocol();
    const target = P.repsPerSet;
    const cur = session.setReps[setIdx] == null ? target : session.setReps[setIdx];
    const next = Math.max(0, Math.min(target, cur + delta));
    if (next === cur) return;
    const setReps = session.setReps.map((r, k) => (k === setIdx ? next : r));
    const nextSession = { ...session, setReps };
    this.setState({ session: nextSession });
    if (nextSession.finishedAt) this.persistSessionRecord(this.buildSessionRecord(nextSession, this.protocol()));
  }

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

  renderBoardPicker() {
    const current = this.state.boardKey;
    this.boardPickerOptionsEl.innerHTML = BOARD_LIST.map(b =>
      `<button type="button" class="board-pill${b.key === current ? ' board-pill-active' : ''}" data-board-key="${b.key}">${b.label}</button>`
    ).join('');
  }

  renderHomeCards() {
    const board = this.board();
    this.abrahangsCardSubEl.textContent = `${board.label} · 10 min × 2/day · low intensity`;
    this.repeatersCardSubEl.textContent = `${board.label} · near-max effort · configurable`;
  }

  formatSessionDate(iso) {
    try {
      const d = new Date(iso);
      const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
      return `${date} · ${time}`;
    } catch (e) { return ''; }
  }

  renderLogbook() {
    const sessions = this.loadSessions().slice().reverse();
    this.logbookClearBtn.hidden = sessions.length === 0;
    if (!sessions.length) {
      this.logbookListEl.innerHTML = `<div class="logbook-empty">No sessions logged yet — finish a timer session and it'll show up here.</div>`;
      return;
    }
    this.logbookListEl.innerHTML = sessions.map(s => this.renderLogbookEntry(s)).join('');
  }

  renderLogbookEntry(record) {
    const isRepeaters = record.protocolKey === 'repeaters';
    const protoLabel = isRepeaters ? 'Repeaters' : 'Abrahangs';
    const accent = isRepeaters ? '#5fb36b' : '#e2a33e';
    const board = BOARDS[record.params.boardKey] || this.board();
    const when = this.formatSessionDate(record.finishedAt || record.startedAt);
    const p = record.params;
    const metaLine = isRepeaters
      ? `${board.label} · ${p.hangSeconds}:${p.repRestSeconds} × ${p.repsPerSet} reps × ${p.setsCount} sets${p.weightKg ? ` · +${p.weightKg}kg` : ''}`
      : `${board.label} · ${p.setsCount} sets × ${p.hangSeconds}s hold`;
    const showReps = p.repsPerSet > 1;
    const setsHtml = record.sets.map(s => {
      const holdDesc = this.describeHolds(s.holdIds, board);
      const short = s.actualReps < s.targetReps;
      const repsPart = showReps
        ? `<span class="logbook-set-reps${short ? ' logbook-set-reps-short' : ''}">${s.actualReps}/${s.targetReps} reps</span>`
        : '';
      return `<div class="logbook-set-row"><span>Set ${s.index + 1} — ${holdDesc}</span>${repsPart}</div>`;
    }).join('');
    return `
      <div class="logbook-entry">
        <div class="logbook-entry-header">
          <div class="logbook-entry-title">
            <span class="logbook-entry-protocol" style="color:${accent}">${protoLabel}</span>
            <span class="logbook-entry-date">${when}</span>
          </div>
          <button type="button" class="logbook-delete-btn" data-session-id="${record.id}" title="Delete session">&times;</button>
        </div>
        <div class="logbook-entry-meta">${metaLine}</div>
        <details class="logbook-entry-details">
          <summary>Set details</summary>
          <div class="logbook-set-list">${setsHtml}</div>
        </details>
      </div>`;
  }

  renderSetupPresets() {
    this.setupPresetsEl.innerHTML = REPEATERS_PRESETS.map((preset, i) =>
      `<button type="button" class="preset-pill" data-preset-index="${i}">${preset.label}</button>`
    ).join('');
  }

  renderSetupFields() {
    const cfg = this.state.repeatersSetup;
    this.setupFieldsEl.innerHTML = SETUP_FIELDS.map(f => {
      const val = cfg[f.key];
      const display = f.formatDuration ? formatSeconds(val) : `${val}${f.suffix}`;
      return `
        <div class="stepper-row">
          <div class="stepper-label">${f.label}</div>
          <div class="stepper-controls">
            <button type="button" class="stepper-btn" data-field="${f.key}" data-delta="${-f.step}">&minus;</button>
            <div class="stepper-value">${display}</div>
            <button type="button" class="stepper-btn" data-field="${f.key}" data-delta="${f.step}">&plus;</button>
          </div>
        </div>`;
    }).join('');
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

  renderRepsFeedbackCard() {
    const { status, phase, setIndex, isLongRest } = this.state;
    const P = this.protocol();
    const session = this.state.session;

    let feedbackIdx = -1;
    if (status === 'done') feedbackIdx = setIndex;
    else if (phase === 'rest' && isLongRest && setIndex > 0) feedbackIdx = setIndex - 1;

    if (P.key !== 'repeaters' || !session || feedbackIdx < 0) {
      this.repsFeedbackCardEl.innerHTML = '';
      this.repsFeedbackCardEl.hidden = true;
      return;
    }
    this.repsFeedbackCardEl.hidden = false;
    const accent = this.getAccent();
    const target = P.repsPerSet;
    const val = session.setReps[feedbackIdx] == null ? target : session.setReps[feedbackIdx];
    this.repsFeedbackCardEl.innerHTML = `
      <div class="reps-feedback-card">
        <div class="reps-feedback-header">
          <span class="reps-feedback-label" style="color:${accent}">Set ${feedbackIdx + 1} Complete</span>
          <span class="reps-feedback-target">${target} rep${target === 1 ? '' : 's'} planned</span>
        </div>
        <div class="reps-feedback-row">
          <div class="reps-feedback-question">Reps completed</div>
          <div class="reps-stepper">
            <button type="button" class="stepper-btn" data-reps-index="${feedbackIdx}" data-reps-delta="-1">&minus;</button>
            <div class="reps-value">${val}<span class="reps-value-target">/${target}</span></div>
            <button type="button" class="stepper-btn" data-reps-index="${feedbackIdx}" data-reps-delta="1">&plus;</button>
          </div>
        </div>
      </div>`;
  }

  renderGripCard() {
    const { status, phase, setIndex, repIndex, isLongRest } = this.state;
    const P = this.protocol();
    const accent = this.getAccent();
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
          ${P.weightKg ? `<span class="tag-weight">+${P.weightKg}kg</span>` : ''}
        </div>
        <p class="grip-cue">${g.cue}</p>
        <div class="nohang-note">
          <span class="tag">${P.footNote.tag}</span>
          <span>${P.footNote.text}</span>
        </div>
      </div>`;
  }

  buildBoardMarkup(board, highlightIds, highlightColor, clipId) {
    const hoverHold = this.state.hoverHold;

    const renderShape = (h, on, hovered) => {
      const fill = on ? highlightColor : hovered ? lightenHex(h.baseFill, 22) : h.baseFill;
      const stroke = on ? board.onStroke : board.baseStroke;
      const sw = on ? board.strokeWidthOn : board.strokeWidthOff;
      const clipAttr = h.clip ? ` clip-path="url(#${clipId})"` : '';
      switch (h.tag) {
        case 'rect':
          return `<rect x="${h.attrs.x}" y="${h.attrs.y}" width="${h.attrs.w}" height="${h.attrs.h}" rx="${h.attrs.rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${clipAttr}></rect>`;
        case 'ellipse':
          return `<ellipse cx="${h.attrs.cx}" cy="${h.attrs.cy}" rx="${h.attrs.rx}" ry="${h.attrs.ry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${clipAttr}></ellipse>`;
        case 'polygon':
          return `<polygon points="${h.attrs.points}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${clipAttr}></polygon>`;
        default:
          return `<path d="${h.attrs.d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${clipAttr}></path>`;
      }
    };

    const byGroup = {};
    board.holds.forEach(h => { (byGroup[h.group] || (byGroup[h.group] = [])).push(h); });

    const holdsMarkup = board.groups.map(grp => {
      const items = (byGroup[grp.key] || []).map(h => {
        const on = highlightIds.includes(h.id);
        const hovered = !on && hoverHold === h.id;
        const labelColor = on ? '#15110d' : board.labelColor;
        const shape = h.transform ? `<g transform="${h.transform}">${renderShape(h, on, hovered)}</g>` : renderShape(h, on, hovered);
        const label = h.label
          ? `<text x="${h.labelPos.x}" y="${h.labelPos.y + board.labelYOffsetExtra}" text-anchor="middle" font-family="Archivo, sans-serif" font-size="${board.labelFontSize}" font-weight="700" fill="${labelColor}" style="pointer-events:none;">${h.label}</text>`
          : '';
        return `<g data-hold-id="${h.id}">${shape}${label}</g>`;
      }).join('');
      return grp.transform ? `<g transform="${grp.transform}">${items}</g>` : items;
    }).join('');

    const clipDef = board.outline.clip
      ? `<defs><clipPath id="${clipId}"><path d="${board.outline.d}" transform="${board.outline.transform || ''}"></path></clipPath></defs>`
      : '';
    const outlineMarkup = `<g transform="${board.outline.transform || ''}"><path d="${board.outline.d}" fill="${board.outline.fill}" stroke="${board.outline.stroke || 'none'}" stroke-width="${board.outline.strokeWidth || 0}"></path></g>`;
    const decorMarkup = (board.decor || []).map(d => `<path d="${d}" fill="none" stroke="rgba(0,0,0,0.22)" stroke-width="0.35" style="pointer-events:none;"></path>`).join('');

    const body = `${clipDef}${outlineMarkup}${decorMarkup}${holdsMarkup}`;
    return board.outerTransform ? `<g transform="${board.outerTransform}">${body}</g>` : body;
  }

  renderBoard() {
    const { status, editHolds, editGroup, setIndex } = this.state;
    const board = this.board();
    const P = this.protocol();
    const accent = this.getAccent();
    const assign = this.state.assignments || board.abrahangs.defaultAssign;
    const g = P.sets[Math.min(setIndex, P.sets.length - 1)];
    const editColor = ((P.groupMeta || []).find(m => m.key === editGroup) || {}).color || '#e2a33e';

    let highlightIds, highlightColor;
    if (editHolds) {
      highlightIds = assign[editGroup] || [];
      highlightColor = editColor;
    } else {
      highlightIds = status === 'done' ? [] : (Array.isArray(g.holds) ? g.holds : (assign[g.holds] || []));
      highlightColor = accent;
    }

    this.boardSvg.setAttribute('viewBox', `0 0 ${board.viewBox.w} ${board.viewBox.h}`);
    this.boardSvg.style.maxWidth = boardMaxWidthPct(board) + '%';
    this.boardSvg.innerHTML = this.buildBoardMarkup(board, highlightIds, highlightColor, 'boardOutlineClip');
    this.boardCardEl.classList.toggle('board-card-active-edit', this.canEditNextHold());
    this.renderTooltip();
  }

  renderSetupBoard() {
    const board = this.board();
    this.setupBoardSvg.setAttribute('viewBox', `0 0 ${board.viewBox.w} ${board.viewBox.h}`);
    this.setupBoardSvg.style.maxWidth = boardMaxWidthPct(board) + '%';
    this.setupBoardSvg.innerHTML = this.buildBoardMarkup(board, this.state.repeatersSetup.holdIds, ACCENT_MAP.hang, 'setupBoardOutlineClip');
  }

  renderTooltip() {
    const { hoverHold, setIndex } = this.state;
    const board = this.board();
    const P = this.protocol();
    const assign = this.state.assignments || board.abrahangs.defaultAssign;
    const relevantGroups = P.groupMeta || [];
    let tooltip = null;
    if (hoverHold) {
      const h = board.holds.find(b => b.id === hoverHold);
      if (h) {
        const g = P.sets[Math.min(setIndex, P.sets.length - 1)];
        const usedBy = Array.isArray(g.holds)
          ? (g.holds.includes(h.id) ? [g.name] : [])
          : relevantGroups.filter(m => (assign[m.key] || []).includes(h.id)).map(m => m.label);
        tooltip = {
          left: (h.tooltipPos.x / board.viewBox.w * 100) + '%',
          top: (h.tooltipPos.y / board.viewBox.h * 100) + '%',
          title: h.tooltipTitle,
          sub: usedBy.length ? `Used in ${usedBy.join(', ')}` : (h.idleNote || 'Not part of current routine'),
        };
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
    if (P.key === 'repeaters') {
      this.editPanelEl.innerHTML = '';
      this.notEditingHintEl.hidden = false;
      this.notEditingHintEl.textContent = this.canEditNextHold()
        ? 'Tap holds to change for the next set — applies for the rest of this session'
        : 'Lit holds = current set · numbers are edge depth (mm)';
      return;
    }
    const groups = this.groupsForProtocol(P);
    if (!editHolds) {
      this.editPanelEl.innerHTML = '';
      this.notEditingHintEl.hidden = false;
      this.notEditingHintEl.textContent = 'Lit holds = current grip · numbers are edge depth (mm)';
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
      <div class="edit-panel-hint">Pick a grip, then tap the 1-2 holds you use for it. Saved on this device.</div>
      <div class="edit-groups">${groupsMarkup}</div>
      <button type="button" class="reset-holds-btn" id="resetHoldsBtn">Reset to defaults</button>
    `;
  }

  render() {
    const { screen, status, phase, soundOn, editHolds, isLongRest } = this.state;

    this.backBtn.hidden = screen === 'home';
    this.backBtn.textContent = screen === 'logbook' ? '‹ Home' : '‹ Modes';
    this.homeScreenEl.hidden = screen !== 'home';
    this.logbookScreenEl.hidden = screen !== 'logbook';
    this.setupScreenEl.hidden = screen !== 'setup';
    this.timerScreenEl.hidden = screen !== 'timer';

    this.soundBtn.textContent = soundOn ? 'Sound on' : 'Sound off';
    this.sessionPill.hidden = screen === 'home' || screen === 'logbook';

    document.title = `Abrahangs Timer — ${this.board().label}`;

    if (screen === 'home') {
      this.brandSub.textContent = this.board().label;
      this.renderBoardPicker();
      this.renderHomeCards();
      return;
    }

    if (screen === 'logbook') {
      this.brandSub.textContent = 'Session history';
      this.renderLogbook();
      return;
    }

    const P = this.protocol();
    this.brandSub.textContent = P.tagline;
    this.sessionPill.textContent = P.sessionNote;

    if (screen === 'setup') {
      this.renderSetupBoard();
      this.renderSetupPresets();
      this.renderSetupFields();
      const hasHolds = this.state.repeatersSetup.holdIds.length > 0;
      this.setupStartBtn.disabled = !hasHolds;
      this.setupStartBtn.textContent = hasHolds ? 'Start Session' : 'Pick a hold to start';
      return;
    }

    const accent = this.getAccent();
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

    this.editBtn.hidden = P.key === 'repeaters';
    this.editBtn.textContent = editHolds ? 'Done' : 'Edit holds';
    this.boardMapTitleEl.textContent = `Board map · ${this.board().label}`;

    this.renderPips();
    this.renderRepsFeedbackCard();
    this.renderGripCard();
    this.renderBoard();
    this.renderEditPanel();
    this.paintTick();
    this.unitTextEl.textContent = this.computeCountdown().unitText;
  }
}

document.addEventListener('DOMContentLoaded', () => new AbrahangsTimer());
