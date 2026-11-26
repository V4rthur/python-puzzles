// Generated from codemure-official/ink-bleed-theme-changer (MIT, see ../LICENSE).
                                     

const root = document.documentElement;

export function getTheme()        {
  return root.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function otherTheme(theme       )        {
  return theme === 'dark' ? 'light' : 'dark';
}

/** Instantly applies a theme to the live DOM and keeps the toggle's ARIA state in sync. */
export function applyTheme(theme       , toggle                           )       {
  root.dataset.theme = theme;
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  }
}
