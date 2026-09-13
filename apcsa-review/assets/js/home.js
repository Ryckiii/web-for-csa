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
