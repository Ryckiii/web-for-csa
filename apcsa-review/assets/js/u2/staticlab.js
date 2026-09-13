/* §2.5 招牌沙盘：<u2-static> instance method vs static method 对照实验
   左通道：4 个 object 各自带 count() 按钮；右通道：class 级共享 num + count_static() */
import '../../../assets/js/components.js';

class U2Static extends HTMLElement {
  connectedCallback() {
    if (this._done) return; this._done = true;
    this.xs = [0, 0, 0, 0];
    this.num = 0;
    this.printedL = [];
    this.printedR = [];

    const lanes = document.createElement('div'); lanes.className = 'sl-lanes';

    /* —— 左通道：Instance method —— */
    const laneL = document.createElement('div'); laneL.className = 'sl-lane';
    const hL = document.createElement('h5');
    hL.textContent = 'Instance method · 每个 object 各带一个 count()';
    const row = document.createElement('div'); row.className = 'objrow';
    this.inst = this.xs.map((_, i) => {
      const d = document.createElement('div'); d.className = 'objunit';
      const h = document.createElement('header'); h.textContent = 'c' + (i + 1);
      const m = document.createElement('mem-box');
      m.setAttribute('name', 'x'); m.setAttribute('value', '0');
      const b = document.createElement('button');
      b.className = 'count-btn'; b.textContent = 'count()';
      b.addEventListener('click', () => this.callInst(i));
      d.append(h, m, b); row.appendChild(d);
      return { unit: d, box: m };
    });
    this.seqL = document.createElement('div'); this.seqL.className = 'seq';
    this.msgL = document.createElement('div'); this.msgL.className = 'sl-msg';
    laneL.append(hL, row, this.seqL, this.msgL);

    /* —— 右通道：Static method —— */
    const laneR = document.createElement('div'); laneR.className = 'sl-lane';
    const hR = document.createElement('h5');
    hR.textContent = 'Static method · 调用的是 class 级那一份';
    const zone = document.createElement('div'); zone.className = 'clszone';
    zone.innerHTML = '<h5>class Cal（class level · 只有一份）</h5>';
    this.numBox = document.createElement('mem-box');
    this.numBox.setAttribute('name', 'num（static）');
    this.numBox.setAttribute('class', 'shared');
    this.numBox.setAttribute('value', '0');
    zone.appendChild(this.numBox);
    this.statBtn = document.createElement('button');
    this.statBtn.className = 'call-big'; this.statBtn.textContent = 'Cal.count_static()';
    this.statBtn.addEventListener('click', () => this.callStatic());
    this.seqR = document.createElement('div'); this.seqR.className = 'seq';
    this.msgR = document.createElement('div'); this.msgR.className = 'sl-msg';
    laneR.append(hR, zone, this.statBtn, this.seqR, this.msgR);

    lanes.append(laneL, laneR);

    this.term = document.createElement('viz-console'); this.term.setAttribute('title', 'Console');
    this.renderSeq(this.seqL, this.printedL);
    this.renderSeq(this.seqR, this.printedR);

    const bottom = document.createElement('div'); bottom.className = 'pz-row';
    const reset = document.createElement('button');
    reset.className = 'btn-ghost'; reset.textContent = '⟲ Reset';
    reset.addEventListener('click', () => this.reset());
    bottom.appendChild(reset);

    this.append(lanes, this.term, bottom);
  }

  callInst(i) {
    this.xs[i]++;
    this.inst[i].box.set(String(this.xs[i]));
    const u = this.inst[i].unit;
    u.classList.remove('flash'); void u.offsetWidth; u.classList.add('flash');
    const v = this.xs[i];
    this.printedL.push(v);
    this.term.print(`c${i + 1}.count() → ${v}`, 'res');
    this.renderSeq(this.seqL, this.printedL);
    if (this.xs.every(v => v === 1)) {
      this.msgL.innerHTML = '💡 四个 object 各调一次，输出 <b>1 1 1 1</b>：instance variable 是每个 object<b>各自一份</b>，都从自己的 0 开始。';
      this.msgL.style.color = 'var(--viz-green)';
    } else if (this.xs.every(v => v >= 1)) {
      this.msgL.innerHTML = '再调同一个 object，它自己的 x 才往上涨——x 永远跟着「那个 object」走。';
      this.msgL.style.color = 'var(--text-2)';
    }
  }

  callStatic() {
    this.num++;
    this.numBox.set(String(this.num));
    this.printedR.push(this.num);
    this.term.print(`Cal.count_static() → ${this.num}`, 'res');
    this.renderSeq(this.seqR, this.printedR);
    if (this.num === 4) {
      this.msgR.innerHTML = '💡 连调 4 次，输出 <b>1 2 3 4</b>：num 是 <b>static（class level）</b>，全体 object 共享<b>同一个盒子</b>。';
      this.msgR.style.color = 'var(--viz-green)';
    } else if (this.num > 4) {
      this.msgR.innerHTML = 'num 还在涨——它不属于任何一个 object，全 class 一辈子只有这一份。';
      this.msgR.style.color = 'var(--text-2)';
    }
  }

  renderSeq(el, arr) {
    el.innerHTML = arr.length
      ? `<span class="lbl">output so far:&nbsp;</span>${arr.join(' ')}`
      : '<span class="lbl">output so far:（还没有）</span>';
  }

  reset() {
    this.xs = [0, 0, 0, 0]; this.num = 0;
    this.printedL = []; this.printedR = [];
    this.inst.forEach(x => x.box.set('0'));
    this.numBox.set('0');
    this.term.clear();
    this.msgL.textContent = ''; this.msgR.textContent = '';
    this.renderSeq(this.seqL, this.printedL);
    this.renderSeq(this.seqR, this.printedR);
  }
}
customElements.define('u2-static', U2Static);
