# Python puzzles

A website where students solve Python puzzles in English and Uzbek, and the teacher sees and marks their answers. The website is the `site/` folder. Answers are stored in a Supabase project.

**Results are practice data.** The answer keys can be read in the page source, scores can be faked, and anyone with a group code can send answers under any name. Do not use the results as exam grades.

## Setup

Follow [db/SETUP.md](db/SETUP.md). Only the **public** Supabase key goes in `site/js/config.js`, never the secret or `service_role` key.

Every push to `main` publishes `site/` with GitHub Pages. The teacher page is `teacher.html`.

## If the site cannot connect

Free Supabase projects pause after about a week without use. Open the project at supabase.com, restore it, and wait until it is active.

## Credits

The light/dark animation in `site/vendor/ink/` is generated from
[ink-bleed-theme-changer](https://github.com/codemure-official/ink-bleed-theme-changer) (MIT, see `site/vendor/ink/LICENSE`).
It loads GSAP (its own standard licence) and html2canvas (MIT) from cdn.jsdelivr.net.
