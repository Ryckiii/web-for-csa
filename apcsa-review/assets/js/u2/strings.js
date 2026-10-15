/* Unit 2 · §2.6–2.7 String objects and methods
   Native Web Components only; shares viz-code / viz-console with the existing page. */
import '../../../assets/js/components.js';

const STRING_STARTER = 'Welcome to Learn Java!';

function renderCode(host, source) {
  const code = document.createElement('viz-code');
  code.textContent = source;
  host.replaceChildren(code);
  return code;
}

function addButton(host, text, cls, onClick, attrs = {}) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = cls;
  b.textContent = text;
  Object.entries(attrs).forEach(([k, v]) => b.setAttribute(k, v));
  b.addEventListener('click', onClick);
  host.appendChild(b);
  return b;
}

function addLabel(host, text, input) {
  const label = document.createElement('label');
  label.className = 'u2-field';
  const caption = document.createElement('span');
  caption.textContent = text;
  label.append(caption, input);
  host.appendChild(label);
  return input;
}

function makeInput(type, value, cls = 'u2-input') {
  const input = document.createElement('input');
  input.type = type;
  input.className = cls;
  input.value = value;
  if (type === 'number') input.step = '1';
  return input;
}

class U2StringLife extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.step = 0;
    this.escapeMode = 'quote';
    this.concatMode = 'discard';
    this.innerHTML = `
      <div class="u2-string-life">
        <div class="u2-life-grid">
          <div>
            <h5 class="u2-lab-title">引用关系 · 每点一次执行一行</h5>
            <div class="u2-code-host" data-code></div>
            <div class="controls u2-control-row">
              <button class="btn-ghost step-btn" type="button" data-prev aria-label="上一步">◀</button>
              <button class="btn step-btn" type="button" data-next>▶ 执行下一行</button>
              <button class="btn-ghost step-btn" type="button" data-reset>⟲</button>
              <span class="u2-step-count" data-count aria-live="polite"></span>
            </div>
          </div>
          <div>
            <h5 class="u2-lab-title">Stack reference → Heap String</h5>
            <div class="u2-string-map" data-map aria-live="polite"></div>
          </div>
        </div>
        <p class="note-chip u2-live-note" data-note aria-live="polite"></p>

        <div class="u2-sub-lab">
          <div class="u2-sub-head">
            <h5 class="u2-lab-title">concat() 会返回新 String</h5>
            <div class="seg" role="group" aria-label="选择是否保存 concat 的返回值">
              <button type="button" data-concat="discard" aria-pressed="true">丢弃返回值</button>
              <button type="button" data-concat="assign" aria-pressed="false">保存返回值</button>
            </div>
          </div>
          <div class="u2-code-host" data-concat-code></div>
          <p class="u2-output-line" data-concat-result aria-live="polite"></p>
        </div>

        <div class="u2-sub-lab">
          <div class="u2-sub-head">
            <h5 class="u2-lab-title">Escape sequences · 源码里的转义，输出时还原</h5>
            <div class="u2-button-row" role="group" aria-label="选择转义序列">
              <button class="btn-ghost u2-escape-btn" type="button" data-escape="quote" aria-pressed="true">\\" 引号</button>
              <button class="btn-ghost u2-escape-btn" type="button" data-escape="slash" aria-pressed="false">\\\\ 反斜线</button>
              <button class="btn-ghost u2-escape-btn" type="button" data-escape="newline" aria-pressed="false">\\n 换行</button>
            </div>
          </div>
          <pre class="u2-code-sample"><code data-escape-code></code></pre>
          <div class="u2-escape-output" data-escape-output aria-live="polite"></div>
        </div>
      </div>`;

    this.codeHost = this.querySelector('[data-code]');
    this.code = renderCode(this.codeHost,
      'String s1 = "xy";\nString s2 = s1;\ns1 = s1 + s2 + "z";');
    this.map = this.querySelector('[data-map]');
    this.note = this.querySelector('[data-note]');
    this.count = this.querySelector('[data-count]');
    this.querySelector('[data-prev]').addEventListener('click', () => {
      this.step = Math.max(0, this.step - 1); this.renderStage();
    });
    this.querySelector('[data-next]').addEventListener('click', () => {
      this.step = Math.min(3, this.step + 1); this.renderStage();
    });
    this.querySelector('[data-reset]').addEventListener('click', () => {
      this.step = 0; this.renderStage();
    });
    this.querySelectorAll('[data-concat]').forEach(b => b.addEventListener('click', () => {
      this.concatMode = b.dataset.concat; this.renderConcat();
    }));
    this.querySelectorAll('[data-escape]').forEach(b => b.addEventListener('click', () => {
      this.escapeMode = b.dataset.escape; this.renderEscape();
    }));
    this.concatCodeHost = this.querySelector('[data-concat-code]');
    this.concatResult = this.querySelector('[data-concat-result]');
    this.escapeCode = this.querySelector('[data-escape-code]');
    this.escapeOutput = this.querySelector('[data-escape-output]');
    this.renderStage();
    this.renderConcat();
    this.renderEscape();
  }

  renderStage() {
    this.code.highlightLine(this.step - 1);
    this.count.textContent = `${this.step}/3 行`;
    this.querySelector('[data-prev]').disabled = this.step === 0;
    this.querySelector('[data-next]').disabled = this.step === 3;
    this.map.replaceChildren();

    const refs = document.createElement('div');
    refs.className = 'u2-string-ref-list';
    const heap = document.createElement('div');
    heap.className = 'u2-string-heap-list';
    const s1Target = this.step >= 3 ? 'str2' : (this.step >= 1 ? 'str1' : '');
    const s2Target = this.step >= 2 ? 'str1' : '';
    [
      { name: 's1', target: s1Target },
      { name: 's2', target: s2Target },
    ].forEach(({ name, target }) => {
      const row = document.createElement('div');
      row.className = 'u2-string-ref';
      const n = document.createElement('b'); n.textContent = name;
      const arrow = document.createElement('span'); arrow.className = 'u2-ref-arrow'; arrow.textContent = target ? '→' : '·';
      const dest = document.createElement('span'); dest.className = 'u2-ref-dest';
      dest.textContent = target ? `String object ${target}` : '尚未赋值';
      if (target) dest.dataset.target = target;
      row.append(n, arrow, dest); refs.appendChild(row);
    });
    const refTitle = document.createElement('div'); refTitle.className = 'u2-map-title'; refTitle.textContent = 'Stack · references';
    refs.prepend(refTitle);

    const heapTitle = document.createElement('div'); heapTitle.className = 'u2-map-title'; heapTitle.textContent = 'Heap · immutable objects';
    heap.appendChild(heapTitle);
    if (this.step >= 1) heap.appendChild(this.makeStringObject('str1', 'xy', s1Target === 'str1' || s2Target === 'str1'));
    if (this.step >= 3) heap.appendChild(this.makeStringObject('str2', 'xyxyz', s1Target === 'str2'));
    if (this.step === 0) {
      const empty = document.createElement('p'); empty.className = 'u2-empty-state'; empty.textContent = '执行第 1 行，创建第一个 String object。'; heap.appendChild(empty);
    }
    this.map.append(refs, heap);

    const notes = [
      '还没执行：先看看变量声明还没有指向任何 String。',
      '第 1 行：s1 指向内容为 "xy" 的 String object。',
      '第 2 行：s2 复制的是 reference；两个变量指向同一个 object。',
      '第 3 行：+ 产生新内容 "xyxyz"，s1 改指向新 object；s2 仍指向原来的 "xy"。',
    ];
    this.note.textContent = notes[this.step];
  }

  makeStringObject(id, value, live) {
    const card = document.createElement('div');
    card.className = 'u2-string-object' + (live ? ' live' : '');
    card.dataset.id = id;
    const label = document.createElement('span'); label.className = 'u2-object-label'; label.textContent = id;
    const contents = document.createElement('code'); contents.textContent = `"${value}"`;
    const badge = document.createElement('span'); badge.className = 'u2-immutable-badge'; badge.textContent = 'immutable';
    card.append(label, contents, badge);
    return card;
  }

  renderConcat() {
    this.querySelectorAll('[data-concat]').forEach(b => {
      const selected = b.dataset.concat === this.concatMode;
      b.setAttribute('aria-pressed', String(selected));
      b.classList.toggle('on', selected);
    });
    const source = this.concatMode === 'discard'
      ? 'String firstname = "Sachin";\nfirstname.concat(" Tendulkar");\nSystem.out.println(firstname);'
      : 'String firstname = "Sachin";\nfirstname = firstname.concat(" Tendulkar");\nSystem.out.println(firstname);';
    renderCode(this.concatCodeHost, source);
    this.concatResult.textContent = this.concatMode === 'discard'
      ? '输出：Sachin　（新 String 返回值没有保存，firstname 未改变）'
      : '输出：Sachin Tendulkar　（firstname 改为引用新 String）';
  }

  renderEscape() {
    const cases = {
      quote: {
        code: 'System.out.println("Hello, \\"David\\"");',
        output: 'Hello, "David"',
      },
      slash: {
        code: 'System.out.println("Great to see you all \\\\ welcome!");',
        output: 'Great to see you all \\ welcome!',
      },
      newline: {
        code: 'System.out.println("Welcome!\\nStudent to learn Java Programming");',
        output: 'Welcome!\nStudent to learn Java Programming',
      },
    };
    const current = cases[this.escapeMode];
    this.querySelectorAll('[data-escape]').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.escape === this.escapeMode));
    });
    this.escapeCode.textContent = current.code;
    this.escapeOutput.textContent = current.output;
  }
}

