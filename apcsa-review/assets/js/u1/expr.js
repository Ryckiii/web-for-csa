/* §1.3 招牌沙盘：<u1-expr> 表达式实验室
   - preset 模式：仅 5 个既定展示按钮
   - free 模式：居中输入框
   - int÷int 截断时，小数尾巴向上飞出消散 */
import { makeControls } from '../../../assets/js/components.js';

/* ---------------- 微型解析器（递归下降） ---------------- */
const OPS = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };
let _nid = 0;
const num = (v, isInt, raw) => ({ kind: 'num', v, isInt, raw: raw ?? String(v), id: _nid++ });
const bin = (op, l, r) => ({ kind: 'bin', op, l, r, id: _nid++ });

function tokenize(str) {
  const m = str.match(/\d+(?:\.\d+)?|[+\-*/%()]/g);
  if (!m || m.join('').replace(/\s/g, '') !== str.replace(/\s/g, ''))
    throw new Error('只支持数字、+ - * / % 和括号哦');
  return m;
}
function parse(str) {
  const toks = tokenize(str);
  let i = 0;
  const peek = () => toks[i], next = () => toks[i++];
  function parseExpr(minP) {
    let left = parseAtom();
    while (peek() && OPS[peek()] >= (minP || 1)) {
      const op = next();
      const right = parseExpr(OPS[op] + 1);
      left = bin(op, left, right);
    }
    return left;
  }
  function parseAtom() {
    const t = next();
    if (t === '(') {
      const e = parseExpr(1);
      if (next() !== ')') throw new Error('括号没有配对');
      e.paren = true;
      return e;
    }
    if (t === '-') { const a = parseAtom(); a.neg = !a.neg; return a; }
    if (/^\d/.test(t)) {
      const isInt = !t.includes('.');
      return num(parseFloat(t), isInt, t);
    }
    throw new Error('看不懂 "' + t + '"');
  }
  const ast = parseExpr(1);
  if (i < toks.length) throw new Error('表达式末尾多了东西');
  return ast;
}

/* ---------------- 求值（产出逐格步骤） ---------------- */
const fmt = (v, isInt) => isInt
  ? String(Math.trunc(v))
  : parseFloat(v.toFixed(10)).toString();

function evalNode(node, steps) {
  if (node.kind === 'num') return { v: node.neg ? -node.v : node.v, isInt: node.isInt, text: (node.neg ? '-' : '') + node.raw };
  const L = evalNode(node.l, steps);
  const R = evalNode(node.r, steps);
  const bothInt = L.isInt && R.isInt;
  let v, isInt, trunc = null;

  if (bothInt) {
    switch (node.op) {
      case '+': v = L.v + R.v; break;
      case '-': v = L.v - R.v; break;
      case '*': v = L.v * R.v; break;
      case '%': v = L.v % R.v; break;
      case '/': {
        const real = L.v / R.v;
        v = Math.trunc(real);
        if (real !== v) trunc = { fracText: Math.abs(real - v).toFixed(4).replace(/0+$/, '').replace(/^0/, '') || '' };
        break;
      }
    }
    isInt = true;
  } else {
    const a = L.v, b = R.v;
    switch (node.op) {
      case '+': v = a + b; break;
      case '-': v = a - b; break;
      case '*': v = a * b; break;
      case '%': v = a % b; break;
      case '/': v = a / b; break;
    }
    isInt = false;
  }
  const res = { v, isInt, text: fmt(v, isInt) };
  steps.push({
    nodeId: node.id,
    desc: `${L.text} ${node.op} ${R.text}`,
    intNote: bothInt ? '两个操作数都是 int' : '出现了 double，按小数算',
    result: res.text, resultIsInt: isInt, trunc,
    modSelf: node.op === '%' && bothInt && Math.abs(L.v) < Math.abs(R.v) && L.v >= 0,
  });
  return res;
}

const PRESETS = [
  ['2 / 3', '经典整除'],
  ['2.0 / 3', '带 .0 就不同'],
  ['2 + 3 * 2', '优先级'],
  ['(2 + 3) * 2', '括号最大'],
  ['2 % 3', '取模小坑'],
];

