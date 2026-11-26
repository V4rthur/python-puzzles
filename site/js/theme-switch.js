// Light/dark button. The ink-bleed animation (vendor/ink) loads on the first click;
// without it (offline, old browser, reduced motion) the theme simply switches.
const SUN = 'M12 7a5 5 0 1 1 0 10a5 5 0 1 1 0-10z';
const MOON = 'M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a7.2 7.2 0 0 0 9.7 9.7z';
const RAYS = [[12, 1.5, 12, 3.5], [12, 20.5, 12, 22.5], [1.5, 12, 3.5, 12], [20.5, 12, 22.5, 12],
  [4.58, 4.58, 6, 6], [18, 18, 19.42, 19.42], [4.58, 19.42, 6, 18], [18, 6, 19.42, 4.58]];
const WAIT_MS = 2500;
const COVER_MS = 5000;

const svg = (tag, attrs) => {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
};

export function themeSwitch(onChange) {
  const root = document.documentElement;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle';
  button.setAttribute('aria-label', 'Dark mode');
  button.setAttribute('data-ink-live', '');
  const icon = svg('svg', { viewBox: '0 0 24 24', width: 20, height: 20, 'aria-hidden': 'true' });
  const body = svg('path', { class: 'theme-toggle__body' });
  const rays = svg('g', { class: 'theme-toggle__rays' });
  rays.append(...RAYS.map(([x1, y1, x2, y2]) => svg('line', { x1, y1, x2, y2 })));
  icon.append(body, rays);
  button.append(icon);

  const dark = () => root.dataset.theme === 'dark';
  const pose = () => {
    button.setAttribute('aria-pressed', String(dark()));
    body.setAttribute('d', dark() ? MOON : SUN);
    rays.style.opacity = dark() ? 0 : 1;
  };
  pose();

  let loading, ink, cover, busy = false;
  const load = () => loading || (loading = import('../vendor/ink/ui/inkTransition.js').then(({ InkTransition }) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'ink-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('data-html2canvas-ignore', '');
    document.body.append(canvas);
    rays.style.opacity = '';
    return new InkTransition(canvas, button);
  }));
  const timeout = () => new Promise((_, reject) => setTimeout(() => reject(new Error('slow')), WAIT_MS));

  button.onclick = async e => {
    if (busy) return;
    busy = true;
    const want = dark() ? 'light' : 'dark';
    const point = e.detail === 0 ? undefined : { x: e.clientX, y: e.clientY };
    try {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) throw new Error('reduced motion');
      ink = ink || await Promise.race([load(), timeout()]);
      if (!ink.isAnimating) {
        root.dataset.rev = Number(root.dataset.rev || 0) + 1;
        await Promise.race([ink.captureAll(), timeout()]);
      }
      ink.toggle(point);
      // If frames stall (slow phone, hidden tab), never leave the snapshot covering the live page.
      clearTimeout(cover);
      cover = setTimeout(() => { ink.cancel(); ink.icon.set(root.dataset.theme); }, COVER_MS);
    } catch {
      root.dataset.theme = want;
      if (ink) ink.icon.set(want); else pose();
      button.setAttribute('aria-pressed', String(want === 'dark'));
    } finally { busy = false; }
    onChange(want);
  };
  return button;
}
