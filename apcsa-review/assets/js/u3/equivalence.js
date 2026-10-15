/* §3.6 De Morgan's Laws and relational negation equivalence checker. */
import { showCode } from './helpers.js';

const truthBadge = value => `<span class="u3-bool-value ${value ? 'is-true' : 'is-false'}">${value}</span>`;
const truthLetter = value => value ? 'T' : 'F';

class U3Equivalence extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.rule = 'notAnd';
    this.a = true;
    this.b = false;
    this.innerHTML = `
      <div class="u3-lab u3-equivalence-lab">
        <div class="u3-rule-picker" role="group" aria-label="Choose an equivalent-expression rule">
          <button type="button" class="u3-rule-card on" data-rule="notAnd" aria-pressed="true">
            <span class="u3-rule-label">De Morgan · AND</span>
            <span class="u3-rule-formula"><code>!(A &amp;&amp; B)</code><b>⇔</b><code>!A || !B</code></span>
          </button>
          <button type="button" class="u3-rule-card" data-rule="notOr" aria-pressed="false">
            <span class="u3-rule-label">De Morgan · OR</span>
            <span class="u3-rule-formula"><code>!(A || B)</code><b>⇔</b><code>!A &amp;&amp; !B</code></span>
          </button>
          <button type="button" class="u3-rule-card" data-rule="notLess" aria-pressed="false">
            <span class="u3-rule-label">Negate a comparison</span>
            <span class="u3-rule-formula"><code>!(x &lt; y)</code><b>⇔</b><code>x &gt;= y</code></span>
          </button>
          <button type="button" class="u3-rule-card" data-rule="notLE" aria-pressed="false">
            <span class="u3-rule-label">Keep the boundary straight</span>
            <span class="u3-rule-formula"><code>!(x &lt;= y)</code><b>⇔</b><code>x &gt; y</code></span>
          </button>
        </div>
        <div class="u3-input-row u3-eq-inputs" data-bool-controls>
          <button type="button" class="u3-toggle-value on" data-a aria-pressed="true">A = true</button>
          <button type="button" class="u3-toggle-value" data-b aria-pressed="false">B = false</button>
          <span class="u3-small-note">The table checks all four possible A / B combinations.</span>
        </div>
        <div class="u3-input-row u3-eq-inputs" data-number-controls hidden>
          <label class="u3-field"><span>int x</span><input class="u2-input u3-compact-input" data-x type="number" step="1" value="4"></label>
          <label class="u3-field"><span>int y</span><input class="u2-input u3-compact-input" data-y type="number" step="1" value="4"></label>
          <span class="u3-small-note">Boundary samples use x−1, x and x+1 against the same y.</span>
        </div>
        <div class="u3-equation" data-equation aria-live="polite"></div>
        <p class="u3-result u3-eq-status" data-status aria-live="polite"></p>
        <div class="u3-code-host" data-code></div>
        <div class="u3-table-wrap"><table class="u3-truth-table" data-table></table></div>
      </div>`;

    this.querySelectorAll('[data-rule]').forEach(button => button.addEventListener('click', () => {
      this.rule = button.dataset.rule;
      this.render();
    }));
    this.querySelector('[data-a]').addEventListener('click', () => { this.a = !this.a; this.render(); });
    this.querySelector('[data-b]').addEventListener('click', () => { this.b = !this.b; this.render(); });
    this.querySelector('[data-x]').addEventListener('input', () => this.render());
    this.querySelector('[data-y]').addEventListener('input', () => this.render());
    this.render();
  }

  render() {
    const rule = this.rule;
    const booleanMode = rule === 'notAnd' || rule === 'notOr';
    this.querySelectorAll('[data-rule]').forEach(button => {
      const selected = button.dataset.rule === rule;
      button.classList.toggle('on', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    this.querySelector('[data-bool-controls]').hidden = !booleanMode;
    this.querySelector('[data-number-controls]').hidden = booleanMode;
    const table = this.querySelector('[data-table]');
    const status = this.querySelector('[data-status]');
    const equation = this.querySelector('[data-equation]');

    if (booleanMode) {
      const leftExpr = rule === 'notAnd' ? '!(a && b)' : '!(a || b)';
      const rightExpr = rule === 'notAnd' ? '!a || !b' : '!a && !b';
      const left = (a, b) => rule === 'notAnd' ? !(a && b) : !(a || b);
      const right = (a, b) => rule === 'notAnd' ? (!a || !b) : (!a && !b);
      const rows = [[true, true], [true, false], [false, true], [false, false]];
      const allMatch = rows.every(([a, b]) => left(a, b) === right(a, b));
      const currentLeft = left(this.a, this.b);
      const currentRight = right(this.a, this.b);
      this.querySelector('[data-a]').textContent = `A = ${this.a}`;
      this.querySelector('[data-a]').setAttribute('aria-pressed', String(this.a));
      this.querySelector('[data-a]').classList.toggle('on', this.a);
      this.querySelector('[data-b]').textContent = `B = ${this.b}`;
      this.querySelector('[data-b]').setAttribute('aria-pressed', String(this.b));
      this.querySelector('[data-b]').classList.toggle('on', this.b);
      equation.innerHTML = `<span>Original</span><code>${leftExpr}</code><b class="u3-equivalent-sign">⇔</b><span>Rewritten</span><code>${rightExpr}</code>`;
      status.innerHTML = `<span>Current row: A=${truthBadge(this.a)}, B=${truthBadge(this.b)}</span><span>Original ${truthBadge(currentLeft)}</span><span>Rewrite ${truthBadge(currentRight)}</span><span>All rows match ${truthBadge(allMatch)}</span>`;
      table.innerHTML = `<thead><tr><th>A</th><th>B</th><th>Original result</th><th>Rewrite result</th><th>Match</th></tr></thead><tbody>${rows.map(([a, b]) => {
        const l = left(a, b), r = right(a, b), match = l === r;
        return `<tr class="${a === this.a && b === this.b ? 'current' : ''}"><td>${truthBadge(a)}</td><td>${truthBadge(b)}</td><td>${truthBadge(l)}</td><td>${truthBadge(r)}</td><td class="u3-match ${match ? 'yes' : 'no'}">${match ? '✓ Yes' : '✗ No'}</td></tr>`;
      }).join('')}</tbody>`;
      showCode(this.querySelector('[data-code]'), `boolean a = ${this.a};\nboolean b = ${this.b};\nboolean original = ${leftExpr};\nboolean rewritten = ${rightExpr};`, 2);
      return;
    }

    const rawX = this.querySelector('[data-x]').value;
    const rawY = this.querySelector('[data-y]').value;
    const x = Number(rawX), y = Number(rawY);
    if (rawX === '' || rawY === '' || !Number.isInteger(x) || !Number.isInteger(y) || x < -2147483647 || x > 2147483646 || y < -2147483648 || y > 2147483647) {
      status.textContent = 'Enter Java int values; x must leave room for the ±1 boundary samples.';
      equation.replaceChildren(); table.replaceChildren(); return;
    }
    const notLess = rule === 'notLess';
    const leftExpr = notLess ? '!(x < y)' : '!(x <= y)';
    const rightExpr = notLess ? 'x >= y' : 'x > y';
    const left = value => notLess ? !(value < y) : !(value <= y);
    const right = value => notLess ? value >= y : value > y;
    const samples = [x - 1, x, x + 1];
    const currentLeft = left(x), currentRight = right(x);
    const allMatch = samples.every(value => left(value) === right(value));
    equation.innerHTML = `<span>Original</span><code>${leftExpr}</code><b class="u3-equivalent-sign">⇔</b><span>Rewritten</span><code>${rightExpr}</code>`;
    status.innerHTML = `<span>Current pair x=${x}, y=${y}</span><span>Original ${truthBadge(currentLeft)}</span><span>Rewrite ${truthBadge(currentRight)}</span><span>Boundary samples match ${truthBadge(allMatch)}</span>`;
    table.innerHTML = `<thead><tr><th>Test value x</th><th>Fixed y</th><th>Original result</th><th>Rewrite result</th><th>Match</th></tr></thead><tbody>${samples.map((value, index) => {
      const l = left(value), r = right(value), match = l === r;
      return `<tr class="${index === 1 ? 'current' : ''}"><td>${value}${index === 1 ? ' · current' : ''}</td><td>${y}</td><td>${truthBadge(l)}</td><td>${truthBadge(r)}</td><td class="u3-match ${match ? 'yes' : 'no'}">${match ? '✓ Yes' : '✗ No'}</td></tr>`;
    }).join('')}</tbody>`;
    showCode(this.querySelector('[data-code]'), `int x = ${x};\nint y = ${y};\nboolean original = ${leftExpr};\nboolean rewritten = ${rightExpr};`, 2);
  }
}

if (!customElements.get('u3-equivalence')) customElements.define('u3-equivalence', U3Equivalence);
