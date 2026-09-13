/* ============================================================
   AP CSA 复习沙盘 · 共享组件基座（原生 Web Components，零依赖）
   - viz-code    Java 语法高亮代码块（逐行 <span class="ln">）
   - viz-console 假终端（print / clear API）
   - mem-box     内存盒（set() 触发 bounce 数值脉冲）
   - quiz-card   可点选小题卡（单选 / multi 多选，首试统计）
   - makeControls()  沙盘控制条工厂（Reset / prev / next / Auto）
   - initQuizProgress() Quiz 进度（会话内存态，刷新即重置，可重做）
   ============================================================ */

/* ---------- 工具 ---------- */
export const escHTML = s =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const RE_JAVA = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)')|(\b\d+(?:\.\d+)?[fLdD]?\b)|\b(public|class|static|void|int|double|boolean|String|new|return|this|null|true|false|if|else|for|while|do|switch|case|break|continue|private|protected|import|package|final|char|extends)\b/g;

export function highlightJava(src) {
  let out = '', last = 0, m;
  RE_JAVA.lastIndex = 0;
  while ((m = RE_JAVA.exec(src))) {
    out += escHTML(src.slice(last, m.index));
    if (m[1])      out += `<span class="tok-c">${escHTML(m[1])}</span>`;
    else if (m[2]) out += `<span class="tok-s">${escHTML(m[2])}</span>`;
    else if (m[3]) out += `<span class="tok-n">${escHTML(m[3])}</span>`;
    else if (m[4]) out += `<span class="tok-k">${escHTML(m[4])}</span>`;
    last = RE_JAVA.lastIndex;
  }
  return out + escHTML(src.slice(last));
}

function dedent(s) {
  const ls = s.replace(/^\s*\n/, '').split('\n');
  const indents = ls.filter(l => l.trim()).map(l => (/^ */.exec(l) || [''])[0].length);
  const m = indents.length ? Math.min(...indents) : 0;
  return ls.map(l => l.slice(m)).join('\n').replace(/\s+$/, '');
}

function define(name, cls) {
  if (!customElements.get(name)) customElements.define(name, cls);
}

/* ---------- <viz-code> ---------- */
export class VizCode extends HTMLElement {
  connectedCallback() {
    if (this._done) return; this._done = true;
    const src = dedent(this.textContent || '');
    const pre = document.createElement('pre'); pre.className = 'code';
    const code = document.createElement('code');
    code.innerHTML = highlightJava(src)
      .split('\n').map(l => `<span class="ln">${l || ' '}</span>`).join('');
    pre.appendChild(code);
    this.replaceChildren(pre);
  }
  /* 步进器用：高亮/取消高亮某一行（0-based）；传 -1 全部取消 */
  highlightLine(i, { ghost = false } = {}) {
    this.querySelectorAll('.ln').forEach((el, k) => {
      el.classList.toggle('hl', k === i);
      if (ghost) el.classList.toggle('ghost', i >= 0 && k !== i);
    });
  }
}
define('viz-code', VizCode);

/* ---------- <viz-console> ---------- */
export class VizConsole extends HTMLElement {
  connectedCallback() {
    if (this._done) return; this._done = true;
    const title = this.getAttribute('title') || 'Console';
    const head = document.createElement('div'); head.className = 'term-head';
    head.innerHTML = `<span class="td r"></span><span class="td y"></span><span class="td g"></span><span class="term-title"></span>`;
    head.querySelector('.term-title').textContent = title;
    this._body = document.createElement('div');
    this._body.className = 'term-body';
    this._body.setAttribute('aria-live', 'polite');
    this.replaceChildren(head, this._body);
  }
  print(text, kind) {
    const d = document.createElement('div');
    d.className = 'term-line' + (kind ? ' ' + kind : '');
    d.textContent = text;
    this._body.appendChild(d);
    this._body.scrollTop = this._body.scrollHeight;
    return d;
  }
  clear() { this._body.replaceChildren(); }
}
define('viz-console', VizConsole);

/* ---------- <mem-box> ---------- */
export class MemBox extends HTMLElement {
  static get observedAttributes() { return ['value']; }
  connectedCallback() {
    if (this._done) return; this._done = true;
    const n = document.createElement('span'); n.className = 'mem-name';
    n.textContent = this.getAttribute('name') || '';
    this._v = document.createElement('span'); this._v.className = 'mem-value';
    this._v.textContent = this.getAttribute('value') ?? '—';
    this.replaceChildren(n, this._v);
  }
  attributeChangedCallback(a, o, nv) { if (a === 'value' && this._v) this.set(nv); }
  set(v) {
    if (!this._v || this._v.textContent === String(v)) return;
    this._v.textContent = v;
    this._v.classList.remove('pulse'); void this._v.offsetWidth;
    this._v.classList.add('pulse');
  }
  get value() { return this._v ? this._v.textContent : ''; }
}
define('mem-box', MemBox);

/* ---------- makeControls()：沙盘控制条 ---------- */
export function makeControls(handlers = {}) {
  const el = document.createElement('div'); el.className = 'controls';
  const mk = (label, aria, cb, cls = 'btn btn-ghost step-btn') => {
    const b = document.createElement('button');
    b.className = cls; b.textContent = label; b.setAttribute('aria-label', aria);
    b.addEventListener('click', cb); el.appendChild(b); return b;
  };
  const api = { el };
  if (handlers.onReset) api.btnReset = mk('⟲', '重置', handlers.onReset);
  if (handlers.onPrev)  api.btnPrev  = mk('◀', '上一步', handlers.onPrev);
  if (handlers.onNext)  api.btnNext  = mk('▶', '下一步', handlers.onNext);
  if (handlers.onPlay)  {
    api.btnPlay = mk('▶ Auto', 'Auto play', () => {
      const playing = !el.classList.contains('playing');
      api.setPlaying(playing);
      handlers.onPlay(playing);
    });
  }
  api.setPlaying = playing => {
    el.classList.toggle('playing', playing);
    if (api.btnPlay) api.btnPlay.textContent = playing ? '⏸ Pause' : '▶ Auto';
  };
  return api;
}

