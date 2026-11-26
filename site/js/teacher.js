// Teacher page. English only. Database text only ever goes in as text (el, textContent).
import { signIn, rest, fetchAll } from './api.js';
import { hardest } from './core.js';
import { LESSONS } from './lessons.js';
import { el, configured } from './ui.js';
import { cleanCode, where, students, studentRow, markItems, markRows, csvText, createDrafts } from './report.js';

const KEY = 'pz:teacher-token';
const app = document.getElementById('app'), message = document.getElementById('message');
let token = null, lessons = [], groups = [];
let group = '', lessonId = '', openKey = null;
// Grows with every new view, so a slow answer cannot draw over a newer one.
let view = 0;
// In memory only, so it outlives redraws and a new sign-in, not a reload.
const drafts = createDrafts();
addEventListener('beforeunload', e => {
  if (!drafts.size) return;
  e.preventDefault();
  e.returnValue = '';
});

// Blocked storage (private mode) only means signing in again after a reload.
try { token = sessionStorage.getItem(KEY); } catch { /* keep null */ }
function keepToken(value) {
  token = value;
  try { value ? sessionStorage.setItem(KEY, value) : sessionStorage.removeItem(KEY); } catch { /* memory only */ }
}

function say(text, bad = true) {
  message.textContent = text;
  message.className = bad ? 'msg no' : 'msg ok';
}

const clear = node => { node.textContent = ''; return node; };
const button = (text, onClick, props = {}) => {
  const node = el('button', { type: 'button', textContent: text, ...props });
  if (onClick) node.onclick = () => run(node, onClick);
  return node;
};

// Every action goes through here: one click at a time, errors shown, an expired sign-in returns to the form.
async function run(control, action) {
  if (control) control.disabled = true;
  say('');
  try { await action(); } catch (e) {
    if (e.status === 401) signOut('Your sign-in has ended. Sign in again.');
    else say(e.status ? `The database refused: ${e.message}` : `Cannot connect (${e.message}). Try again.`);
  } finally { if (control) control.disabled = false; }
}

function signOut(text = '') {
  keepToken(null);
  view++;
  openKey = null;
  showLogin();
  say(text);
}

function showLogin() {
  const email = el('input', { type: 'email', id: 'email', required: true, autocomplete: 'username' });
  const password = el('input', { type: 'password', id: 'password', required: true, autocomplete: 'current-password' });
  const submit = el('button', { type: 'submit', textContent: 'Sign in', disabled: !configured });
  const form = el('form', {}, el('label', {}, 'Email', email), el('label', {}, 'Password', password), submit);
  form.onsubmit = e => {
    e.preventDefault();
    run(submit, async () => {
      let signedIn;
      try { signedIn = await signIn(email.value.trim(), password.value); } catch (error) {
        if (error.status === 400) return say('Wrong email or password, or the email is not confirmed.');
        // Not an expired sign-in: nobody is signed in yet.
        return say(error.status ? `Sign-in failed: ${error.message}` : `Cannot connect (${error.message}). Try again.`);
      }
      keepToken(signedIn);
      await start();
    });
  };
  clear(app).append(form);
  if (!configured) say('This site is not set up yet (not configured). See db/SETUP.md.');
}

async function start() {
  const mine = ++view;
  clear(app).append(el('p', { textContent: 'Loading…' }), button('Sign out', () => signOut()));
  // A non-teacher would only get empty lists, so ask first.
  const teacher = await rest('rpc/is_teacher', { method: 'POST', body: {} }, token);
  if (mine !== view) return;
  if (teacher !== true) {
    return clear(app).append(el('h2', { textContent: 'No access' }),
      el('p', { textContent: 'This account is not a teacher account.' }), button('Sign out', () => signOut()));
  }
  lessons = await Promise.all(LESSONS.filter(l => l.quiz).map(async l => ({
    label: l.no ? `${l.no}. ${l.title.en}` : l.title.en, quiz: (await import(`../quizzes/${l.quiz}.js`)).default,
  })));
  if (mine !== view) return;
  await loadGroups();
}

async function loadGroups() {
  const mine = ++view;
  const list = await fetchAll('groups?order=code', token);
  if (mine !== view) return;
  groups = list;
  if (!groups.some(g => g.code === group)) { group = groups[0]?.code ?? ''; openKey = null; }
  if (!lessons.some(l => l.quiz.id === lessonId)) lessonId = lessons[0].quiz.id;
  showDashboard();
  await loadReport();
}

