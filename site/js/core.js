// Only the values and their order count: brackets, commas and quotes are ignored.
export const norm = s => s.replace(/[\[\](){},'"]/g, ' ').trim().replace(/\s+/g, ' ');

export const pointsOf = item => item.points ?? (item.type === 'code' ? item.tests.length : 1);

// Auto-scored questions; the warm-up never counts.
const autoItems = quiz => quiz.parts.filter(p => p.id !== 'warmup').flatMap(p =>
  p.items.filter(q => q.type !== 'written' && pointsOf(q) > 0).map(q => ({ ...q, part: p.id })));

export const autoMax = quiz => autoItems(quiz).reduce((t, q) => t + pointsOf(q), 0);

export const scoredParts = quiz => quiz.parts
  .filter(p => p.id !== 'warmup' && p.items.some(q => pointsOf(q) > 0)).map(p => p.id);

// Ids of the tower blocks a student earned: auto-scored questions that ever got full points.
export const earned = (quiz, subs) => new Set(autoItems(quiz)
  .filter(q => subs.some(s => s.part === q.part && s.results?.[q.id] === pointsOf(q))).map(q => q.id));

export const nameKey = name => name.trim().replace(/\s+/g, ' ').toLowerCase();

export const isFilled = (item, value = '') =>
  value.trim() !== '' && !(item.type === 'code' && value.trim() === (item.start ?? '').trim());

const byTime = subs => [...subs].sort((a, b) => Date.parse(a.checked_at) - Date.parse(b.checked_at));

// Submissions are student-supplied JSON: anything but a number from 0 to the item's points counts as "not checked".
const resultOf = (s, item) => {
  const r = s.results?.[item.id];
  return typeof r === 'number' && r >= 0 && r <= pointsOf(item) ? r : null;
};

// First non-null result of one question; `sorted` must be in time order.
const firstResult = (sorted, item) => sorted.map(s => resultOf(s, item)).find(r => r != null);

// `subs`: one student's submissions for this quiz only.
export function summarize(quiz, subs) {
  const sorted = byTime(subs), items = autoItems(quiz), levels = scoredParts(quiz);
  const first = items.reduce((t, q) => t + (firstResult(sorted, q) ?? 0), 0);
  const best = levels.reduce((total, part) => total + subs.filter(s => s.part === part)
    .map(s => items.filter(q => q.part === part).reduce((t, q) => t + (resultOf(s, q) ?? 0), 0))
    .reduce((a, b) => Math.max(a, b), 0), 0);
  // Finished: every level was sent, and every auto-scored question in it was checked at least once.
  const tried = (part, q) => subs.some(s => s.part === part && Object.prototype.hasOwnProperty.call(s.results ?? {}, q.id));
  const finished = levels.every(part => subs.some(s => s.part === part) && items.filter(q => q.part === part).every(q => tried(part, q)));
  return { first, best, finished };
}

// What to send after checking one question: that level's questions checked so far, each with its latest answer and result.
export function levelState(subs, part, qid, answer, result) {
  const answers = {}, results = {};
  for (const s of byTime(subs.filter(s => s.part === part))) {
    Object.assign(answers, s.answers);
    Object.assign(results, s.results);
  }
  return { answers: { ...answers, [qid]: answer }, results: { ...results, [qid]: result } };
}

// `subs`: submissions for this quiz only, from any number of students.
export function hardest(quiz, subs) {
  const students = new Map();
  for (const s of byTime(subs)) {
    const key = JSON.stringify([s.group_code, s.name_key]);
    if (!students.has(key)) students.set(key, []);
    students.get(key).push(s);
  }
  return autoItems(quiz).flatMap(q => {
    const firsts = [...students.values()].map(list => firstResult(list, q)).filter(r => r != null);
    const n = firsts.length, wrong = firsts.filter(r => r < pointsOf(q)).length;
    return n ? [{ qid: q.id, part: q.part, wrong, n, pct: Math.round(100 * wrong / n) }] : [];
  }).sort((a, b) => b.pct - a.pct);
}

// Every question's latest non-blank answer; callers pick the written ones.
export const latestWritten = subs => Object.fromEntries(byTime(subs)
  .flatMap(s => Object.entries(s.answers ?? {})).filter(([, a]) => typeof a === 'string' && a.trim() !== ''));

// `subs` and `marks` belong to one student.
export function needsMarking(quiz, subs, marks) {
  const latest = latestWritten(subs);
  return quiz.parts.flatMap(p => p.items)
    .filter(q => q.type === 'written' && pointsOf(q) > 0 && q.id in latest
      && !marks.some(m => m.quiz === quiz.id && m.qid === q.id && m.answer === latest[q.id]))
    .map(q => q.id);
}

// A leading ' stops spreadsheets from running student text as a formula.
const csvCell = v => {
  // Also after ';' and line breaks, where such a locale starts a new cell; there a " could wrap a formula too.
  if (typeof v === 'string') v = v.replace(/(^(?=[=+\-@\t\r])|[;\r\n](?=[=+\-@\t\r"]))/g, "$1'");
  // ';' is quoted too: some Excel locales split columns on it.
  return /[",;\r\n]/.test(v) ? `"${String(v).replaceAll('"', '""')}"` : String(v);
};

export const toCSV = rows => rows.map(row => row.map(csvCell).join(',')).join('\r\n');
