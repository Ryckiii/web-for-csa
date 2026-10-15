/* 首页：Unit 1 卡片里的打字机小剧场 */
import './components.js';

const term = document.getElementById('u1-term');
const LINES = [
  { t: 'System.out.println(2 / 3);',   cls: 'cmd' },
  { t: '0',                            cls: 'res' },
  { t: 'System.out.println(2.0 / 3);', cls: 'cmd' },
  { t: '0.6666666666666666',           cls: 'res' },
  { t: '// 差一个 .0，天壤之别',        cls: 'dim' },
];
const wait = ms => new Promise(r => setTimeout(r, ms));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

async function play() {
  if (!term) return;
  if (reduced) {                     // 降低动态偏好：静态铺满即可，不循环
    term.clear();
    LINES.forEach(l => term.print(l.t, l.cls));
    return;
  }
  for (;;) {
    term.clear();
    for (const line of LINES) {
      const el = term.print('', line.cls);
      for (const ch of line.t) { el.textContent += ch; await wait(28); }
      await wait(line.cls === 'res' ? 850 : 350);
    }
    await wait(2100);
  }
}
play();

/* Unit carousel: vertical mouse wheels become horizontal scroll; controls, drag and arrows also work. */
const unitRail = document.querySelector('[data-unit-carousel]');
if (unitRail) {
  const cards = [...unitRail.querySelectorAll(':scope > .card')];
  const controls = document.querySelector('[data-carousel-controls]');
  const previous = controls?.querySelector('[data-carousel-prev]');
  const next = controls?.querySelector('[data-carousel-next]');
  const position = controls?.querySelector('[data-carousel-position]');
  const getMax = () => Math.max(0, unitRail.scrollWidth - unitRail.clientWidth);
  let cardStep = 0;
  const updateControls = () => {
    const max = getMax();
    const prevDisabled = unitRail.scrollLeft <= 1;
    const nextDisabled = unitRail.scrollLeft >= max - 1;
    if (previous && previous.disabled !== prevDisabled) previous.disabled = prevDisabled;
    if (next && next.disabled !== nextDisabled) next.disabled = nextDisabled;
    if (!position || !cards.length || cardStep <= 0) return;
    const left = unitRail.scrollLeft;
    const right = left + unitRail.clientWidth;
    const first = Math.max(0, Math.min(cards.length - 1, Math.floor((left + 1) / cardStep)));
    const last = Math.max(first, Math.min(cards.length - 1, Math.ceil((right - 1) / cardStep) - 1));
    const label = `${first + 1}–${last + 1} / ${cards.length}`;
    if (position.textContent !== label) position.textContent = label;
  };
  const refreshGeometry = () => {
    const gap = parseFloat(getComputedStyle(unitRail).columnGap) || 0;
    cardStep = (cards[0]?.getBoundingClientRect().width || 0) + gap;
    updateControls();
  };

  let wheelTarget = null;
  let wheelFrame = 0;
  let lastWheelFrame = 0;
  const stopWheelAnimation = () => {
    if (wheelFrame) cancelAnimationFrame(wheelFrame);
    wheelFrame = 0;
    wheelTarget = null;
    lastWheelFrame = 0;
    unitRail.classList.remove('is-wheel-scrolling');
  };
  const animateWheel = timestamp => {
    if (wheelTarget === null) { wheelFrame = 0; lastWheelFrame = 0; return; }
    const current = unitRail.scrollLeft;
    const remaining = wheelTarget - current;
    if (Math.abs(remaining) < .8) {
      unitRail.scrollLeft = wheelTarget;
      wheelFrame = 0;
      wheelTarget = null;
      lastWheelFrame = 0;
      unitRail.classList.remove('is-wheel-scrolling');
      return;
    }
    const elapsed = lastWheelFrame ? Math.min(48, timestamp - lastWheelFrame) : 16.67;
    lastWheelFrame = timestamp;
    const blend = 1 - Math.pow(.7, elapsed / 16.67);
    unitRail.scrollLeft = current + remaining * blend;
    wheelFrame = requestAnimationFrame(animateWheel);
  };
  const moveOneCard = direction => {
    stopWheelAnimation();
    const gap = parseFloat(getComputedStyle(unitRail).columnGap) || 0;
    const distance = Math.min(unitRail.clientWidth, (cards[0]?.getBoundingClientRect().width || unitRail.clientWidth) + gap);
    unitRail.scrollBy({ left:direction * distance, behavior:reduced ? 'auto' : 'smooth' });
  };
  previous?.addEventListener('click', () => moveOneCard(-1));
  next?.addEventListener('click', () => moveOneCard(1));

  /* Capture wheel events so embedded card content cannot swallow the horizontal gesture. */
  unitRail.addEventListener('wheel', event => {
    const max = getMax();
    if (max <= 1) return;
    const rawDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? unitRail.clientWidth : 1;
    const start = wheelTarget === null ? unitRail.scrollLeft : wheelTarget;
    const target = Math.max(0, Math.min(max, start + rawDelta * scale));
    if (Math.abs(target - start) > 1) {
      event.preventDefault();
      if (reduced) {
        stopWheelAnimation();
        unitRail.scrollLeft = target;
      } else {
        wheelTarget = target;
        unitRail.classList.add('is-wheel-scrolling');
        if (!wheelFrame) wheelFrame = requestAnimationFrame(animateWheel);
      }
    }
  }, { passive:false, capture:true });

  /* Let desktop users grab and pull the cards; preserve ordinary clicks when there was no drag. */
  let activePointer = null;
  let startX = 0;
  let startScroll = 0;
  let dragged = false;
  let suppressClick = false;
  unitRail.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !event.isPrimary) return;
    if (event.target.closest('button, input, select, textarea, [contenteditable="true"]')) return;
    stopWheelAnimation();
    activePointer = event.pointerId;
    startX = event.clientX;
    startScroll = unitRail.scrollLeft;
    dragged = false;
  });
  unitRail.addEventListener('pointermove', event => {
    if (event.pointerId !== activePointer) return;
    const distance = event.clientX - startX;
    if (!dragged && Math.abs(distance) < 6) return;
    if (!dragged) {
      dragged = true;
      try { unitRail.setPointerCapture(event.pointerId); } catch (_) {}
    }
    unitRail.classList.add('is-dragging');
    unitRail.scrollLeft = startScroll - distance;
    event.preventDefault();
  });
  const finishDrag = event => {
    if (event.pointerId !== activePointer) return;
    if (dragged) {
      suppressClick = true;
      unitRail.classList.remove('is-dragging');
      requestAnimationFrame(() => { suppressClick = false; });
    }
    activePointer = null;
    dragged = false;
  };
  unitRail.addEventListener('pointerup', finishDrag);
  unitRail.addEventListener('pointercancel', finishDrag);
  unitRail.addEventListener('click', event => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick = false;
  }, true);

  unitRail.addEventListener('scroll', updateControls, { passive:true });
  window.addEventListener('resize', refreshGeometry, { passive:true });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(refreshGeometry);
    observer.observe(unitRail);
    unitRail._carouselResizeObserver = observer;
  }
  unitRail.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    moveOneCard(event.key === 'ArrowRight' ? 1 : -1);
  });
  requestAnimationFrame(refreshGeometry);
}
