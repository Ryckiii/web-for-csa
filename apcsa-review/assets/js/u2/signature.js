/* §2.2 / §2.4 沙盘：<u2-signature> 签名匹配判定（构造器 / 方法 / 混合三场）
   用法：<u2-signature kind="ctor|method|mix"> */
import '../../../assets/js/components.js';

const SETS = {
  ctor: {
    who: 'Cat',
    sigTitle: 'Cat 类里的两个构造器（签名墙）',
    sigs: ['Cat(String name, int age)', 'Cat(int age)'],
    calls: [
      { code: 'new Cat("Tom", 3)', ok: true, hit: 0 },
      { code: 'new Cat("Tom")', ok: false, err: 'error: cannot find symbol\n  symbol:   constructor Cat(String)　← 没有只收一个 String 的构造器' },
      { code: 'new Cat(3)', ok: true, hit: 1 },
      { code: 'new Cat("Tom", 3.5)', ok: false, err: 'error: incompatible types: possible lossy conversion from double to int' },
      { code: 'new Cat("Tom", "3")', ok: false, err: 'error: incompatible types: String cannot be converted to int　← 顺序对，类型不对' },
    ],
    tip: 'constructor 规则：名字 = class 名、<b>没有 return type</b>（连 void 都不写）、new 时自动调用；同名不同 signature = overloading。',
  },
  method: {
    who: 'c1（某个对象）',
    sigTitle: '同一类中重载的三个 add（签名墙）',
    sigs: ['add(String name, int x, int y)', 'add(int x, int y, int z)', 'add(double d, int x)'],
    calls: [
      { code: 'c1.add("Akash", 10, 15)', ok: true, hit: 0 },
      { code: 'c1.add(12, 13, "Akash")', ok: false, err: 'error: incompatible types: int cannot be converted to String　← 第一个参数就要 String' },
      { code: 'c1.add("Akash", 12.5, 12)', ok: false, err: 'error: incompatible types: possible lossy conversion from double to int' },
      { code: 'c1.add(1, 2, 3)', ok: true, hit: 1 },
      { code: 'c1.add(2.5, 4)', ok: true, hit: 2, note: 'int 4 → double 是 widening，自动放行' },
      { code: 'c1.add(1, 2)', ok: false, err: 'error: no suitable method found for add(int,int)　← 没有双 int 参数的签名' },
    ],
    tip: 'method 的 signature = 方法名 + <b>有序的参数 type 列表</b>。调用时实参的<b>顺序和类型</b>都要匹配；同名不同 signature = overloading，compiler 按 signature 选最合适的一个。',
  },
  mix: {
    who: '综合',
    sigTitle: '综合判定场：构造器 + 方法的签名都在这面墙上',
    sigs: ['Human(String name, int age)', 'Human(int age)', 'add(int x, int y, int z)', 'add(String s, int x, int y)', 'add(double d, int x)'],
    calls: [
      { code: 'new Human("David", 17)', ok: true, hit: 0 },
      { code: 'new Human("David", 5.5)', ok: false, err: 'error: incompatible types: possible lossy conversion from double to int' },
      { code: 'c1.add(1, 2, 3)', ok: true, hit: 2 },
      { code: 'c1.add("Rin", 3)', ok: false, err: 'error: no suitable method found for add(String,int)' },
      { code: 'c1.add(2.5, 3)', ok: true, hit: 4 },
      { code: 'new Human(32, "Adam", 75)', ok: false, err: 'error: no suitable constructor found Human(int,String,int)　← 参数个数/顺序都不匹配' },
    ],
    tip: 'signature 只看<b>方法名 + 参数 type 列表</b>，参数名 / return value 都不算——这就是 overloading 判定的全部规则。',
  },
};

class U2Signature extends HTMLElement {
  connectedCallback() {
    if (this._done) return; this._done = true;
    const S = SETS[this.getAttribute('kind') || 'ctor'] || SETS.ctor;
    this.S = S; this.right = 0; this.judged = 0;

    const wall = document.createElement('div'); wall.className = 'sig-wall';
    wall.innerHTML = `<h5>${S.sigTitle}</h5>`;
    this.sigEls = S.sigs.map(s => {
      const d = document.createElement('div'); d.className = 'sigline';
      d.textContent = s; wall.appendChild(d); return d;
    });

    this.score = document.createElement('div'); this.score.className = 'note-chip';
    this.score.textContent = `点下面每个调用，判断它能不能编译（${S.calls.length} 个）`;

    this.callsEl = document.createElement('div'); this.callsEl.className = 'calls';
    S.calls.forEach(c => {
      const chip = document.createElement('button');
      chip.className = 'callchip';
      chip.innerHTML = `<span>${c.code}</span><span class="verdict">？</span>`;
      const err = document.createElement('div'); err.className = 'jerr';
      err.textContent = c.err || '';
      chip.addEventListener('click', () => this.judge(chip, err, c));
      this.callsEl.append(chip, err);
    });

    const tip = document.createElement('p'); tip.className = 'hint';
    tip.innerHTML = '💡 ' + S.tip;

    const row = document.createElement('div'); row.className = 'pz-row'; row.style.marginTop = '.6rem';
    const again = document.createElement('button');
    again.className = 'btn-ghost'; again.textContent = '⟲ Reset';
    again.addEventListener('click', () => this.reset());
    row.appendChild(again);

    this.append(wall, this.score, this.callsEl, row, tip);
  }

  judge(chip, errEl, c) {
    if (chip.dataset.done === '1') return;
    chip.dataset.done = '1';
    this.judged++;
    if (c.ok) {
      this.right++;
      chip.classList.add('ok');
      chip.querySelector('.verdict').textContent = '✓ 能编译' + (c.note ? `（${c.note}）` : '');
      if (c.hit !== undefined && this.sigEls[c.hit]) {
        this.sigEls[c.hit].classList.add('hit');
      }
    } else {
      chip.classList.add('no');
      chip.querySelector('.verdict').textContent = '✗ 编译失败';
      errEl.classList.add('show');
    }
    const total = this.S.calls.length;
    this.score.classList.toggle('hot', this.judged === total);
    this.score.textContent = this.judged === total
      ? (this.right === total
        ? `全部判对！${total}/${total} —— 签名匹配这块已经拿捏`
        : `判定完成：${this.right}/${total} 个能编译 —— 看看编译器红字，规律全在报错文案里`)
      : `已判定 ${this.judged}/${total} · 能编译 ${this.right} 个`;
  }

  reset() {
    this.right = 0; this.judged = 0;
    this.sigEls.forEach(s => s.classList.remove('hit'));
    this.callsEl.querySelectorAll('.callchip').forEach(chip => {
      chip.dataset.done = ''; chip.classList.remove('ok', 'no');
      chip.querySelector('.verdict').textContent = '？';
    });
    this.callsEl.querySelectorAll('.jerr').forEach(e => e.classList.remove('show'));
    this.score.classList.remove('hot');
    this.score.textContent = `点下面每个调用，判断它能不能编译（${this.S.calls.length} 个）`;
  }
}
customElements.define('u2-signature', U2Signature);
