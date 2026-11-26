import { LESSONS } from './lessons.js';
import { checkGroup } from './api.js';
import { storage, getStudent, setStudent, clearStudent, load, progressRows } from './store.js';
import { cover } from './figures.js';
import { T, el, tx, configured, NOT_CONFIGURED, startSync } from './ui.js';

const app = document.getElementById('app');
const STATES = {
  new: T('Not started', 'Boshlanmagan'),
  started: T('Started', 'Boshlangan'),
  done: T('Done', 'Bajarildi'),
  soon: T('Soon', 'Tez orada'),
  unknown: T('Score not available', "Natija ko'rinmayapti"),
};

startSync(document.getElementById('status'), storage);

// A lesson file that fails to load only costs that row its score.
const quizzes = Promise.all(LESSONS.filter(l => l.quiz).map(l =>
  import(`../quizzes/${l.quiz}.js`).then(m => [l.quiz, m.default], () => [l.quiz, null]))).then(Object.fromEntries);

function signIn() {
  const code = el('input', { id: 'code', required: true, maxLength: 20, autocomplete: 'off', spellcheck: false });
  code.setAttribute('autocapitalize', 'characters');
  const name = el('input', { id: 'name', required: true, maxLength: 60, autocomplete: 'off', spellcheck: false });
  const button = tx(el('button', { type: 'submit', className: 'go' }), T('Sign in', 'Kirish'));
  const message = el('p', { className: 'msg no' });
  message.setAttribute('role', 'alert');
  const form = el('form', {},
    el('label', {}, tx(el('span'), T('Group code', 'Guruh kodi')), code),
    el('label', {}, tx(el('span'), T('Your name', 'Ismingiz')), name),
    tx(el('p', { className: 'note' }), T('If two students have the same name, add an initial.',
      "Ikki talabaning ismi bir xil bo'lsa, familiyaning bosh harfini qo'shing.")),
    button, message);
  if (!configured) {
    button.disabled = true;
    tx(message, NOT_CONFIGURED);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const student = { code: code.value.trim(), name: name.value.trim() };
    if (!student.code || !student.name) return void tx(message, T('Write the group code and your name.', 'Guruh kodi va ismingizni yozing.'));
    button.disabled = true;
    message.textContent = '';
    let open;
    try { open = await checkGroup(student.code); } catch {
      return void tx(message, T('Cannot connect. Check the internet connection and try again.',
        "Ulanib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring."));
    } finally { button.disabled = false; }
    if (!open) return void tx(message, T('This group code is unknown or closed.', "Bu guruh kodi noma'lum yoki yopilgan."));
    if (!setStudent(student)) return void tx(message, T('This browser does not allow saving. Leave private mode or allow site data.',
      "Bu brauzer saqlashga ruxsat bermayapti. Maxfiy rejimdan chiqing yoki sayt ma'lumotlariga ruxsat bering."));
    render();
  });
  return form;
}

function lessonList(student, loaded) {
  const { rows, done, total } = progressRows(LESSONS, loaded, load);
  const out = tx(el('button', { type: 'button', className: 'link' }), T('Not you?', 'Bu siz emasmisiz?'));
  out.onclick = () => { clearStudent(); render(); };
  const title = row => T(row.no ? `${row.no}. ${row.title.en}` : row.title.en, row.no ? `${row.no}. ${row.title.uz}` : row.title.uz);
  // Puzzles that are ready get a drawing; the rest wait in a short list. Both keep the teaching order.
  const covers = el('ol', { className: 'covers' }, ...rows.filter(r => r.quiz).map(row => {
    const info = el('span', { className: 'info' }, tx(el('span'), STATES[row.state]));
    if (row.max != null) info.append(tx(el('span', { className: 'best' }), T(`Best ${row.best}/${row.max}`, `Eng yaxshi: ${row.best}/${row.max}`)));
    return el('li', {}, el('a', { href: `lesson.html?q=${row.quiz}` }, cover(row.quiz), tx(el('span', { className: 'title' }), title(row)), info));
  }));
  const soon = el('ol', { className: 'lessons' }, ...rows.filter(r => !r.quiz).map(row =>
    el('li', {}, el('div', { className: 'soon' }, tx(el('span'), title(row)), tx(el('span', { className: 'info' }), STATES.soon)))));
  const bar = el('progress', { max: total, value: done });
  bar.setAttribute('aria-label', 'Progress / Natija');
  return el('div', {},
    el('p', { className: 'who' }, el('strong', { textContent: student.name }), ` · ${student.code} `, out),
    tx(el('p', { className: 'progress' }), T(`${done} of ${total} done`, `${total} tadan ${done} tasi bajarildi`)),
    bar,
    covers, tx(el('h2'), T('Coming soon', 'Tez orada')), soon);
}

async function render() {
  const loaded = await quizzes, student = getStudent();
  app.textContent = '';
  app.append(tx(el('h1'), T('Python puzzles', 'Python boshqotirmalari')), student ? lessonList(student, loaded) : signIn());
}

render();
// Coming back with the Back button, or signing in or out in another tab.
addEventListener('pageshow', e => { if (e.persisted) render(); });
addEventListener('storage', e => { if (e.key === 'pz:student') render(); });
