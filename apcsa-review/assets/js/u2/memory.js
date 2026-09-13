/* §2.2 招牌沙盘：<u2-memory> 栈与堆 + NullPointerException
   帧驱动：每一步都是完整状态描述，渲染纯函数化 → prev/next 天然可逆 */
import { makeControls } from '../../../assets/js/components.js';

const H1 = { id: 'h1', cls: 'Human', fields: [['name', '"Akash"'], ['age', '37'], ['height', '5.5']] };
const H2 = { id: 'h2', cls: 'Human', fields: [['name', '"David"'], ['age', '17'], ['height', '5.7']] };

const FRAMES = [
  { line: 0, stack: [{ v: 'a', t: 'h1' }], heap: ['h1'],
    note: 'new 在堆里造对象；栈里的引用变量 a 用一根线指向它' },
  { line: 1, stack: [{ v: 'a', t: 'h1' }, { v: 'd', t: 'h2' }], heap: ['h1', 'h2'],
    note: '再来一次：d 指向第二个对象。每个对象各自一份实例变量' },
  { line: 2, stack: [{ v: 'a', t: 'h1' }, { v: 'd', t: 'h2' }], heap: ['h1', 'h2'],
    log: ['Akash  is walking'], note: '用点运算符调非静态方法：引用变量.方法名()' },
  { line: 3, stack: [{ v: 'a', t: null, was: 'h1' }, { v: 'd', t: 'h2' }], heap: ['h1', 'h2'],
    note: 'a = null：箭头断了！a 不再指向任何对象（h1 没人引用了）' },
  { line: 4, stack: [{ v: 'a', t: null, was: 'h1' }, { v: 'd', t: 'h2' }], heap: ['h1', 'h2'],
    npe: true, hot: true,
    log: ['Exception in thread "main" java.lang.NullPointerException', '        at Human.main(Human.java:24)'],
    note: '对 null 调方法 → 运行期直接爆炸：NullPointerException，程序挂掉' },
];

class U2Memory extends HTMLElement {
  connectedCallback() {
    if (this._done) return; this._done = true;
    this.code = this.querySelector('viz-code');
    this.area = this.querySelector('.mem-area');
    this.stackPane = this.querySelector('#stackPane .stack-frame');
    this.heapPane = this.querySelector('#heapPane');
    this.console = this.querySelector('viz-console');
    this.noteChip = this.querySelector('.note-chip');
    this.npeBanner = this.querySelector('.npe-banner');
    this.idx = 0;
    this._prevHeap = [];

    /* 箭头图层 */
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'wires');
    this.svg.innerHTML = `<defs data-keep="1"><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5"
      markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path data-keep="1" d="M0,0 L10,5 L0,10 z" fill="var(--viz-3)"></path></marker></defs>`;
    this.area.appendChild(this.svg);

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
    this.setAttribute('aria-label', '栈与堆内存沙盘，用左右方向键步进');
    this.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); this.move(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); this.move(-1); }
    });
    this._ro = new ResizeObserver(() => this.drawWires());
    this._ro.observe(this.area);
    this.render(true);
  }

  /* —— 从 0 重播、按帧建 DOM；新建对象才有入场动画 —— */
  render(first) {
    const f = FRAMES[this.idx];
    /* 代码行高亮 */
    this.code.highlightLine(f.line, { ghost: true });
    /* 栈 */
    this.stackPane.querySelectorAll('.stack-var').forEach(e => e.remove());
    const varEls = {};
    f.stack.forEach(sv => {
      const d = document.createElement('div');
      d.className = 'stack-var' + (sv.t === null ? ' isnull' : '');
      d.dataset.var = sv.v;
      d.innerHTML = `<b>${sv.v}</b>: Human = <span class="val">${sv.t === null ? 'null' : '→ Heap 对象'}</span>`;
      this.stackPane.appendChild(d);
      varEls[sv.v] = d;
    });
    /* 堆 */
    this._prevHeap = this._curHeap || [];
    const newIds = f.heap.filter(id => !this._prevHeap.includes(id));
    this.heapPane.classList.add('quiet');
    this.heapPane.querySelectorAll('.heap-obj').forEach(e => e.remove());
    const objEls = {};
    f.heap.forEach(id => {
      const m = id === 'h1' ? H1 : H2;
      const d = document.createElement('div');
      d.className = 'heap-obj';
      d.dataset.id = id;
      d.innerHTML = `<header>${m.cls} 对象 <span class="oid">${id === 'h1' ? '#1' : '#2'}</span></header>` +
        m.fields.map(([k, v]) => `${k} = ${v}`).join('<br>');
      if (newIds.includes(id)) d.style.animation = '';   // 新对象播放 objIn
      else d.style.animation = 'none';
      this.heapPane.appendChild(d);
      objEls[id] = d;
    });
    this._curHeap = f.heap;
    this._vars = f.stack.map(sv => ({ ...sv, el: varEls[sv.v] }));

    /* console（重播累计输出） */
    this.console.clear();
    for (let k = 0; k <= this.idx; k++) {
      const fr = FRAMES[k];
      if (fr.log) fr.log.forEach(l => this.console.print(l, fr.npe ? 'err' : 'res'));
    }

    /* 旁注 & NPE 横幅 */
    if (this.noteChip) {
      this.noteChip.textContent = f.note;
      this.noteChip.classList.toggle('hot', !!f.hot);
    }
    if (this.npeBanner) this.npeBanner.classList.toggle('show', !!f.npe && this.idx === FRAMES.length - 1);

    requestAnimationFrame(() => this.drawWires());
  }

  drawWires() {
    const f = FRAMES[this.idx];
    const ar = this.area.getBoundingClientRect();
    this.svg.setAttribute('viewBox', `0 0 ${ar.width} ${ar.height}`);
    this.svg.querySelectorAll('path').forEach(p => { if (!p.dataset.keep) p.remove(); });
    const mkPath = (d, cls = '') => {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d); p.setAttribute('class', cls);
      p.setAttribute('marker-end', 'url(#arr)');
      this.svg.appendChild(p); return p;
    };
    (this._vars || []).forEach(sv => {
      const fromEl = sv.el;
      const toEl = sv.t ? this.heapPane.querySelector(`.heap-obj[data-id="${sv.t}"]`) : null;
      if (toEl) {
        const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
        const x1 = a.right - ar.left, y1 = a.top + a.height / 2 - ar.top;
        const x2 = b.left - ar.left + 4, y2 = b.top + 14 - ar.top;
        const mx = (x1 + x2) / 2;
        mkPath(`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2 - 3} ${y2}`);
      } else if (sv.was) {
        /* 断掉的箭头：先画出断口一截，下一帧再加 .dying 触发淡出 */
        const dead = this.heapPane.querySelector(`.heap-obj[data-id="${sv.was}"]`);
        if (dead) {
          const a = fromEl.getBoundingClientRect(), b = dead.getBoundingClientRect();
          const x1 = a.right - ar.left, y1 = a.top + a.height / 2 - ar.top;
          const x2 = x1 + Math.min(46, (b.left - ar.left - x1) / 3), y2 = y1 - 10;
          const p = mkPath(`M ${x1} ${y1} Q ${x1 + 18} ${y1}, ${x2} ${y2}`);
          p.style.stroke = 'var(--viz-6)'; p.style.strokeDasharray = '7 5';
          requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('dying')));
        }
      }
    });
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
    }, 1600);
  }
  stop() { if (this._timer) { clearInterval(this._timer); this._timer = null; } }
  reset() { this.stop(); this.ctl.setPlaying(false); this.idx = 0; this.render(); }
}
customElements.define('u2-memory', U2Memory);
