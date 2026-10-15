/* Unit 3 project playgrounds: Magic 8 Ball and nested Animal Guessing. */
import { showCode, showConsole } from './helpers.js';

const ANSWERS = {
  1: 'It is certain.',
  2: 'Without a doubt.',
  3: 'Yes — definitely.',
  4: 'Signs point to yes.',
  5: 'Ask again later.',
  6: 'Cannot predict now.',
  7: "Don't count on it.",
  8: 'Very doubtful.',
};

const MAGIC_CODE = `int answer = (int) (Math.random() * 8) + 1;\nString response;\nif (answer == 1) response = "It is certain.";\nelse if (answer == 2) response = "Without a doubt.";\nelse if (answer == 3) response = "Yes — definitely.";\nelse if (answer == 4) response = "Signs point to yes.";\nelse if (answer == 5) response = "Ask again later.";\nelse if (answer == 6) response = "Cannot predict now.";\nelse if (answer == 7) response = "Don't count on it.";\nelse response = "Very doubtful.";`;

class U3Playground extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.project = 'magic';
    this.mammal = null;
    this.pet = null;
    this.innerHTML = `
      <div class="u3-lab u3-playground">
        <div class="u3-mode-tabs" role="group" aria-label="选择 Playground 项目">
          <button type="button" class="u3-mode-tab on" data-project="magic" aria-pressed="true">🔮 Magic 8 Ball</button>
          <button type="button" class="u3-mode-tab" data-project="animal" aria-pressed="false">🐾 Animal Guessing</button>
        </div>
        <section class="u3-mode-panel" data-project-panel="magic">
          <p>点击 Random 随机生成 1–8 的数值；else-if 链据此选择回答。结果区会同时显示 answer 数值与对应文本。</p>
          <div class="u3-magic-actions">
            <button class="btn u3-random-button" type="button" data-random>🎲 Random</button>
            <div class="u3-magic-readout" aria-live="polite">
              <span class="u3-magic-label">ANSWER</span>
              <strong data-answer-output>1</strong>
              <span class="u3-magic-response" data-response>It is certain.</span>
            </div>
          </div>
          <div class="u3-code-console-grid">
            <div class="u3-code-host" data-magic-code></div>
            <viz-console class="term-host" title="Magic 8 Ball" data-magic-console></viz-console>
          </div>
        </section>
        <section class="u3-mode-panel" data-project-panel="animal" hidden>
          <p>依次回答问题，观察嵌套 if 决定猜测路径。先回答是否为哺乳动物；只有选“是”才会出现第二问。</p>
          <div class="u3-animal-game">
            <div class="u3-question-card" data-question-one>
              <strong>Is it a mammal?</strong>
              <div class="u3-yes-no" role="group" aria-label="动物是否为哺乳动物">
                <button type="button" class="btn btn-ghost" data-mammal-choice="yes" aria-pressed="false">Yes</button>
                <button type="button" class="btn btn-ghost" data-mammal-choice="no" aria-pressed="false">No</button>
              </div>
            </div>
            <div class="u3-question-card" data-question-two hidden>
              <strong>Is it commonly kept as a pet?</strong>
              <div class="u3-yes-no" role="group" aria-label="动物是否常作为宠物饲养">
                <button type="button" class="btn btn-ghost" data-pet-choice="yes" aria-pressed="false">Yes</button>
                <button type="button" class="btn btn-ghost" data-pet-choice="no" aria-pressed="false">No</button>
              </div>
            </div>
            <button type="button" class="btn-ghost u3-reset-animal" data-reset-animal>↺ Start over</button>
          </div>
          <p class="u3-result" data-animal-result aria-live="polite">Choose an answer to begin.</p>
          <div class="u3-code-console-grid">
            <div class="u3-code-host" data-animal-code></div>
            <viz-console class="term-host" title="Animal Guessing" data-animal-console></viz-console>
          </div>
        </section>
      </div>`;

    this.projectButtons = [...this.querySelectorAll('[data-project]')];
    this.projectButtons.forEach(button => button.addEventListener('click', () => this.setProject(button.dataset.project)));
    this.querySelector('[data-random]').addEventListener('click', () => {
      const n = Math.floor(Math.random() * 8) + 1;
      this.renderMagic(n);
    });
    this.querySelectorAll('[data-mammal-choice]').forEach(button => button.addEventListener('click', () => {
      this.mammal = button.dataset.mammalChoice === 'yes';
      this.pet = null;
      this.syncChoiceButtons();
      this.renderAnimal();
    }));
    this.querySelectorAll('[data-pet-choice]').forEach(button => button.addEventListener('click', () => {
      this.pet = button.dataset.petChoice === 'yes';
      this.syncChoiceButtons();
      this.renderAnimal();
    }));
    this.querySelector('[data-reset-animal]').addEventListener('click', () => {
      this.mammal = null; this.pet = null;
      this.syncChoiceButtons(); this.renderAnimal();
    });
    this.renderMagic(1);
    this.renderAnimal();
  }

  setProject(project) {
    this.project = project;
    this.projectButtons.forEach(button => {
      const on = button.dataset.project === project;
      button.classList.toggle('on', on); button.setAttribute('aria-pressed', String(on));
    });
    this.querySelectorAll('[data-project-panel]').forEach(panel => {
      panel.hidden = panel.dataset.projectPanel !== project;
    });
  }

  renderMagic(n) {
    const response = ANSWERS[n];
    this.querySelector('[data-answer-output]').textContent = String(n);
    this.querySelector('[data-response]').textContent = response;
    showCode(this.querySelector('[data-magic-code]'), MAGIC_CODE, n === 8 ? 9 : n + 1);
    showConsole(this.querySelector('[data-magic-console]'), [`answer = ${n}`, response]);
  }

  syncChoiceButtons() {
    this.querySelectorAll('[data-mammal-choice]').forEach(button => {
      const selected = this.mammal !== null && (button.dataset.mammalChoice === 'yes') === this.mammal;
      button.classList.toggle('on', selected); button.setAttribute('aria-pressed', String(selected));
    });
    this.querySelector('[data-question-two]').hidden = this.mammal !== true;
    this.querySelectorAll('[data-pet-choice]').forEach(button => {
      const selected = this.pet !== null && (button.dataset.petChoice === 'yes') === this.pet;
      button.classList.toggle('on', selected); button.setAttribute('aria-pressed', String(selected));
    });
  }

  renderAnimal() {
    const codeHost = this.querySelector('[data-animal-code]');
    const consoleEl = this.querySelector('[data-animal-console]');
    if (this.mammal === null) {
      this.querySelector('[data-animal-result]').textContent = 'Choose Yes or No to begin the decision tree.';
      showCode(codeHost, '// Answer the outer if condition first.');
      showConsole(consoleEl, ['Waiting for your first answer…']);
      return;
    }
    if (this.mammal && this.pet === null) {
      this.querySelector('[data-animal-result]').textContent = 'mammal = true → enter the outer block; now answer the nested pet question.';
      showCode(codeHost, `boolean mammal = true;\nif (mammal) {\n    // Waiting for the nested "pet?" condition.\n} else {\n    animal = "parrot";\n}`);
      showConsole(consoleEl, ['Outer condition true.', 'Waiting for pet answer…']);
      return;
    }
    const animal = !this.mammal ? 'parrot' : (this.pet ? 'dog' : 'elephant');
    const source = `boolean mammal = ${this.mammal};\nboolean pet = ${Boolean(this.pet)};\nString animal;\nif (mammal) {\n    if (pet) {\n        animal = "dog";\n    } else {\n        animal = "elephant";\n    }\n} else {\n    animal = "parrot";\n}`;
    const line = !this.mammal ? 10 : (this.pet ? 5 : 7);
    this.querySelector('[data-animal-result]').innerHTML = `Path: ${this.mammal ? 'mammal = true' : 'mammal = false'}${this.mammal ? ` → pet = ${this.pet}` : ''} → <strong>${animal}</strong>!`;
    showCode(codeHost, source, line);
    showConsole(consoleEl, [`Guess: ${animal}`]);
  }
}

if (!customElements.get('u3-playground')) customElements.define('u3-playground', U3Playground);
