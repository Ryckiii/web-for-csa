/* §1.2 附加小游戏：<u1-decl-game> 点出所有 declaration / initialization */
import '../../../assets/js/components.js';

const LINES = [
  { code: 'int numLives;',           decl: true,  init: false },
  { code: 'numLives = 0;',           decl: false, init: true },
  { code: 'double health;',          decl: true,  init: false },
  { code: 'double health = 8.5;',    decl: false, init: true },
  { code: 'boolean powerUp;',        decl: true,  init: false },
  { code: 'boolean powerUp = true;', decl: false, init: true },
];
const ROUNDS = [
  { key: 'decl', label: 'declaration（声明）', tip: '声明 = 给变量按类型分配内存，还没有塞值' },
  { key: 'init', label: 'initialization（初始化）', tip: '初始化 = 第一次把值放进变量里（含声明+赋值合体）' },
];

class U1DeclGame extends HTMLElement {
  connectedCallback() {
    if (this._done) return; this._done = true;
    this.round = 0;
    this.prompt = document.createElement('div');
    this.prompt.className = 'note-chip';
    this.linesEl = document.createElement('div');
    this.linesEl.className = 'dg-lines';
    this.status = document.createElement('div');
    this.status.className = 'pz-status';
    this.append(this.prompt, this.linesEl, this.status);
    this.startRound();
  }

  startRound() {
    const r = ROUNDS[this.round];
    this.left = LINES.filter(l => l[r.key]).length;
    this.prompt.className = 'note-chip';
    this.prompt.innerHTML = `第 ${this.round + 1}/2 轮：<b>点出所有 ${r.label}</b> —— ${r.tip}`;
    this.status.className = 'pz-status';
    this.status.textContent = `还要找出 ${this.left} 行`;
    this.linesEl.replaceChildren(...LINES.map(l => {
      const b = document.createElement('button');
      b.className = 'dg-line'; b.textContent = l.code;
      b.addEventListener('click', () => this.pick(b, l));
      return b;
    }));
  }

  pick(btn, line) {
    const r = ROUNDS[this.round];
    if (btn.disabled) return;
    if (line[r.key]) {
      btn.classList.add('ok'); btn.disabled = true;
      this.left--;
      this.status.className = 'pz-status ok';
      this.status.textContent = this.left > 0 ? `✓ 对！还剩 ${this.left} 行` : '✓ 全找到了！';
      if (this.left === 0) setTimeout(() => this.next(), 900);
    } else {
      btn.classList.add('bad');
      setTimeout(() => btn.classList.remove('bad'), 380);
      this.status.className = 'pz-status bad';
      this.status.textContent = line.decl || line.init
        ? '这行是另一种——注意看有没有类型名'
        : '✗ 这行是两轮都不算吗？再想想';
    }
  }

  next() {
    if (this.round === 0) { this.round = 1; this.startRound(); }
    else {
      this.prompt.className = 'note-chip';
      this.prompt.innerHTML = '<b style="color:var(--viz-green)">两轮都完成！</b> 记住：<code>double health = 8.5;</code> 这种"声明 + 赋值"合体算作 initialization。';
      this.status.textContent = '';
      const again = document.createElement('button');
      again.className = 'btn-ghost'; again.textContent = '↻ Replay';
      again.addEventListener('click', () => { this.round = 0; again.remove(); this.startRound(); });
      this.linesEl.after(again);
    }
  }
}
customElements.define('u1-decl-game', U1DeclGame);
