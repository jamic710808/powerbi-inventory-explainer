/* 場景框架：載入 cues.json（由真實旁白停頓校準）→ 對齊字幕 → 逐場繪製＋推移轉場。
   每場的繪製函式放在 window.SC[sceneId]，收到 (c, X)：X.t 場景內秒數、X.at('片語') 取得該句開始秒數。 */
(() => {
  const { E } = L;
  window.SC = window.SC || {};
  let T = null, CUES = null;

  window.prepareScenes = async t => {
    T = t;
    CUES = await (await fetch('cues.json')).json();
    // 以校準後的句子取代 pipeline 的「依字數近似」字幕
    const fps = t.fps, caps = [];
    for (const s of t.scenes) {
      const cu = CUES[s.id]; if (!cu) continue;
      const segs = cu.segments.map(g => ({ ...g }));
      // 把句首的收尾引號 」』 併回上一句，避免字幕開頭出現孤立引號
      for (let i = 1; i < segs.length; i++) { const m = segs[i].text.match(/^[」』]+/); if (m) { segs[i - 1].text += m[0]; segs[i].text = segs[i].text.slice(m[0].length); } }
      for (const g of segs) {
        const text = g.text.replace(/[，。；：、]+(?=[」』]*$)/g, '').trim(); if (!text) continue;
        const a = s.voiceStartFrame + Math.round(g.start * fps), b = s.voiceStartFrame + Math.round(g.end * fps);
        // 極少數過長的句子拆成兩塊，時間按字數分配
        const parts = text.length > 24 ? [text.slice(0, Math.ceil(text.length / 2)), text.slice(Math.ceil(text.length / 2))] : [text];
        let acc = 0; const tot = parts.reduce((x, p) => x + p.length, 0);
        for (const p of parts) { const s0 = a + Math.round((b - a) * acc / tot); acc += p.length; const s1 = a + Math.round((b - a) * acc / tot); if (s1 > s0) caps.push({ text: p, startFrame: s0, endFrame: s1 }); }
      }
    }
    // 句與句之間補到下一句起點，字幕不閃爍
    caps.sort((x, y) => x.startFrame - y.startFrame);
    for (let i = 0; i < caps.length - 1; i++) if (caps[i + 1].startFrame - caps[i].endFrame < 12) caps[i].endFrame = caps[i + 1].startFrame;
    t.captions = caps;
    t.captionTiming = 'silence-aligned (cues.json)';
  };

  function ctxFor(scene, localFrame, W, H) {
    const fps = T.fps, t = localFrame / fps, v0 = (scene.voiceStartFrame - scene.startFrame) / fps;
    const segs = CUES[scene.id].segments;
    const find = p => { const g = segs.find(x => x.text.includes(p)); if (!g) throw Error(`${scene.id}: 找不到句子「${p}」`); return g; };
    return { t, W, H, v0, dur: scene.durationFrames / fps, scene, fps,
      at: p => v0 + find(p).start, end: p => v0 + find(p).end, mid: p => { const g = find(p); return v0 + (g.start + g.end) / 2; } };
  }
  function draw(c, scene, localFrame, W, H) {
    const fn = SC[scene.id]; if (!fn) throw Error(`未實作場景 ${scene.id}`);
    c.save(); c.beginPath(); c.rect(0, 0, W, H); c.clip(); fn(c, ctxFor(scene, localFrame, W, H)); c.restore();
  }
  window.drawScene = (c, a) => {
    const { scene: s, localFrame, width: W, height: H, timeline: t } = a;
    const idx = t.scenes.indexOf(s), TR = 10;
    if (idx > 0 && localFrame < TR) {
      const e = E.io((localFrame + 1) / (TR + 1)), prev = t.scenes[idx - 1];
      c.save(); c.translate(-W * e, 0); draw(c, prev, prev.durationFrames - 1, W, H); c.restore();
      c.save(); c.translate(W * (1 - e), 0); draw(c, s, localFrame, W, H); c.restore();
      // 轉場縫線
      c.save(); c.fillStyle = 'rgba(34,52,79,.25)'; c.fillRect(W * (1 - e) - 6, 0, 6, H); c.restore();
    } else draw(c, s, localFrame, W, H);
  };
})();