/* ---------- <quiz-card> ---------- */
export class QuizCard extends HTMLElement {
  connectedCallback() {
    if (this._done) return; this._done = true;
    this.qno = this.getAttribute('qno') || '';
    this.multi = this.hasAttribute('multi');
    this.attempts = 0; this.done = false;

    this.querySelectorAll('.options li').forEach(li => {
      li.setAttribute('role', 'button'); li.tabIndex = 0;
      li.addEventListener('click', () => this.select(li));
      li.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.select(li); }
      });
    });

    if (this.multi) {
      const row = document.createElement('div'); row.className = 'check-row';
      this._checkBtn = document.createElement('button');
      this._checkBtn.className = 'btn'; this._checkBtn.textContent = 'Check my answer';
      this._checkBtn.addEventListener('click', () => this.checkMulti());
      row.appendChild(this._checkBtn);
      (this.querySelector('.options') || this).after(row);
    }

    const v = document.createElement('p');
    v.className = 'verdict'; v.setAttribute('aria-live', 'polite'); v.setAttribute('role', 'status');
    (this.querySelector('.explain') || this.lastElementChild).before(v);
    this._verdict = v;
  }

  select(li) {
    if (this.done || li.classList.contains('wrong')) return;
    if (this.multi) { li.classList.toggle('selected'); return; }
    this.attempts++;
    if (li.hasAttribute('data-correct')) {
      li.classList.add('correct');
      this.finish(this.attempts === 1);
    } else {
      li.classList.add('wrong');
      this.verdict(false, '✗ 不对，再想想（可以继续选）');
    }
  }

  checkMulti() {
    if (this.done) return;
    this.attempts++;
    const opts = [...this.querySelectorAll('.options li')];
    const correct = opts.filter(li => li.hasAttribute('data-correct'));
    const chosen = opts.filter(li => li.classList.contains('selected'));
    const exact = correct.length === chosen.length &&
      correct.every(li => li.classList.contains('selected'));
    if (exact) {
      correct.forEach(li => li.classList.add('correct'));
      this.finish(this.attempts === 1);
    } else {
      chosen.filter(li => !li.hasAttribute('data-correct'))
        .forEach(li => { li.classList.remove('selected'); li.classList.add('wrong'); });
      this.verdict(false, '✗ 还不完全对——错选已排除，继续挑');
    }
  }

  finish(firstTry) {
    this.done = true; this.classList.add('done');
    if (this._checkBtn) this._checkBtn.disabled = true;
    this.querySelectorAll('.options li[data-correct]').forEach(li => li.classList.add('correct'));
    this.verdict(true, firstTry ? '✓ 一次答对！' : '✓ 答对了（首次尝试未命中——再练一遍巩固）');
    this.dispatchEvent(new CustomEvent('quiz-answered', {
      bubbles: true, detail: { qno: this.qno, first: firstTry },
    }));
  }


  verdict(ok, text) {
    if (!this._verdict) return;
    this._verdict.className = 'verdict ' + (ok ? 'ok' : 'bad');
    this._verdict.textContent = text;
  }
}
define('quiz-card', QuizCard);

/* ---------- Quiz 进度（仅本次会话，刷新即重置，可重新作答） ---------- */
export function initQuizProgress() {
  const cards = [...document.querySelectorAll('quiz-card[qno]')];
  if (!cards.length) return;
  const holders = [...document.querySelectorAll('[data-quiz-progress]')];
  const state = {};   // 内存态，不落盘

  const render = () => {
    const done = cards.filter(c => state[c.qno]).length;
    const first = cards.filter(c => state[c.qno] && state[c.qno].first).length;
    holders.forEach(h => {
      const dots = cards.map(c => {
        const st = state[c.qno];
        return `<span class="qp-dot ${st ? (st.first ? 'ok' : 'bad') : ''}" title="${c.qno}"></span>`;
      }).join('');
      h.innerHTML =
        `<span class="qp-text"><strong>Quiz 进度</strong>　${done}/${cards.length} 完成 · 首试答对 <strong>${first}</strong> 道</span>` +
        `<span class="qp-dots">${dots}</span><button class="btn-ghost qp-reset" type="button">⟲ Reset</button>`;
      h.querySelector('.qp-reset').addEventListener('click', () => location.reload());
    });
  };

  document.addEventListener('quiz-answered', e => {
    const { qno, first } = e.detail || {};
    if (!qno) return;
    state[qno] = { first };
    render();
    holders.forEach(h => { h.classList.remove('bump'); void h.offsetWidth; h.classList.add('bump'); });
  });

  render();
}

/* ---------- 主题切换 ---------- */
export function initThemeToggle() {
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    const sync = () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      btn.textContent = dark ? '☀️ Light' : '🌙 Dark';
      btn.setAttribute('aria-label', '切换深色/浅色主题');
    };
    btn.addEventListener('click', () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      document.documentElement.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem('apcsa-theme', dark ? 'light' : 'dark'); } catch (e) {}
      sync();
    });
    sync();
  });
}

/* ---------- 滚动入场 ---------- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

/* 副作用初始化 */
initThemeToggle();
initQuizProgress();