/* ---------------- 自定义元素 ---------------- */
class U1Expr extends HTMLElement {
  connectedCallback() {
    if (this._done) return; this._done = true;
    this.build();
    this.load(this.mode === 'free' ? '5 / 2' : '2 / 3');
  }

  build() {
    this.mode = this.hasAttribute('free') ? 'free' : 'preset';
    this.currentSrc = null;

    /* —— 左侧：舞台 —— */
    this.stage = document.createElement('div'); this.stage.className = 'xp-stage';
    this.exprEl = document.createElement('div'); this.exprEl.className = 'xp-expr';
    this.fmtRow = document.createElement('div'); this.fmtRow.className = 'fmt-row';

    if (this.mode === 'free') {
      const bar = document.createElement('div'); bar.className = 'xp-bar';
      bar.style.justifyContent = 'center';                 // 输入框在舞台内居中
      this.input = document.createElement('input');
      this.input.className = 'xp-in'; this.input.style.width = '13rem';
      this.input.placeholder = '敲一个式子：2 + 3 * 2';
      this.input.value = '5 / 2';
      this.input.addEventListener('input', () => this.load(this.input.value));
      bar.append(this.input);
      this.stage.append(this.exprEl, this.fmtRow, bar);
    } else {
      const chips = document.createElement('div'); chips.className = 'chiprow';
      PRESETS.forEach(([code, label]) => {
        const a = document.createElement('a'); a.className = 'chip'; a.href = 'javascript:void 0';
        a.textContent = code; a.title = label;
        a.addEventListener('click', () => this.load(code));
        chips.appendChild(a);
      });
      this.stage.append(chips, this.exprEl, this.fmtRow);
    }

    /* —— 右侧：步骤列表 —— */
    const right = document.createElement('div');
    this.stepsEl = document.createElement('div'); this.stepsEl.className = 'xp-steps';
    this.resEl = document.createElement('div'); this.resEl.className = 'xpres';
    this.modNote = document.createElement('div'); this.modNote.className = 'note-chip';

    const ctl = makeControls({
      onPrev: () => this.stepBack(),
      onNext: () => this.stepNext(),
      onPlay: playing => playing ? this.play() : this.stop(),
    });
    this.ctl = ctl;
    right.append(ctl.el, this.stepsEl, this.resEl, this.modNote);

    const wrap = document.createElement('div'); wrap.className = 'xp';
    wrap.append(this.stage, right);
    this.append(wrap);
  }

  /* ---------- 载入 & 重置 ---------- */
  load(src) {
    this.stop();
    this.currentSrc = src;
    this.steps = []; this.idx = 0;
    this.stepsEl.replaceChildren(); this.modNote.textContent = ''; this.modNote.classList.remove('hot');
    this.exprEl.replaceChildren(); this.fmtRow.textContent = '';
    try {
      this.ast = parse(src);
      if (this.input) this.input.style.borderColor = '';
      const final = evalNode(this.ast, this.steps);
      this.final = final;
      this.renderExpr();
      this.stepEls = this.steps.map(st => {
        const d = document.createElement('div'); d.className = 'xstep';
        d.innerHTML = `<span class="mono"></span> → <b class="mono"></b>`;
        d.querySelectorAll('.mono')[0].textContent = st.desc;
        d.title = st.intNote;
        this.stepsEl.appendChild(d); return d;
      });
      const tail = document.createElement('div'); tail.className = 'xstep';
      tail.innerHTML = '<b>最终结果</b>　';
      this.tailEl = tail; this.stepsEl.appendChild(tail);
      this.resEl.innerHTML = '点 ▶ 或「▶ Auto」逐步求值——盯着每一步的 int / double 标签';
      this.updateSteps();
    } catch (err) {
      if (this.input) this.input.style.borderColor = 'var(--viz-red)';
      this.resEl.innerHTML = `<span style="color:var(--viz-red)">⚠ ${err.message}</span>`;
    }
  }

  renderExpr() { this.exprEl.innerHTML = this.nodeHTML(this.ast); }
  nodeHTML(n) {
    if (n.kind === 'num') return `<span class="xp-tok" data-n="${n.id}">${n.neg ? '-' : ''}${n.raw}</span>`;
    const inner = `${this.nodeHTML(n.l)} ${n.op} ${this.nodeHTML(n.r)}`;
    return `<span class="xp-tok" data-n="${n.id}">${n.paren ? '( ' + inner + ' )' : inner}</span>`;
  }
  tokEl(id) { return this.exprEl.querySelector(`.xp-tok[data-n="${id}"]`); }

