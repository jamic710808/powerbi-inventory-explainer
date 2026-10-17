/* 繪圖工具庫：扁平插畫＋MG。全部是「時間的純函式」——同一個時間必得同一格，不累積狀態。 */
(() => {
  const TAU = Math.PI * 2;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const hash = n => { const v = Math.sin(n * 127.1 + 37.7) * 43758.5453; return v - Math.floor(v); };
  const E = {
    lin: t => t,
    io: t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    out: t => 1 - Math.pow(1 - t, 3),
    in: t => t * t * t,
    back: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    elastic: t => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -9 * t) * Math.sin((t * 10 - .75) * (TAU / 3)) + 1),
  };
  const tw = (t, t0, t1, e = E.out) => e(clamp((t - t0) / Math.max(1e-6, t1 - t0)));
  const pop = (t, t0, d = .38) => { const u = (t - t0) / d; return u <= 0 ? 0 : u >= 1 ? 1 : E.back(u); };
  const C = {
    cream: '#FFF3DC', wall: '#FBE6C6', wall2: '#F6D9AE', floor: '#E6C393', floor2: '#D9B07A',
    ink: '#22344F', ink2: '#3E5373', orange: '#F08A3C', orange2: '#D9692A', teal: '#46B29D', teal2: '#2E8F7D',
    red: '#E4572E', red2: '#C2411F', yellow: '#F6C453', skin: '#F2C6A0', skin2: '#E2AA82', white: '#FFFFFF',
    blue: '#5B7DB1', blue2: '#46659A', grey: '#C9CED6', grey2: '#9AA3B2', box: '#D9A066', box2: '#BF8650', tape: '#F2D08E',
    pink: '#F4A3A0', green: '#5CBF72', paper: '#FFFDF7', navy: '#1B2A44',
  };
  const FONT = "'Microsoft JhengHei','Noto Sans TC','PingFang TC',sans-serif";

  function rr(c, x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  const fillRR = (c, x, y, w, h, r, f) => { rr(c, x, y, w, h, r); c.fillStyle = f; c.fill(); };
  const circ = (c, x, y, r, f) => { c.beginPath(); c.arc(x, y, r, 0, TAU); if (f) { c.fillStyle = f; c.fill(); } };
  const ell = (c, x, y, rx, ry, f, rot = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); if (f) { c.fillStyle = f; c.fill(); } };
  const line = (c, x1, y1, x2, y2, w, col, cap = 'round') => { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineWidth = w; c.strokeStyle = col; c.lineCap = cap; c.stroke(); };
  function text(c, str, x, y, o = {}) {
    c.save();
    c.font = `${o.weight || 800} ${o.size || 40}px ${o.font || FONT}`;
    c.textAlign = o.align || 'center'; c.textBaseline = o.base || 'middle';
    if (o.stroke) { c.lineWidth = o.strokeW || 8; c.strokeStyle = o.stroke; c.lineJoin = 'round'; c.strokeText(str, x, y); }
    c.fillStyle = o.color || C.ink; c.fillText(str, x, y); c.restore();
  }
  function shadow(c, x, y, rx, ry = rx * .18, a = .18) { ell(c, x, y, rx, ry, `rgba(34,52,79,${a})`); }
  const withAlpha = (c, a, fn) => { if (a <= 0) return; c.save(); c.globalAlpha *= clamp(a); fn(); c.restore(); };
  const scaleAt = (c, x, y, s, fn) => { if (s <= 0.001) return; c.save(); c.translate(x, y); c.scale(s, s); fn(); c.restore(); };

  /* ---------- 背景 ---------- */
  function room(c, W, H, o = {}) {
    // 牆、地板、窗、踢腳線。o.tint 可讓每場微調色。
    const wall = o.wall || C.wall;
    c.fillStyle = wall; c.fillRect(0, 0, W, H);
    c.fillStyle = o.wall2 || C.wall2; c.fillRect(0, 0, W, 60); // 牆頂線
    const fy = o.floorY || 800;
    c.fillStyle = C.floor; c.fillRect(0, fy, W, H - fy);
    c.fillStyle = C.floor2; c.fillRect(0, fy, W, 14);
    for (let i = 0; i < 12; i++) { c.fillStyle = 'rgba(160,110,60,.10)'; c.fillRect(i * 170 - ((o.scroll || 0) % 170), fy + 14, 3, H - fy); }
  }
  function windowFrame(c, x, y, w, h, t = 0, glow = 0) {
    fillRR(c, x - 14, y - 14, w + 28, h + 28, 16, '#fff7e8');
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, glow > 0 ? '#FFD9A0' : '#BFE3F2'); g.addColorStop(1, glow > 0 ? '#FFB073' : '#E9F6FB');
    fillRR(c, x, y, w, h, 8, g);
    c.fillStyle = '#fff'; c.fillRect(x + w / 2 - 5, y, 10, h); c.fillRect(x, y + h / 2 - 5, w, 10);
    ell(c, x + w * .2 + Math.sin(t * .4) * 12, y + h * .28, 52, 20, 'rgba(255,255,255,.85)');
    ell(c, x + w * .72 - Math.sin(t * .3) * 10, y + h * .2, 38, 15, 'rgba(255,255,255,.8)');
    if (glow > 0) circ(c, x + w * .3, y + h * .62, 40 * glow, 'rgba(255,240,170,.9)');
  }
  function shelf(c, x, y, w, rows, t = 0, seed = 1) {
    // 貨架：直柱＋層板＋一排紙箱
    const h = rows * 120 + 20;
    fillRR(c, x, y, 14, h, 4, '#9D7A52'); fillRR(c, x + w - 14, y, 14, h, 4, '#9D7A52');
    for (let r = 0; r < rows; r++) {
      const by = y + 20 + r * 120 + 100;
      fillRR(c, x, by, w, 14, 4, '#B58D5C');
      let bx = x + 24;
      for (let i = 0; bx < x + w - 70; i++) {
        const bw = 56 + hash(seed + r * 7 + i) * 40, bh = 52 + hash(seed + r * 13 + i * 3) * 36;
        if (bx + bw > x + w - 20) break;
        box(c, bx, by - bh, bw, bh);
        bx += bw + 8 + hash(seed + i * 11 + r) * 10;
      }
    }
  }
  function box(c, x, y, w, h, o = {}) {
    c.save(); if (o.rot) { c.translate(x + w / 2, y + h / 2); c.rotate(o.rot); c.translate(-w / 2, -h / 2); } else c.translate(x, y);
    fillRR(c, 0, 0, w, h, 6, o.color || C.box);
    fillRR(c, 0, 0, w, h * .22, 6, o.color2 || C.box2);
    fillRR(c, w / 2 - w * .09, 0, w * .18, h * .55, 3, C.tape);
    if (o.label) { fillRR(c, w * .16, h * .62, w * .68, h * .26, 4, '#fff'); if (o.labelText) text(c, o.labelText, w / 2, h * .75, { size: Math.min(h * .2, 26), color: C.ink }); }
    c.restore();
  }

  /* ---------- 人物骨架 ---------- */
  const WHO = {
    cang: { shirt: '#FFF5E1', shirt2: '#EBDDBE', vest: C.orange, hair: '#2A3B5A', glasses: true },
    boss: { shirt: '#5B7DB1', shirt2: '#46659A', tie: '#D8453B', hair: '#3B2F2F', glasses: false },
    cust: { shirt: '#8E7CC3', shirt2: '#7664AD', hair: '#4A3A2A', glasses: false },
    cust2: { shirt: '#6FB6A4', shirt2: '#559A88', hair: '#2F2F3A', glasses: false },
    biz: { shirt: '#E4A63C', shirt2: '#CC8F26', hair: '#1F2430', glasses: false },
  };
  function ik(sx, sy, hx, hy, l1, l2, side) {
    let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy); const max = l1 + l2 - 1, min = Math.abs(l1 - l2) + 1;
    if (d > max) { dx *= max / d; dy *= max / d; d = max; } if (d < min) d = min;
    const a = Math.atan2(dy, dx), cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), ang = Math.acos(cosA);
    const e1 = { x: sx + Math.cos(a + ang) * l1, y: sy + Math.sin(a + ang) * l1 }, e2 = { x: sx + Math.cos(a - ang) * l1, y: sy + Math.sin(a - ang) * l1 };
    const sc = e => side * e.x * .6 + e.y * .6; const e = sc(e1) > sc(e2) ? e1 : e2;
    return { ex: e.x, ey: e.y, hx: sx + dx, hy: sy + dy };
  }
  function eye(c, x, y, o) {
    const shock = o.shock || 0, blink = o.blink || 0;
    if (shock > .05) {
      circ(c, x, y, lerp(8, 19, shock), '#fff'); c.lineWidth = 3; c.strokeStyle = C.ink; c.stroke();
      circ(c, x + (o.lx || 0) * 5, y + (o.ly || 0) * 5, lerp(7, 5, shock), C.ink);
    } else if (blink > .5) {
      line(c, x - 9, y, x + 9, y, 5, C.ink);
    } else if (o.happy) {
      c.beginPath(); c.arc(x, y + 4, 10, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 5; c.strokeStyle = C.ink; c.lineCap = 'round'; c.stroke();
    } else {
      circ(c, x + (o.lx || 0) * 3, y + (o.ly || 0) * 3, 8, C.ink); circ(c, x + (o.lx || 0) * 3 + 2.5, y + (o.ly || 0) * 3 - 3, 2.5, '#fff');
    }
  }
  function mouth(c, kind, open, x = 0, y = 38) {
    c.lineCap = 'round'; c.lineJoin = 'round';
    if (kind === 'smile') { c.beginPath(); c.arc(x, y - 8, 20, .15 * Math.PI, .85 * Math.PI); c.lineWidth = 5; c.strokeStyle = C.ink; c.stroke(); }
    else if (kind === 'grin') { c.beginPath(); c.moveTo(x - 24, y - 4); c.quadraticCurveTo(x, y + 30, x + 24, y - 4); c.closePath(); c.fillStyle = C.ink; c.fill(); ell(c, x, y + 10, 12, 6, C.pink); }
    else if (kind === 'o') { ell(c, x, y + 4, 10 + open * 8, 10 + open * 14, C.ink); ell(c, x, y + 10 + open * 8, 7 + open * 3, 5, C.pink); }
    else if (kind === 'shout') { ell(c, x, y + 6, 22 + open * 4, 14 + open * 16, C.ink); ell(c, x, y + 14 + open * 12, 14, 7, C.pink); }
    else if (kind === 'worry') { c.beginPath(); c.arc(x, y + 22, 16, 1.15 * Math.PI, 1.85 * Math.PI); c.lineWidth = 5; c.strokeStyle = C.ink; c.stroke(); }
    else if (kind === 'wavy') { c.beginPath(); c.moveTo(x - 20, y + 4); c.quadraticCurveTo(x - 10, y - 4, x, y + 4); c.quadraticCurveTo(x + 10, y + 12, x + 20, y + 4); c.lineWidth = 5; c.strokeStyle = C.ink; c.stroke(); }
    else { line(c, x - 14, y + 2, x + 14, y + 2, 5, C.ink); }
  }
  // o: {x,y,s,flip,who,t, lean, tilt, face:{brow,mouth,open,shock,blink,happy,lx,ly,sweat}, hl:[x,y], hr:[x,y], itemL, itemR, idle}
  function person(c, o) {
    const W = WHO[o.who || 'cang'], t = o.t || 0, s = o.s || 1, f = o.face || {};
    const idle = o.idle === undefined ? 1 : o.idle;
    c.save(); c.translate(o.x, o.y); c.scale(s * (o.flip ? -1 : 1), s);
    const breathe = Math.sin(t * 2.4 + (o.phase || 0)) * 3 * idle;
    c.translate(0, breathe); c.rotate(o.lean || 0);
    const sh = [{ x: -92, y: -180 }, { x: 92, y: -180 }];
    const hands = [o.hl || [-125, -40], o.hr || [125, -40]];
    const arms = hands.map((h, i) => ik(sh[i].x, sh[i].y, h[0], h[1], 108, 104, i === 0 ? -1 : 1));
    // 後側手臂（先畫在身體後面的那條：有拿東西的手在前）
    const drawArm = (i, a) => {
      line(c, sh[i].x, sh[i].y, a.ex, a.ey, 50, W.shirt2); line(c, a.ex, a.ey, a.hx, a.hy, 42, W.shirt);
      circ(c, a.ex, a.ey, 21, W.shirt2); circ(c, a.hx, a.hy, 25, C.skin);
    };
    // 軀幹
    c.beginPath(); c.moveTo(-104, 0); c.lineTo(-108, -150); c.quadraticCurveTo(-110, -205, -60, -212); c.lineTo(60, -212); c.quadraticCurveTo(110, -205, 108, -150); c.lineTo(104, 0); c.closePath();
    c.fillStyle = W.shirt; c.fill();
    if (o.who === 'cang') {
      // 橘色背心＋口袋
      c.beginPath(); c.moveTo(-104, 0); c.lineTo(-108, -150); c.quadraticCurveTo(-110, -205, -64, -212); c.lineTo(-30, -212); c.lineTo(-22, -20); c.lineTo(-22, 0); c.closePath(); c.fillStyle = W.vest; c.fill();
      c.beginPath(); c.moveTo(104, 0); c.lineTo(108, -150); c.quadraticCurveTo(110, -205, 64, -212); c.lineTo(30, -212); c.lineTo(22, -20); c.lineTo(22, 0); c.closePath(); c.fillStyle = W.vest; c.fill();
      fillRR(c, -88, -72, 44, 38, 8, C.orange2); fillRR(c, 44, -72, 44, 38, 8, C.orange2);
      for (let k = 0; k < 3; k++) { c.fillStyle = 'rgba(255,255,255,.65)'; c.fillRect(-106 + k * 0, -128 - k * 0, 0, 0); }
      c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(-106, -118, 84, 12); c.fillRect(22, -118, 84, 12);
    }
    // 頸、領
    fillRR(c, -24, -232, 48, 40, 14, C.skin2);
    if (o.who === 'boss') {
      c.beginPath(); c.moveTo(-40, -214); c.lineTo(0, -166); c.lineTo(40, -214); c.lineTo(22, -222); c.lineTo(0, -196); c.lineTo(-22, -222); c.closePath(); c.fillStyle = '#fff'; c.fill();
      c.save(); c.translate(0, -180); c.rotate(.2 + Math.sin(t * 2) * .03 * idle);
      c.beginPath(); c.moveTo(-12, 0); c.lineTo(12, 0); c.lineTo(18, 70); c.lineTo(0, 92); c.lineTo(-18, 70); c.closePath(); c.fillStyle = W.tie; c.fill(); c.restore();
    } else if (o.who === 'cang') { fillRR(c, -34, -226, 68, 18, 8, '#fff'); }
    // 手臂：沒有 item 的手畫在身體前；有 item 的先畫手臂再畫 item
    drawArm(0, arms[0]); drawArm(1, arms[1]);
    if (o.itemL) { c.save(); c.translate(arms[0].hx, arms[0].hy); o.itemL(c); c.restore(); circ(c, arms[0].hx, arms[0].hy, 25, C.skin); }
    if (o.itemR) { c.save(); c.translate(arms[1].hx, arms[1].hy); o.itemR(c); c.restore(); circ(c, arms[1].hx, arms[1].hy, 25, C.skin); }
    // 頭
    c.save(); c.translate(0, -292); c.rotate(o.tilt || 0);
    const shock = f.shock || 0;
    ell(c, -76, 6, 14, 20, C.skin2); ell(c, 76, 6, 14, 20, C.skin2); // 耳
    ell(c, 0, 0, 76, 82, C.skin);
    // 頭髮
    c.fillStyle = W.hair;
    if (o.who === 'cang') {
      c.beginPath(); c.moveTo(-78, -4); c.quadraticCurveTo(-86, -88, -10, -92); c.quadraticCurveTo(60, -96, 78, -20); c.quadraticCurveTo(70, -52, 40, -58); c.quadraticCurveTo(0, -40, -50, -52); c.quadraticCurveTo(-70, -40, -78, -4); c.fill();
    } else if (o.who === 'boss') {
      c.beginPath(); c.moveTo(-80, -6); c.quadraticCurveTo(-92, -86, -6, -94); c.quadraticCurveTo(70, -96, 80, -8); c.quadraticCurveTo(66, -54, 30, -60); c.quadraticCurveTo(-10, -48, -48, -62); c.quadraticCurveTo(-72, -50, -80, -6); c.fill();
      // 呆毛（驚嚇時豎起）
      c.save(); c.translate(6, -90); c.rotate(-.2 + shock * .5 + Math.sin(t * 3) * .03); c.beginPath(); c.moveTo(-8, 0); c.quadraticCurveTo(0, -42 - shock * 18, 16, -52 - shock * 20); c.quadraticCurveTo(14, -24, 10, 0); c.closePath(); c.fill(); c.restore();
    } else {
      c.beginPath(); c.moveTo(-78, -4); c.quadraticCurveTo(-84, -90, 0, -92); c.quadraticCurveTo(84, -90, 78, -4); c.quadraticCurveTo(60, -50, 0, -50); c.quadraticCurveTo(-60, -50, -78, -4); c.fill();
    }
    // 眉毛
    const brow = f.brow || 0; // -1 皺眉(生氣/擔心)、0 平、+1 上揚(驚訝)
    const by = -34 - brow * 12;
    c.lineWidth = 8; c.strokeStyle = W.hair; c.lineCap = 'round';
    if (f.worry) { line(c, -46, by + 4, -14, by - 6, 8, W.hair); line(c, 46, by + 4, 14, by - 6, 8, W.hair); }
    else { line(c, -48, by + brow * 2, -14, by - brow * 5 + 2, 8, W.hair); line(c, 48, by + brow * 2, 14, by - brow * 5 + 2, 8, W.hair); }
    // 眼睛、眼鏡
    eye(c, -28, -4, { shock, blink: f.blink, happy: f.happy, lx: f.lx, ly: f.ly }); eye(c, 28, -4, { shock, blink: f.blink, happy: f.happy, lx: f.lx, ly: f.ly });
    if (W.glasses) {
      c.lineWidth = 6; c.strokeStyle = C.ink; c.beginPath(); c.arc(-28, -4, 24, 0, TAU); c.stroke(); c.beginPath(); c.arc(28, -4, 24, 0, TAU); c.stroke();
      line(c, -4, -4, 4, -4, 6, C.ink); line(c, -52, -6, -74, -12, 6, C.ink); line(c, 52, -6, 74, -12, 6, C.ink);
      c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.arc(-34, -10, 10, Math.PI, Math.PI * 1.6); c.fill();
    }
    ell(c, -48, 22, 14, 8, 'rgba(240,120,110,.35)'); ell(c, 48, 22, 14, 8, 'rgba(240,120,110,.35)');
    mouth(c, f.mouth || 'smile', f.open || 0, 0, 34);
    if (f.sweat) { for (let i = 0; i < 2; i++) { const p = ((t * 1.3 + i * .5) % 1); const sx = 66 + i * 14, sy = -50 + p * 70; c.save(); c.globalAlpha = (1 - p) * clamp(f.sweat); c.beginPath(); c.moveTo(sx, sy - 14); c.quadraticCurveTo(sx + 11, sy + 4, sx, sy + 10); c.quadraticCurveTo(sx - 11, sy + 4, sx, sy - 14); c.fillStyle = '#7CC6E8'; c.fill(); c.restore(); } }
    c.restore();
    c.restore();
  }

  /* ---------- 手持物 ---------- */
  const items = {
    cup: (o = {}) => c => { // 咖啡杯：o.tilt、o.steam、o.t
      c.save(); c.rotate(o.tilt || 0); c.translate(-26, -66);
      fillRR(c, 0, 0, 52, 62, 10, '#fff'); fillRR(c, 0, 0, 52, 16, 8, o.coffee === false ? '#eee' : '#6B4A3A');
      c.lineWidth = 9; c.strokeStyle = '#fff'; c.beginPath(); c.arc(56, 32, 14, -1.3, 1.3); c.stroke();
      if (o.steam) for (let i = 0; i < 3; i++) { const p = ((o.t || 0) * .8 + i * .33) % 1; c.save(); c.globalAlpha = (1 - p) * .7; c.strokeStyle = '#fff'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(12 + i * 14, -6); c.quadraticCurveTo(4 + i * 14 + Math.sin(p * 6 + i) * 8, -26 - p * 18, 12 + i * 14, -44 - p * 20); c.stroke(); c.restore(); }
      c.restore();
    },
    phone: (o = {}) => c => { c.save(); c.rotate(o.rot ?? -.9); c.translate(-14, -50); fillRR(c, 0, 0, 28, 74, 8, '#2B3550'); fillRR(c, 4, 8, 20, 50, 4, '#9FD6FF'); c.restore(); },
    pointer: (o = {}) => c => { c.save(); c.rotate(o.rot ?? -.6); line(c, 0, 0, 0, -(o.len || 200), 10, '#8B5E3C'); circ(c, 0, -(o.len || 200), 9, C.red); c.restore(); },
    clip: () => c => { c.save(); c.rotate(-.2); fillRR(c, -42, -88, 84, 112, 8, '#B58D5C'); fillRR(c, -34, -76, 68, 94, 4, '#fff'); fillRR(c, -14, -96, 28, 14, 4, C.grey2); for (let i = 0; i < 4; i++) line(c, -22, -58 + i * 20, 22, -58 + i * 20, 4, C.grey); c.restore(); },
    bottle: (o = {}) => c => { c.save(); c.rotate(o.rot ?? -.2); fillRR(c, -20, -78, 40, 78, 10, '#4A2F22'); fillRR(c, -10, -100, 20, 28, 5, '#4A2F22'); fillRR(c, -14, -50, 28, 30, 4, '#F3E3C3'); text(c, '醬油', 0, -35, { size: 17, color: '#4A2F22' }); c.restore(); },
    stamp: (o = {}) => c => { c.save(); c.rotate(o.rot ?? 0); fillRR(c, -26, -50, 52, 24, 6, C.red); fillRR(c, -14, -86, 28, 44, 8, '#8B5E3C'); c.restore(); },
    watch: () => c => { c.save(); fillRR(c, -20, 8, 40, 14, 4, '#444'); circ(c, 0, 14, 20, '#fff'); c.lineWidth = 4; c.strokeStyle = C.ink; c.stroke(); line(c, 0, 14, 0, 2, 3, C.ink); line(c, 0, 14, 9, 14, 3, C.ink); c.restore(); },
    briefcase: () => c => { fillRR(c, -50, -10, 100, 70, 10, '#6A4B34'); fillRR(c, -16, -22, 32, 16, 6, '#6A4B34'); fillRR(c, -6, 8, 12, 14, 3, C.yellow); },
  };

  /* ---------- 其他角色與道具 ---------- */
  // 倉庫角色：o={x,y,s,name,color,w,h,t,mood:'chill'|'proud'|'tired'|'busy', boxesHeld, look}
  function warehouseChar(c, o) {
    const s = o.s || 1, t = o.t || 0, w = o.w || 230, h = o.h || 270;
    c.save(); c.translate(o.x, o.y); c.scale(s, s);
    shadow(c, 0, 4, w * .62);
    const bob = Math.sin(t * 2.2 + (o.phase || 0)) * 4 * (o.idle === undefined ? 1 : o.idle);
    c.translate(0, bob);
    // 腳
    fillRR(c, -w * .28, -14, w * .2, 22, 8, C.ink2); fillRR(c, w * .08, -14, w * .2, 22, 8, C.ink2);
    // 身體
    fillRR(c, -w / 2, -h, w, h - 8, 26, o.color || C.orange);
    fillRR(c, -w / 2, -h, w, 26, 20, 'rgba(0,0,0,.10)');
    // 屋頂（帽子）
    c.beginPath(); c.moveTo(-w / 2 - 14, -h + 8); c.lineTo(0, -h - 62); c.lineTo(w / 2 + 14, -h + 8); c.closePath(); c.fillStyle = o.roof || C.orange2; c.fill();
    // 捲簾門（肚子）
    fillRR(c, -w * .32, -h * .5, w * .64, h * .44, 10, '#E9E2D2');
    for (let i = 0; i < 5; i++) line(c, -w * .3, -h * .5 + 10 + i * (h * .08), w * .3, -h * .5 + 10 + i * (h * .08), 4, '#CFC6B1');
    // 名牌
    fillRR(c, -w * .26, -h * .62, w * .52, 32, 8, '#fff'); text(c, o.name || '', 0, -h * .62 + 17, { size: 22, color: C.ink });
    // 眼睛
    const ey = -h * .8, lx = (o.look || 0);
    for (const sx of [-1, 1]) { circ(c, sx * w * .2, ey, 24, '#fff'); circ(c, sx * w * .2 + lx * 7, ey + 2, 11, C.ink); circ(c, sx * w * .2 + lx * 7 + 4, ey - 3, 4, '#fff'); }
    if (o.mood === 'tired') { for (const sx of [-1, 1]) { fillRR(c, sx * w * .2 - 26, ey - 28, 52, 26, 10, o.color || C.orange); } }
    // 嘴
    c.lineWidth = 5; c.strokeStyle = C.ink; c.lineCap = 'round';
    c.beginPath();
    if (o.mood === 'tired') { c.arc(0, ey + 56, 16, 1.2 * Math.PI, 1.8 * Math.PI); }
    else if (o.mood === 'busy') { c.moveTo(-14, ey + 44); c.lineTo(14, ey + 44); }
    else { c.arc(0, ey + 34, 20, .15 * Math.PI, .85 * Math.PI); }
    c.stroke();
    ell(c, -w * .33, ey + 34, 11, 7, 'rgba(240,100,100,.3)'); ell(c, w * .33, ey + 34, 11, 7, 'rgba(240,100,100,.3)');
    // 手
    const arm = (sx, up) => { const ax = sx * (w / 2), ay = -h * .45; line(c, ax, ay, ax + sx * 40, ay + (up ? -40 : 30), 26, o.color || C.orange); circ(c, ax + sx * 40, ay + (up ? -40 : 30), 17, C.skin); };
    arm(-1, o.armUp === -1); arm(1, o.armUp === 1);
    c.restore();
  }
  // 明川空氣清淨機零六型：老住戶
  function purifier(c, o) {
    const s = o.s || 1, t = o.t || 0;
    c.save(); c.translate(o.x, o.y); c.scale(s * (o.flip ? -1 : 1), s);
    shadow(c, 0, 4, 100);
    const bob = Math.sin(t * 1.8) * 3; c.translate(0, bob);
    fillRR(c, -80, -290, 160, 280, 30, '#F2F4F7'); fillRR(c, -80, -290, 160, 36, 24, '#DDE2E9');
    // 風扇格柵（會轉）
    circ(c, 0, -104, 58, '#DDE2E9'); circ(c, 0, -104, 50, '#B9C2CE');
    c.save(); c.translate(0, -104); c.rotate(t * 3); for (let k = 0; k < 3; k++) { c.rotate(TAU / 3); ell(c, 0, -26, 13, 28, '#F2F4F7'); } c.restore(); circ(c, 0, -104, 9, '#8E98A8');
    for (let i = 0; i < 3; i++) fillRR(c, -46, -40 + i * 12, 92, 6, 3, '#CBD2DC');
    fillRR(c, -26, -274, 52, 14, 7, C.teal); circ(c, 0, -267, 3, '#fff');
    // 臉
    for (const sx of [-1, 1]) { circ(c, sx * 28, -230, 16, '#fff'); circ(c, sx * 28, -228, 8, C.ink); }
    // 眼鏡
    c.lineWidth = 4; c.strokeStyle = '#8B5E3C'; for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * 28, -230, 20, 0, TAU); c.stroke(); } line(c, -8, -230, 8, -230, 4, '#8B5E3C');
    // 小鬍子
    c.fillStyle = '#6B5B50'; c.beginPath(); c.moveTo(0, -200); c.quadraticCurveTo(-34, -214, -52, -196); c.quadraticCurveTo(-30, -190, 0, -194); c.quadraticCurveTo(30, -190, 52, -196); c.quadraticCurveTo(34, -214, 0, -200); c.fill();
    c.lineWidth = 4; c.strokeStyle = C.ink; c.beginPath(); c.arc(0, -184, 10, .1 * Math.PI, .9 * Math.PI); c.stroke();
    // 拐杖
    c.lineWidth = 9; c.strokeStyle = '#8B5E3C'; c.lineCap = 'round'; c.beginPath(); c.moveTo(104, -110); c.lineTo(104, -4); c.stroke(); c.beginPath(); c.arc(116, -112, 14, Math.PI, Math.PI * 2.1); c.stroke();
    line(c, 80, -140, 104, -112, 22, '#E4E8EE'); circ(c, 104, -112, 14, C.skin);
    if (o.card) { c.save(); c.translate(-92, -120 - (o.cardUp || 0)); c.rotate(-.12); fillRR(c, -50, -34, 100, 64, 8, '#fff'); fillRR(c, -50, -34, 100, 18, 8, C.teal); text(c, '入住證', 0, -25, { size: 14, color: '#fff' }); text(c, '#06', 0, 8, { size: 30, color: C.ink }); c.restore(); line(c, -80, -140, -96, -112, 22, '#E4E8EE'); circ(c, -96, -112, 14, C.skin); }
    c.restore();
  }
  function desk(c, x, y, w, h = 36) { fillRR(c, x, y, w, h, 10, '#B97F4B'); fillRR(c, x + 24, y + h - 4, w - 48, 150, 6, '#A06C3E'); fillRR(c, x, y, w, 12, 8, '#CF9460'); }
  function laptop(c, x, y, s = 1, screen) {
    c.save(); c.translate(x, y); c.scale(s, s);
    fillRR(c, -140, -200, 280, 190, 14, '#2A3350'); fillRR(c, -128, -188, 256, 166, 8, '#F4F8FC');
    if (screen) { c.save(); c.beginPath(); c.rect(-128, -188, 256, 166); c.clip(); c.translate(-128, -188); screen(c); c.restore(); }
    fillRR(c, -170, -12, 340, 18, 8, '#3A4565'); c.restore();
  }
  function clock(c, x, y, r, h, m) {
    circ(c, x, y, r + 10, '#8B5E3C'); circ(c, x, y, r, '#fff');
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU - Math.PI / 2; line(c, x + Math.cos(a) * r * .82, y + Math.sin(a) * r * .82, x + Math.cos(a) * r * .94, y + Math.sin(a) * r * .94, 4, C.ink2); }
    const ah = (h % 12 + m / 60) / 12 * TAU - Math.PI / 2, am = m / 60 * TAU - Math.PI / 2;
    line(c, x, y, x + Math.cos(ah) * r * .5, y + Math.sin(ah) * r * .5, 8, C.ink); line(c, x, y, x + Math.cos(am) * r * .75, y + Math.sin(am) * r * .75, 5, C.ink); circ(c, x, y, 7, C.red);
  }
  function bubble(c, x, y, w, h, tailX, tailY, fill = '#fff', stroke = C.ink) {
    c.save(); rr(c, x - w / 2, y - h / 2, w, h, 26); c.fillStyle = fill; c.fill(); c.lineWidth = 5; c.strokeStyle = stroke; c.stroke();
    c.beginPath(); c.moveTo(x - 18, y + h / 2 - 2); c.lineTo(tailX, tailY); c.lineTo(x + 18, y + h / 2 - 2); c.closePath(); c.fillStyle = fill; c.fill();
    c.beginPath(); c.moveTo(x - 18, y + h / 2); c.lineTo(tailX, tailY); c.lineTo(x + 18, y + h / 2); c.lineWidth = 5; c.strokeStyle = stroke; c.stroke();
    fillRR(c, x - 16, y + h / 2 - 8, 32, 12, 2, fill); c.restore();
  }
  function bang(c, x, y, s, col = C.red) { // 驚嘆號
    c.save(); c.translate(x, y); c.scale(s, s); fillRR(c, -14, -70, 28, 70, 14, col); circ(c, 0, 24, 15, col); c.restore();
  }
  function check(c, x, y, s, col = C.green) { c.save(); c.translate(x, y); c.scale(s, s); c.lineWidth = 16; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.beginPath(); c.moveTo(-28, 0); c.lineTo(-8, 22); c.lineTo(30, -24); c.stroke(); c.restore(); }
  function star(c, x, y, r, rot, col, n = 8) { c.save(); c.translate(x, y); c.rotate(rot); c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU, rr_ = i % 2 ? r * .5 : r; c.lineTo(Math.cos(a) * rr_, Math.sin(a) * rr_); } c.closePath(); c.fillStyle = col; c.fill(); c.restore(); }
  function card(c, x, y, w, h, o = {}) { // 數字卡片（MG）
    c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); if (o.s) c.scale(o.s, o.s);
    fillRR(c, -w / 2 + 6, -h / 2 + 10, w, h, 20, 'rgba(34,52,79,.14)');
    fillRR(c, -w / 2, -h / 2, w, h, 20, o.fill || '#fff'); fillRR(c, -w / 2, -h / 2, 14, h, 8, o.accent || C.orange);
    if (o.label) text(c, o.label, 14, -h / 2 + 34, { size: o.ls || 26, color: o.lcolor || C.ink2, weight: 700 });
    if (o.value) text(c, o.value, 14, h / 2 - (o.vy || 50), { size: o.vs || 62, color: o.vcolor || C.ink });
    if (o.sub) text(c, o.sub, 14, h / 2 - 22, { size: 22, color: C.ink2, weight: 700 });
    c.restore();
  }
  function chip(c, x, y, label, q, k, s = 1) { // 左上「第 N 問」標籤
    c.save(); c.translate(x, y); c.scale(s, s);
    const w = 150 + q.length * 54; fillRR(c, 6, 10, w, 104, 52, 'rgba(34,52,79,.14)'); fillRR(c, 0, 0, w, 104, 52, '#fff');
    circ(c, 52, 52, 40, C.orange); text(c, String(k), 52, 54, { size: 50, color: '#fff' });
    text(c, label, 120 + 8, 34, { size: 24, color: C.ink2, weight: 700, align: 'left' }); text(c, q, 120 + 8, 70, { size: 46, color: C.ink, align: 'left' });
    c.restore();
  }
  function donut(c, x, y, r, parts, prog, t = 0) { // parts:[{v,color}]
    const tot = parts.reduce((a, p) => a + p.v, 0); let a0 = -Math.PI / 2; const end = a0 + TAU * prog;
    parts.forEach(p => { const a1 = a0 + (p.v / tot) * TAU; const e1 = Math.min(a1, end); if (e1 > a0) { c.beginPath(); c.arc(x, y, r, a0, e1); c.lineWidth = r * .42; c.strokeStyle = p.color; c.lineCap = 'butt'; c.stroke(); } a0 = a1; });
  }
  function sparkle(c, x, y, s, t) { const k = 1 + Math.sin(t * 6) * .15; star(c, x, y, 16 * s * k, t, '#FFE08A', 4); }
  window.L = { TAU, clamp, lerp, hash, E, tw, pop, C, FONT, rr, fillRR, circ, ell, line, text, shadow, withAlpha, scaleAt, room, windowFrame, shelf, box, person, items, warehouseChar, purifier, desk, laptop, clock, bubble, bang, check, star, card, chip, donut, sparkle, ik };
})();