class U2StringMethods extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.method = 'length';
    this.innerHTML = `
      <div class="u2-string-methods">
        <div class="u2-method-input-row">
          <label class="u2-field u2-source-field"><span>String s</span><input class="u2-input" data-source maxlength="60" value="${STRING_STARTER}" aria-label="String s 的内容"></label>
          <button class="btn-ghost" type="button" data-reset>↺ 重置示例</button>
        </div>
        <div class="u2-index-wrap">
          <div class="u2-index-caption"><span>字符</span><span>index（从 0 开始）</span></div>
          <div class="u2-index-strip" data-strip role="list" aria-label="字符串字符及索引"></div>
        </div>
        <div class="u2-method-pills" role="group" aria-label="选择 String 方法"></div>
        <div class="u2-method-action">
          <div class="u2-method-args" data-args></div>
          <button class="btn" type="button" data-run>▶ Run method</button>
        </div>
        <div class="u2-code-host" data-code></div>
        <viz-console title="String method output"></viz-console>
        <p class="note-chip" data-note aria-live="polite">选择一个方法，调整参数，再看返回值。</p>
        <details class="u2-mini-details">
          <summary>toString()：为什么 object 可以直接打印或与 String 拼接？</summary>
          <p>对象转成字符串时会调用它的 <code>toString()</code>。自定义 class 可以 override 该方法来提供有意义的文本；不重写时默认结果通常不是对象的业务内容。</p>
          <div class="u2-code-host" data-tostring-code></div>
        </details>
      </div>`;

    this.sourceInput = this.querySelector('[data-source]');
    this.strip = this.querySelector('[data-strip]');
    this.argsHost = this.querySelector('[data-args]');
    this.codeHost = this.querySelector('[data-code]');
    this.console = this.querySelector('viz-console');
    this.note = this.querySelector('[data-note]');
    this.querySelector('[data-run]').addEventListener('click', () => this.runMethod());
    this.sourceInput.addEventListener('input', () => this.renderStrip());
    this.querySelector('[data-reset]').addEventListener('click', () => {
      this.sourceInput.value = STRING_STARTER;
      this.method = 'length';
      this.renderMethodButtons(); this.renderArgs(); this.renderStrip();
      renderCode(this.codeHost, `String s = ${JSON.stringify(STRING_STARTER)};\nSystem.out.println(s.length());`);
      this.console.clear();
      this.note.textContent = '选择一个方法，调整参数，再看返回值。';
    });
    this.tostringCodeHost = this.querySelector('[data-tostring-code]');
    renderCode(this.tostringCodeHost,
      'class Pet {\n    public String toString() { return "Rin"; }\n}\nSystem.out.println(new Pet()); // Rin');
    this.renderMethodButtons();
    this.renderArgs();
    this.renderStrip();
  }

  renderMethodButtons() {
    const host = this.querySelector('.u2-method-pills');
    host.replaceChildren();
    const methods = [
      ['length', 'length()'], ['charAt', 'charAt(i)'], ['substring2', 'substring(a, b)'],
      ['substring1', 'substring(a)'], ['indexOf', 'indexOf(text)'], ['equals', 'equals(other)'],
      ['compareTo', 'compareTo(other)'],
    ];
    methods.forEach(([value, label]) => {
      const b = addButton(host, label, 'u2-method-pill' + (value === this.method ? ' on' : ''), () => {
        this.method = value;
        this.renderMethodButtons(); this.renderArgs();
        this.console.clear();
        this.note.textContent = `已选择 ${label}；调整参数后运行查看结果。`;
      }, { 'aria-pressed': String(value === this.method) });
      b.dataset.method = value;
    });
  }

  renderArgs() {
    this.argsHost.replaceChildren();
    const addNum = (name, value, label) => {
      const input = makeInput('number', String(value));
      input.step = '1'; input.dataset.arg = name; input.setAttribute('aria-label', label);
      addLabel(this.argsHost, label, input);
    };
    const addText = (name, value, label) => {
      const input = makeInput('text', value); input.dataset.arg = name; input.maxLength = 40;
      input.setAttribute('aria-label', label);
      addLabel(this.argsHost, label, input);
    };
    switch (this.method) {
      case 'charAt': addNum('index', 5, 'index i'); break;
      case 'substring2': addNum('from', 2, 'from index'); addNum('to', 6, 'to index（不包含）'); break;
      case 'substring1': addNum('from', 2, 'from index'); break;
      case 'indexOf': addText('text', 'am', '查找 text'); break;
      case 'equals': case 'compareTo': addText('other', 'Welcome to Java!', '另一个 String'); break;
      default: break;
    }
  }

  renderStrip() {
    const source = this.sourceInput.value;
    this.strip.replaceChildren();
    if (!source.length) {
      const empty = document.createElement('span'); empty.className = 'u2-empty-state'; empty.textContent = '空字符串：length() = 0';
      this.strip.appendChild(empty); return;
    }
    for (let i = 0; i < source.length; i++) {
      const cell = document.createElement('div'); cell.className = 'u2-index-cell'; cell.setAttribute('role', 'listitem');
      const ch = document.createElement('b'); ch.textContent = source.charAt(i) === ' ' ? '␠' : source.charAt(i);
      const idx = document.createElement('span'); idx.textContent = String(i);
      cell.append(ch, idx); this.strip.appendChild(cell);
    }
  }

  javaCompareTo(a, b) {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
      const diff = a.charCodeAt(i) - b.charCodeAt(i);
      if (diff !== 0) return diff;
    }
    return a.length - b.length;
  }

  runMethod() {
    const s = this.sourceInput.value;
    const arg = name => this.argsHost.querySelector(`[data-arg="${name}"]`);
    let call = '';
    let result;
    let note = '';
    let error = '';
    const quote = value => JSON.stringify(value);
    const number = name => Number(arg(name)?.value ?? 0);
    switch (this.method) {
      case 'length':
        call = 'length()'; result = s.length; note = 'length() 返回字符数；Java String 的 index 范围是 0 到 length() - 1。'; break;
      case 'charAt': {
        const i = number('index'); call = `charAt(${i})`;
        if (!Number.isInteger(i) || i < 0 || i >= s.length) error = 'java.lang.StringIndexOutOfBoundsException';
        else { result = s.charAt(i); note = `index ${i} 对应第 ${i + 1} 个位置；index 从 0 开始。`; }
        break;
      }
      case 'substring2': {
        const from = number('from'), to = number('to'); call = `substring(${from}, ${to})`;
        if (![from, to].every(Number.isInteger) || from < 0 || to > s.length || from > to) error = 'java.lang.StringIndexOutOfBoundsException';
        else { result = s.substring(from, to); note = 'from 包含在结果中，to 不包含；允许 from == to，结果为空字符串。'; }
        break;
      }
      case 'substring1': {
        const from = number('from'); call = `substring(${from})`;
        if (!Number.isInteger(from) || from < 0 || from > s.length) error = 'java.lang.StringIndexOutOfBoundsException';
        else { result = s.substring(from); note = 'substring(from) 从 from 一直取到字符串末尾。'; }
        break;
      }
      case 'indexOf': {
        const text = arg('text').value; call = `indexOf(${quote(text)})`; result = s.indexOf(text);
        note = result === -1 ? '没有找到目标，indexOf 返回 -1。' : `返回第一次出现的位置 ${result}。`; break;
      }
      case 'equals': {
        const other = arg('other').value; call = `equals(${quote(other)})`; result = s === other;
        note = 'equals 比较字符串内容（区分大小写），不是比较变量是否指向同一对象。'; break;
      }
      case 'compareTo': {
        const other = arg('other').value; call = `compareTo(${quote(other)})`; result = this.javaCompareTo(s, other);
        note = result < 0 ? '结果 < 0：s 按字典序排在 other 前面。' : (result > 0 ? '结果 > 0：s 按字典序排在 other 后面。' : '结果 = 0：两个 String 内容相同。');
        break;
      }
      default: return;
    }

    const code = `String s = ${quote(s)};\nSystem.out.println(s.${call});`;
    renderCode(this.codeHost, code);
    this.console.clear();
    this.console.print(`s.${call}`, 'cmd');
    if (error) {
      this.console.print(error, 'err');
      this.note.textContent = '参数必须落在有效索引范围内；考试题会要求判断异常。';
    } else {
      const shown = typeof result === 'string' ? quote(result) : String(result);
      this.console.print(shown, 'res');
      this.note.textContent = note;
    }
  }
}

if (!customElements.get('u2-string-life')) customElements.define('u2-string-life', U2StringLife);
if (!customElements.get('u2-string-methods')) customElements.define('u2-string-methods', U2StringMethods);
