/* §2.3 沙盘：<u2-callflow> 执行流步进器：高亮行"飞"进方法体，栈帧推入弹出 */
import { makeControls } from '../../../assets/js/components.js';

/* 帧 = { main, m(null 表示不在方法里), push/pop 用于动画, log, note } */
const FRAMES = [
  { main: 0, m: null, stack: [], note: '先 new 出对象 rin（构造器先跑）' },
  { main: 1, m: null, stack: ['rin.displayInformation()'], note: '调用发生！顺序执行被打断——控制流跳进方法体，栈帧 +1' },
  { main: 1, m: 0, stack: ['rin.displayInformation()'], log: 'Rin 的信息：', note: '开始在方法体里逐行执行（main 还停在调用那一行等着）' },
  { main: 1, m: 1, stack: ['rin.displayInformation()'], log: '  age = 16', note: '方法体第二行' },
  { main: 2, m: null, stack: [], note: '方法结束 → 弹栈，回到调用点的下一行（第 3 行）' },
  { main: 3, m: null, stack: ['ken.displayInformation()'], note: '第二个对象，同样的剧情再来一遍' },
  { main: 3, m: 0, stack: ['ken.displayInformation()'], log: 'Ken 的信息：' },
  { main: 3, m: 1, stack: ['ken.displayInformation()'], log: '  age = 17' },
  { main: 4, m: null, stack: [], note: '再次弹栈回来，执行最后一行' },
  { main: 4, m: null, stack: [], log: 'done', hot: true, note: '看 console：输出顺序就是"跳进去 → 执行完 → 回来"决定的（AP Skill 2.C）' },
];

class U2Callflow extends HTMLElement {
  connectedCallback() {
    if (this._done) return; this._done = true;
    this.codeMain = this.querySelector('#codeMain');
    this.codeM = this.querySelector('#codeM');
    this.stackEl = this.querySelector('.cstack');
    this.console = this.querySelector('viz-console');
    this.noteChip = this.querySelector('.note-chip');
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
    this.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); this.move(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); this.move(-1); }
    });
    this.render();
  }

  render() {
    const f = FRAMES[this.idx];
    this.codeMain.highlightLine(f.main, { ghost: true });
    this.codeM.highlightLine(f.m === null ? -1 : f.m, { ghost: true });

    /* 调用栈：main 常驻 + 各帧栈帧；长度没变则别重播动画 */
    const lenChanged = (this._lastStackLen ?? -1) !== f.stack.length;
    this._lastStackLen = f.stack.length;
    this.stackEl.classList.toggle('quiet', !lenChanged);
    this.stackEl.replaceChildren();
    const base = document.createElement('span');
    base.className = 'framechip base'; base.textContent = 'main(String[] args)';
    this.stackEl.appendChild(base);
    f.stack.forEach(s => {
      const c = document.createElement('span');
      c.className = 'framechip'; c.textContent = s;
      this.stackEl.appendChild(c);
    });

    /* console 重播 */
    this.console.clear();
    for (let k = 0; k <= this.idx; k++) if (FRAMES[k].log) this.console.print(FRAMES[k].log, 'res');

    if (this.noteChip) {
      this.noteChip.textContent = f.note;
      this.noteChip.classList.toggle('hot', !!f.hot);
    }
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
    this._timer = setInterval(() => {
      this.move(1);
      if (this.idx >= FRAMES.length - 1) { this.stop(); this.ctl.setPlaying(false); }
    }, 1400);
  }
  stop() { if (this._timer) { clearInterval(this._timer); this._timer = null; } }
  reset() { this.stop(); this.ctl.setPlaying(false); this.idx = 0; this.render(); }
}
customElements.define('u2-callflow', U2Callflow);
