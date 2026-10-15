/* Unit 2 · §2.8 Wrapper Classes: explicit and automatic conversions. */
import '../../../assets/js/components.js';

function wrapperCode(host, source) {
  const code = document.createElement('viz-code');
  code.textContent = source;
  host.replaceChildren(code);
  return code;
}

class U2WrapperLab extends HTMLElement {
  connectedCallback() {
    if (this._done) return;
    this._done = true;
    this.kind = 'int';
    this.value = 5;
    this.stages = { explicit: 0, automatic: 0 };
    this.innerHTML = `
      <div class="u2-wrapper-lab">
        <div class="u2-wrapper-toolbar">
          <label class="u2-field"><span>转换类型</span>
            <select class="u2-select" data-kind aria-label="选择 primitive 与 wrapper 类型">
              <option value="int">int ↔ Integer</option>
              <option value="double">double ↔ Double</option>
            </select>
          </label>
          <label class="u2-field"><span>primitive 值</span>
            <input class="u2-input" data-value type="number" value="5" step="1" aria-label="输入 primitive 数值">
          </label>
        </div>
        <div class="u2-wrapper-tracks">
          <div class="u2-wrap-track" data-track="explicit">
            <h5 class="u2-lab-title">显式 Boxing / Unboxing</h5>
            <div class="u2-code-host" data-code></div>
            <div class="u2-wrap-flow" data-flow></div>
            <div class="controls u2-control-row">
              <button class="btn step-btn" type="button" data-next>▶ 下一步</button>
              <button class="btn-ghost step-btn" type="button" data-reset>⟲ 重置</button>
            </div>
            <p class="u2-track-note" data-note aria-live="polite"></p>
          </div>
          <div class="u2-wrap-track" data-track="automatic">
            <h5 class="u2-lab-title">Autoboxing / Auto-unboxing</h5>
            <div class="u2-code-host" data-code></div>
            <div class="u2-wrap-flow" data-flow></div>
            <div class="controls u2-control-row">
              <button class="btn step-btn" type="button" data-next>▶ 下一步</button>
              <button class="btn-ghost step-btn" type="button" data-reset>⟲ 重置</button>
            </div>
            <p class="u2-track-note" data-note aria-live="polite"></p>
          </div>
        </div>
        <p class="note-chip">Wrapper class 属于 <code>java.lang</code>；<code>Integer</code> 包装 <code>int</code>，<code>Double</code> 包装 <code>double</code>。自动装箱/拆箱会隐式完成对应转换。</p>

        <div class="u2-sub-lab u2-int-boundary">
          <div class="u2-boundary-overview">
            <h5 class="u2-lab-title">Integer 的 32-bit 边界</h5>
            <div class="u2-boundary-values" aria-label="Integer 的最小值和最大值">
              <div><code>Integer.MIN_VALUE</code><b>-2147483648</b></div>
              <div><code>Integer.MAX_VALUE</code><b>2147483647</b></div>
            </div>
            <p class="u2-small-note">int 溢出不会抛异常，而是按 32-bit 有符号整数的范围回绕；0 既非正也非负。</p>
          </div>
          <div class="u2-button-row">
            <button class="btn-ghost" type="button" data-overflow="max">MAX_VALUE + 1</button>
            <button class="btn-ghost" type="button" data-overflow="min">MIN_VALUE - 1</button>
          </div>
          <viz-code>System.out.println(Integer.MAX_VALUE + 1);
System.out.println(Integer.MIN_VALUE - 1);</viz-code>
          <viz-console title="Integer boundary output"></viz-console>
        </div>
      </div>`;

    this.kindSelect = this.querySelector('[data-kind]');
    this.valueInput = this.querySelector('[data-value]');
    this.valueInput.addEventListener('input', () => {
      const v = Number(this.valueInput.value);
      if (Number.isFinite(v)) this.value = this.kind === 'int' ? Math.trunc(v) : v;
      this.renderTracks();
    });
    this.kindSelect.addEventListener('change', () => {
      this.kind = this.kindSelect.value;
      this.value = this.kind === 'int' ? 5 : 6.5;
      this.valueInput.step = this.kind === 'int' ? '1' : 'any';
      this.valueInput.value = String(this.value);
      this.stages = { explicit: 0, automatic: 0 };
      this.renderTracks();
    });

    this.tracks = {};
    this.querySelectorAll('[data-track]').forEach(track => {
      const key = track.dataset.track;
      this.tracks[key] = {
        el: track,
        codeHost: track.querySelector('[data-code]'),
        flow: track.querySelector('[data-flow]'),
        note: track.querySelector('[data-note]'),
        next: track.querySelector('[data-next]'),
      };
      track.querySelector('[data-next]').addEventListener('click', () => {
        this.stages[key] = Math.min(2, this.stages[key] + 1); this.renderTrack(key);
      });
      track.querySelector('[data-reset]').addEventListener('click', () => {
        this.stages[key] = 0; this.renderTrack(key);
      });
    });
    this.console = this.querySelector('viz-console');
    this.querySelectorAll('[data-overflow]').forEach(b => b.addEventListener('click', () => this.showOverflow(b.dataset.overflow)));
    this.renderTracks();
  }

