/* §2.1 沙盘：<u2-instantiator> 饼干模具：填属性 → new → 哐当落一块对象 */
import '../../../assets/js/components.js';

const EYE = ['Brown', 'Black', 'Blue', 'Green'];
const OBJ_COLORS = ['var(--viz-2)', 'var(--viz-3)', 'var(--viz-1)', 'var(--viz-7)', 'var(--viz-5)'];
const NAMES = ['Akash', 'Rin', 'David', 'Maya', 'Ken', 'Ada'];

class U2Instantiator extends HTMLElement {
  connectedCallback() {
    if (this._done) return; this._done = true;
    this.count = 0;

    const grid = document.createElement('div'); grid.className = 'mk-grid';

    /* —— 左：Class 卡片（蓝图 + 表单） —— */
    const cc = document.createElement('div'); cc.className = 'classcard';
    cc.innerHTML = `<h4>class Human</h4>
      <div class="fieldline">String name; String eyeColor; int age;　<span style="opacity:.7">// 属性清单</span></div>
      <hr style="border:none;border-top:1px dashed var(--border);margin:.5rem 0">`;
    this.inName = this.mkFld(cc, 'name', 'text', 'Akash');
    this.inAge = this.mkFld(cc, 'age', 'text', '37');
    const fldColor = document.createElement('div'); fldColor.className = 'fld';
    const lab = document.createElement('label'); lab.textContent = 'eyeColor';
    this.inColor = document.createElement('select'); this.inColor.className = 'xp-sel';
    EYE.forEach(c => { const o = document.createElement('option'); o.textContent = c; this.inColor.appendChild(o); });
    fldColor.append(lab, this.inColor);
    cc.appendChild(fldColor);

    const newBtn = document.createElement('button');
    newBtn.className = 'new-btn'; newBtn.textContent = 'new Human()';
    newBtn.addEventListener('click', () => this.instantiate());
    cc.appendChild(newBtn);
    const hint = document.createElement('p'); hint.className = 'hint';
    hint.textContent = '点一次 new，就有一块「对象」被创建出来——试试连点几次';
    cc.appendChild(hint);

    /* —— 右：对象工作台 —— */
    const right = document.createElement('div');
    this.bench = document.createElement('div'); this.bench.className = 'bench';
    this.bench.innerHTML = '<span class="empty">还没有对象。模具在手，new 一个不？</span>';
    this.countEl = document.createElement('div'); this.countEl.className = 'note-chip';
    this.countEl.textContent = '已创建 0 个对象';
    this.term = document.createElement('viz-console'); this.term.setAttribute('title', 'Console');
    right.append(this.bench, this.countEl, this.term);

    grid.append(cc, right);
    this.appendChild(grid);
  }

  mkFld(parent, label, type, def) {
    const d = document.createElement('div'); d.className = 'fld';
    const l = document.createElement('label'); l.textContent = label;
    const i = document.createElement('input');
    i.className = 'xp-in'; i.style.width = '7.5rem'; i.value = def;
    i.addEventListener('input', () => this.nextName = null);
    d.append(l, i); parent.appendChild(d);
    return i;
  }

  instantiate() {
    this.count++;
    const name = (this.inName.value.trim() || NAMES[(this.count - 1) % NAMES.length]);
    const age = this.inAge.value.trim() || '0';
    const eye = this.inColor.value;
    const color = OBJ_COLORS[(this.count - 1) % OBJ_COLORS.length];
    const oid = 'Human@' + (0x2a4f + this.count * 7919 % 0xffff).toString(16);

    const empty = this.bench.querySelector('.empty'); if (empty) empty.remove();
    const card = document.createElement('div');
    card.className = 'objcard';
    card.style.borderTop = `3px solid ${color}`;
    card.innerHTML = `<header>对象 #${this.count}</header>
      <span class="oid">${oid}</span><br>
      name = "${name}"<br>age = ${age}<br>eyeColor = "${eye}"`;
    const mrow = document.createElement('div'); mrow.className = 'mrow';
    const bWalk = this.mkMbtn('walk()');
    const bShow = this.mkMbtn('showInfo()');
    bWalk.addEventListener('click', () => {
      this.flash(card);
      this.term.print(`${name}  is walking`, 'res');
    });
    bShow.addEventListener('click', () => {
      this.flash(card);
      this.term.print(`── ${name} 的信息 ──`, 'res');
      this.term.print(`age = ${age} · eyeColor = ${eye}`, 'res');
    });
    mrow.append(bWalk, bShow);
    card.appendChild(mrow);
    this.bench.appendChild(card);
    this.bench.scrollTop = this.bench.scrollHeight;
    this.term.print(`new Human() → ${oid}（name="${name}"）`, 'cmd');

    this.countEl.classList.add('hot');
    this.countEl.textContent = this.count < 3
      ? `已创建 ${this.count} 个对象`
      : `已创建 ${this.count} 个 object —— Quiz 2-1-4 的答案：一个 class 想 new 多少都行，每个 object 各自一份 instance variable`;
    setTimeout(() => this.countEl.classList.remove('hot'), 600);
  }

  mkMbtn(label) {
    const b = document.createElement('button');
    b.className = 'mbtn'; b.textContent = label; return b;
  }
  flash(card) {
    card.classList.remove('speaking'); void card.offsetWidth; card.classList.add('speaking');
    setTimeout(() => card.classList.remove('speaking'), 900);
  }
}
customElements.define('u2-instantiator', U2Instantiator);
