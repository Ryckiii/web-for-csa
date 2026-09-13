/* §1.2 沙盘：<u1-type-game> 生活场景选类型 + 内存位宽抽屉 */
import '../../../assets/js/components.js';

const SCENARIOS = [
  { sc: '课程平均 GPA（比如 86.7）',     t: 'double',  v: 'GPA',           hint: '平均分通常带小数' },
  { sc: '家里有几口人',                   t: 'int',     v: 'familyMembers', hint: '人口只能是整数' },
  { sc: '现在外面在下雨吗',               t: 'boolean', v: 'isRaining',     hint: '只有 是/否 两种取值' },
  { sc: '同桌的名字',                     t: 'String',  v: 'buddyName',     hint: '文字要用引用类型 String' },
  { sc: '存钱罐里的钱（19.87 元）',        t: 'double',  v: 'money',         hint: '钱数常带小数' },
  { sc: '全班的学生人数',                 t: 'int',     v: 'numStudents',   hint: '人数是整数' },
  { sc: '演唱会门票是不是售罄了',          t: 'boolean', v: 'soldOut',       hint: '是/否 二选一' },
  { sc: '最喜欢的一句歌词',               t: 'String',  v: 'lyric',         hint: '一句话就是一段文本' },
  { sc: '今早量的体温（36.5℃）',          t: 'double',  v: 'temp',          hint: '体温有小数点' },
];
const TYPES = ['int', 'double', 'boolean', 'String'];
const BITS = { int: { w: '50%', label: '32 bits' }, double: { w: '100%', label: '64 bits' }, 'boolean': { w: '4%', label: '≥ 1 bit' }, String: null };
const wait = ms => new Promise(r => setTimeout(r, ms));

class U1TypeGame extends HTMLElement {
  connectedCallback() {
    if (this._done) return; this._done = true;
    this.deck = SCENARIOS.map((_, i) => i).sort(() => Math.random() - .5);
    this.pos = 0; this.score = 0; this.streak = 0;

    this.scoreEl = document.createElement('div');
    this.scoreEl.className = 'score';
    this.scoreEl.innerHTML = '进度 <b>0/' + this.deck.length + '</b>　连对 <b>0</b>　点卡片下方的类型作答';

    this.card = document.createElement('div'); this.card.className = 'tg-card';
    this.card.innerHTML = '<span class="sc"></span><span class="sub">它该用什么类型存储？</span>';

    this.types = document.createElement('div'); this.types.className = 'tg-types';
    this.typeBtns = TYPES.map(t => {
      const b = document.createElement('button');
      b.className = 'tg-type'; b.dataset.t = t; b.textContent = t;
      b.addEventListener('click', () => this.pick(b, t));
      this.types.appendChild(b); return b;
    });

    this.hint = document.createElement('div'); this.hint.className = 'tg-hint';

    this.drawer = document.createElement('div'); this.drawer.className = 'tg-drawer';
    this.drawer.innerHTML =
      '<div class="bitbar"><span class="bitfill"></span><span class="bits"></span></div>' +
      '<span class="tg-decl"></span>';

    this.append(this.scoreEl, this.card, this.types, this.hint, this.drawer);
    this.show();
  }

  cur() { return SCENARIOS[this.deck[this.pos]]; }

  show() {
    const c = this.cur();
    if (!c) return this.finish();
    this.card.querySelector('.sc').textContent = c.sc;
    this.hint.textContent = '';
    this.drawer.classList.remove('live');
    this.typeBtns.forEach(b => { b.className = 'tg-type'; b.disabled = false; });
    this.renderScore();
  }

  async pick(btn, t) {
    const c = this.cur();
    if (t !== c.t) {
      this.streak = 0;
      btn.classList.add('bad');
      setTimeout(() => btn.classList.remove('bad'), 380);
      this.hint.textContent = '✗ 再想想：' + c.hint;
      this.renderScore();
      return;
    }
    // 答对
    btn.classList.add('ok');
    this.streak++; this.score++;
    this.hint.textContent = '';
    this.typeBtns.forEach(b => b.disabled = true);

    const fill = this.drawer.querySelector('.bitfill');
    const bits = this.drawer.querySelector('.bits');
    const decl = this.drawer.querySelector('.tg-decl');
    const meta = BITS[c.t];
    fill.style.setProperty('--ac', `var(--viz-${c.t === 'int' ? 2 : c.t === 'double' ? 1 : c.t === 'boolean' ? 3 : 7})`);
    if (meta) {
      this.drawer.querySelector('.bitbar').style.display = '';
      fill.style.width = '2%';
      bits.textContent = '';
      this.drawer.classList.add('live');
      decl.textContent = '';
      await wait(60);
      fill.style.width = meta.w;                       // 抽屉拉开动画
      bits.textContent = meta.label;
      await wait(320);
      decl.textContent = `${c.t} ${c.v};`;              // 声明落笔
    } else {
      this.drawer.querySelector('.bitbar').style.display = 'none';
      this.drawer.classList.add('live');
      decl.textContent = `String ${c.v};  // 引用类型 → 指向堆里的一串字符`;
    }
    this.renderScore();
    await wait(1400);
    this.pos++;
    this.show();
  }

  renderScore() {
    const done = Math.min(this.pos + (this.typeBtns[0].disabled ? 1 : 0), this.deck.length);
    this.scoreEl.innerHTML =
      `进度 <b>${done}/${this.deck.length}</b>　连对 <b>${this.streak}</b>` +
      (this.deck.length - done > 0 ? `　还剩 ${this.deck.length - done} 张场景卡` : '');
  }

  finish() {
    this.card.querySelector('.sc').textContent = '全部场景分类完毕！';
    this.card.querySelector('.sub').textContent = '口诀：整数 int · 小数 double · 是非 boolean · 文字 String';
    this.types.style.display = 'none';
    this.hint.textContent = '';
    const again = document.createElement('button');
    again.className = 'btn'; again.textContent = '↻ Replay';
    again.addEventListener('click', () => {
      this.pos = 0; this.score = 0; this.streak = 0;
      this.deck.sort(() => Math.random() - .5);
      this.types.style.display = '';
      this.drawer.classList.remove('live');
      again.remove();
      this.show();
    });
    this.scoreEl.after(again);
    this.renderScore();
  }
}
customElements.define('u1-type-game', U1TypeGame);
