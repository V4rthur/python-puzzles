import { autoMax, nameKey, summarize } from './core.js';

const STUDENT = 'pz:student';

// The upper-case code keeps these apart from the lower-case pz:student and pz:queue: keys.
export const dataKey = ({ code, name }, quizId) => `pz:${code.trim().toUpperCase()}:${nameKey(name)}:${quizId}`;

// `storage` is localStorage, or null when the browser blocks it: nothing here throws.
export function createStore(storage) {
  const read = key => { try { return JSON.parse(storage.getItem(key)); } catch { return null; } };
  const write = (key, value) => { try { storage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
  const getStudent = () => {
    const s = read(STUDENT);
    return typeof s?.code === 'string' && s.code && typeof s.name === 'string' && s.name ? { code: s.code, name: s.name } : null;
  };
  const keyFor = quizId => { const s = getStudent(); return s && dataKey(s, quizId); };

  return {
    getStudent,
    setStudent: ({ code, name }) => write(STUDENT, { code: code.trim().toUpperCase(), name: name.trim().replace(/\s+/g, ' ') }),
    // Only signs out. Each student's work and the queued submissions stay.
    clearStudent() { try { storage.removeItem(STUDENT); } catch { /* storage blocked */ } },
    load(quizId) {
      const key = keyFor(quizId), data = key ? read(key) : null;
      return {
        answers: Object.fromEntries(Object.entries(data?.answers ?? {}).filter(([, v]) => typeof v === 'string')),
        subs: Array.isArray(data?.subs) ? data.subs.filter(s => s && typeof s === 'object') : [],
      };
    },
    save(quizId, data) {
      const key = keyFor(quizId);
      return key ? write(key, data) : false;
    },
  };
}

export const storage = (() => { try { return globalThis.localStorage ?? null; } catch { return null; } })();
export const { getStudent, setStudent, clearStudent, load, save } = createStore(storage);

// One row per lesson for the home page. `quizzes`: loaded quiz objects by id.
export function progressRows(lessons, quizzes, loadData) {
  const rows = lessons.map(lesson => {
    const quiz = quizzes[lesson.quiz];
    if (!quiz) return { ...lesson, state: lesson.quiz ? 'unknown' : 'soon', best: null, max: null };
    const { subs } = loadData(lesson.quiz), { best, finished } = summarize(quiz, subs);
    return { ...lesson, state: finished ? 'done' : subs.length ? 'started' : 'new', best, max: autoMax(quiz) };
  });
  return { rows, done: rows.filter(r => r.state === 'done').length, total: lessons.filter(l => l.quiz).length };
}
