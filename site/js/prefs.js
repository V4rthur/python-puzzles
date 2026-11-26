// The language and light/dark buttons at the top of every page.
import { themeSwitch } from './theme-switch.js';

const root = document.documentElement;
const save = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
const bar = document.createElement('div');
bar.className = 'prefs';

// The teacher page is English only.
if (!document.body.classList.contains('teacher')) {
  const lang = document.createElement('button');
  lang.type = 'button';
  lang.className = 'lang';
  // The button is labelled in the language it switches to.
  const show = () => {
    const uz = root.dataset.lang === 'uz';
    root.lang = uz ? 'uz' : 'en';
    lang.textContent = uz ? 'English' : "O'zbekcha";
    lang.lang = uz ? 'en' : 'uz';
  };
  lang.onclick = () => {
    root.dataset.lang = root.dataset.lang === 'uz' ? 'en' : 'uz';
    save('pz:lang', root.dataset.lang);
    show();
  };
  show();
  bar.append(lang);
} else root.dataset.lang = 'en';

bar.append(themeSwitch(theme => save('pz:theme', theme)));
document.body.prepend(bar);
