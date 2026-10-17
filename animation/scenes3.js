/* 場景 7–10：別的倉有餘貨嗎／帳實對得上嗎／這些數字怎麼算的／所以該做什麼 */
(() => {
  const { clamp, lerp, hash, E, tw, pop, C, rr, fillRR, circ, ell, line, text, shadow, withAlpha, scaleAt, room, windowFrame, shelf, box, person, items, warehouseChar, desk, chip, bang, check, star, card, sparkle, bubble, TAU } = L;
  const SCN = window.SC;
  const blinkOf = (t, ph = 0) => ((t + ph) % 3.4) < .12 ? 1 : 0;
  const bgRoom = (c, X, o = {}) => { room(c, X.W, X.H, { floorY: o.floorY || 820, wall: o.wall || '#FCEBD0' }); if (o.win !== false) windowFrame(c, o.wx || 1460, o.wy || 140, 250, 210, X.t, o.glow === undefined ? 1 : o.glow); };
  const titleChip = (c, X, label, q, k) => chip(c, 70, 56, label, q, k, pop(X.t, .15, .4));
  function boxFace(c, x, y, s, o = {}) {
    c.save(); c.translate(x, y); c.scale(s, s); box(c, -50, -90, 100, 90, { color: o.color, color2: o.color2 });
    if (o.happy) { c.lineWidth = 5; c.strokeStyle = C.ink; c.lineCap = 'round'; for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * 18, -42, 9, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); } }
    else { circ(c, -18, -48, 7, C.ink); circ(c, 18, -48, 7, C.ink); }
    c.lineWidth = 4; c.strokeStyle = C.ink; c.lineCap = 'round'; c.beginPath(); c.arc(0, -38, 11, .15 * Math.PI, .85 * Math.PI); c.stroke(); c.restore();
  }

  /* ---------- 場景 7：第五問 別的倉有餘貨嗎 ---------- */
  SCN['s07-transfer'] = (c, X) => {
    const { t, W, H, at, end } = X;
    bgRoom(c, X, { win: false }); titleChip(c, X, '第五問', '別的倉有餘貨嗎？', 5);
    const gy = 850;
    const tKnock = at('先問鄰居有沒有多的醬油'), tKnockE = end('先問鄰居有沒有多的醬油'), tNorth = at('華北倉調出最多'), tNorthE = end('華北倉調出最多');
    const tLess = at('庫存卻最少'), tLent = at('還是被借光了'), tAsk = at('先問清楚');
    const give = tw(t, tKnock + 1.2, tKnock + 1.9, E.io);
    // 三個倉
    const eastBusy = t > tNorth && t < tNorthE + 1;
    warehouseChar(c, { x: 800, y: gy, s: 1.15, name: '華東倉', color: '#F2A25E', roof: C.orange2, t, phase: 0, w: 260, h: 290, look: -.8, armUp: t > tKnock + .3 && t < tKnock + 1.4 ? 1 : 0 });
    warehouseChar(c, { x: 1150, y: gy, s: 1.12, name: '華南倉', color: '#6FC3B0', roof: C.teal2, t, phase: 1.1, w: 240, h: 270, look: -.5 });
    const mood = t > tLess ? 'tired' : (t > tNorth ? 'busy' : 'chill');
    warehouseChar(c, { x: 1490, y: gy, s: 1.0, name: '華北倉', color: '#7FA3D8', roof: C.blue2, t, phase: 2.2, w: 200, h: 255, mood, idle: t > tNorth && t < tLess ? 4 : 1, look: -.4, armUp: t > tLent ? 1 : 0 });
    // 空貨架（華北倉旁）：只有柱子、層板與蜘蛛網
    const sx = 1730; fillRR(c, sx, 520, 12, 330, 4, '#9D7A52'); fillRR(c, sx + 150, 520, 12, 330, 4, '#9D7A52'); for (let r = 0; r < 3; r++) fillRR(c, sx, 620 + r * 100, 162, 12, 4, '#B58D5C');
    const web = pop(t, tLess, .5); if (web > 0) { c.save(); c.globalAlpha = web; c.strokeStyle = 'rgba(80,90,110,.55)'; c.lineWidth = 2; for (let k = 0; k < 5; k++) { const a = Math.PI * (.5 + k * .25) - Math.PI / 4; line(c, sx + 156, 524, sx + 156 + Math.cos(a) * 80, 524 + Math.sin(a) * 80, 2, 'rgba(80,90,110,.55)', 'butt'); } for (let r = 1; r < 4; r++) { c.beginPath(); c.arc(sx + 156, 524, r * 22, .55 * Math.PI, Math.PI * 1.05); c.stroke(); } c.restore();
      const drop = (Math.sin(t * 2) + 1) / 2 * 40; line(c, sx + 100, 524, sx + 100, 560 + drop, 2, 'rgba(80,90,110,.6)', 'butt'); circ(c, sx + 100, 566 + drop, 9, C.ink); }
    // 阿倉＋瓶子
    const armR = tw(t, tKnock - .2, tKnock + .5, E.out) * (gotBottleT(t, tKnock) ? 1 : 1 - 0);
    const knockSw = t > tKnock && t < tKnock + 1.2 ? Math.sin((t - tKnock) * 16) * 22 : 0;
    const gotBottle = t > tKnock + 1.9;
    function gotBottleT() { return true; }
    person(c, { x: 260, y: 1100, s: 1.2, who: 'cang', t, phase: 1, face: { mouth: t > tAsk ? 'grin' : 'smile', blink: blinkOf(t, .6), brow: .3, lx: 1 }, hl: [-125, -40], hr: [lerp(125, gotBottle ? 175 : 215, armR) + (gotBottle ? 0 : knockSw * .5), lerp(-40, gotBottle ? -190 : -250, armR)], itemR: gotBottle ? items.bottle({ rot: -.15 }) : null });
    if (t > tKnock && t < tKnock + 1.3) { const k = pop(t, tKnock, .2); scaleAt(c, 600, 640, k, () => { text(c, '咚咚', 0, 0, { size: 64, color: C.orange2, stroke: '#fff', strokeW: 10 }); }); }
    // 瓶子從華東倉飛到阿倉手上
    if (t > tKnock + 1.2 && t < tKnock + 1.95) { const u = give, x = lerp(740, 400, u), y = 640 - Math.sin(u * Math.PI) * 120; c.save(); c.translate(x, y); c.rotate(u * 3); fillRR(c, -20, -52, 40, 78, 10, '#4A2F22'); fillRR(c, -10, -76, 20, 28, 5, '#4A2F22'); fillRR(c, -14, -30, 28, 30, 4, '#F3E3C3'); text(c, '醬油', 0, -15, { size: 17, color: '#4A2F22' }); c.restore(); }
    // 調出 822：箱子從華北倉飛向東、南
    if (t > tNorth - .1) {
      const run = clamp((t - tNorth) / Math.max(.5, tNorthE - tNorth));
      for (let i = 0; i < 14; i++) {
        const t0 = tNorth + i * .15, u = (t - t0) / 1.1; if (u < 0 || u > 1) continue;
        const tx = i % 2 ? 1150 : 800, x = lerp(1470, tx, E.io(u)), y = 560 - Math.sin(u * Math.PI) * (160 + (i % 3) * 30);
        box(c, x - 26, y - 22, 52, 44, { rot: u * 4 * (i % 2 ? 1 : -1) });
      }
      const n = Math.round(822 * E.out(clamp((t - tNorth) / 2.2)));
      scaleAt(c, 1490, 300, pop(t, tNorth, .35), () => { fillRR(c, -170, -52, 340, 104, 28, C.ink); text(c, '調出', -102, 0, { size: 32, color: '#FFD9A0' }); text(c, String(n), 40, 2, { size: 70, color: '#fff' }); });
    }
    // 庫存最少（141千，來自第 2 頁）
    const lk = pop(t, tLess + .1, .35); if (lk > 0) scaleAt(c, 1490, 440, lk, () => { bubble(c, 0, 0, 250, 80, 10, 74, '#fff', C.blue2); text(c, '庫存最少', 0, 2, { size: 40, color: C.blue2 }); });
    // 人緣太好：愛心
    if (t > at('庫存卻最少') + 1 && t < tLent + .3) for (let i = 0; i < 4; i++) { const p = ((t * .9 + i * .25) % 1); withAlpha(c, 1 - p, () => { c.save(); c.translate(1430 + i * 40, 500 - p * 120); c.scale(1 + p * .4, 1 + p * .4); c.beginPath(); c.moveTo(0, 8); c.bezierCurveTo(-24, -12, -12, -30, 0, -14); c.bezierCurveTo(12, -30, 24, -12, 0, 8); c.fillStyle = C.red; c.fill(); c.restore(); }); }
    // 被借光了：空口袋
    if (t > tLent) { const k = pop(t, tLent, .35); scaleAt(c, 1230, 330, k, () => { circ(c, 0, 0, 52, '#fff'); text(c, '？', 0, 2, { size: 80, color: C.orange2 }); }); }
    // 便利貼
    const sk = tw(t, tAsk, tAsk + .2, E.in), shown = pop(t, tAsk + .12, .3);
    if (shown > 0) scaleAt(c, 960, 330, shown, () => { c.rotate(-.1); fillRR(c, -170 + 8, -120 + 12, 340, 240, 6, 'rgba(34,52,79,.18)'); fillRR(c, -170, -120, 340, 240, 6, '#FFE27A'); fillRR(c, -170, -120, 340, 34, 6, '#F2CB4F'); text(c, '先問清楚', 0, 14, { size: 76, color: C.ink }); });
  };

  /* ---------- 場景 8：第六問 帳和實物對得上嗎 ---------- */
  SCN['s08-count'] = (c, X) => {
    const { t, W, H, at, end } = X;
    bgRoom(c, X, { win: false }); titleChip(c, X, '第六問', '帳和實物對得上嗎？', 6);
    const gy = 880, tAcc = at('準確率九成三多'), tOnly = at('但只代表有盤到的記錄'), tRoll = at('像點名只點有來的人'), tRollE = end('像點名只點有來的人');
    const tPlus = at('多了兩萬九'), tCancel = at('幾乎抵銷'), tAbs = at('可是絕對差異');
    // 阿倉點名
    const calling = t > tRoll - .2 && t < tRollE;
    const ci = Math.floor(clamp((t - tRoll) / (tRollE - tRoll)) * 6);
    person(c, { x: 270, y: 1100, s: 1.2, who: 'cang', t, phase: 1, face: { mouth: calling ? 'o' : 'smile', open: calling ? (Math.sin(t * 10) + 1) / 2 * .8 : 0, blink: blinkOf(t, 1), brow: .2, lx: 1 }, hl: [-130, -50], hr: [150, -190 + (calling ? Math.sin(t * 9) * 8 : 0)], itemR: items.clip() });
    // 貨架上的箱子（4 個到、2 個缺席）
    const board = 720; fillRR(c, 500, board, 840, 18, 6, '#B58D5C'); fillRR(c, 500, board, 14, 190, 4, '#9D7A52'); fillRR(c, 1326, board, 14, 190, 4, '#9D7A52'); fillRR(c, 500, board + 190, 840, 14, 4, '#B58D5C');
    const present = [0, 1, 3, 4], bx0 = 590;
    for (let i = 0; i < 6; i++) {
      const x = bx0 + i * 135, here = present.includes(i), k = pop(t, .3 + i * .08, .3);
      if (here) {
        const hi = t > tRoll && ci >= (present.indexOf(i) >= 0 ? [0, 1, 3, 4].indexOf(i) + (i > 1 ? 1 : 0) : 9) - 0; // 輪到就舉手
        const raise = t > tRoll + (i * .35) ? 1 : 0;
        boxFace(c, x, board, 1.12 * k, { happy: raise > 0 });
        if (raise) { const u = pop(t, tRoll + i * .35, .3); scaleAt(c, x, board - 150, u, () => { fillRR(c, -42, -26, 84, 50, 20, '#fff'); text(c, '到！', 0, 0, { size: 32, color: C.green }); }); }
      } else { // 缺席：躲在貨架後面偷笑（只露出一點箱頂與眼睛）
        const peek = tw(t, tRoll + 1.2, tRoll + 1.9, E.out); c.save(); c.globalAlpha = .55 * k; box(c, x - 46, board - 38 * peek - 12, 92, 40, { color: '#BFA886', color2: '#A58E6C' }); c.restore();
        if (peek > .5) { c.save(); c.globalAlpha = k; circ(c, x - 14, board - 22, 6, C.ink); circ(c, x + 14, board - 22, 6, C.ink); c.restore(); text(c, 'zzz', x + 26, board - 70 - Math.sin(t * 4 + i) * 6, { size: 26, color: C.grey2 }); }
      }
    }
    // 準確率條（只涵蓋有盤到）
    const ak = pop(t, tAcc - .1, .4); if (ak > 0) scaleAt(c, 920, 330, ak, () => { fillRR(c, -330, -70, 660, 140, 26, '#fff'); text(c, '盤點準確率', -200, -34, { size: 32, color: C.ink2, weight: 700 }); text(c, '九成三多', 190, -30, { size: 52, color: C.teal2 }); fillRR(c, -300, 6, 600, 34, 17, '#E8F0EC'); fillRR(c, -300, 6, 600 * .935 * tw(t, tAcc, tAcc + .8, E.out), 34, 17, C.teal); });
    const ok = pop(t, tOnly, .4); if (ok > 0) scaleAt(c, 920, 470, ok, () => { fillRR(c, -260, -26, 520, 52, 26, C.yellow); text(c, '只代表「有盤到的記錄」', 0, 2, { size: 34, color: C.ink }); });
    // 天平：多＋2.9萬、少−2.8萬 → 幾乎抵銷
    const sk = pop(t, tPlus - .1, .45);
    if (sk > 0) scaleAt(c, 1630, 430, sk * .85, () => {
      const tilt = lerp(-.26, -.012, tw(t, tCancel, tCancel + .8, E.io)) + Math.sin(t * 7) * .01 * (1 - tw(t, tCancel + .8, tCancel + 1.2));
      fillRR(c, -10, -20, 20, 230, 8, '#8B5E3C'); fillRR(c, -90, 200, 180, 22, 10, '#8B5E3C');
      c.save(); c.rotate(tilt); line(c, -200, 0, 200, 0, 14, '#6A4B34'); circ(c, 0, 0, 16, C.yellow);
      for (const sx of [-1, 1]) { c.save(); c.translate(sx * 200, 0); c.rotate(-tilt); line(c, -50, 0, 0, 100, 4, '#6A4B34', 'butt'); line(c, 50, 0, 0, 100, 4, '#6A4B34', 'butt'); fillRR(c, -70, 100, 140, 18, 9, '#C9CED6'); c.restore(); }
      c.restore();
      // 兩邊的標籤隨盤子位置
      const ly = Math.sin(tilt) * 200;
      scaleAt(c, -200, ly + 160, 1, () => { fillRR(c, -100, -28, 200, 56, 28, C.green); text(c, '＋2.9萬 多', 0, 2, { size: 32, color: '#fff' }); });
      scaleAt(c, 200, -ly + 160, 1, () => { fillRR(c, -100, -28, 200, 56, 28, C.red); text(c, '－2.8萬 少', 0, 2, { size: 32, color: '#fff' }); });
      if (t > tCancel + .8) scaleAt(c, 0, -80, pop(t, tCancel + .8, .35), () => { fillRR(c, -80, -26, 160, 52, 26, '#fff'); text(c, '差不多抵銷', 0, 2, { size: 28, color: C.ink2 }); });
    });
    // 絕對差異大燈
    const lamp = pop(t, tAbs, .4); if (lamp > 0) scaleAt(c, 1640, 790, lamp, () => { const g = (Math.sin(t * 6) + 1) / 2; circ(c, 0, 0, 130 + g * 10, `rgba(246,196,83,${.25 + g * .15})`); fillRR(c, -170, -62, 340, 124, 30, C.ink); text(c, '絕對差異', -60, -20, { size: 34, color: '#FFD9A0' }); text(c, '5.7萬', 20, 24, { size: 64, color: '#fff' }); });
    // 待複核（畫面細節）
    const rk = pop(t, tAbs + 1.6, .35); if (rk > 0) scaleAt(c, 1180, 830, rk, () => { c.rotate(-.1); c.lineWidth = 6; c.strokeStyle = C.red; rr(c, -130, -34, 260, 68, 10); c.stroke(); text(c, '待複核', -30, 2, { size: 38, color: C.red }); text(c, '5,527元', 80, 4, { size: 24, color: C.red2 }); });
  };

  /* ---------- 場景 9：這些數字怎麼算的 ---------- */
  SCN['s09-measure'] = (c, X) => {
    const { t, W, H, at, end } = X;
    bgRoom(c, X, { win: false });
    const tQ = at('「這些數字怎麼算的'), tHand = at('阿倉遞上計算機'), tM = at('度量值'), tF = at('就是存好公式的按鈕'), t93 = at('一共九十三個');
    // 老闆（托腮）
    person(c, { x: 300, y: 1100, s: 1.2, who: 'boss', t, phase: .5, face: { mouth: t > tHand ? 'o' : 'smile', open: .2, brow: .6, worry: false, blink: blinkOf(t, 1), lx: 1 }, hl: [-140, -50], hr: [60, -300 + Math.sin(t * 2) * 4] });
    const qk = pop(t, tQ, .35) * (1 - tw(t, tHand + .3, tHand + .7)); if (qk > 0) scaleAt(c, 520, 430, qk, () => { bubble(c, 0, 0, 420, 130, 0, 120, '#fff', C.ink); text(c, '怎麼算的？', 0, 2, { size: 64, color: C.ink }); });
    // 阿倉＋遞計算機
    const slide = tw(t, tHand, tHand + .9, E.io), bob = Math.sin(t * 2) * 3;
    person(c, { x: 1650, y: 1100, s: 1.2, who: 'cang', t, phase: 2, face: { mouth: 'grin', blink: blinkOf(t, .3), brow: .2, lx: -1 }, hl: [lerp(-125, -220, tw(t, tHand - .3, tHand + .2)) , lerp(-40, -150, tw(t, tHand - .3, tHand + .2))], hr: [125, -40] });
    // 計算機
    const cx = lerp(1420, 1000, slide), cy = lerp(820, 560, slide) + bob * slide, ck = pop(t, tHand - .05, .3);
    scaleAt(c, cx, cy, ck, () => {
      c.rotate((1 - slide) * .18);
      fillRR(c, -230 + 10, -290 + 14, 460, 620, 40, 'rgba(34,52,79,.2)'); fillRR(c, -230, -290, 460, 620, 40, '#3A4565'); fillRR(c, -200, -260, 400, 120, 20, '#DDF0E5');
      const val = t > tM ? '22.8' : '0'; text(c, val, 170, -200, { size: 84, color: '#2E5A4A', align: 'right', font: "Consolas,'Microsoft JhengHei',monospace" });
      const keys = [['週轉天數', C.orange], ['缺貨率', C.red], ['準確率', C.teal], ['÷', C.grey2]];
      keys.forEach((k, i) => { const col = i, pressed = (i === 0 && t > tM && t < tM + .35) ? 8 : 0; fillRR(c, -200 + col * 102, -110 + pressed, 94, 74, 16, k[1]); text(c, k[0], -200 + col * 102 + 47, -73 + pressed, { size: k[0].length > 2 ? 24 : 34, color: '#fff' }); });
      for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) fillRR(c, -200 + q * 102, -20 + r * 92, 94, 76, 16, q === 3 ? '#8AA0C8' : '#5E6B8F');
    });
    // 紙帶吐出公式
    const tp = tw(t, tM + .2, tF + 1.2, E.out), PH = 250;
    if (tp > 0 && slide >= 1) {
      c.save(); c.translate(cx - 165, cy - 290); fillRR(c, 0, -PH * tp, 330, PH * tp + 8, 6, '#fff'); c.beginPath(); c.rect(0, -PH * tp, 330, PH * tp); c.clip();
      const lines = ['日均在庫金額', '× 天數', '÷ 淨銷售出庫成本'];
      lines.forEach((s2, i) => { const show = clamp((t - (tF + .1 + i * .45)) / .3); withAlpha(c, show, () => text(c, s2, 165, -PH * tp + 50 + i * 66, { size: i === 2 ? 34 : 40, color: i === 0 ? C.ink : C.orange2 })); });
      for (let i = 0; i < 12; i++) fillRR(c, 6 + i * 27, -8, 14, 8, 2, '#EDE7DA');
      c.restore();
    }
    // 93 個按鈕牆
    if (t > t93 - .1) {
      const x0 = 1250, y0 = 170;
      for (let i = 0; i < 93; i++) { const col = i % 12, row = Math.floor(i / 12), k = pop(t, t93 + i * .012, .28); if (k <= 0) continue; scaleAt(c, x0 + col * 42, y0 + row * 42, k, () => fillRR(c, -15, -15, 30, 30, 7, [C.teal, C.orange, C.blue, C.yellow][(col + row) % 4])); }
      scaleAt(c, 1500, 560, pop(t, t93 + .2, .4), () => { fillRR(c, -150, -52, 300, 104, 28, C.ink); text(c, '93', -62, 2, { size: 80, color: '#fff' }); text(c, '個度量值', 70, 12, { size: 34, color: '#FFD9A0' }); });
    }
  };

  /* ---------- 場景 10：所以，該做什麼？ ---------- */
  SCN['s10-decide'] = (c, X) => {
    const { t, W, H, at, end } = X;
    const tLast = at('老闆問最後一題'), tQ = at('「所以我該做什麼'), tSmile = at('」阿倉笑了'), t1 = at('總覽找重點'), t2 = at('專題頁查細節'), t3 = at('從查數字走向做判斷'), tPhone = at('老闆拿起電話'), tCall = at('第一通打給華北倉'), tEnd = end('第一通打給華北倉');
    const sun = clamp(t / (X.dur - 2.4));
    bgRoom(c, X, { wx: 1560, wy: 130, glow: 1 });
    // 日出光暈
    withAlpha(c, .18 + .22 * sun, () => circ(c, 1685, 245, 240 + 40 * sun, '#FFD58A'));
    // 白板
    const bk = pop(t, tSmile - .1, .45);
    scaleAt(c, 960, 400, bk, () => {
      fillRR(c, -430 + 10, -250 + 14, 860, 480, 24, 'rgba(34,52,79,.16)'); fillRR(c, -430, -250, 860, 480, 24, '#fff'); fillRR(c, -430, -250, 860, 30, 24, C.grey);
      const steps = [[-290, t1, '① 總覽', '找重點', C.orange], [0, t2, '② 專題頁', '查細節', C.teal], [290, t3, '③ 判斷', '不只查數字', C.blue]];
      steps.forEach((s2, i) => {
        const k = pop(t, s2[1], .4); if (k <= 0) return;
        scaleAt(c, s2[0], -20, k, () => {
          circ(c, 0, -60, 82, s2[4]); text(c, s2[2], 0, 74, { size: 38, color: C.ink }); text(c, s2[3], 0, 122, { size: 34, color: C.ink2, weight: 700 });
          c.save(); c.translate(0, -60);
          if (i === 0) { fillRR(c, -44, -36, 88, 72, 8, '#fff'); for (let r = 0; r < 3; r++) fillRR(c, -34 + r * 24, -8 - r * 8, 16, 34 + r * 8, 3, s2[4]); }
          if (i === 1) { for (let r = 0; r < 2; r++) fillRR(c, -44 + r * 30, -34 + r * 12, 52, 66, 6, '#fff'); c.lineWidth = 8; c.strokeStyle = '#fff'; c.beginPath(); c.arc(18, 4, 20, 0, TAU); c.stroke(); line(c, 32, 18, 50, 36, 10, '#fff'); }
          if (i === 2) { c.beginPath(); c.arc(0, -8, 30, 0, TAU); c.fillStyle = '#FFE27A'; c.fill(); fillRR(c, -14, 20, 28, 20, 5, '#fff'); for (let r = 0; r < 4; r++) line(c, Math.cos(r * 1.1 - 1.9) * 40, -8 + Math.sin(r * 1.1 - 1.9) * 40, Math.cos(r * 1.1 - 1.9) * 52, -8 + Math.sin(r * 1.1 - 1.9) * 52, 5, '#fff'); }
          c.restore();
        });
        if (i < 2) { const nk = tw(t, steps[i + 1][1] - .3, steps[i + 1][1] + .2, E.out); if (nk > 0) { c.save(); c.globalAlpha = nk; line(c, s2[0] + 110, -80, s2[0] + 180, -80, 10, C.ink2); c.beginPath(); c.moveTo(s2[0] + 190, -80); c.lineTo(s2[0] + 164, -100); c.lineTo(s2[0] + 164, -60); c.closePath(); c.fillStyle = C.ink2; c.fill(); c.restore(); } }
      });
    });
    // 阿倉（右）
    person(c, { x: 1600, y: 1100, s: 1.2, who: 'cang', t, phase: 1, face: { mouth: 'grin', blink: blinkOf(t, .5), brow: .2, lx: -1, happy: t > tSmile && t < tSmile + 1.3 }, hl: [lerp(-125, -230, tw(t, t1 - .3, t1 + .3)) , lerp(-40, -290 + Math.sin(t * 3) * 10, tw(t, t1 - .3, t1 + .3))], hr: [125, -40], itemL: t > t1 - .3 ? items.pointer({ rot: .5, len: 210 }) : null });
    // 老闆（左）：先放下咖啡，再拿起電話
    const setDown = tw(t, tLast, tLast + .7, E.io), ph = tw(t, tPhone - .1, tPhone + .55, E.out);
    const cupHandY = lerp(-210, -60, setDown) , handX = 150;
    let itemR = null, hr = [handX, cupHandY];
    if (t < tPhone - .1) itemR = items.cup({ tilt: 0, steam: true, t });
    else { hr = [lerp(handX, 70, ph), lerp(-60, -330, ph)]; itemR = items.phone({ rot: lerp(-.9, -.1, ph) }); }
    const worry = t < tSmile ? .4 : 0;
    person(c, { x: 340, y: 1100, s: 1.2, who: 'boss', t, phase: 0, face: { mouth: t > tPhone ? 'smile' : (t > tQ && t < tSmile ? 'o' : 'smile'), open: .4, brow: t < tSmile ? .6 : 0, blink: blinkOf(t, 2), happy: t > tPhone, lx: 1 }, hl: [-130, -50], hr, itemR });
    // 桌上的咖啡（放下後）
    if (setDown > .6 && t < tPhone - .1) { /* 杯子在手裡，不另畫 */ }
    // 撥號音波與通話泡泡
    if (t > tPhone + .4) { const k = pop(t, tPhone + .4, .4); for (let i = 0; i < 3; i++) { const p = ((t * 1.2 + i * .33) % 1); withAlpha(c, (1 - p) * k, () => { c.beginPath(); c.arc(470, 640, 50 + p * 90, -.9, .9); c.lineWidth = 8; c.strokeStyle = C.teal; c.stroke(); }); } }
    if (t > tCall - .1) { const k = pop(t, tCall - .1, .4); scaleAt(c, 340, 360, k, () => { bubble(c, 0, 0, 330, 120, 0, 150, '#fff', C.teal2); text(c, '☎ 華北倉', 0, 2, { size: 58, color: C.teal2 }); }); }
    // 片尾字卡
    const ek = tw(t, tEnd + .5, tEnd + 1.1, E.out);
    if (ek > 0) { c.save(); c.globalAlpha = ek; c.fillStyle = C.cream; c.fillRect(0, 0, W, H); circ(c, W / 2, H / 2 - 60, 260 + (1 - ek) * 80, 'rgba(246,196,83,.25)');
      text(c, '阿倉的週一', W / 2, H / 2 - 80, { size: 140, color: C.ink }); text(c, '一份庫存報表，從查數字走向做判斷', W / 2, H / 2 + 40, { size: 46, color: C.ink2, weight: 700 });
      fillRR(c, W / 2 - 420, H / 2 + 140, 840, 84, 42, '#fff'); text(c, '故事為虛構・數字取自示範資料', W / 2, H / 2 + 182, { size: 38, color: C.ink2, weight: 700 }); c.restore(); }
  };
})();