  /* ---------- 步进 ---------- */
  stepNext() {
    if (!this.steps || this.idx >= this.steps.length) return;
    const st = this.steps[this.idx];
    const el = this.tokEl(st.nodeId);
    if (el) {
      el.classList.add('on');
      setTimeout(() => {
        el.classList.remove('on'); el.classList.add('folded');
        el.innerHTML = `${st.result} <span class="tag-${st.resultIsInt ? 'int' : 'dbl'}">${st.resultIsInt ? 'int' : 'double'}</span>`;
      }, 420);
    }
    if (st.trunc) setTimeout(() => this.throwAway(st), 430);
    if (st.modSelf) setTimeout(() => {
      this.modNote.classList.add('hot');
      this.modNote.textContent = 'x < y 时，x % y 的结果就是 x 自己——商是 0，整个 x 变成余数留下来';
    }, 460);
    this.idx++;
    this.updateSteps();
  }

  stepBack() {
    if (!this.steps || this.idx === 0 || !this.currentSrc) return;
    const target = this.idx - 1;
    this.load(this.currentSrc);
    while (this.idx < target) this.stepNextInstant();
  }
  stepNextInstant() {
    const st = this.steps[this.idx];
    const el = this.tokEl(st.nodeId);
    if (el) {
      el.classList.add('folded');
      el.innerHTML = `${st.result} <span class="tag-${st.resultIsInt ? 'int' : 'dbl'}">${st.resultIsInt ? 'int' : 'double'}</span>`;
    }
    this.idx++;
    this.updateSteps();
  }

  updateSteps() {
    if (!this.stepEls) return;
    this.stepEls.forEach((d, i) => {
      d.classList.toggle('done', i < this.idx);
      d.classList.toggle('now', i === this.idx);
      const st = this.steps[i];
      const b = d.querySelector('b.mono');
      if (i < this.idx && !b.textContent) b.textContent = st.result;
    });
    if (this.tailEl) {
      this.tailEl.classList.toggle('done', this.idx >= this.steps.length);
      if (this.idx >= this.steps.length) {
        this.tailEl.innerHTML = `<b>最终结果</b>　<span class="mono"><b>${this.final.text}</b> <span class="tag-${this.final.isInt ? 'int' : 'dbl'}">${this.final.isInt ? 'int' : 'double'}</span></span>`;
        this.resEl.textContent = '换个数 / 运算符再玩一次？';
        this.stop(); this.ctl.setPlaying(false);
      }
    }
  }

  /* 小数尾巴向上飞出消散（无落点，纯示意"被丢掉"） */
  throwAway(st) {
    const el = this.tokEl(st.nodeId);
    if (!el || !st.trunc.fracText) return;
    const stageRect = this.stage.getBoundingClientRect();
    const from = el.getBoundingClientRect();
    const fly = document.createElement('span');
    fly.className = 'fly fly-up';
    fly.textContent = st.trunc.fracText;
    fly.style.left = (from.left - stageRect.left + from.width / 2 - 8) + 'px';
    fly.style.top = (from.top - stageRect.top - 8) + 'px';
    this.stage.appendChild(fly);
    requestAnimationFrame(() => {
      fly.style.opacity = '0';
      fly.style.transform = 'translate(14px,-46px) rotate(18deg) scale(.75)';
    });
    setTimeout(() => fly.remove(), 800);
    this.fmtRow.textContent = `${st.desc} 的小数部分 ${st.trunc.fracText} 被 integer division 丢掉了（不是四舍五入！）`;
  }

  play() {
    this.stop();
    this._timer = setInterval(() => {
      if (this.idx >= this.steps.length) { this.stop(); this.ctl.setPlaying(false); return; }
      this.stepNext();
      if (this.idx >= this.steps.length) this.ctl.setPlaying(false);
    }, 1100);
  }
  stop() { if (this._timer) { clearInterval(this._timer); this._timer = null; this.ctl && this.ctl.setPlaying(false); } }
}
customElements.define('u1-expr', U1Expr);
