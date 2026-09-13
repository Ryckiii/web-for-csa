/* §1.4 沙盘：<u1-stepper> 复合赋值三联动步进器
   HTML 内预置结构：<viz-code> / mem-box[name] / <viz-console>，JS 接管联动 */
import { makeControls } from '../../../assets/js/components.js';

const wait = ms => new Promise(r => setTimeout(r, ms));

/* 每一帧：高亮行号、变量值、console 追加、旁注 */
const FRAMES = [
  { line: 0, score: '0', pen: '—', note: '声明并初始化：内存里给 score 分配 32 bits，放进 0' },
  { line: 1, log: '0', note: '打印当前 score → 0' },
  { line: 2, score: '1', note: 'score++ ＝ score = score + 1（先取旧值 0，算完放回去）' },
  { line: 3, log: '1', note: '打印 → 1' },
  { line: 4, score: '2', note: 'score *= 2 → score = 1 × 2 = 2' },
  { line: 5, log: '2', note: '打印 → 2' },
  { line: 6, pen: '5', note: '声明 penalty = 5' },
  { line: 7, score: '0', hot: true, note: '关键一步：先算 penalty/2 = 5/2 = 2（整数除法！），score = 2 − 2 = 0' },
  { line: 8, log: '0', note: '打印 → 0。如果是 score -= penalty / 2.0 就不是 0 了！' },
];

class U1Stepper extends HTMLElement {
  connectedCallback() {
    if (this._done) return; this._done = true;
    this.code = this.querySelector('viz-code');
    this.console = this.querySelector('viz-console');
    this.boxes = {};
    this.querySelectorAll('mem-box').forEach(m => { this.boxes[m.getAttribute('name')] = m; });
    this.note = this.querySelector('.note-chip');
    this.idx = 0;

    const ctl = makeControls({
      onReset: () => this.reset(),
      onPrev: () => this.move(-1),
      onNext: () => this.move(1),
      onPlay: playing => playing ? this.play() : this.stop(),
    });
    this.ctl = ctl;
    this.prepend(ctl.el);

    this.tabIndex = 0;
    this.setAttribute('role', 'application');
    this.setAttribute('aria-label', '复合赋值步进器，用左右方向键步进');
    this.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); this.move(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); this.move(-1); }
    });
    this.render();
  }

  apply(f) {
    this.code.highlightLine(f.line, { ghost: true });
    if (f.score !== undefined) this.boxes.score.set(f.score);
    if (f.pen !== undefined)   this.boxes.penalty.set(f.pen);
    if (f.log !== undefined)   this.console.print(f.log, 'res');
    if (this.note) {
      this.note.textContent = f.note;
      this.note.classList.toggle('hot', !!f.hot);
    }
  }

  render() {
    // 重播到 idx（idx 含义 = 已应用到第 idx 帧）
    this.console.clear();
    this.boxes.score.set('？'); this.boxes.penalty.set('？');
    this.code.highlightLine(-1);
    let snapshot = { score: undefined, pen: undefined };
    for (let k = 0; k <= this.idx; k++) {
      const f = FRAMES[k];
      if (f.score !== undefined) snapshot.score = f.score;
      if (f.pen !== undefined) snapshot.pen = f.pen;
      if (f.log !== undefined) this.console.print(f.log, 'res');
    }
    this.boxes.score.set(snapshot.score ?? '？');
    this.boxes.penalty.set(snapshot.pen ?? '？');
    const f = FRAMES[this.idx];
    this.code.highlightLine(f.line, { ghost: true });
    if (this.note) {
      this.note.textContent = f.note;
      this.note.classList.toggle('hot', !!f.hot);
    }
    // 去掉重播时的抖动：pulse 只保留最后一次（视觉可接受）
  }

  move(d) {
    const next = Math.min(Math.max(this.idx + d, 0), FRAMES.length - 1);
    if (next === this.idx) return;
    this.idx = next;
    this.render();
    if (this.idx === FRAMES.length - 1) { this.stop(); this.ctl.setPlaying(false); }
  }

  play() {
    this.stop();
    if (this.idx >= FRAMES.length - 1) { this.idx = 0; this.render(); }
    this._timer = setInterval(() => {
      this.move(1);
      if (this.idx >= FRAMES.length - 1) { this.stop(); this.ctl.setPlaying(false); }
    }, 1300);
  }
  stop() { if (this._timer) { clearInterval(this._timer); this._timer = null; } }

  reset() {
    this.stop(); this.ctl.setPlaying(false);
    this.idx = 0;
    this.render();
  }
}
customElements.define('u1-stepper', U1Stepper);
