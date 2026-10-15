/* §2.5 guided counter demo: start with the visible behavior, reveal Java terminology afterwards. */
import '../../../assets/js/components.js';

const CAL_CODE = `class Cal {
    int x = 0; // each Cal object has its own x
    void count() {
        x = x + 1;
        System.out.println(x);
    }
    static int num = 0; // one num shared by the class
    static void count_static() {
        num = num + 1;
        System.out.println(num);
    }
}`;

class U2Static extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.xs = [0, 0, 0, 0];
    this.num = 0;
    this.mode = 'instance';

    this.innerHTML = `
      <div class="sl-guide">
        <p class="sl-intro">把 <code>Cal</code> 想成一种计数器。先试“每个计数器自己记”，再试“全班共用一块计数板”；先看数字怎么变，最后再看 Java 名词。</p>
        <div class="sl-mode-tabs" role="group" aria-label="选择计数方式">
          <button class="sl-mode-tab on" type="button" aria-pressed="true" data-mode="instance">① 每个对象自己记</button>
          <button class="sl-mode-tab" type="button" aria-pressed="false" data-mode="static">② 全班共用一份</button>
        </div>

        <section class="sl-mode-panel" data-panel="instance" aria-label="每个对象各自计数">
          <p class="sl-prompt" data-instance-note aria-live="polite">先点 c1 一次，再点 c2 一次。观察：是不是只有被点的那张卡数字变化？</p>
          <div class="sl-object-grid" data-instances></div>
          <p class="sl-console-caption">Console：方法里的 <code>System.out.println(x)</code> 实际打印的数字</p>
          <viz-console title="Console · 每个对象的输出" data-instance-console></viz-console>
        </section>

        <section class="sl-mode-panel" data-panel="static" aria-label="所有对象共用一份计数" hidden>
          <p class="sl-prompt" data-static-note aria-live="polite">下面只有一块共享计数板。点一次“共享计数 +1”，再点一次，观察同一个数字继续增加。</p>
          <div class="sl-class-frame">
            <div class="sl-class-heading"><b>Cal 这个 class</b><span>可以创建很多对象</span></div>
            <div class="sl-member-row" aria-label="Cal class 的四个示例对象">
              <span>c1</span><span>c2</span><span>c3</span><span>c4</span>
            </div>
            <p class="sl-shared-caption">这些对象共用 class 上的这一份数字：</p>
            <div class="sl-shared-board">
              <mem-box name="共享数字 num" value="0" class="shared" data-num></mem-box>
              <button class="sl-shared-button" type="button" data-static-call>共享计数 +1</button>
              <code class="sl-call-code">Cal.count_static()</code>
            </div>
          </div>
          <p class="sl-console-caption">Console：方法里的 <code>System.out.println(num)</code> 实际打印的数字</p>
          <viz-console title="Console · 全班共享的输出" data-static-console></viz-console>
        </section>

        <div class="sl-reset-row">
          <button class="btn-ghost" type="button" data-reset>⟲ 全部重置</button>
          <span>切换上方两幕时，数字会保留，方便来回比较。</span>
        </div>

        <details class="sl-after-details">
          <summary>看懂数字变化后：对应的 Java 术语</summary>
          <div class="sl-term-grid">
            <div><b>每张对象卡自己的数字 x</b><span>instance variable（实例变量）</span></div>
            <div><b>c1.count() 这样的对象按钮</b><span>instance method（实例方法）</span></div>
            <div><b>全班共享的唯一数字 num</b><span>static variable（静态变量）</span></div>
            <div><b>Cal.count_static() 共享按钮</b><span>static method（静态方法）</span></div>
          </div>
        </details>

        <details class="sl-code-details">
          <summary>最后再看对应的 Java 代码</summary>
          <viz-code data-java-code>${CAL_CODE}</viz-code>
        </details>
      </div>`;

    this.instanceNote = this.querySelector('[data-instance-note]');
    this.staticNote = this.querySelector('[data-static-note]');
    this.instanceConsole = this.querySelector('[data-instance-console]');
    this.staticConsole = this.querySelector('[data-static-console]');
    this.numBox = this.querySelector('[data-num]');
    this.code = this.querySelector('[data-java-code]');
    this.instanceCards = [];

    const host = this.querySelector('[data-instances]');
    this.xs.forEach((_, i) => {
      const card = document.createElement('div');
      card.className = 'sl-object-card';
      const heading = document.createElement('div'); heading.className = 'sl-object-heading';
      const name = document.createElement('b'); name.textContent = `c${i + 1}`;
      const kind = document.createElement('span'); kind.textContent = '一个 Cal 对象';
      heading.append(name, kind);
      const box = document.createElement('mem-box');
      box.setAttribute('name', '它自己的数字 x'); box.setAttribute('value', '0');
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'sl-personal-button';
      button.textContent = '记录一次';
      button.setAttribute('aria-label', `让 c${i + 1} 的个人数字加一`);
      button.addEventListener('click', () => this.callInstance(i));
      const code = document.createElement('code'); code.className = 'sl-call-code'; code.textContent = `c${i + 1}.count()`;
      card.append(heading, box, button, code);
      host.appendChild(card);
      this.instanceCards.push({ card, box });
    });

    this.querySelectorAll('[data-mode]').forEach(button => {
      button.addEventListener('click', () => this.setMode(button.dataset.mode));
    });
    this.querySelector('[data-static-call]').addEventListener('click', () => this.callStatic());
    this.querySelector('[data-reset]').addEventListener('click', () => this.reset());
    this.setMode('instance');
  }

  setMode(mode) {
    this.mode = mode;
    this.querySelectorAll('[data-mode]').forEach(button => {
      const selected = button.dataset.mode === mode;
      button.classList.toggle('on', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    this.querySelectorAll('[data-panel]').forEach(panel => {
      panel.hidden = panel.dataset.panel !== mode;
    });
    if (this.code && typeof this.code.highlightLine === 'function') {
      this.code.highlightLine(mode === 'instance' ? 3 : 8);
    }
  }

  callInstance(i) {
    this.xs[i]++;
    this.instanceCards[i].box.set(String(this.xs[i]));
    const card = this.instanceCards[i].card;
    card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash');
    this.instanceConsole.print(String(this.xs[i]), 'res');

    if (this.xs.every(value => value === 1)) {
      this.instanceNote.textContent = '四张卡各记了一次：每张都是 1。Console 里会出现四个 1，但它们来自四个各自独立的数字。';
    } else {
      this.instanceNote.textContent = `你点了 c${i + 1}：只有 c${i + 1} 的数字变成 ${this.xs[i]}；其他三张卡保持原值。Console 打印 ${this.xs[i]}。`;
    }
    this.setMode('instance');
  }

  callStatic() {
    this.num++;
    this.numBox.set(String(this.num));
    this.staticConsole.print(String(this.num), 'res');
    this.staticNote.textContent = `共享数字从 ${this.num - 1} 变成 ${this.num}。再按一次，同一个数字会继续增加；它不属于某一张 c 卡。Console 打印 ${this.num}。`;
    this.setMode('static');
  }

  reset() {
    this.xs = [0, 0, 0, 0]; this.num = 0;
    this.instanceCards.forEach(item => { item.box.set('0'); item.card.classList.remove('flash'); });
    this.numBox.set('0');
    this.instanceConsole.clear(); this.staticConsole.clear();
    this.instanceNote.textContent = '先点 c1 一次，再点 c2 一次。观察：是不是只有被点的那张卡数字变化？';
    this.staticNote.textContent = '下面只有一块共享计数板。点一次“共享计数 +1”，再点一次，观察同一个数字继续增加。';
    this.setMode('instance');
  }
}

if (!customElements.get('u2-static')) customElements.define('u2-static', U2Static);
