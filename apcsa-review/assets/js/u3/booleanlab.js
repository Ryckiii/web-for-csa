/* §3.1 Boolean expressions, comparisons and integer remainder. */
import { showCode } from './helpers.js';

const RELATIONS = {
  '<': (a, b) => a < b,
  '<=': (a, b) => a <= b,
  '==': (a, b) => a === b,
  '!=': (a, b) => a !== b,
  '>=': (a, b) => a >= b,
  '>': (a, b) => a > b,
};

const fmt = n => String(n);
const boolBadge = value => `<span class="u3-bool-value ${value ? 'is-true' : 'is-false'}">${value}</span>`;

class U3BooleanLab extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.innerHTML = `
      <div class="u3-lab u3-boolean-lab">
        <div class="u3-mode-tabs" role="group" aria-label="Boolean 实验模式">
          <button type="button" class="u3-mode-tab on" data-mode="compare" aria-pressed="true">Compare values</button>
          <button type="button" class="u3-mode-tab" data-mode="remainder" aria-pressed="false">Integer checks · %</button>
        </div>
        <section class="u3-mode-panel" data-panel="compare" aria-label="数值关系比较">
          <div class="u3-input-row">
            <label class="u3-field"><span>左侧值</span><input class="u2-input u3-compact-input" data-left type="number" step="any" value="-4"></label>
            <label class="u3-field"><span>运算符</span><select class="u2-select u3-select" data-operator aria-label="选择关系运算符">
              <option>&lt;</option><option>&lt;=</option><option>==</option><option>!=</option><option selected>&gt;=</option><option>&gt;</option>
            </select></label>
            <label class="u3-field"><span>右侧值</span><input class="u2-input u3-compact-input" data-right type="number" step="any" value="-9"></label>
            <button class="btn" type="button" data-run-compare>Check</button>
          </div>
          <p class="u3-result" data-compare-result aria-live="polite"></p>
          <div class="u3-code-host" data-compare-code></div>
        </section>
        <section class="u3-mode-panel" data-panel="remainder" aria-label="余数模式" hidden>
          <div class="u3-input-row">
            <label class="u3-field"><span>Integer n</span><input class="u2-input u3-compact-input" data-n type="number" step="1" value="-9"></label>
            <label class="u3-field"><span>Property</span><select class="u2-select u3-select" data-property>
              <option value="odd">奇数</option><option value="even">偶数</option><option value="positive">正数</option><option value="negative">负数</option><option value="multiple">是否为 divisor 的倍数</option>
            </select></label>
            <label class="u3-field" data-divisor-field hidden><span>Divisor</span><input class="u2-input u3-compact-input" data-divisor type="number" step="1" value="3"></label>
            <button class="btn" type="button" data-run-remainder>Check</button>
          </div>
          <p class="u3-result" data-remainder-result aria-live="polite"></p>
          <div class="u3-code-host" data-remainder-code></div>
          <p class="u3-small-note">负数的余数可能小于 0。例如 <code>-9 % 2</code> 是 <code>-1</code>；判断奇数应使用“余数不等于 0”。</p>
        </section>
      </div>`;

    this.modeButtons = [...this.querySelectorAll('[data-mode]')];
    this.modeButtons.forEach(button => button.addEventListener('click', () => this.setMode(button.dataset.mode)));
    this.querySelector('[data-run-compare]').addEventListener('click', () => this.runCompare());
    this.querySelector('[data-run-remainder]').addEventListener('click', () => this.runRemainder());
    this.querySelector('[data-property]').addEventListener('change', () => {
      const isMultiple = this.querySelector('[data-property]').value === 'multiple';
      this.querySelector('[data-divisor-field]').hidden = !isMultiple;
      this.runRemainder();
    });
    this.querySelector('[data-left]').addEventListener('keydown', e => { if (e.key === 'Enter') this.runCompare(); });
    this.querySelector('[data-right]').addEventListener('keydown', e => { if (e.key === 'Enter') this.runCompare(); });
    this.querySelector('[data-n]').addEventListener('keydown', e => { if (e.key === 'Enter') this.runRemainder(); });
    this.runCompare();
    this.runRemainder();
  }

  setMode(mode) {
    this.modeButtons.forEach(button => {
      const on = button.dataset.mode === mode;
      button.classList.toggle('on', on);
      button.setAttribute('aria-pressed', String(on));
    });
    this.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== mode; });
  }

  runCompare() {
    const leftRaw = this.querySelector('[data-left]').value;
    const rightRaw = this.querySelector('[data-right]').value;
    const a = Number(leftRaw), b = Number(rightRaw);
    const op = this.querySelector('[data-operator]').value;
    const result = this.querySelector('[data-compare-result]');
    if (leftRaw === '' || rightRaw === '' || !Number.isFinite(a) || !Number.isFinite(b)) {
      result.textContent = '请在两侧都输入有效数值。';
      return;
    }
    const value = RELATIONS[op](a, b);
    result.innerHTML = `<span class="u3-equation-result">${fmt(a)} <b>${op}</b> ${fmt(b)}</span><span class="u3-result-arrow" aria-hidden="true">→</span>${boolBadge(value)}`;
    showCode(this.querySelector('[data-compare-code]'), `double left = ${fmt(a)};\ndouble right = ${fmt(b)};\nboolean result = left ${op} right;`, 2);
  }

  runRemainder() {
    const raw = this.querySelector('[data-n]').value;
    const n = Number(raw);
    const property = this.querySelector('[data-property]').value;
    const result = this.querySelector('[data-remainder-result]');
    const host = this.querySelector('[data-remainder-code]');
    if (raw === '' || !Number.isInteger(n)) {
      result.textContent = '请输入一个整数。';
      host.replaceChildren();
      return;
    }
    let check, code, explanation;
    if (property === 'odd') {
      check = n % 2 !== 0; code = 'n % 2 != 0'; explanation = `${n} % 2 = ${n % 2}，余数非零，所以是奇数。`;
    } else if (property === 'even') {
      check = n % 2 === 0; code = 'n % 2 == 0'; explanation = `${n} % 2 = ${n % 2}，余数为 0，所以是偶数。`;
    } else if (property === 'positive') {
      check = n > 0; code = 'n > 0'; explanation = `${n} ${check ? '> 0' : '≤ 0'}，结果为 ${check}。`;
    } else if (property === 'negative') {
      check = n < 0; code = 'n < 0'; explanation = `${n} ${check ? '< 0' : '≥ 0'}，结果为 ${check}。`;
    } else {
      const rawDivisor = this.querySelector('[data-divisor]').value;
      const divisor = Number(rawDivisor);
      if (rawDivisor === '' || !Number.isInteger(divisor)) {
        result.textContent = '请输入整数 divisor。'; host.replaceChildren(); return;
      }
      if (divisor === 0) {
        result.textContent = 'divisor 不能为 0；Java 会抛出 ArithmeticException。'; host.replaceChildren(); return;
      }
      check = n % divisor === 0; code = `n % divisor == 0`;
      explanation = `${n} % ${divisor} = ${n % divisor}，${check ? '整除' : '不能整除'}。`;
    }
    result.innerHTML = `<span>${explanation}</span>${boolBadge(check)}`;
    showCode(host, `int n = ${n};\nboolean result = ${code};`, 1);
  }
}

if (!customElements.get('u3-booleanlab')) customElements.define('u3-booleanlab', U3BooleanLab);
