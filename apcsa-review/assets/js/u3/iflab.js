/* §3.2 One-way if flow inspector. */
import { showCode, showConsole } from './helpers.js';

class U3IfLab extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.innerHTML = `
      <div class="u3-lab u3-if-lab">
        <div class="u3-input-row">
          <label class="u3-field u3-if-value"><span>value</span><input class="u2-input u3-compact-input" data-value type="number" step="1" value="-3"></label>
          <button class="btn" type="button" data-run>▶ Run</button>
          <span class="u3-small-note">改值后点 Run，追踪 true / false 两条路径。</span>
        </div>
        <div class="u3-flow-grid">
          <div class="u3-flow-card" data-condition-card>
            <span class="u3-flow-kicker">STEP 1 · CONDITION</span>
            <code data-condition-text>value &gt; 0</code>
            <strong data-condition-result>—</strong>
          </div>
          <div class="u3-flow-connector" aria-hidden="true">↓</div>
          <div class="u3-flow-branches">
            <div class="u3-flow-card" data-if-card>
              <span class="u3-flow-kicker">IF BLOCK · TRUE</span>
              <span><code>"positive"</code> is printed</span>
              <strong data-if-result>—</strong>
            </div>
            <div class="u3-flow-card" data-skip-card>
              <span class="u3-flow-kicker">IF BLOCK · FALSE</span>
              <span>skip the block</span>
              <strong data-skip-result>—</strong>
            </div>
          </div>
        </div>
        <div class="u3-code-console-grid">
          <div class="u3-code-host" data-code></div>
          <viz-console class="term-host" title="if output" data-console></viz-console>
        </div>
      </div>`;
    this.querySelector('[data-run]').addEventListener('click', () => this.run());
    this.querySelector('[data-value]').addEventListener('keydown', e => { if (e.key === 'Enter') this.run(); });
    this.run();
  }

  run() {
    const raw = this.querySelector('[data-value]').value;
    const value = Number(raw);
    const result = this.querySelector('[data-condition-result]');
    if (raw === '' || !Number.isFinite(value)) {
      result.textContent = '请输入有效数值';
      return;
    }
    const enters = value > 0;
    this.querySelector('[data-condition-text]').textContent = `${value} > 0`;
    result.textContent = String(enters);
    this.querySelector('[data-if-result]').textContent = enters ? 'EXECUTED' : 'SKIPPED';
    this.querySelector('[data-skip-result]').textContent = enters ? 'not selected' : 'EXECUTED';
    this.querySelector('[data-if-card]').classList.toggle('active', enters);
    this.querySelector('[data-skip-card]').classList.toggle('active', !enters);
    const source = `int value = ${value};\nif (value > 0)\n{\n    System.out.println("positive");\n}\nSystem.out.println("after if");`;
    showCode(this.querySelector('[data-code]'), source, enters ? 3 : 5);
    showConsole(this.querySelector('[data-console]'), [
      ...(enters ? ['positive'] : []),
      'after if',
    ]);
  }
}

if (!customElements.get('u3-iflab')) customElements.define('u3-iflab', U3IfLab);