function showDashboard() {
  const code = el('input', { id: 'new-code', required: true, maxLength: 20, autocomplete: 'off', spellcheck: false });
  const create = el('button', { type: 'submit', textContent: 'Create group' });
  const form = el('form', {}, el('label', {}, 'New group code (4 to 20 characters)', code), create);
  form.onsubmit = e => {
    e.preventDefault();
    run(create, async () => {
      const next = cleanCode(code.value);
      if (!next) return say('A group code needs 4 to 20 characters.');
      try { await rest('groups', { method: 'POST', body: { code: next } }, token); } catch (error) {
        if (error.code !== '23505') throw error;
        return say(`Group ${next} already exists.`);
      }
      group = next;
      openKey = null;
      await loadGroups();
      say(`Group ${next} created.`, false);
    });
  };

  const parts = [el('p', {}, button('Sign out', () => signOut())), el('h2', { textContent: 'Groups' }), form];
  if (!group) return clear(app).append(...parts, el('p', { textContent: 'No groups yet.' }));

  const current = groups.find(g => g.code === group);
  const picker = (label, id, options, value, onChange) => {
    const select = el('select', { id }, ...options.map(([v, text]) => el('option', { value: v, textContent: text })));
    select.value = value;
    select.onchange = () => { onChange(select.value); openKey = null; };
    return el('label', {}, label, select);
  };
  parts.push(
    picker('Group', 'group', groups.map(g => [g.code, g.open ? g.code : `${g.code} (closed)`]), group,
      // The page is redrawn, so keyboard focus is put back on the list.
      value => { group = value; showDashboard(); document.getElementById('group').focus(); run(null, loadReport); }),
    el('p', { textContent: current.open ? 'Open: students can sign in and send answers.'
      : 'Closed: new sign-ins and answers are refused.' }),
    el('p', { className: 'actions' },
      button(current.open ? 'Close group' : 'Open group', async () => {
        await rest(`groups?${where({ code: group })}`, { method: 'PATCH', body: { open: !current.open } }, token);
        await loadGroups();
      }),
      button('Delete group', async () => {
        const gone = group;
        if (!confirm(`Delete group ${gone}?\n\nThis removes the group code and the answers and marks of all its students, in every lesson. It cannot be undone.`)) return;
        await rest(`groups?${where({ code: gone })}`, { method: 'DELETE' }, token);
        drafts.drop([gone]);
        await loadGroups();
        say(`Group ${gone} deleted.`, false);
      }, { className: 'danger' })),
    el('h2', { textContent: 'Results' }),
    picker('Lesson', 'lesson', lessons.map(l => [l.quiz.id, l.label]), lessonId,
      value => { lessonId = value; run(null, loadReport); }),
    el('p', { className: 'actions' }, button('Refresh', loadGroups), button('Download CSV (this group, all lessons)', downloadCSV)),
    el('p', { className: 'note', textContent: 'If Excel shows one column: Data > From Text/CSV, delimiter comma.' }),
    el('div', { id: 'report' }));
  clear(app).append(...parts);
}

async function loadReport() {
  if (!group) return;
  const mine = ++view, quiz = lessons.find(l => l.quiz.id === lessonId).quiz;
  const box = clear(document.getElementById('report'));
  box.append(el('p', { textContent: 'Loading…' }));
  const filter = where({ group_code: group, quiz: quiz.id });
  let subs, marks;
  try {
    [subs, marks] = await Promise.all([
      fetchAll(`submissions?${filter}&order=checked_at,id`, token),
      fetchAll(`marks?${filter}&order=name_key,qid`, token),
    ]);
  } catch (e) {
    if (mine === view) clear(box).append(el('p', { textContent: 'The results did not load. Press Refresh.' }));
    throw e;
  }
  if (mine !== view) return;
  showReport(clear(box), quiz, subs, marks);
}

function showReport(box, quiz, subs, marks) {
  const list = students(subs).map(s => ({ ...s, row: studentRow(quiz, s, marks) }));
  if (!list.length) return box.append(el('p', { textContent: 'No answers for this lesson yet.' }));
  const count = test => list.filter(s => test(s.row)).length;
  box.append(el('p', { className: 'counts', textContent:
    `Started: ${list.length} · Finished: ${count(r => r.finished)} · Students to mark: ${count(r => r.toMark)} · Submissions: ${subs.length}` }));

  const items = quiz.parts.flatMap(p => p.items.map(q => ({ ...q, title: p.title.en.split(':')[0] })));
  const hard = hardest(quiz, subs);
  box.append(el('h3', { textContent: 'Hardest questions' }),
    el('p', { className: 'note', textContent: 'Share of students without full points on their first checked try.' }),
    hard.length ? el('ol', { className: 'hardest' }, ...hard.map(h => {
      const q = items.find(i => i.id === h.qid);
      const detail = el('details', {}, el('summary', { textContent: 'Show question' }));
      if (q.prompt) detail.append(el('p', { className: 'prompt', textContent: q.prompt.en }));
      if (q.code) detail.append(el('pre', { textContent: q.code }));
      return el('li', {}, el('strong', { textContent: `${h.pct}%` }), ` (${h.wrong} of ${h.n}) ${q.title}, ${h.qid}`, detail);
    })) : el('p', { textContent: 'No checked answers yet.' }));

  const panel = el('div', { id: 'panel' });
  const score = (value, max) => `${value ?? '–'}/${max}`;
  const rows = list.map(student => {
    const r = student.row;
    const name = el('th', { scope: 'row', textContent: r.name });
    if (r.unchecked) name.append(el('span', { className: 'flag', textContent: 'code not checked' }));
    return el('tr', {}, name,
      el('td', { textContent: score(r.first, r.autoMax) }),
      el('td', { textContent: score(r.best, r.autoMax) }),
      el('td', { textContent: score(r.written, r.writtenMax) }),
      el('td', { textContent: r.finished ? 'Yes' : 'No' }),
      el('td', { className: 'actions' },
        button(r.remark ? 'Re-mark' : r.toMark ? 'Mark' : 'View', () => {
          openKey = student.key;
          showPanel(panel, quiz, student, marks);
          panel.querySelector('h3').focus();
        }),
        button('Delete', () => deleteStudent(student), { className: 'danger' })));
  });
  box.append(el('h3', { textContent: 'Students' }),
    el('div', { className: 'scroll' }, el('table', {},
      el('thead', {}, el('tr', {}, ...['Name', 'First try', 'Best', 'Written', 'Finished', 'Actions']
        .map(text => el('th', { scope: 'col', textContent: text })))),
      el('tbody', {}, ...rows))),
    panel);
  const open = list.find(s => s.key === openKey);
  if (open) showPanel(panel, quiz, open, marks);
}

