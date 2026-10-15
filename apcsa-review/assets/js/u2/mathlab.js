/* Unit 2 · §2.9 Math class: static methods and random integer ranges. */
import '../../../assets/js/components.js';

function mathCode(host, source) {
  const code = document.createElement('viz-code');
  code.textContent = source;
  host.replaceChildren(code);
}

function field(labelText, value, step = 'any') {
  const label = document.createElement('label'); label.className = 'u2-field';
  const caption = document.createElement('span'); caption.textContent = labelText;
  const input = document.createElement('input'); input.className = 'u2-input'; input.type = 'number'; input.step = step; input.value = String(value);
  input.setAttribute('aria-label', labelText);
  label.append(caption, input);
  return { label, input };
}

class U2MathLab extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.method = 'abs';
    this.innerHTML = `
      <div class="u2-math-lab">
        <div class="u2-math-workbench">
          <div>
            <h5 class="u2-lab-title">静态方法试算台 · 通过 Math.method(...) 调用</h5>
            <div class="u2-math-methods" role="group" aria-label="选择 Math 静态方法"></div>
            <div class="u2-math-args" data-args></div>
            <div class="u2-button-row u2-math-actions">
              <button class="btn" type="button" data-run>▶ 运行 Math 方法</button>
              <button class="btn-ghost" type="button" data-reset>⟲ 重置</button>
            </div>
            <div class="u2-code-host" data-code></div>
            <viz-console title="Math method output"></viz-console>
          </div>
          <aside class="u2-math-aside">
            <div class="u2-math-stamp">static</div>
            <p><code>Math</code> 是 <code>java.lang</code> 中的工具类。方法属于 class，直接写 <code>Math.abs(...)</code>；不需要 <code>new Math()</code>。</p>
            <p class="u2-small-note"><code>pow</code>、<code>sqrt</code> 和 <code>random</code> 返回 <code>double</code>；<code>abs</code>、<code>min</code>、<code>max</code> 会根据参数类型选择对应重载。</p>
          </aside>
        </div>

        <div class="u2-sub-lab u2-random-lab">
          <div class="u2-random-intro">
            <div>
              <h5 class="u2-lab-title">Math.random() → 指定范围内的 int</h5>
              <p>先产生 <code>0.0 ≤ r &lt; 1.0</code>，乘以区间格数、截断，再平移到起点。</p>
            </div>
            <div class="u2-formula"><code>(int)(Math.random() * (max - min + 1)) + min</code></div>
          </div>
          <div class="u2-random-controls">
            <label class="u2-field"><span>min（包含）</span><input class="u2-input" data-min type="number" min="-2147483648" max="2147483647" step="1" value="1" aria-label="随机整数最小值，包含"></label>
            <label class="u2-field"><span>max（包含）</span><input class="u2-input" data-max type="number" min="-2147483648" max="2147483647" step="1" value="4" aria-label="随机整数最大值，包含"></label>
            <button class="btn" type="button" data-roll>🎲 Roll</button>
          </div>
          <div class="u2-range-track" data-range role="img" aria-label="可能产生的整数范围"></div>
          <p class="note-chip" data-range-note aria-live="polite">当前范围：1 到 4，包含两端；每次 Roll 都会重新抽取。</p>
          <viz-console title="Random range output"></viz-console>
        </div>
      </div>`;

    this.methodsHost = this.querySelector('.u2-math-methods');
    this.argsHost = this.querySelector('[data-args]');
    this.codeHost = this.querySelector('[data-code]');
    this.methodConsole = this.querySelector('.u2-math-workbench viz-console');
    this.randomConsole = this.querySelector('.u2-random-lab viz-console');
    this.minInput = this.querySelector('[data-min]');
    this.maxInput = this.querySelector('[data-max]');
    this.range = this.querySelector('[data-range]');
    this.rangeNote = this.querySelector('[data-range-note]');
    this.querySelector('[data-run]').addEventListener('click', () => this.runMethod());
    this.querySelector('[data-reset]').addEventListener('click', () => this.resetMethods());
    this.querySelector('[data-roll]').addEventListener('click', () => this.rollRange());
    this.minInput.addEventListener('input', () => this.renderRange());
    this.maxInput.addEventListener('input', () => this.renderRange());
    this.renderMethodButtons();
    this.renderArgs();
    this.renderRange();
    mathCode(this.codeHost, 'System.out.println(Math.abs(-5.5));');
  }

  renderMethodButtons() {
    this.methodsHost.replaceChildren();
    const methods = [
      ['abs', 'abs(x)'], ['pow', 'pow(base, exp)'], ['sqrt', 'sqrt(x)'],
      ['min', 'min(a, b)'], ['max', 'max(a, b)'], ['random', 'random()'],
    ];
    methods.forEach(([value, label]) => {
      const b = document.createElement('button'); b.type = 'button';
      b.className = 'u2-method-pill' + (value === this.method ? ' on' : '');
      b.textContent = `Math.${label}`; b.dataset.method = value; b.setAttribute('aria-pressed', String(value === this.method));
      b.addEventListener('click', () => { this.method = value; this.renderMethodButtons(); this.renderArgs(); });
      this.methodsHost.appendChild(b);
    });
  }

  renderArgs() {
    this.argsHost.replaceChildren();
    const put = (label, value, name) => {
      const f = field(label, value);
      f.input.dataset.arg = name; this.argsHost.appendChild(f.label);
    };
    switch (this.method) {
      case 'abs': put('x', -5.5, 'x'); break;
      case 'pow': put('base', 2, 'base'); put('exponent', 3, 'exponent'); break;
      case 'sqrt': put('x', 16, 'x'); break;
      case 'min': case 'max': put('a', 10, 'a'); put('b', 7, 'b'); break;
      case 'random': {
        const hint = document.createElement('span'); hint.className = 'u2-small-note';
        hint.textContent = '不带参数；每次运行会产生不同的 double。'; this.argsHost.appendChild(hint); break;
      }
      default: break;
    }
  }

  runMethod() {
    const get = name => Number(this.argsHost.querySelector(`[data-arg="${name}"]`)?.value ?? 0);
    let args = [];
    let result;
    switch (this.method) {
      case 'abs': args = [get('x')]; result = Math.abs(args[0]); break;
      case 'pow': args = [get('base'), get('exponent')]; result = Math.pow(args[0], args[1]); break;
      case 'sqrt': args = [get('x')]; result = Math.sqrt(args[0]); break;
      case 'min': args = [get('a'), get('b')]; result = Math.min(args[0], args[1]); break;
      case 'max': args = [get('a'), get('b')]; result = Math.max(args[0], args[1]); break;
      case 'random': result = Math.random(); break;
      default: return;
    }
    const argsText = args.map(n => String(n)).join(', ');
    const code = this.method === 'random'
      ? 'System.out.println(Math.random());'
      : `System.out.println(Math.${this.method}(${argsText}));`;
    mathCode(this.codeHost, code);
    this.methodConsole.clear();
    this.methodConsole.print(`Math.${this.method}(${argsText})`, 'cmd');
    this.methodConsole.print(String(result), 'res');
  }

  resetMethods() {
    this.method = 'abs';
    this.renderMethodButtons(); this.renderArgs();
    mathCode(this.codeHost, 'System.out.println(Math.abs(-5.5));');
    this.methodConsole.clear();
  }

  validIntRange(min, max) {
    return Number.isInteger(min) && Number.isInteger(max) &&
      min >= -2147483648 && max <= 2147483647 && min <= max &&
      max - min + 1 <= 2147483647;
  }

  renderRange() {
    const min = Number(this.minInput.value), max = Number(this.maxInput.value);
    this.range.replaceChildren();
    if (!this.validIntRange(min, max)) {
      this.rangeNote.textContent = '请输入 32-bit int 范围内的整数，min ≤ max，且区间长度不超过 Integer.MAX_VALUE。';
      this.rangeNote.classList.add('hot');
      return;
    }
    this.rangeNote.classList.remove('hot');
    const count = max - min + 1;
    const values = count <= 12
      ? Array.from({ length: count }, (_, i) => min + i)
      : [...Array.from({ length: 5 }, (_, i) => min + i), null, ...Array.from({ length: 5 }, (_, i) => max - 4 + i)];
    values.forEach(n => {
      const cell = document.createElement('span');
      if (n === null) {
        cell.className = 'u2-range-ellipsis'; cell.textContent = '…';
      } else {
        cell.className = 'u2-range-cell'; cell.textContent = String(n); cell.dataset.value = String(n);
      }
      this.range.appendChild(cell);
    });
    this.rangeNote.textContent = count <= 12
      ? `当前范围：${min} 到 ${max}，包含两端，共 ${count} 个可能的整数。`
      : `当前范围：${min} 到 ${max}，共 ${count} 个可能的整数；图中仅抽样展示两端。`;
  }

  rollRange() {
    const min = Number(this.minInput.value), max = Number(this.maxInput.value);
    if (!this.validIntRange(min, max)) {
      this.rangeNote.textContent = '无效区间：请使用 32-bit int 范围内的整数，并确保 min ≤ max。';
      this.rangeNote.classList.add('hot'); return;
    }
    const random = Math.random();
    const value = Math.floor(random * (max - min + 1)) + min;
    this.randomConsole.clear();
    this.randomConsole.print(`r = Math.random() → ${random}`, 'cmd');
    this.randomConsole.print(`(int)(r * (${max} - ${min} + 1)) + ${min} → ${value}`, 'res');
    this.range.querySelectorAll('.u2-range-cell').forEach(cell => {
      cell.classList.toggle('picked', Number(cell.dataset.value) === value);
    });
    this.rangeNote.classList.remove('hot');
    this.rangeNote.textContent = `${value} 命中范围 [${min}, ${max}]。因为 r < 1，最大值也不会越界。`;
  }
}

if (!customElements.get('u2-mathlab')) customElements.define('u2-mathlab', U2MathLab);
