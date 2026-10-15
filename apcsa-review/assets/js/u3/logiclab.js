/* §3.5 Compound Boolean expressions, truth tables and short-circuit evaluation. */
import { showCode, showConsole } from './helpers.js';

const truth = value => value ? 'T' : 'F';

class U3LogicLab extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.mode = 'truth';
    this.a = true;
    this.b = false;
    this.innerHTML = `
      <div class="u3-lab u3-logic-lab">
        <div class="u3-mode-tabs" role="group" aria-label="逻辑实验模式">
          <button type="button" class="u3-mode-tab on" data-mode="truth" aria-pressed="true">Truth Table</button>
          <button type="button" class="u3-mode-tab" data-mode="short" aria-pressed="false">Short-Circuit Trace</button>
        </div>
        <section class="u3-mode-panel" data-panel="truth">
          <div class="u3-input-row u3-logic-controls">
            <button type="button" class="u3-toggle-value" data-a aria-pressed="true">A = true</button>
            <button type="button" class="u3-toggle-value" data-b aria-pressed="false">B = false</button>
            <label class="u3-field"><span>expression</span><select class="u2-select" data-truth-expression>
              <option value="notA">!A</option><option value="and">A &amp;&amp; B</option><option value="or">A || B</option><option value="notAnd">!(A &amp;&amp; B)</option><option value="notOr">!(A || B)</option><option value="notAorB">!A || B</option><option value="aAndNotB">A &amp;&amp; !B</option>
            </select></label>
          </div>
          <p class="u3-result" data-truth-result aria-live="polite"></p>
          <div class="u3-code-host" data-truth-code></div>
          <div class="u3-table-wrap"><table class="u3-truth-table" data-truth-table aria-label="A and B truth table"></table></div>
        </section>
        <section class="u3-mode-panel" data-panel="short" hidden>
          <div class="u3-input-row u3-short-controls">
            <label class="u3-field"><span>int x</span><input class="u2-input" data-x type="number" step="1" value="0"></label>
            <label class="u3-field"><span>int y</span><input class="u2-input" data-y type="number" step="1" value="7"></label>
            <label class="u3-field u3-expression-field"><span>expression</span><select class="u2-select" data-short-expression>
              <option value="and">x &gt; 0 &amp;&amp; y / x &gt; 2</option>
              <option value="or">x &gt; 0 || y / x &gt; 2</option>
              <option value="orZero">x == 0 || y / x &gt; 2</option>
            </select></label>
            <button class="btn" type="button" data-run-short>Trace</button>
          </div>
          <div class="u3-short-trace" data-short-trace aria-live="polite"></div>
          <div class="u3-code-console-grid">
            <div class="u3-code-host" data-short-code></div>
            <viz-console class="term-host" title="short-circuit output" data-short-console></viz-console>
          </div>
          <p class="u3-small-note">本沙盘按 Java 的 int 除法规则模拟：小数部分向 0 截断；若 RHS 实际求值且 x 为 0，显示 Java 的 <code>ArithmeticException</code>。</p>
        </section>
      </div>`;

    this.modeButtons = [...this.querySelectorAll('[data-mode]')];
    this.modeButtons.forEach(button => button.addEventListener('click', () => this.setMode(button.dataset.mode)));
    this.querySelector('[data-a]').addEventListener('click', () => { this.a = !this.a; this.updateTruth(); });
    this.querySelector('[data-b]').addEventListener('click', () => { this.b = !this.b; this.updateTruth(); });
    this.querySelector('[data-truth-expression]').addEventListener('change', () => this.updateTruth());
    this.querySelector('[data-short-expression]').addEventListener('change', () => this.runShort());
    this.querySelector('[data-run-short]').addEventListener('click', () => this.runShort());
    this.querySelector('[data-x]').addEventListener('keydown', e => { if (e.key === 'Enter') this.runShort(); });
    this.querySelector('[data-y]').addEventListener('keydown', e => { if (e.key === 'Enter') this.runShort(); });
    this.updateTruth();
    this.runShort();
  }

  setMode(mode) {
    this.modeButtons.forEach(button => {
      const on = button.dataset.mode === mode;
      button.classList.toggle('on', on); button.setAttribute('aria-pressed', String(on));
    });
    this.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== mode; });
  }

  updateTruth() {
    const aButton = this.querySelector('[data-a]');
    const bButton = this.querySelector('[data-b]');
    aButton.textContent = `A = ${this.a}`; aButton.setAttribute('aria-pressed', String(this.a));
    bButton.textContent = `B = ${this.b}`; bButton.setAttribute('aria-pressed', String(this.b));
    const key = this.querySelector('[data-truth-expression]').value;
    const compute = (a, b) => ({
      notA: !a,
      and: a && b,
      or: a || b,
      notAnd: !(a && b),
      notOr: !(a || b),
      notAorB: !a || b,
      aAndNotB: a && !b,
    })[key];
    const expressions = {
      notA: '!a', and: 'a && b', or: 'a || b', notAnd: '!(a && b)',
      notOr: '!(a || b)', notAorB: '!a || b', aAndNotB: 'a && !b',
    };
    const value = compute(this.a, this.b);
    this.querySelector('[data-truth-result]').innerHTML = `<code>${expressions[key]}</code> with A=${this.a}, B=${this.b} → <strong>${value}</strong>`;
    const rows = [[true, true], [true, false], [false, true], [false, false]];
    const table = this.querySelector('[data-truth-table]');
    table.innerHTML = `<thead><tr><th>A</th><th>B</th><th>${expressions[key]}</th></tr></thead><tbody>${rows.map(([a, b]) => `<tr class="${a === this.a && b === this.b ? 'current' : ''}"><td>${truth(a)}</td><td>${truth(b)}</td><td><strong>${truth(compute(a, b))}</strong></td></tr>`).join('')}</tbody>`;
    showCode(this.querySelector('[data-truth-code]'), `boolean a = ${this.a};\nboolean b = ${this.b};\nboolean result = ${expressions[key]};`, 2);
  }

  runShort() {
    const rawX = this.querySelector('[data-x]').value;
    const rawY = this.querySelector('[data-y]').value;
    const x = Number(rawX), y = Number(rawY);
    const trace = this.querySelector('[data-short-trace]');
    if (rawX === '' || rawY === '' || !Number.isInteger(x) || !Number.isInteger(y)) {
      trace.innerHTML = '<p class="u3-result">x 与 y 都要是整数。</p>';
      return;
    }
    const mode = this.querySelector('[data-short-expression]').value;
    let left, op, rightWasEvaluated, right, result, rightText;
    if (mode === 'and') {
      left = x > 0; op = '&&';
      rightWasEvaluated = left;
      if (rightWasEvaluated) {
        right = Math.trunc(y / x) > 2;
        rightText = `evaluated: ${Math.trunc(y / x)} > 2 → ${right}`;
        result = right;
      } else { rightText = 'SKIPPED · 左侧为 false，&& 已确定整体为 false'; result = false; }
    } else if (mode === 'or') {
      left = x > 0; op = '||';
      rightWasEvaluated = !left;
      if (left) { rightText = 'SKIPPED · 左侧为 true，|| 已确定整体为 true'; result = true; }
      else if (x === 0) { rightText = 'EVALUATED · y / 0 → ArithmeticException'; result = 'error'; }
      else { right = Math.trunc(y / x) > 2; rightText = `evaluated: ${Math.trunc(y / x)} > 2 → ${right}`; result = right; }
    } else {
      left = x === 0; op = '||';
      rightWasEvaluated = !left;
      if (left) { rightText = 'SKIPPED · 左侧为 true，|| 已确定整体为 true'; result = true; }
      else if (x === 0) { rightText = 'EVALUATED · y / 0 → ArithmeticException'; result = 'error'; }
      else { right = Math.trunc(y / x) > 2; rightText = `evaluated: ${Math.trunc(y / x)} > 2 → ${right}`; result = right; }
    }
    const leftLabel = mode === 'orZero' ? `x == 0 → ${left}` : `x > 0 → ${left}`;
    const leftDisplay = `<div class="u3-short-step"><span>LEFT</span><code>${leftLabel}</code></div>`;
    const rightDisplay = `<div class="u3-short-step ${result === 'error' ? 'error' : ''}"><span>RIGHT</span><code>${rightText}</code></div>`;
    const resultText = result === 'error' ? 'ArithmeticException' : String(result);
    trace.innerHTML = `${leftDisplay}${rightDisplay}<div class="u3-short-final ${result === 'error' ? 'error' : ''}">OVERALL RESULT <strong>${resultText}</strong></div>`;

    let source;
    if (mode === 'and') source = `int x = ${x};\nint y = ${y};\nif (x > 0 && y / x > 2)\n    System.out.println("yes");\nelse\n    System.out.println("no");`;
    else if (mode === 'or') source = `int x = ${x};\nint y = ${y};\nif (x > 0 || y / x > 2)\n    System.out.println("yes");\nelse\n    System.out.println("no");`;
    else source = `int x = ${x};\nint y = ${y};\nif (x == 0 || y / x > 2)\n    System.out.println("yes");\nelse\n    System.out.println("no");`;
    showCode(this.querySelector('[data-short-code]'), source, 2);
    showConsole(this.querySelector('[data-short-console]'), result === 'error' ? ['Runtime exception: ArithmeticException'] : [result ? 'yes' : 'no']);
  }
}

if (!customElements.get('u3-logiclab')) customElements.define('u3-logiclab', U3LogicLab);