function showPanel(panel, quiz, student, marks) {
  const code = group;
  const items = markItems(quiz, student.subs, marks.filter(m => m.name_key === student.key));
  const inputs = {};
  const blocks = items.map(item => {
    const { q, max, answer, state } = item;
    const block = el('div', { className: 'answer' },
      el('h4', { textContent: max ? `Written question ${q.id}` : 'Reflection (no points)' }),
      el('p', { className: 'prompt', textContent: q.prompt.en }));
    if (q.code) block.append(el('pre', { textContent: q.code }));
    block.append(answer === null ? el('p', { className: 'note', textContent: 'No answer yet.' })
      : el('blockquote', { textContent: answer }));
    if (!max || answer === null) return block;
    block.append(el('p', { className: 'state', textContent:
      state === 'changed' ? `Re-mark: the answer changed after it got ${item.old} of ${max}.`
        : state === 'marked' ? 'Marked.' : 'Not marked yet.' }));
    const id = [code, student.key, quiz.id, q.id], stored = String(item.points ?? '');
    const input = inputs[q.id] = el('input', { type: 'number', min: '0', max: String(max), step: 'any',
      value: drafts.get(id, answer) ?? stored });
    input.oninput = () => drafts.type(id, answer, input.value, stored);
    block.append(el('label', {}, `Points for ${q.id} (0 to ${max})`, inputs[q.id]));
    return block;
  });

  const save = el('button', { type: 'submit', textContent: 'Save marks' });
  const form = el('form', { noValidate: true, className: 'marking' }, ...blocks);
  if (Object.keys(inputs).length) form.append(save);
  form.onsubmit = e => {
    e.preventDefault();
    run(save, async () => {
      // A number field reports unreadable text as empty, which would look like "leave as it is".
      const values = Object.fromEntries(Object.entries(inputs)
        .map(([id, input]) => [id, input.validity.badInput ? 'bad' : input.value]));
      const rows = markRows(code, student.key, quiz, items, values);
      if (!rows) return say('Points must be a number from 0 to the maximum shown.');
      if (!rows.length) return say('Write the points first.');
      await rest('marks', { method: 'POST', body: rows, headers: { Prefer: 'resolution=merge-duplicates' } }, token);
      for (const [qid, value] of Object.entries(values)) drafts.saved([code, student.key, quiz.id, qid], value);
      const done = `Marks saved for ${student.name}.`;
      try { await loadReport(); } catch (error) {
        if (error.status === 401) return signOut(`${done} Your sign-in has ended. Sign in again.`);
        return say(`${done} The results did not reload: press Refresh.`);
      }
      say(done, false);
    });
  };
  const title = el('h3', { textContent: `Answers: ${student.name}`, tabIndex: -1 });
  clear(panel).append(title, form, button('Close', () => { openKey = null; clear(panel); }));
}

async function deleteStudent(student) {
  const code = group;
  if (!confirm(`Delete ${student.name} from group ${code}?\n\nThis removes all of this student's answers and marks, in every lesson. It cannot be undone. Close the group first to stop new answers.`)) return;
  const filter = where({ group_code: code, name_key: student.key });
  // Marks first: if the second request fails, the student is still listed and can be deleted again.
  await rest(`marks?${filter}`, { method: 'DELETE' }, token);
  await rest(`submissions?${filter}`, { method: 'DELETE' }, token);
  drafts.drop([code, student.key]);
  if (openKey === student.key) openKey = null;
  await loadReport();
  say(`${student.name} deleted.`, false);
}

async function downloadCSV() {
  const code = group, filter = where({ group_code: code });
  const [subs, marks] = await Promise.all([
    fetchAll(`submissions?${filter}&order=checked_at,id`, token),
    fetchAll(`marks?${filter}&order=name_key,quiz,qid`, token),
  ]);
  // The byte order mark makes Excel read the file as UTF-8.
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csvText(code, lessons, subs, marks)], { type: 'text/csv;charset=utf-8' }));
  const link = el('a', { href: url, download: `${code.replace(/[^\p{L}\p{N}_-]+/gu, '-')}.csv` });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

if (token && configured) run(null, start);
else showLogin();
