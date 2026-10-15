/* §3.3 Two-way and nested if-else branch tree. */
import { showCode, showConsole } from './helpers.js';

class U3IfElseLab extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.mammal = false;
    this.pet = true;
    this.innerHTML = `
      <div class="u3-lab u3-ifelse-lab">
        <div class="u3-input-row u3-check-row">
          <button class="u3-toggle-value" type="button" data-mammal aria-pressed="false">mammal = false</button>
          <button class="u3-toggle-value on" type="button" data-pet aria-pressed="true">pet = true</button>
          <button class="btn" type="button" data-run>Trace branch</button>
        </div>
        <p class="u3-small-note">先检查外层 <code>mammal</code>；只有它为 true 时，内层 <code>pet</code> 才会被求值。</p>
        <div class="u3-branch-tree" aria-live="polite">
          <div class="u3-flow-card" data-outer>
            <span class="u3-flow-kicker">OUTER IF</span><code>mammal?</code><strong data-outer-state>—</strong>
          </div>
          <div class="u3-tree-branches">
            <div class="u3-tree-path" data-mammal-path>
              <span class="u3-path-label">TRUE → enter outer block</span>
              <div class="u3-flow-card" data-inner>
                <span class="u3-flow-kicker">INNER IF</span><code>pet?</code><strong data-inner-state>—</strong>
              </div>
              <div class="u3-tree-leaves">
                <div class="u3-flow-card" data-dog><span class="u3-flow-kicker">pet = true</span><code>"dog"</code></div>
                <div class="u3-flow-card" data-elephant><span class="u3-flow-kicker">pet = false</span><code>"elephant"</code></div>
              </div>
            </div>
            <div class="u3-tree-path" data-not-mammal-path>
              <span class="u3-path-label">FALSE → outer else</span>
              <div class="u3-flow-card" data-bird><span class="u3-flow-kicker">ELSE</span><code>"bird"</code></div>
            </div>
          </div>
        </div>
        <p class="u3-result" data-route aria-live="polite"></p>
        <div class="u3-code-console-grid">
          <div class="u3-code-host" data-code></div>
          <viz-console class="term-host" title="nested if output" data-console></viz-console>
        </div>
      </div>`;
    this.querySelector('[data-run]').addEventListener('click', () => this.run());
    this.querySelector('[data-mammal]').addEventListener('click', () => { this.mammal = !this.mammal; this.syncControls(); this.run(); });
    this.querySelector('[data-pet]').addEventListener('click', () => { this.pet = !this.pet; this.syncControls(); this.run(); });
    this.syncControls();
    this.run();
  }

  syncControls() {
    const mammal = this.querySelector('[data-mammal]');
    const pet = this.querySelector('[data-pet]');
    mammal.textContent = `mammal = ${this.mammal}`;
    pet.textContent = `pet = ${this.pet}`;
    mammal.setAttribute('aria-pressed', String(this.mammal));
    pet.setAttribute('aria-pressed', String(this.pet));
    mammal.classList.toggle('on', this.mammal);
    pet.classList.toggle('on', this.pet);
  }

  run() {
    const mammal = this.mammal;
    const pet = this.pet;
    const chosen = mammal ? (pet ? 'dog' : 'elephant') : 'bird';
    const summary = mammal
      ? `mammal = true → check pet (${pet}) → print "${chosen}".`
      : 'mammal = false → skip the nested if completely → print "bird".';
    this.querySelector('[data-outer-state]').textContent = String(mammal);
    this.querySelector('[data-inner-state]').textContent = mammal ? String(pet) : 'NOT CHECKED';
    this.querySelector('[data-inner]').classList.toggle('active', mammal);
    this.querySelector('[data-dog]').classList.toggle('active', mammal && pet);
    this.querySelector('[data-elephant]').classList.toggle('active', mammal && !pet);
    this.querySelector('[data-bird]').classList.toggle('active', !mammal);
    this.querySelector('[data-route]').textContent = summary;
    const source = `boolean mammal = ${mammal};\nboolean pet = ${pet};\nif (mammal) {\n    if (pet) {\n        System.out.println("dog");\n    } else {\n        System.out.println("elephant");\n    }\n} else {\n    System.out.println("bird");\n}\nSystem.out.println("after selection");`;
    const line = !mammal ? 9 : (pet ? 4 : 6);
    showCode(this.querySelector('[data-code]'), source, line);
    showConsole(this.querySelector('[data-console]'), [chosen, 'after selection']);
  }
}

if (!customElements.get('u3-ifelse-lab')) customElements.define('u3-ifelse-lab', U3IfElseLab);
