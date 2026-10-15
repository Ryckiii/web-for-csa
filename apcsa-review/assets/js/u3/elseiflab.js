/* §3.4 Multi-way selection: independent if statements vs an else-if ladder. */
import { showCode, showConsole } from './helpers.js';

class U3ElseIfLab extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.mode = 'chain';
    this.innerHTML = `
      <div class="u3-lab u3-elseif-lab">
        <div class="u3-input-row u3-score-controls">
          <label class="u3-field u3-score-number"><span>score</span><input class="u2-input" data-score-number type="number" min="0" max="100" step="1" value="93"></label>
          <div class="u3-score-range"><input data-score-range aria-label="Adjust score" type="range" min="0" max="100" step="1" value="93"></div>
        </div>
        <p class="u3-small-note">演示量表：A ≥ 90，B ≥ 80，C ≥ 70，D ≥ 60，否则 F。</p>
        <div class="u3-mode-tabs" role="group" aria-label="选择分支写法">
          <button type="button" class="u3-mode-tab on" data-mode="chain" aria-pressed="true">else-if ladder · stop at first match</button>
          <button type="button" class="u3-mode-tab" data-mode="independent" aria-pressed="false">Independent ifs · may overwrite</button>
        </div>
        <div class="u3-grade-trace" data-trace aria-live="polite"></div>
        <p class="u3-result" data-explanation></p>
        <div class="u3-code-console-grid">
          <div class="u3-code-host" data-code></div>
          <viz-console class="term-host" title="grade result" data-console></viz-console>
        </div>
      </div>`;
    this.modeButtons = [...this.querySelectorAll('[data-mode]')];
    this.modeButtons.forEach(button => button.addEventListener('click', () => {
      this.mode = button.dataset.mode;
      this.modeButtons.forEach(b => {
        const on = b.dataset.mode === this.mode;
        b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
      });
      this.render();
    }));
    this.querySelector('[data-score-range]').addEventListener('input', e => {
      this.querySelector('[data-score-number]').value = e.target.value;
      this.render();
    });
    this.querySelector('[data-score-number]').addEventListener('input', e => {
      const n = Number(e.target.value);
      if (e.target.value !== '' && Number.isFinite(n)) {
        this.querySelector('[data-score-range]').value = String(Math.max(0, Math.min(100, n)));
        this.render();
      }
    });
    this.render();
  }

  render() {
    const raw = this.querySelector('[data-score-number]').value;
    const score = Number(raw);
    const trace = this.querySelector('[data-trace]');
    if (raw === '' || !Number.isInteger(score) || score < 0 || score > 100) {
      trace.innerHTML = '<p class="u3-small-note">请输入 0–100 的整数分数。</p>';
      return;
    }
    const rules = [
      { label: 'score ≥ 90', grade: 'A', test: score >= 90 },
      { label: 'score ≥ 80', grade: 'B', test: score >= 80 },
      { label: 'score ≥ 70', grade: 'C', test: score >= 70 },
      { label: 'score ≥ 60', grade: 'D', test: score >= 60 },
      { label: 'otherwise', grade: 'F', test: score < 60 },
    ];
    let grade = '?';
    const rows = rules.map((rule, index) => {
      let state;
      if (this.mode === 'chain') {
        if (grade !== '?') state = 'SKIPPED · 已命中前一分支';
        else if (rule.test) { grade = rule.grade; state = `TRUE · grade = ${rule.grade}`; }
        else state = 'FALSE · 继续检查';
      } else {
        if (rule.test) { grade = rule.grade; state = `TRUE · grade 改为 ${rule.grade}`; }
        else state = 'FALSE · 不赋值';
      }
      return `<div class="u3-grade-row ${state.startsWith('TRUE') ? 'active' : ''}"><code>${rule.label}</code><span>${state}</span></div>`;
    });
    trace.innerHTML = rows.join('');
    this.querySelector('[data-explanation]').innerHTML = this.mode === 'chain'
      ? `首个匹配的等级是 <strong>${grade}</strong>；后续 else-if 已跳过。`
      : `所有条件各自检查，最终 <code>grade</code> 为 <strong>${grade}</strong>${score >= 70 ? '（较低门槛的后续 if 覆写了较高等级）' : ''}。`;

    let source, line;
    if (this.mode === 'chain') {
      source = `int score = ${score};\nString grade;\nif (score >= 90) grade = "A";\nelse if (score >= 80) grade = "B";\nelse if (score >= 70) grade = "C";\nelse if (score >= 60) grade = "D";\nelse grade = "F";\nSystem.out.println(grade);`;
      line = grade === 'A' ? 2 : grade === 'B' ? 3 : grade === 'C' ? 4 : grade === 'D' ? 5 : 6;
    } else {
      source = `int score = ${score};\nString grade = "?";\nif (score >= 90) grade = "A";\nif (score >= 80) grade = "B";\nif (score >= 70) grade = "C";\nif (score >= 60) grade = "D";\nif (score < 60) grade = "F";\nSystem.out.println(grade);`;
      line = grade === 'A' ? 2 : grade === 'B' ? 3 : grade === 'C' ? 4 : grade === 'D' ? 5 : 6;
    }
    showCode(this.querySelector('[data-code]'), source, line);
    showConsole(this.querySelector('[data-console]'), [`score = ${score}`, `grade = ${grade}`]);
  }
}

if (!customElements.get('u3-elseif-lab')) customElements.define('u3-elseif-lab', U3ElseIfLab);
