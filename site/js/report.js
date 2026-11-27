// The teacher page's logic without the page. `subs` and `marks` are database rows of one group.
import { pointsOf, autoMax, scoredParts, summarize, hardest, latestWritten, needsMarking, toCSV } from './core.js';

export function cleanCode(text) {
  const code = text.trim().toUpperCase();
  return [...code].length >= 4 && [...code].length <= 20 ? code : null;
}

// PostgREST equality filters; names are student text.
export const where = values => Object.entries(values).map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&');

// One entry per name key, shown with the most recently used spelling.
export function students(subs) {
  const map = new Map();
  for (const s of subs) {
    if (!map.has(s.name_key)) map.set(s.name_key, { key: s.name_key, subs: [] });
    map.get(s.name_key).subs.push(s);
  }
  return [...map.values()].map(student => {
    const latest = student.subs.reduce((a, b) => Date.parse(b.checked_at) >= Date.parse(a.checked_at) ? b : a);
    return { ...student, name: latest.name };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

const writtenItems = quiz => quiz.parts.flatMap(p => p.items).filter(q => q.type === 'written');

// `student` is an entry from students(), with submissions for this quiz only.
export function studentRow(quiz, student, marks) {
  const own = marks.filter(m => m.name_key === student.key && m.quiz === quiz.id);
  const { first, best, finished } = summarize(quiz, student.subs);
  // For one student, hardest() lists exactly the questions that have a checked result.
  const checked = new Set(hardest(quiz, student.subs).map(h => h.qid));
  const unchecked = quiz.parts.filter(p => scoredParts(quiz).includes(p.id) && student.subs.some(s => s.part === p.id))
    // A question the student has not tried yet has no entry in `results`; an unchecked one has null.
    .some(p => p.items.some(q => q.type === 'code' && pointsOf(q) > 0 && !checked.has(q.id)
      // Not `in`: it throws when a student sends a number or text as `results`.
      && student.subs.some(s => Object.prototype.hasOwnProperty.call(s.results ?? {}, q.id))));
  const written = writtenItems(quiz).filter(q => pointsOf(q) > 0);
  const given = written.flatMap(q => own.filter(m => m.qid === q.id).map(m => Math.min(Number(m.points), pointsOf(q))));
  const toMark = needsMarking(quiz, student.subs, own);
  return {
    key: student.key, name: student.name, finished, unchecked,
    // null: nothing to count yet, which is not the same as zero.
    first: checked.size ? first : null, best: checked.size ? best : null, autoMax: autoMax(quiz),
    written: given.length ? given.reduce((a, b) => a + b, 0) : null,
    writtenMax: written.reduce((t, q) => t + pointsOf(q), 0),
    toMark: toMark.length > 0, remark: toMark.some(qid => own.some(m => m.qid === qid)),
  };
}

// The written questions and reflection of one student.
export function markItems(quiz, subs, marks) {
  const latest = latestWritten(subs);
  return writtenItems(quiz).map(q => {
    const max = pointsOf(q), answer = latest[q.id] ?? null;
    const mark = marks.find(m => m.quiz === quiz.id && m.qid === q.id);
    const state = !max ? 'reflection' : answer === null ? 'none' : !mark ? 'new' : mark.answer === answer ? 'marked' : 'changed';
    return { q, max, answer, state,
      points: state === 'marked' ? Number(mark.points) : null, old: state === 'changed' ? Number(mark.points) : null };
  });
}

// `values`: qid to the text of its points field. Blank means "leave as it is"; null means a value is not allowed.
export function markRows(group, key, quiz, items, values) {
  const rows = items.filter(i => i.max && i.answer !== null && (values[i.q.id] ?? '').trim() !== '')
    .map(i => ({ group_code: group, name_key: key, quiz: quiz.id, qid: i.q.id, points: Number(values[i.q.id]), answer: i.answer }));
  const max = qid => items.find(i => i.q.id === qid).max;
  return rows.every(r => r.points >= 0 && r.points <= max(r.qid)) ? rows : null;
}

// The class at a glance, from one group's rows. `lessons`: [{ quiz }] in teaching order.
export function overview(lessons, subs, marks) {
  const byQuiz = lessons.map(({ quiz }) => students(subs.filter(s => s.quiz === quiz.id)));
  const rows = students(subs).map(({ key, name }) => {
    let toMark = 0;
    const cells = lessons.map(({ quiz }, i) => {
      const own = byQuiz[i].find(s => s.key === key);
      if (!own) return { state: 'none' };
      const row = studentRow(quiz, own, marks);
      toMark += needsMarking(quiz, own.subs, marks.filter(m => m.name_key === key)).length;
      return { state: row.finished ? 'done' : 'started', best: row.best, toMark: row.toMark };
    });
    return { key, name, cells, done: cells.filter(c => c.state === 'done').length, toMark };
  }).sort((a, b) => a.done - b.done || a.name.localeCompare(b.name));
  // Behind: more than 2 finished lessons below the middle student.
  const middle = rows.length && (rows[Math.floor((rows.length - 1) / 2)].done + rows[Math.ceil((rows.length - 1) / 2)].done) / 2;
  const reteach = lessons.flatMap(({ quiz }, lesson) => hardest(quiz, subs.filter(s => s.quiz === quiz.id))
    // With fewer than 3 tries one student would top the list.
    .filter(h => h.n >= 3 && h.wrong)
    .map(h => ({ ...h, lesson, who: byQuiz[lesson].filter(s => hardest(quiz, s.subs).some(x => x.qid === h.qid && x.wrong))
      .map(s => ({ key: s.key, name: s.name })) })))
    .sort((a, b) => b.pct - a.pct || b.wrong - a.wrong).slice(0, 5);
  return {
    students: rows.map(({ toMark, ...s }) => ({ ...s, behind: s.done < middle - 2 })),
    toMark: rows.reduce((t, s) => t + s.toMark, 0),
    reteach,
  };
}

// `lessons`: [{ label, quiz }].
export function csvText(group, lessons, subs, marks) {
  const rows = lessons.flatMap(({ label, quiz }) => students(subs.filter(s => s.quiz === quiz.id)).map(student => {
    const r = studentRow(quiz, student, marks);
    // The columns are fixed, so the "code not checked" flag travels with `finished`.
    return [group, r.name, label, r.first ?? '', r.best ?? '', r.autoMax, r.written ?? '', r.writtenMax,
      (r.finished ? 'yes' : 'no') + (r.unchecked ? ' (code not checked)' : '')];
  }));
  return toCSV([['group', 'name', 'lesson', 'first', 'best', 'auto_max', 'written', 'written_max', 'finished'], ...rows]);
}

// Points typed but not saved. An id is [group, name key, quiz id, question id]; `answer` is the one being marked.
export function createDrafts() {
  const map = new Map();
  return {
    type(id, answer, value, stored) {
      if (value === stored) map.delete(JSON.stringify(id));
      else map.set(JSON.stringify(id), { id, answer, value });
    },
    get(id, answer) {
      const d = map.get(JSON.stringify(id));
      return d && d.answer === answer ? d.value : undefined;
    },
    // Only what was sent: something typed during the save stays.
    saved(id, value) {
      if (map.get(JSON.stringify(id))?.value === value) map.delete(JSON.stringify(id));
    },
    // For deleted data: `start` is [group] or [group, name key].
    drop(start) {
      for (const [key, d] of map) if (start.every((v, i) => d.id[i] === v)) map.delete(key);
    },
    get size() { return map.size; },
  };
}