  typeNames() {
    return this.kind === 'int'
      ? { primitive: 'int', wrapper: 'Integer', field: 'intValue()', value: String(Math.trunc(this.value)) }
      : { primitive: 'double', wrapper: 'Double', field: 'doubleValue()', value: String(this.value) };
  }

  renderTracks() {
    this.renderTrack('explicit');
    this.renderTrack('automatic');
  }

  renderTrack(key) {
    const t = this.tracks[key];
    const type = this.typeNames();
    const stage = this.stages[key];
    const v = type.value;
    const lines = key === 'explicit'
      ? [`${type.primitive} x = ${v};`, `${type.wrapper} boxed = new ${type.wrapper}(x); // explicit boxing`, `${type.primitive} restored = boxed.${type.field}; // explicit unboxing`]
      : [`${type.primitive} x = ${v};`, `${type.wrapper} boxed = x; // autoboxing`, `${type.primitive} restored = boxed; // auto-unboxing`];
    const code = wrapperCode(t.codeHost, lines.join('\n'));
    code.highlightLine(stage);
    t.next.disabled = stage === 2;

    t.flow.replaceChildren();
    const nodes = [
      { cls: 'primitive', title: `${type.primitive} x`, value: stage >= 0 ? v : '—', live: true },
      { cls: 'wrapper', title: type.wrapper, value: stage >= 1 ? v : '—', live: stage >= 1 },
      { cls: 'primitive restored', title: `${type.primitive} restored`, value: stage >= 2 ? v : '—', live: stage >= 2 },
    ];
    nodes.forEach((n, i) => {
      const card = document.createElement('div'); card.className = `u2-wrap-node ${n.cls}` + (n.live ? ' live' : '');
      const title = document.createElement('span'); title.textContent = n.title;
      const value = document.createElement('b'); value.textContent = n.value;
      card.append(title, value); t.flow.appendChild(card);
      if (i < nodes.length - 1) {
        const arrow = document.createElement('span'); arrow.className = 'u2-wrap-arrow'; arrow.textContent = i === 0 ? '→' : '→';
        t.flow.appendChild(arrow);
      }
    });
    const notes = [
      '起点：primitive 在变量中直接保存数值。点下一步完成 boxing。',
      key === 'explicit'
        ? '显式 boxing：调用 wrapper 的构造器把 primitive 包装成对象。'
        : 'Autoboxing：赋值时 Java 自动把 primitive 转成对应 wrapper 对象。',
      key === 'explicit'
        ? '显式 unboxing：调用 intValue() / doubleValue() 取出 primitive。'
        : 'Auto-unboxing：赋值时 Java 自动从 wrapper 对象取出 primitive。',
    ];
    t.note.textContent = notes[stage];
  }

  showOverflow(kind) {
    this.console.clear();
    if (kind === 'max') {
      this.console.print('Integer.MAX_VALUE + 1', 'cmd');
      this.console.print('-2147483648  (Integer.MIN_VALUE)', 'res');
    } else {
      this.console.print('Integer.MIN_VALUE - 1', 'cmd');
      this.console.print('2147483647  (Integer.MAX_VALUE)', 'res');
    }
  }
}

if (!customElements.get('u2-wrapperlab')) customElements.define('u2-wrapperlab', U2WrapperLab);
