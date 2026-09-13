/* §1.5 沙盘：<u1-cast-duel> casting 对照台（丢失的精度向上飘散，无落点） */
import { makeControls } from '../../../assets/js/components.js';

const wait = ms => new Promise(r => setTimeout(r, ms));

const LANES = [
  {
    title: 'double money = 5000 / 110;',
    tag: '先除法，后装箱',
    chips: ['5000 / 110', '45 (int)⚠', 'money = 45.0'],
    lost: '.4545…',
  },
  {
    title: 'double money = (double) 5000 / 110;',
    tag: '先转换，后除法',
    chips: ['(double) 5000 / 110', '5000.0 / 110', 'money = 45.454545…'],
  },
];
const STEP_NOTES = [
  '括号外的赋值都还没发生——注意力全在右边的 expression 上。',
  'A 道：两个操作数都是 int，integer division 先算完，小数部分当场丢掉；B 道：(double) 先把 5000 变成 5000.0。',
  'A 道：只剩 45 的结果装进 double → 45.0（丢失的精度一去不复返）。B 道：5000.0 / 110 里已有 double → 45.454545…',
];

class U1CastDuel extends HTMLElement {
  connectedCallback() {
    if (this._done) return; this._done = true;
    this.pos = -1;

    const lanesEl = document.createElement('div'); lanesEl.className = 'lanes';
    this.laneChips = LANES.map(lane => {
      const el = document.createElement('div'); el.className = 'lane';
      const h = document.createElement('h4'); h.textContent = lane.title;
      const tag = document.createElement('span');
      tag.className = 'chip'; tag.textContent = lane.tag; tag.style.fontSize = '.72rem';
      const box = document.createElement('div'); box.style.marginTop = '.4rem';
      const chips = lane.chips.map((c, i) => {
        const s = document.createElement('span');
        s.className = 'stage' + (i === lane.chips.length - 1 ? ' result' : '');
        s.textContent = c;
        box.appendChild(s);
        if (i < lane.chips.length - 1) {
          const a = document.createElement('span'); a.className = 'arrow'; a.textContent = ' → ';
          box.appendChild(a);
        }
        return s;
      });
      el.append(h, tag, box);
      lanesEl.appendChild(el);
      return chips;
    });

    this.note = document.createElement('div'); this.note.className = 'note-chip';
    this.note.textContent = '点 ▶ 逐步推进两条流水线';
    this.end = document.createElement('p'); this.end.className = 'duel-end';
    this.end.textContent = '结论：同样是 5000/110——(double) 写在哪，决定精度活不活得下来。';

    const ctl = makeControls({
      onReset: () => this.reset(),
      onPrev: () => this.move(-1),
      onNext: () => this.move(1),
    });
    this.prepend(ctl.el);
    this.append(lanesEl, this.note, this.end);
  }

  async move(d) {
    const next = Math.min(Math.max(this.pos + d, -1), LANES[0].chips.length - 1);
    if (next === this.pos) return;
    if (d > 0) {
      this.pos = next;
      this.laneChips.forEach((chips) => {
        chips.forEach((c, i) => {
          c.classList.toggle('now', i === this.pos);
          c.classList.toggle('done', i < this.pos);
        });
      });
      this.note.classList.add('hot');
      this.note.textContent = STEP_NOTES[this.pos] || '';
      setTimeout(() => this.note.classList.remove('hot'), 600);
      if (this.pos === 1) { await wait(300); this.throwAway(); }
      if (this.pos === LANES[0].chips.length - 1) this.end.classList.add('show');
    } else {
      this.pos = next;
      this.laneChips.forEach(chips => chips.forEach((c, i) => {
        c.classList.toggle('now', i === this.pos);
        c.classList.toggle('done', i < this.pos);
      }));
      this.note.textContent = STEP_NOTES[this.pos] || '点 ▶ 逐步推进两条流水线';
      this.end.classList.remove('show');
    }
  }

  /* A 道第二步：.4545… 向上飘散 */
  throwAway() {
    const chip = this.laneChips[0][1];
    if (!chip || !LANES[0].lost) return;
    const lane = chip.closest('.lane');
    const lr = lane.getBoundingClientRect();
    const from = chip.getBoundingClientRect();
    const fly = document.createElement('span');
    fly.className = 'fly fly-up';
    fly.textContent = LANES[0].lost;
    fly.style.left = (from.left - lr.left + from.width / 2) + 'px';
    fly.style.top = (from.top - lr.top - 6) + 'px';
    lane.appendChild(fly);
    requestAnimationFrame(() => {
      fly.style.opacity = '0';
      fly.style.transform = 'translate(10px,-40px) rotate(14deg) scale(.75)';
    });
    setTimeout(() => fly.remove(), 800);
  }

  reset() {
    this.pos = -1;
    this.laneChips.forEach(chips => chips.forEach(c => c.classList.remove('now', 'done')));
    this.end.classList.remove('show');
    this.note.classList.remove('hot');
    this.note.textContent = '点 ▶ 逐步推进两条流水线';
  }
}
customElements.define('u1-cast-duel', U1CastDuel);
