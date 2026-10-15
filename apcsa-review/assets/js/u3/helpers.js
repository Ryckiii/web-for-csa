/* Shared tiny helpers for Unit 3 labs. */
export function showCode(host, source, activeLine = -1) {
  const code = document.createElement('viz-code');
  code.textContent = source;
  host.replaceChildren(code);
  if (activeLine >= 0) code.highlightLine(activeLine);
  return code;
}

export function showConsole(consoleEl, lines = []) {
  consoleEl.clear();
  lines.forEach(line => consoleEl.print(String(line), 'res'));
}

export function setPressed(buttons, selected) {
  buttons.forEach(button => {
    const on = button.dataset.mode === selected;
    button.classList.toggle('on', on);
    button.setAttribute('aria-pressed', String(on));
  });
}
