/* §1.1 沙盘：<u1-puzzle> 拼出第一个 Java 程序 + print/println 对照 */
import '../../../assets/js/components.js';
import { makeControls } from '../../../assets/js/components.js';

const CORRECT = [
  'public class FourthClass {',
  '    public static void main(String[] args) {',
  '        System.out.print("Hi ");',
  '        System.out.println("there!");',
  '    }',
  '}',
];
const BAG_ORDER = [3, 0, 4, 1, 5, 2];       // 打乱的拼块袋

class U1Puzzle extends HTMLElement {
  connectedCallback() {
    if (this._done) return; this._done = true;
    this.solved = false;
    this.slots = Array(CORRECT.length).fill(null);   // 每格放的 blockIndex

    const bag = document.createElement('div'); bag.className = 'bag';
    this.bagBtns = BAG_ORDER.map(bi => {
      const b = document.createElement('button');
      b.className = 'blk'; b.textContent = CORRECT[bi];
      b.style.textIndent = '0';
      b.addEventListener('click', () => this.place(bi));
      bag.appendChild(b); return b;
    });

    const slots = document.createElement('div'); slots.className = 'slots';
    this.slotEls = CORRECT.map((_, i) => {
      const s = document.createElement('button');
      s.className = 'slot'; s.dataset.hint = '点拼块放入这里';
      s.innerHTML = '<span class="txt" style="opacity:.45">＋ pick a block</span><span class="idx">' + (i + 1) + '</span>';
      s.addEventListener('click', () => this.unplace(i));
      slots.appendChild(s); return s;
    });

    const row = document.createElement('div'); row.className = 'pz-row';
    this.status = document.createElement('span'); this.status.className = 'pz-status';
    this.status.textContent = '目标：把 6 块拼成能编译运行的完整程序';
    this.runBtn = document.createElement('button');
    this.runBtn.className = 'btn'; this.runBtn.textContent = '▶ Run'; this.runBtn.disabled = true;
    this.runBtn.addEventListener('click', () => this.run());
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn-ghost'; resetBtn.textContent = '⟲ Reset';
    resetBtn.addEventListener('click', () => this.reset());

    this.modeSeg = document.createElement('span'); this.modeSeg.className = 'seg';
    this.modeSeg.style.display = 'none';
    this.modeSeg.innerHTML =
      '<button data-m="0" class="on">As-is</button>' +
      '<button data-m="1">Both println</button>' +
      '<button data-m="2">Both print</button>';
    this.mode = 0;
    this.modeSeg.querySelectorAll('button').forEach(b =>
      b.addEventListener('click', () => {
        this.mode = +b.dataset.m;
        this.modeSeg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      }));

    row.append(this.runBtn, resetBtn, this.modeSeg, this.status);
    const term = document.createElement('viz-console');
    term.setAttribute('title', 'Console');
    this.term = term;
    this.append(bag, slots, row, term);
  }

  firstEmpty() { return this.slots.findIndex(v => v === null); }

  place(bi) {
    if (this.solved) return;
    const i = this.firstEmpty();
    if (i < 0) return;
    this.slots[i] = bi;
    const s = this.slotEls[i];
    s.classList.add('filled');
    s.querySelector('.txt').textContent = CORRECT[bi];
    s.querySelector('.txt').style.opacity = '1';
    this.bagBtns[BAG_ORDER.indexOf(bi)].classList.add('placed');
    if (this.firstEmpty() < 0) this.check();
    else { this.status.className = 'pz-status'; this.status.textContent = '继续……还差 ' + (CORRECT.length - this.slots.filter(v => v !== null).length > 0 ? (CORRECT.length - this.slots.filter(v => v !== null).length) : 0) + ' 块'; }
  }

  unplace(i) {
    if (this.solved || this.slots[i] === null) return;
    const bi = this.slots[i];
    this.slots[i] = null;
    const s = this.slotEls[i];
    s.className = 'slot';
    s.querySelector('.txt').textContent = '＋ pick a block';
    s.querySelector('.txt').style.opacity = '.45';
    this.bagBtns[BAG_ORDER.indexOf(bi)].classList.remove('placed');
    this.status.className = 'pz-status'; this.status.textContent = '已退回一块，重新选';
  }

  check() {
    const badIdx = [];
    this.slots.forEach((bi, i) => { if (bi !== i) badIdx.push(i); });
    if (badIdx.length === 0) {
      this.solved = true;
      this.slotEls.forEach(s => s.classList.add('ok'));
      this.status.className = 'pz-status ok';
      this.status.textContent = '✓ 拼对了！点 Run 看输出，还能切换 print/println 模式';
      this.runBtn.disabled = false;
      this.modeSeg.style.display = '';
    } else {
      badIdx.forEach(i => {
        const s = this.slotEls[i];
        s.classList.add('bad');
        setTimeout(() => s.classList.remove('bad'), 400);
      });
      this.status.className = 'pz-status bad';
      this.status.textContent = `第 ${badIdx.map(i => i + 1).join('、')} 行好像不对——点错行可退回拼块`;
    }
  }

  async run() {
    this.runBtn.disabled = true;
    this.term.clear();
    // line2 = print("Hi ")  line3 = println("there!")
    const mode = this.mode; // 0 原样 1 全 println 2 全 print
    const stmts = mode === 0
      ? [{ txt: 'Hi ', nl: false }, { txt: 'there!', nl: true }]
      : mode === 1
        ? [{ txt: 'Hi ', nl: true }, { txt: 'there!', nl: true }]
        : [{ txt: 'Hi ', nl: false }, { txt: 'there!', nl: false }];
    let cur = '';
    let lineEl = this.term.print('', 'res');
    for (const st of stmts) {
      for (const ch of st.txt) { cur += ch; lineEl.textContent = cur; await wait(90); }
      await wait(320);
      if (st.nl) {
        lineEl.textContent = cur + ' ⏎';
        cur = '';
        if (st !== stmts[stmts.length - 1]) lineEl = this.term.print('', 'res');
      }
    }
    if (!stmts[stmts.length - 1].nl) lineEl.textContent = cur;
    this.term.print(`—— ${mode === 2 ? 'print 不换行，全部挤在一行' : mode === 1 ? '两个 println：每句结尾都换行 ⏎' : 'print 紧跟不换行，println 才换行'}`, 'dim');
    this.runBtn.disabled = false;

    function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  }

  reset() {
    this.solved = false;
    this.slots.fill(null);
    this.term.clear();
    this.runBtn.disabled = true;
    this.modeSeg.style.display = 'none';
    this.slotEls.forEach((s, i) => {
      s.className = 'slot';
      s.querySelector('.txt').textContent = '＋ pick a block';
      s.querySelector('.txt').style.opacity = '.45';
    });
    this.bagBtns.forEach(b => b.classList.remove('placed'));
    this.status.className = 'pz-status';
    this.status.textContent = '目标：把 6 块拼成能编译运行的完整程序';
  }
}
customElements.define('u1-puzzle', U1Puzzle);
