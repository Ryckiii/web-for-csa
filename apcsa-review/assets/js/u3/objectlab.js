/* §3.7 Object identity, String value comparison and safe null guards. */
import { showCode, showConsole } from './helpers.js';

class U3ObjectLab extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.mode = 'refs';
    this.innerHTML = `
      <div class="u3-lab u3-object-lab">
        <div class="u3-mode-tabs" role="group" aria-label="对象比较实验模式">
          <button type="button" class="u3-mode-tab on" data-mode="refs" aria-pressed="true">== vs .equals()</button>
          <button type="button" class="u3-mode-tab" data-mode="null" aria-pressed="false">null guard</button>
        </div>
        <section class="u3-mode-panel" data-panel="refs">
          <div class="u3-reference-map" role="group" aria-label="变量引用关系图">
            <div class="u3-reference-cluster" role="group" aria-label="s1 与 s3 指向 Object A">
              <div class="u3-ref-vars">
                <div class="u3-ref-variable"><strong>s1</strong><span>String reference</span></div>
                <div class="u3-ref-variable"><strong>s3</strong><span>alias of s1</span></div>
              </div>
              <svg class="u3-ref-arrows" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 24 C34 24 61 50 88 50"></path>
                <path d="M2 76 C34 76 61 50 88 50"></path>
                <path class="u3-arrow-tip" d="M80 43 L96 50 L80 57"></path>
              </svg>
              <div class="u3-object-box"><span>OBJECT A</span><code>"map"</code></div>
            </div>
            <div class="u3-reference-cluster" role="group" aria-label="s2 指向 Object B">
              <div class="u3-ref-vars">
                <div class="u3-ref-variable"><strong>s2</strong><span>String reference</span></div>
              </div>
              <svg class="u3-ref-arrows" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 50 H88"></path>
                <path class="u3-arrow-tip" d="M80 43 L96 50 L80 57"></path>
              </svg>
              <div class="u3-object-box"><span>OBJECT B</span><code>"map"</code></div>
            </div>
          </div>
          <div class="u3-compare-buttons" role="group" aria-label="运行 String 比较">
            <button type="button" class="btn btn-ghost" data-compare="identity12">s1 == s2</button>
            <button type="button" class="btn btn-ghost" data-compare="value12">s1.equals(s2)</button>
            <button type="button" class="btn btn-ghost" data-compare="identity13">s1 == s3</button>
            <button type="button" class="btn btn-ghost" data-compare="value13">s1.equals(s3)</button>
          </div>
          <p class="u3-result" data-ref-result aria-live="polite">点一个表达式，判断引用身份或文字内容。</p>
          <div class="u3-code-console-grid">
            <div class="u3-code-host" data-ref-code></div>
            <viz-console class="term-host" title="comparison result" data-ref-console></viz-console>
          </div>
        </section>
        <section class="u3-mode-panel" data-panel="null" hidden>
          <div class="u3-input-row">
            <label class="u3-field"><span>String s</span><select class="u2-select" data-null-value>
              <option value="null">null</option><option value="java">new String("java")</option><option value="empty">new String("")</option>
            </select></label>
            <button class="btn btn-ghost" type="button" data-unsafe>Run unsafe call</button>
            <button class="btn" type="button" data-safe>Run guarded call</button>
          </div>
          <p class="u3-small-note">目标表达式：<code>s.indexOf("a") &gt;= 0</code>。先确认 s 不为 null，才能调用 String method。</p>
          <p class="u3-result" data-null-result aria-live="polite">选择一个值，再比较未保护调用与短路保护。</p>
          <div class="u3-code-console-grid">
            <div class="u3-code-host" data-null-code></div>
            <viz-console class="term-host" title="null safety result" data-null-console></viz-console>
          </div>
        </section>
      </div>`;
    this.modeButtons = [...this.querySelectorAll('[data-mode]')];
    this.modeButtons.forEach(button => button.addEventListener('click', () => this.setMode(button.dataset.mode)));
    this.querySelectorAll('[data-compare]').forEach(button => button.addEventListener('click', () => this.runCompare(button.dataset.compare)));
    this.querySelector('[data-unsafe]').addEventListener('click', () => this.runNull(false));
    this.querySelector('[data-safe]').addEventListener('click', () => this.runNull(true));
    this.querySelector('[data-null-value]').addEventListener('change', () => {
      this.querySelector('[data-null-result]').textContent = '已更新 s；选择 unsafe 或 guarded call 进行追踪。';
    });
    this.showInitialReferences();
  }

  setMode(mode) {
    this.mode = mode;
    this.modeButtons.forEach(button => {
      const on = button.dataset.mode === mode;
      button.classList.toggle('on', on); button.setAttribute('aria-pressed', String(on));
    });
    this.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== mode; });
  }

  showInitialReferences() {
    const source = `String s1 = new String("map");\nString s2 = new String("map");\nString s3 = s1;\nboolean sameReference = s1 == s2;`;
    showCode(this.querySelector('[data-ref-code]'), source, 3);
  }

  runCompare(which) {
    const details = {
      identity12: { expr: 's1 == s2', value: false, meaning: '两个变量指向不同的 String objects。' },
      value12: { expr: 's1.equals(s2)', value: true, meaning: '两个 String 的字符内容相同。' },
      identity13: { expr: 's1 == s3', value: true, meaning: 's3 = s1 是 alias，两个变量指向同一个 object。' },
      value13: { expr: 's1.equals(s3)', value: true, meaning: '同一个对象当然也有相同内容。' },
    }[which];
    this.querySelector('[data-ref-result]').innerHTML = `<code>${details.expr}</code> → <strong>${details.value}</strong> · ${details.meaning}`;
    const source = `String s1 = new String("map");\nString s2 = new String("map");\nString s3 = s1;\nboolean result = ${details.expr};`;
    showCode(this.querySelector('[data-ref-code]'), source, 3);
    showConsole(this.querySelector('[data-ref-console]'), [`${details.expr} → ${details.value}`]);
  }

  runNull(guarded) {
    const value = this.querySelector('[data-null-value]').value;
    const isNull = value === 'null';
    const text = value === 'java' ? 'java' : '';
    const found = !isNull && text.indexOf('a') >= 0;
    const expression = guarded ? 's != null && s.indexOf("a") >= 0' : 's.indexOf("a") >= 0';
    const source = guarded
      ? `String s = ${isNull ? 'null' : `new String("${text}")`};\nboolean found = s != null && s.indexOf("a") >= 0;`
      : `String s = ${isNull ? 'null' : `new String("${text}")`};\nboolean found = s.indexOf("a") >= 0;`;
    const status = isNull && !guarded
      ? 'NullPointerException · s.indexOf(...) was called on null.'
      : `Safe result: ${found} · ${isNull ? 's != null is false, so && skips the method call.' : 's is non-null, so indexOf runs normally.'}`;
    this.querySelector('[data-null-result]').textContent = status;
    showCode(this.querySelector('[data-null-code]'), source, 1);
    showConsole(this.querySelector('[data-null-console]'), [
      isNull && !guarded ? 'Runtime exception: NullPointerException' : `${expression} → ${found}`,
    ]);
  }
}

if (!customElements.get('u3-objectlab')) customElements.define('u3-objectlab', U3ObjectLab);
