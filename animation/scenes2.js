/* 場景 3–6：錢壓在哪／轉得快不快／哪些貨有風險／要不要補貨 */
(() => {
  const { clamp, lerp, hash, E, tw, pop, C, rr, fillRR, circ, ell, line, text, shadow, withAlpha, scaleAt, room, windowFrame, shelf, box, person, items, warehouseChar, purifier, desk, chip, bang, check, star, card, sparkle, donut, TAU } = L;
  const SCN = window.SC;
  const blinkOf = (t, ph = 0) => ((t + ph) % 3.4) < .12 ? 1 : 0;
  const bgRoom = (c, X, o = {}) => { room(c, X.W, X.H, { floorY: o.floorY || 820, wall: o.wall || '#FCEBD0' }); if (o.win !== false) windowFrame(c, o.wx || 1460, o.wy || 140, 250, 210, X.t, 1); };
  const titleChip = (c, X, label, q, k) => chip(c, 70, 56, label, q, k, pop(X.t, .15, .4));
  // 小箱子角色（有臉）
  function boxFace(c, x, y, s, t, o = {}) {
    c.save(); c.translate(x, y); c.scale(s, s); box(c, -50, -90, 100, 90, { color: o.color, color2: o.color2 });
    circ(c, -18, -48, 7, C.ink); circ(c, 18, -48, 7, C.ink);
    c.lineWidth = 4; c.strokeStyle = C.ink; c.lineCap = 'round'; c.beginPath(); if (o.sad) c.arc(0, -22, 10, 1.2 * Math.PI, 1.8 * Math.PI); else c.arc(0, -38, 11, .15 * Math.PI, .85 * Math.PI); c.stroke(); c.restore();
  }

  /* ---------- 場景 3：第一問 錢壓在哪 ---------- */
  SCN['s03-money'] = (c, X) => {
    const { t, W, H, at, end, mid } = X;
    bgRoom(c, X); titleChip(c, X, '第一問', '錢壓在哪？', 1);
    // 圓環
    const cx = 480, cy = 560, r = 150;
    const tTot = at('五十八點九萬裡'), tUse = at('可用四十八點三萬'), tBad = at('殘次十點六萬');
    const ring = pop(t, tTot - .1, .4);
    if (ring > 0) scaleAt(c, cx, cy, ring, () => {
      circ(c, 0, 0, r + 42, '#fff'); circ(c, 0, 0, r - 42, C.cream);
      c.beginPath(); c.arc(0, 0, r, 0, TAU); c.lineWidth = r * .42; c.strokeStyle = '#E8DCC6'; c.stroke();
    });
    const pUse = tw(t, tUse - .1, tUse + .9, E.io), pBad = tw(t, tBad - .1, tBad + .6, E.io), tot = 48.3 + 10.6;
    if (pUse > 0) { c.save(); c.translate(cx, cy); c.beginPath(); c.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + TAU * (48.3 / tot) * pUse); c.lineWidth = r * .42; c.strokeStyle = C.teal; c.stroke(); c.restore(); }
    if (pBad > 0) { c.save(); c.translate(cx, cy); const a0 = -Math.PI / 2 + TAU * (48.3 / tot); c.beginPath(); c.arc(0, 0, r, a0, a0 + TAU * (10.6 / tot) * pBad); c.lineWidth = r * .42; c.strokeStyle = C.orange; c.stroke(); c.restore(); }
    withAlpha(c, ring, () => { text(c, '58.9萬', cx, cy - 8, { size: 62, color: C.ink }); text(c, '在庫金額', cx, cy + 44, { size: 28, color: C.ink2, weight: 700 }); });
    const lab = (k, x, y, col, a, b) => scaleAt(c, x, y, k, () => { fillRR(c, -118, -36, 236, 72, 36, col); text(c, a, -36, 0, { size: 32, color: '#fff' }); text(c, b, 62, 0, { size: 38, color: '#fff' }); });
    lab(pop(t, tUse + .4, .35), 740, 400, C.teal2, '可用', '48.3'); lab(pop(t, tBad + .2, .35), 230, 760 - 60, C.orange2, '殘次', '10.6');
    // 三兄弟
    const tEast = at('華東倉最會囤'), tHome = at('像家裡什麼都捨不得丟');
    const ent = (i) => E.out(clamp((t - .3 - i * .15) / .6));
    const gy = 835;
    warehouseChar(c, { x: 1130, y: gy + (1 - ent(0)) * 400, s: 1.12, name: '華東倉', color: '#F2A25E', roof: C.orange2, t, phase: 0, w: 290, h: 300, mood: t > tHome ? 'chill' : 'chill', look: -.3 });
    warehouseChar(c, { x: 1490, y: gy + (1 - ent(1)) * 400, s: 1.0, name: '華南倉', color: '#6FC3B0', roof: C.teal2, t, phase: 1.1, w: 240, h: 270 });
    warehouseChar(c, { x: 1750, y: gy + (1 - ent(2)) * 400, s: .88, name: '華北倉', color: '#7FA3D8', roof: C.blue2, t, phase: 2.2, w: 190, h: 250 });
    // 華東倉：堆滿箱子
    if (t > tEast - .1) {
      for (let i = 0; i < 9; i++) {
        const k = pop(t, tEast + i * .13, .35); if (k <= 0) continue;
        const col = i % 3, row = Math.floor(i / 3), bxx = 940 + col * 100 + (row % 2) * 24, byy = gy - 4 - row * 70 - (i === 8 ? 0 : 0);
        scaleAt(c, bxx, byy, k, () => box(c, -46, -66, 92, 66, { rot: (hash(i + 4) - .5) * .18 }));
      }
      const tag = pop(t, tEast + .3, .4); scaleAt(c, 1130, 330, tag, () => { fillRR(c, -86, -30, 172, 60, 30, C.yellow); text(c, '24.5萬 最多', 0, 2, { size: 30, color: C.ink }); });
    }
    // 捨不得丟的思考泡泡
    const tb = pop(t, tHome + .1, .4);
    if (tb > 0) scaleAt(c, 960, 250, tb, () => {
      circ(c, 80, 118, 8, '#fff'); circ(c, 60, 140, 12, '#fff'); ell(c, 0, 0, 200, 76, '#fff'); c.lineWidth = 4; c.strokeStyle = C.ink2; c.beginPath(); c.ellipse(0, 0, 200, 76, 0, 0, TAU); c.stroke();
      // 舊檯燈、玩偶、舊箱子
      fillRR(c, -150, -10, 44, 12, 4, '#B58D5C'); line(c, -128, -10, -128, -50, 6, C.ink2); c.beginPath(); c.moveTo(-148, -50); c.lineTo(-108, -50); c.lineTo(-118, -72); c.lineTo(-138, -72); c.closePath(); c.fillStyle = C.yellow; c.fill();
      circ(c, -30, -22, 24, '#C58B50'); circ(c, -44, -52, 10, '#C58B50'); circ(c, -16, -52, 10, '#C58B50'); circ(c, -38, -26, 3, C.ink); circ(c, -22, -26, 3, C.ink);
      box(c, 60, -42, 62, 50, { rot: -.1 }); text(c, '捨不得', 150, 0, { size: 28, color: C.ink2, weight: 700 });
    });
  };

  /* ---------- 場景 4：第二問 轉得快不快 ---------- */
  SCN['s04-turnover'] = (c, X) => {
    const { t, W, H, at, end } = X;
    bgRoom(c, X, { wx: 1560, wy: 120 }); titleChip(c, X, '第二問', '轉得快不快？', 2);
    // 輸送帶（橢圓軌道）
    const cx = 470, cy = 560, rx = 320, ry = 150, tT = at('平均二十二點八天'), tE = end('平均二十二點八天');
    c.save(); c.beginPath(); c.ellipse(cx, cy, rx + 36, ry + 36, 0, 0, TAU); c.fillStyle = '#6F7A8E'; c.fill(); c.beginPath(); c.ellipse(cx, cy, rx - 36, ry - 36, 0, 0, TAU); c.fillStyle = '#FCEBD0'; c.fill();
    c.setLineDash([22, 18]); c.lineDashOffset = -t * 60; c.lineWidth = 6; c.strokeStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, TAU); c.stroke(); c.restore();
    const pr = pop(t, .25, .4);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU + t * .75 - Math.PI / 2, bx = cx + Math.cos(a) * rx, by = cy + Math.sin(a) * ry; const k = pop(t, .4 + i * .05, .3);
      scaleAt(c, bx, by + 38, k * pr, () => box(c, -34, -56, 68, 56, { rot: Math.sin(a * 2) * .08 }));
    }
    // 計時圈
    const ck = pop(t, tT - .1, .4), prog = tw(t, tT, tE, E.io);
    scaleAt(c, cx, cy, ck, () => { circ(c, 0, 0, 108, '#fff'); c.beginPath(); c.arc(0, 0, 90, 0, TAU); c.lineWidth = 16; c.strokeStyle = '#EFE3CC'; c.stroke(); c.beginPath(); c.arc(0, 0, 90, -Math.PI / 2, -Math.PI / 2 + TAU * prog); c.strokeStyle = C.orange; c.stroke(); text(c, '22.8', 0, -10, { size: 62 }); text(c, '天 賣完一輪', 0, 40, { size: 24, color: C.ink2, weight: 700 }); });
    // 散點圖
    const gx = 1230, gy = 520, gw = 580, gh = 400, kk = pop(t, at('右上角') - .5, .45) || pop(t, 1.4, .4);
    const chartK = pop(t, .9, .45);
    scaleAt(c, gx, gy, chartK, () => {
      fillRR(c, -gw / 2 + 8, -gh / 2 + 12, gw, gh, 24, 'rgba(34,52,79,.14)'); fillRR(c, -gw / 2, -gh / 2, gw, gh, 24, '#fff');
      line(c, -gw / 2 + 60, gh / 2 - 56, gw / 2 - 30, gh / 2 - 56, 5, C.ink2); line(c, -gw / 2 + 60, gh / 2 - 56, -gw / 2 + 60, -gh / 2 + 30, 5, C.ink2);
      text(c, '週轉天數 →', 40, gh / 2 - 26, { size: 24, color: C.ink2, weight: 700 }); c.save(); c.translate(-gw / 2 + 24, -20); c.rotate(-Math.PI / 2); text(c, '在庫金額 →', 0, 0, { size: 24, color: C.ink2, weight: 700 }); c.restore();
      for (let i = 0; i < 46; i++) { const px = -gw / 2 + 90 + Math.pow(hash(i + 1), 1.6) * 190, py = gh / 2 - 80 - Math.pow(hash(i + 70), 1.5) * 230; circ(c, px, py, 7 + hash(i + 3) * 8, 'rgba(91,125,177,.55)'); }
      for (let i = 0; i < 4; i++) circ(c, 150 + i * 28 + (i % 2) * 20, gh / 2 - 80 - i * 6, 6, 'rgba(91,125,177,.7)');
      // 右上角「躺平區」
      const tz = at('右上角'), zk = pop(t, tz, .4), pulse = (Math.sin(t * 5) + 1) / 2;
      if (zk > 0) { c.save(); c.translate(150, -gh / 2 + 110); c.scale(zk, zk); c.setLineDash([14, 10]); c.lineWidth = 5; c.strokeStyle = t > at('是空的') ? C.teal : C.red; c.strokeRect(-110, -78, 220, 156); c.setLineDash([]);
        c.fillStyle = t > at('是空的') ? 'rgba(70,178,157,.14)' : `rgba(228,87,46,${.08 + pulse * .1})`; c.fillRect(-110, -78, 220, 156);
        // 沙發
        fillRR(c, -68, -10, 136, 52, 14, '#B7657B'); fillRR(c, -80, -30, 30, 66, 12, '#A2556B'); fillRR(c, 50, -30, 30, 66, 12, '#A2556B'); fillRR(c, -62, -34, 124, 34, 12, '#C97A91');
        if (t > at('是空的')) { circ(c, 0, -10, 15, '#F6C453'); } else { ell(c, 0, -16, 22, 14, '#F6C453'); }
        text(c, '躺平區', 0, -58, { size: 28, color: C.ink }); c.restore(); }
    });
    // 阿倉＋望遠鏡
    const look = tw(t, at('又慢又佔錢') - .3, at('又慢又佔錢') + .4, E.out), awake = t > at('是空的');
    const s = 1.1, ax = 1640, ay = 1095;
    person(c, { x: ax, y: ay, s, who: 'cang', t, phase: 3, face: { mouth: awake ? 'grin' : 'smile', blink: blinkOf(t, 1), brow: .3, lx: -1, ly: -.4 }, hl: [lerp(-125, -78, look), lerp(-40, -290, look)], hr: [lerp(125, 78, look), lerp(-40, -290, look)] });
    if (look > .05) { // 望遠鏡蓋在臉上
      c.save(); c.translate(ax, ay - 296 * s); c.scale(s, s); c.globalAlpha = look;
      for (const sx of [-1, 1]) { fillRR(c, sx * 28 - 24, -26, 48, 56, 12, '#3E5373'); circ(c, sx * 28, 2, 18, '#9FD6FF'); circ(c, sx * 28 - 5, -3, 5, '#fff'); }
      fillRR(c, -8, -10, 16, 24, 4, '#2A3350'); c.restore();
    }
  };

  /* ---------- 場景 5：第三問 哪些貨有風險 ---------- */
  SCN['s05-risk'] = (c, X) => {
    const { t, W, H, at, end } = X;
    bgRoom(c, X, { wx: 1560, wy: 130 }); titleChip(c, X, '第三問', '哪些貨有風險？', 3);
    const tPhaseB = at('一箱貨再多種罪名') - .2, pb = tw(t, tPhaseB, tPhaseB + .7, E.io);
    const gy = 870;
    // 報到處招牌（階段 B 淡出）
    withAlpha(c, 1 - pb, () => { fillRR(c, 740, 210, 640, 84, 20, C.ink); text(c, '風險報到處', 1060, 253, { size: 52, color: '#fff' }); line(c, 800, 294, 800, 340, 8, C.ink); line(c, 1320, 294, 1320, 340, 8, C.ink); });
    // 隊伍：第一位是明川空氣清淨機（老住戶）
    const tOld = at('是明川空氣清淨機零六型'), enter = tw(t, .1, .9, E.out), advance = tw(t, tOld - .3, tOld + .5, E.out);
    purifier(c, { x: lerp(-260, 330 + advance * 70, enter), y: gy, s: 1.5, t, card: t > at('最資深的住戶'), cardUp: Math.sin(t * 4) * 4 });
    // 排隊的箱子（有臉）
    for (let i = 0; i < 5; i++) { const k = pop(t, .5 + i * .12, .3) * (1 - pb); if (k > 0) boxFace(c, 700 + i * 190 + Math.sin(t * 2 + i) * 2, gy, 1.5 * k, t, { sad: i === 2 }); }
    // 金額號碼牌（三組）
    const cardAt = (cue, x, label, val, col) => { const k = pop(t, at(cue), .38) * (1 - pb); if (k > 0) scaleAt(c, x, 520, k, () => card(c, 0, 0, 330, 190, { label, value: val, accent: col, vs: 76, vy: 56, ls: 30 })); };
    cardAt('超過一百八十天', 840, '超過 180 天', '8.2萬', C.orange); cardAt('已退市的', 1200, '已退市', '1.5萬', C.red); cardAt('快到期的只有', 1560, '快到期／已過期', '幾百元', C.teal);
    // 「最資深」光圈
    const tS = at('最資深的住戶'); if (t > tS && t < tS + 2.8) { const k = tw(t, tS, tS + .4) * (1 - tw(t, tS + 2.3, tS + 2.8)); withAlpha(c, k, () => star(c, 330, 560, 190 + Math.sin(t * 6) * 8, t * .6, 'rgba(246,196,83,.40)', 12)); }
    // 階段 B：一箱貨被貼三張標籤 → 疊成一張 → 阿倉蓋章「只算一次」
    if (pb > 0) {
      scaleAt(c, 960, 850, 2.4 * pb, () => { box(c, -60, -120, 120, 120); circ(c, -20, -70, 8, C.ink); circ(c, 20, -70, 8, C.ink); c.lineWidth = 5; c.strokeStyle = C.ink; c.beginPath(); c.arc(0, -52, 14, .15 * Math.PI, .85 * Math.PI); c.stroke(); });
      const tStamp = at('也只算一次'), merge = tw(t, tStamp - .7, tStamp - .1, E.io);
      const tags = [['太老了', C.orange2], ['已退市', C.red2], ['快過期', C.teal2]];
      withAlpha(c, 1 - merge * .0, () => tags.forEach((g, i) => {
        const k = pop(t, tPhaseB + .5 + i * .5, .35); if (k <= 0) return;
        const px = lerp(960 - 260 + i * 260, 960, merge), py = lerp(330 + (i % 2) * 50, 470, merge), rot = lerp((i - 1) * .14, 0, merge);
        scaleAt(c, px, py, k, () => { c.rotate(rot); c.globalAlpha *= 1 - merge; fillRR(c, -110, -38, 220, 76, 16, g[1]); text(c, g[0], 0, 2, { size: 46, color: '#fff' }); });
      }));
      // 蓋章
      const stampDown = tw(t, tStamp, tStamp + .16, E.in), after = t - tStamp - .16, thump = after > 0 ? Math.exp(-after * 9) * Math.sin(after * 40) * 7 : 0, shown = pop(t, tStamp + .14, .28);
      if (shown > 0) scaleAt(c, 960 + thump, 470, shown, () => { c.rotate(-.12); c.lineWidth = 9; c.strokeStyle = C.red; rr(c, -190, -66, 380, 132, 16); c.stroke(); text(c, '只算一次', 0, 2, { size: 82, color: C.red, stroke: 'rgba(255,255,255,.85)', strokeW: 8 }); });
      // 阿倉從右側進場
      const armUp = tw(t, tPhaseB + 1, tPhaseB + 1.7, E.out), px = lerp(2300, 1640, pb), dn = (t > tStamp ? 1 : 0);
      person(c, { x: px, y: 1100, s: 1.2, who: 'cang', t, phase: 1, face: { mouth: t > tStamp ? 'grin' : 'smile', blink: blinkOf(t, 1), brow: .2, lx: -1 },
        hl: [lerp(-125, -220, armUp), lerp(-40, -330, armUp) + dn * 110 * Math.min(1, (t - tStamp) / .15 + 0) * (t > tStamp + .4 ? 0 : 1)], hr: [125, -40], itemL: items.stamp({ rot: 0 }) });
    }
  };

  /* ---------- 場景 6：第四問 要不要補貨 ---------- */
  SCN['s06-replenish'] = (c, X) => {
    const { t, W, H, at, end } = X;
    bgRoom(c, X, { win: false }); titleChip(c, X, '第四問', '要不要補貨？', 4);
    // 櫃檯與客人（批發客戶在最前面）
    const tImp = at('批發客戶最沒耐心'), steam = tw(t, tImp, tImp + .6) * (1 - tw(t, tImp + 2.2, tImp + 2.8));
    person(c, { x: 760, y: 760, s: .78, who: 'cust2', t, phase: 1, face: { mouth: 'flat', blink: blinkOf(t, .4) } });
    person(c, { x: 560, y: 760, s: .8, who: 'cust', t, phase: 2, face: { mouth: 'smile', blink: blinkOf(t, 1.4) } });
    person(c, { x: 300, y: 790, s: 1.05, who: 'biz', t, phase: 3, face: { mouth: steam > .3 ? 'o' : 'flat', open: .3, brow: steam > .3 ? -.6 : 0, blink: blinkOf(t, 2.2), sweat: steam * .9, lx: 1 }, hl: [-140, steam > .3 ? -200 + Math.sin(t * 14) * 14 : -50], hr: [130, -50], itemL: items.watch() });
    desk(c, 40, 720, 860);
    if (steam > .05) { for (let i = 0; i < 3; i++) { const p = ((t * 1.4 + i * .33) % 1); withAlpha(c, steam * (1 - p), () => circ(c, 250 + i * 60, 440 - p * 80, 18 + p * 18, 'rgba(255,255,255,.9)')); } scaleAt(c, 300, 400, steam, () => text(c, '＃！', 0, 0, { size: 70, color: C.red2, stroke: '#fff', strokeW: 12 })); }
    // 缺貨率圓環
    const gx = 1180, gy = 420, gk = pop(t, at('缺貨率') - .1, .4), tP = at('百分之七點五'), pr = tw(t, tP, tP + .7, E.out);
    scaleAt(c, gx, gy, gk, () => {
      circ(c, 0, 0, 176, '#fff'); c.beginPath(); c.arc(0, 0, 130, 0, TAU); c.lineWidth = 38; c.strokeStyle = '#E8F0EC'; c.stroke();
      c.beginPath(); c.arc(0, 0, 130, -Math.PI / 2, -Math.PI / 2 + TAU * .075 * pr + .001); c.strokeStyle = C.red; c.stroke();
      text(c, '需求缺貨率', 0, -54, { size: 28, color: C.ink2, weight: 700 }); text(c, t > tP - .05 ? '7.5%' : '?', 0, 10, { size: 78, color: C.red2 }); text(c, '答應準時出貨，沒做到', 0, 68, { size: 22, color: C.ink2, weight: 700 });
    });
    const bk = pop(t, tImp + .3, .4);
    if (bk > 0) scaleAt(c, 1180, 700, bk, () => { fillRR(c, -300, -64, 600, 128, 22, '#fff'); text(c, '批發客戶', -214, -22, { size: 30, color: C.ink2, weight: 700 }); fillRR(c, -120, -34, 300 * bk, 30, 15, C.red); fillRR(c, -120, -34, 300 * (7.5 / 10.2) * bk, 30, 15, C.orange); text(c, '10.2%', 252, -20, { size: 40, color: C.red2 }); text(c, '整體 7.5%', -214, 24, { size: 26, color: C.ink2, weight: 700 }); line(c, -120 + 300 * (7.5 / 10.2), 6, -120 + 300 * (7.5 / 10.2), 30, 4, C.ink2); });
    // 三條小溪（可用／在途／安全庫存）→ 水桶 → 814
    const tRep = at('報表算出'), tNum = at('建議補貨八百一十四件'), kb = pop(t, tRep - .1, .4);
    if (kb > 0) {
      const bx = 1680, by = 760;
      const src = [['可用', C.teal, 1440, 230], ['在途', C.blue, 1580, 200], ['安全庫存', C.orange, 1740, 230]];
      src.forEach((s2, i) => {
        const p = tw(t, tRep + .1 + i * .3, tRep + .9 + i * .3, E.out), k = pop(t, tRep + i * .2, .3);
        scaleAt(c, s2[2], s2[3], k, () => { fillRR(c, -80, -30, 160, 60, 30, s2[1]); text(c, s2[0], 0, 2, { size: 30, color: '#fff' }); });
        if (p > 0) for (let j = 0; j < 9; j++) { const u = ((t * 1.1 + j / 9 + i * .2) % 1) * p; circ(c, lerp(s2[2], bx, u) + Math.sin(u * 9 + j) * 6, lerp(s2[3] + 30, by - 90, u * u), 8, s2[1]); }
      });
      scaleAt(c, bx, by, kb, () => { c.beginPath(); c.moveTo(-110, -80); c.lineTo(110, -80); c.lineTo(88, 90); c.lineTo(-88, 90); c.closePath(); c.fillStyle = '#9AA3B2'; c.fill(); const lvl = tw(t, tRep + .5, tNum + .6, E.io); c.save(); c.beginPath(); c.moveTo(-106, -80); c.lineTo(106, -80); c.lineTo(86, 88); c.lineTo(-86, 88); c.clip(); fillRR(c, -120, 88 - 168 * lvl, 240, 180, 0, C.teal); c.restore(); fillRR(c, -122, -98, 244, 24, 10, '#C9CED6'); });
      const nk = pop(t, tNum, .4); if (nk > 0) scaleAt(c, 1700, 470, nk, () => { fillRR(c, -170, -72, 340, 144, 34, C.ink); text(c, '814', -50, 2, { size: 100, color: '#fff' }); text(c, '件', 112, 16, { size: 46, color: '#FFD9A0' }); });
    }
  };

})();
