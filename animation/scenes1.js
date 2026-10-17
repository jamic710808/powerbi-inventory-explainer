/* 場景 1–2：週一早上八點／封面與驚魂記 */
(() => {
  const { clamp, lerp, hash, E, tw, pop, C, rr, fillRR, circ, ell, line, text, shadow, withAlpha, scaleAt, room, windowFrame, shelf, box, person, items, warehouseChar, desk, laptop, clock, bubble, bang, check, star, card, sparkle, TAU } = L;
  const SCN = window.SC;

  // 小倉庫模型（桌上的三兄弟）
  const minis = (c, x, y, t) => {
    warehouseChar(c, { x: x, y: y, s: .26, name: '東', color: '#F2A25E', roof: '#D9692A', t, phase: 0, w: 260, h: 250 });
    warehouseChar(c, { x: x + 86, y: y, s: .22, name: '南', color: '#6FC3B0', roof: '#2E8F7D', t, phase: 1.3 });
    warehouseChar(c, { x: x + 160, y: y, s: .19, name: '北', color: '#7FA3D8', roof: '#46659A', t, phase: 2.1, w: 200 });
  };
  const blinkOf = (t, ph = 0) => ((t + ph) % 3.4) < .12 ? 1 : 0;

  // 報表縮圖牆：8 個頁面小卡
  function pagesPanel(c, X, x, y, tStart) {
    const labels = ['封面', '總覽', '結構', '週轉', '風險', '補貨', '調撥', '盤點'];
    c.save(); c.translate(x, y);
    const k = pop(X.t, tStart, .45); if (k <= 0) { c.restore(); return; }
    c.scale(k, k);
    fillRR(c, -270 + 8, -190 + 12, 540, 380, 30, 'rgba(34,52,79,.16)'); fillRR(c, -270, -190, 540, 380, 30, '#fff'); fillRR(c, -270, -190, 540, 66, 30, C.orange); c.fillStyle = C.orange; c.fillRect(-270, -150, 540, 20);
    text(c, '庫存分析報告', 0, -156, { size: 36, color: '#fff' });
    labels.forEach((l, i) => {
      const cx = -195 + (i % 4) * 130, cy = -64 + Math.floor(i / 4) * 128, p = pop(X.t, tStart + .25 + i * .09, .3);
      scaleAt(c, cx, cy, p, () => {
        fillRR(c, -50, -50, 100, 100, 14, i < 2 ? '#FFF1DB' : '#EAF6F3');
        for (let r = 0; r < 3; r++) fillRR(c, -34, -32 + r * 24, 68 - r * 16, 12, 5, i < 2 ? C.orange : C.teal);
        text(c, l, 0, 58, { size: 20, color: C.ink, weight: 800 });
      });
    });
    c.restore();
  }

  SCN['s01-monday'] = (c, X) => {
    const { t, W, H, at, end } = X;
    room(c, W, H, { floorY: 800 });
    windowFrame(c, 1330, 150, 300, 260, t, 1);
    // 牆上時鐘與標籤
    clock(c, 1120, 200, 72, 8, 0);
    const tTag = at('週一早上八點');
    scaleAt(c, 1120, 336, pop(t, tTag, .4), () => { fillRR(c, -120, -30, 240, 60, 30, C.ink); text(c, '週一 08:00', 0, 2, { size: 34, color: '#fff' }); });
    shelf(c, 360, 300, 330, 3, t, 5);
    { const a = 1 - tw(t, 1.9, 2.6, E.io); if (a > 0) withAlpha(c, a, () => { text(c, '阿倉的週一', 640, 168, { size: 118, color: C.ink, stroke: '#FFF3DC', strokeW: 14 }); fillRR(c, 640 - 250, 234, 500, 56, 28, C.orange); text(c, '一份庫存報表的故事', 640, 263, { size: 34, color: '#fff' }); }); }
    // 門
    const tBurst = at('老闆衝進倉庫');
    fillRR(c, 40, 190, 270, 620, 10, '#9C6B3F'); fillRR(c, 60, 210, 230, 590, 6, '#FFEFC9');
    const open = tw(t, tBurst - .15, tBurst + .25, E.out);
    if (open < 1) { // 門板（關閉→往內側打開）
      c.save(); c.translate(60, 0); c.beginPath(); c.moveTo(0, 210); c.lineTo(230 * (1 - open * .8), 210 + open * 24); c.lineTo(230 * (1 - open * .8), 800 - open * 24); c.lineTo(0, 800); c.closePath(); c.fillStyle = '#D9A066'; c.fill(); circ(c, 200 * (1 - open * .8), 520, 11, C.yellow); c.restore();
    } else { c.save(); c.beginPath(); c.moveTo(60, 210); c.lineTo(104, 234); c.lineTo(104, 776); c.lineTo(60, 800); c.closePath(); c.fillStyle = '#C48B52'; c.fill(); c.restore(); }
    // 桌＋阿倉
    const cangTalk = t > at('阿倉打開一份報表') - .1;
    const lookBoss = t > tBurst + .3;
    person(c, { x: 1460, y: 800, s: 1.05, who: 'cang', t, phase: 1, face: { mouth: cangTalk ? 'grin' : 'smile', open: 0, blink: blinkOf(t, .8), lx: lookBoss ? -1 : 0, brow: lookBoss ? .4 : 0, happy: false },
      hl: [-120, -105], hr: [120, -105] });
    desk(c, 1010, 690, 840);
    minis(c, 1676, 690, t);
    // 筆電：先背對老闆，阿倉打開一份報表時轉過來
    const tOpen = at('阿倉打開一份報表'), flip = tw(t, tOpen, tOpen + .45, E.io), slide = tw(t, tOpen + .1, tOpen + .8, E.out);
    c.save(); c.translate(lerp(1220, 1100, slide), 690); c.scale(Math.cos(flip * Math.PI), 1); // 轉面
    if (flip < .5) { fillRR(c, -140, -200, 280, 190, 14, '#3A4565'); circ(c, 0, -105, 20, 'rgba(255,255,255,.35)'); fillRR(c, -170, -12, 340, 18, 8, '#3A4565'); }
    else { laptop(c, 0, 0, 1, cc => { fillRR(cc, 0, 0, 256, 40, 0, C.orange); for (let i = 0; i < 8; i++) fillRR(cc, 16 + (i % 4) * 58, 56 + Math.floor(i / 4) * 50, 48, 38, 8, i < 2 ? '#FFD9B0' : '#CDEBE4'); }); }
    c.restore();
    // 老闆衝進來
    const run = tw(t, tBurst, tBurst + .75, E.back), bx = lerp(-300, 560, run);
    const shoutP = at('阿倉！'), shoutE = end('阿倉！'), qS = at('庫存到底好不好'), qE = end('庫存到底好不好');
    const tSplash = at('咖啡灑了一半'), sp = tw(t, tSplash, tSplash + .35, E.out);
    const bossSweat = clamp(tw(t, tSplash, tSplash + .6) - tw(t, qE + .6, qE + 1.6));
    const shouting = t > shoutP && t < qE ? 1 : 0;
    const mouthOpen = shouting ? (Math.sin((t - shoutP) * 14) * .5 + .5) : 0;
    const calmer = tw(t, tOpen, tOpen + 1.2);
    let bMouth = 'shout', bOpen = shouting ? mouthOpen : .4;
    if (t > tSplash && !shouting && t < shoutP) { bMouth = 'o'; bOpen = .5; }
    if (t >= qE) { bMouth = calmer > .6 ? 'o' : 'worry'; bOpen = .3; }
    if (t < tBurst) bMouth = 'shout';
    const waving = shouting ? Math.sin((t - shoutP) * 10) * 40 : 0;
    const cupItem = items.cup({ tilt: sp * 1.15 - tw(t, qE + .2, qE + .8) * 1.15, steam: true, t, coffee: true });
    person(c, { x: bx, y: 1095, s: 1.25, who: 'boss', t, phase: .4, idle: run < 1 ? 3 : 1, lean: lerp(.12, 0, run) + (shouting ? -.03 : 0),
      face: { mouth: bMouth, open: bOpen, brow: t < qE ? .9 : lerp(.9, .1, calmer), shock: 0, blink: blinkOf(t, 1.5), sweat: bossSweat, worry: t > tSplash && t < tOpen, lx: lookBoss ? 1 : 0 },
      hl: [-190 - waving * .3, -300 + waving], hr: [150, -210], itemR: cupItem });
    // 奔跑的速度線
    if (t > tBurst - .05 && t < tBurst + .8) withAlpha(c, 1 - tw(t, tBurst + .4, tBurst + .8), () => { for (let i = 0; i < 4; i++) line(c, bx - 260 - i * 30, 640 + i * 70, bx - 130 - i * 30, 640 + i * 70, 10, 'rgba(34,52,79,.25)'); });
    // 咖啡潑灑
    if (t > tSplash) {
      const bossHand = { x: bx + 150 * 1.25 + 8, y: 1095 - 210 * 1.25 - 40 };
      for (let i = 0; i < 12; i++) {
        const t0 = tSplash + .08 + i * .012, u = t - t0; if (u < 0) continue;
        const vx = 160 + hash(i + 3) * 260, vy = -420 + hash(i + 9) * 240, x = bossHand.x + vx * u, y = bossHand.y + vy * u + 1700 * u * u;
        const gy = 868 + hash(i + 50) * 24; if (y < gy) circ(c, x, y, 8 + hash(i) * 7, '#6B4A3A'); else ell(c, x, gy, 16 + hash(i) * 10, 5, '#6B4A3A');
      }
      const pw = tw(t, tSplash + .75, tSplash + 1.6, E.out); if (pw > 0) ell(c, bossHand.x + 300, 880, 110 * pw, 14 * pw, '#6B4A3A');
    }
    // 阿倉！(尖叫爆框)  → 庫存到底好不好？（問號）
    if (t > shoutP - .05 && t < shoutE + .1) { const k = pop(t, shoutP, .25); scaleAt(c, 880, 520, k, () => { star(c, 0, 0, 120, t * 3, C.yellow, 12); star(c, 0, 0, 86, -t * 2, '#FFF3BF', 12); bang(c, 0, 20, 1.1, C.red); bang(c, 56, 28, .8, C.red); }); }
    if (t > qS - .05 && t < qE + .6) { const a = 1 - tw(t, qE + .2, qE + .6); withAlpha(c, a, () => { for (let i = 0; i < 3; i++) { const k = pop(t, qS + i * .18, .3); scaleAt(c, 820 + i * 120, 500 - (i % 2) * 40 + Math.sin(t * 6 + i) * 6, k, () => text(c, '？', 0, 0, { size: 150 - i * 20, color: C.orange2, stroke: '#fff', strokeW: 14 })); } }); }
    // 報表縮圖面板（阿倉轉過筆電後）
    pagesPanel(c, X, 970, 420, tOpen + .35);
    const t6 = at('六個問題'), tpl = pop(t, at('八頁'), .35);
    withAlpha(c, tpl, () => { scaleAt(c, 1300, 256, tpl, () => { fillRR(c, -90, -34, 180, 68, 34, C.teal); text(c, '8 頁', 0, 2, { size: 44, color: '#fff' }); }); });
    for (let i = 0; i < 6; i++) { const k = pop(t, t6 + i * .1, .3); scaleAt(c, 330 + i * 64, 585 - (i % 2) * 44, k, () => { circ(c, 0, 0, 30, C.orange); text(c, '?', 0, 2, { size: 38, color: '#fff' }); }); }
  };

  /* ---------- 場景 2：封面與驚魂記 ---------- */
  const cover = [
    { label: '在庫金額', value: '78.5萬', accent: C.teal, cue: '在庫七十八點五萬' },
    { label: '週轉天數', value: '22.5天', accent: C.blue, cue: '週轉二十二點五天' },
    { label: '需求缺貨率', value: '8%', accent: C.red, cue: '缺貨率百分之八' },
    { label: '盤點準確率', value: '93.5%', accent: C.orange, cue: '準確率九成三多' },
  ];
  function tabletScreen(c, X, page, flipK) {
    // 平板：page 0 封面、1 總覽。flipK＝翻頁的橫向壓縮
    const t = X.t; c.save(); c.translate(960, 510);
    fillRR(c, -410 + 8, -280 + 14, 820, 560, 40, 'rgba(34,52,79,.18)'); fillRR(c, -410, -280, 820, 560, 40, '#2A3350');
    c.save(); c.scale(Math.max(.02, flipK), 1);
    fillRR(c, -390, -260, 780, 520, 22, '#F7FAFD'); c.save(); rr(c, -390, -260, 780, 520, 22); c.clip();
    if (page === 0) {
      fillRR(c, -390, -260, 780, 84, 0, C.orange); text(c, '庫存分析報告', -190, -218, { size: 40, color: '#fff', align: 'center' }); text(c, '封面', 300, -218, { size: 30, color: '#FFE8CF', weight: 700 });
      cover.forEach((k, i) => {
        const cx = -200 + (i % 2) * 400, cy = -60 + Math.floor(i / 2) * 190, p = pop(t, X.at(k.cue), .38);
        scaleAt(c, cx, cy, p, () => card(c, 0, 0, 350, 160, { label: k.label, value: k.value, accent: k.accent, vs: 64, vy: 44, ls: 24 }));
      });
    } else {
      fillRR(c, -390, -260, 780, 84, 0, C.teal); text(c, '庫存經營總覽', -170, -218, { size: 40, color: '#fff' }); text(c, '第 1 頁', 290, -218, { size: 30, color: '#D5F2EB', weight: 700 });
      const vals = [['在庫金額', '58.9萬'], ['週轉天數', '22.8天'], ['缺貨率', '7.5%'], ['超180天', '13.9%'], ['準確率', '93.6%']];
      vals.forEach((v, i) => {
        const hot = i === 0 ? clamp((Math.sin(t * 10) + 1) / 2) : 0;
        c.save(); c.translate(-308 + i * 154, -118);
        fillRR(c, -68, -52, 136, 108, 14, hot > 0 && X.t > X.at('翻頁就驚呼') ? `rgba(255,${200 - hot * 80},${190 - hot * 90},1)` : '#fff'); c.lineWidth = 3; c.strokeStyle = i === 0 ? C.red : '#E3E9F1'; rr(c, -68, -52, 136, 108, 14); c.stroke();
        text(c, v[0], 0, -28, { size: 19, color: C.ink2, weight: 700 }); text(c, v[1], 0, 14, { size: 31, color: i === 0 ? C.red2 : C.ink });
        c.restore();
      });
      // 面積圖
      c.beginPath(); c.moveTo(-360, 220); for (let i = 0; i <= 30; i++) { const x = -360 + i * 24, y = 90 - Math.sin(i * .5) * 22 - Math.sin(i * .21 + 1) * 28; c.lineTo(x, y); } c.lineTo(360, 220); c.closePath(); c.fillStyle = 'rgba(240,138,60,.25)'; c.fill();
      for (let i = 0; i < 5; i++) fillRR(c, 30 + i * 62, 130 - i * 8, 44, 60 + i * 8, 6, i % 2 ? '#BFE6DC' : '#9ED8CA');
    }
    c.restore(); c.restore(); c.restore();
  }
  function calendarWidget(c, x, y, s, label, sub, flipK) {
    c.save(); c.translate(x, y); c.scale(s, s);
    fillRR(c, -140 + 8, -150 + 12, 280, 300, 24, 'rgba(34,52,79,.16)'); fillRR(c, -140, -150, 280, 300, 24, '#fff'); fillRR(c, -140, -150, 280, 76, 24, C.red); c.fillStyle = C.red; c.fillRect(-140, -112, 280, 38);
    circ(c, -80, -150, 14, '#fff'); circ(c, 80, -150, 14, '#fff');
    text(c, sub, 0, -112, { size: 36, color: '#fff' });
    c.save(); c.scale(1, Math.max(.05, flipK)); text(c, label, 0, 4, { size: label.length > 3 ? 74 : 108, color: C.ink }); c.restore();
    c.restore();
  }
  SCN['s02-calendar'] = (c, X) => {
    const { t, W, H, at, end } = X;
    room(c, W, H, { floorY: 820, wall: '#FCEBD0' }); windowFrame(c, 130, 150, 250, 220, t, 1); shelf(c, 1480, 190, 330, 2, t, 9);
    const tFlip = at('翻頁就驚呼'), page = t > tFlip + .2 ? 1 : 0, flipK = t > tFlip && t < tFlip + .5 ? Math.abs(Math.cos((t - tFlip) / .5 * Math.PI)) : 1;
    tabletScreen(c, X, page, flipK);
    // 右：阿倉
    const tPoint = at('阿倉指指日期'), tMay = at('這頁只算到五月一日'), tAug = at('封面算到八月底'), tNo = at('沒掉錢'), tMonths = at('只是日曆翻了四個月');
    const pointing = tw(t, tPoint, tPoint + .5, E.out) * (1 - tw(t, tNo + 1.4, tNo + 2, E.io));
    const wave = Math.sin(t * 8) * 10 * tw(t, tMay, tMay + .3);
    person(c, { x: 1650, y: 1095, s: 1.22, who: 'cang', t, phase: 2, idle: 1, face: { mouth: t > tNo ? 'grin' : 'smile', blink: blinkOf(t, 2), brow: .2, lx: -1 },
      hl: [lerp(-130, -230, pointing), lerp(-40, -320 + wave, pointing)], hr: [128, -40], itemL: pointing > .05 ? items.pointer({ rot: .32, len: 250 }) : null });
    // 左：老闆
    const relief = tw(t, at('老闆剛放心'), at('老闆剛放心') + .6), shocked = tw(t, tFlip, tFlip + .3, E.out) * (1 - tw(t, tNo, tNo + .8));
    const sweat = clamp(shocked);
    const tShock2 = at('五十八點九萬'), tBoom = at('少了二十萬');
    const shake = t > tBoom && t < tBoom + .6 ? Math.sin((t - tBoom) * 50) * 5 * (1 - (t - tBoom) / .6) : 0;
    let m = t < tFlip ? (relief > .5 ? 'grin' : 'smile') : 'o', mo = .6;
    if (t >= tFlip && t < tNo) { m = (t > tBoom && t < tBoom + 1.8) ? 'shout' : 'o'; mo = .5 + Math.sin(t * 12) * .25; }
    if (t >= tNo) { m = t > tMonths ? 'smile' : 'o'; mo = .15; }
    person(c, { x: 300 + shake, y: 1095, s: 1.22, who: 'boss', t, phase: 0, idle: 1, lean: shocked > .5 ? -.06 : 0,
      face: { mouth: m, open: mo, brow: t < tFlip ? .1 : lerp(.8, 0, tw(t, tNo, tNo + 1)), shock: shocked, blink: shocked > .2 ? 0 : blinkOf(t, 3), sweat, happy: relief > .5 && t < tFlip },
      hl: [-130, -60 + (shocked > .4 ? -210 * shocked : 0)], hr: [130, -50 + (shocked > .4 ? -190 * shocked : 0)] });
    if (shocked > .1) scaleAt(c, 300, 430, pop(t, tFlip + .15, .35) * (1 - tw(t, tNo, tNo + .4)), () => bang(c, 0, 20, 1.6, C.red));
    // 兩張數字卡片：78.5（封面）vs 58.9（總覽）
    const tCards = at('五十八點九萬'), enter = tw(t, tCards - .3, tCards + .5, E.out), fight = tw(t, tBoom - .5, tBoom, E.in);
    const ma = t > tMonths ? tw(t, tMonths, tMonths + .9, E.io) : 0;
    const ax = lerp(lerp(180, 760, enter), 930, fight) * (1 - ma) + 770 * ma, bx2 = lerp(lerp(1740, 1160, enter), 990, fight) * (1 - ma) + 1150 * ma;
    const sep = tw(t, at('阿倉指指日期') - .2, at('阿倉指指日期') + .6, E.out) * (1 - ma);
    const ax2 = t < tBoom + .2 ? ax : lerp(930, 740, sep) * (1 - ma) + 770 * ma, bx3 = t < tBoom + .2 ? bx2 : lerp(990, 1180, sep) * (1 - ma) + 1150 * ma;
    const cy = 330 - (t > tBoom && t < tBoom + .3 ? 20 : 0);
    if (enter > 0) {
      const colA = t > tNo + .5 ? C.green : C.orange, colB = t > tNo + .5 ? C.green : C.blue;
      const shk = Math.sin(t * 40) * (t > tBoom && t < tBoom + .7 ? 6 : 0);
      scaleAt(c, ax2 + shk, cy, 1, () => { card(c, 0, 0, 300, 170, { label: '封面', value: '78.5萬', accent: colA, vs: 70, vy: 46, rot: -.03 }); });
      scaleAt(c, bx3 - shk, cy, 1, () => { card(c, 0, 0, 300, 170, { label: '總覽', value: '58.9萬', accent: colB, vs: 70, vy: 46, rot: .03 }); });
      // 算到哪天的標籤
      const ta = pop(t, tAug, .35), tb = pop(t, tMay, .35);
      scaleAt(c, ax2, cy + 118, ta, () => { fillRR(c, -90, -22, 180, 44, 22, C.orange2); text(c, '算到 8/31', 0, 2, { size: 28, color: '#fff' }); });
      scaleAt(c, bx3, cy + 118, tb, () => { fillRR(c, -80, -22, 160, 44, 22, C.blue2); text(c, '算到 5/1', 0, 2, { size: 28, color: '#fff' }); });
    }
    // 撞擊星爆＋紅色氣泡
    if (t > tBoom - .02 && t < tBoom + 1.2) { const k = pop(t, tBoom, .22) * (1 - tw(t, tBoom + .7, tBoom + 1.2)); scaleAt(c, 960, cy, k, () => { star(c, 0, 0, 150, t * 2, C.yellow, 14); star(c, 0, 0, 100, -t * 3, '#fff', 14); }); }
    const bb = pop(t, tBoom + .05, .3) * (1 - tw(t, tNo, tNo + .35)); if (bb > 0) scaleAt(c, 330, 540, bb, () => { bubble(c, 0, 0, 330, 120, 20, 90, '#fff', C.red); text(c, '少了 20 萬?!', 0, 2, { size: 52, color: C.red2 }); });
    // 日曆
    const calK = pop(t, tPoint, .4);
    if (calK > 0) {
      const m5 = t < tAug, k5 = t > tMonths ? 0 : 1;
      let label = m5 ? '5/1' : '8/31', sub = m5 ? '總覽' : '封面', fl = 1;
      if (t > tMay - .1 && t < tMay + .3) fl = Math.abs(Math.cos((t - tMay + .1) / .4 * Math.PI)) ;
      if (t > tAug - .1 && t < tAug + .3) fl = Math.abs(Math.cos((t - tAug + .1) / .4 * Math.PI));
      if (t >= tMonths) { const u = (t - tMonths) / .9, mo = ['5 月', '6 月', '7 月', '8 月'], idx = Math.min(3, Math.floor(u * 4)); label = mo[idx]; sub = '翻翻翻'; fl = Math.abs(Math.cos(((u * 4) % 1) * Math.PI * .999)); if (u >= 1) { label = '4 個月'; sub = '日曆而已'; fl = 1; } }
      calendarWidget(c, 1520, 310, calK, label, sub, Math.max(.05, fl));
    }
    // 握手＋打勾
    if (ma > 0) {
      const k = ma, hy = cy + 6, sh = Math.sin(t * 12) * 6 * ma;
      line(c, ax2 + 150, hy, 960 - 14, hy + sh, 24, C.skin, 'round'); line(c, bx3 - 150, hy, 960 + 14, hy - sh, 24, C.skin, 'round'); circ(c, 960, hy, 26 * k, C.skin2);
      scaleAt(c, 960, 170, pop(t, tNo + .2, .4), () => { circ(c, 0, 0, 62, '#E6F6EA'); check(c, 0, 0, 1.2); });
      for (let i = 0; i < 3; i++) sparkle(c, 780 + i * 190, 200 + (i % 2) * 40, .9, t + i);
    }
  };
})();
