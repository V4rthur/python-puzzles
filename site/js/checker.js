import { norm, pointsOf } from './core.js';

const LOAD_MS = 90000, RUN_MS = 5000;
const cut = message => String(message).slice(0, 300);
const T = (en, uz) => ({ en, uz });
const RIGHT = T('correct', "to'g'ri"), WRONG = T('not yet', "hali to'g'ri emas");
const SHOWN = T('correct. Python prints it as: ', "to'g'ri. Python buni shunday chiqaradi: ");
const TOO_LONG = T('Your code ran too long: check your loop.', 'Kod juda uzoq ishladi: siklni tekshiring.');
const NOT_CHECKED = T('Code was not checked: Python could not load. Check the internet connection and try again.',
  "Kod tekshirilmadi: Python yuklanmadi. Internetni tekshirib, qayta urinib ko'ring.");

const NOT_RUN = T('Python could not load. Check the internet connection and try again.',
  "Python yuklanmadi. Internetni tekshirib, qayta urinib ko'ring.");
const SILENT = T('Nothing was printed. Add print() to see a value.', "Hech narsa chiqmadi. Qiymatni ko'rish uchun print() qo'shing.");

// Runs programs one at a time in py-worker.js. `spawn` is replaced in tests.
export function createRunner(spawn = () => new Worker(new URL('./py-worker.js', import.meta.url))) {
  let worker = null, runs = 0, last = Promise.resolve();
  const stop = () => { worker.terminate(); worker = null; };
  // The worker's answer to run `id` (0: loading). Replies with any other id are ignored.
  const reply = (id, ms) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout')), ms);
    worker.onmessage = ({ data }) => {
      if (data?.id !== id) return;
      clearTimeout(timer);
      resolve(data);
    };
    worker.onerror = e => { clearTimeout(timer); reject(new Error(cut(e.message || 'Python stopped'))); };
  });

  async function execute(code) {
    if (!worker) {
      worker = spawn();
      try {
        const { failed } = await reply(0, LOAD_MS);
        if (failed) throw new Error(cut(failed));
      } catch (e) { stop(); throw e; }
    }
    try {
      const id = ++runs, answer = reply(id, RUN_MS);
      worker.postMessage({ id, code });
      const { error, fatal, output = '' } = await answer;
      if (fatal) stop();
      return { error: cut(error), output };
    } catch (e) {
      stop();
      return { error: e.message, output: '' };
    }
  }

  const output = code => {
    const result = last.then(() => execute(code));
    last = result.catch(() => {});
    return result;
  };
  // `run` resolves with the error line ('' means success); `output` also gives what was printed.
  return { output, run: code => output(code).then(r => r.error) };
}

// The Run button: shows what the code prints with the first data set. Nothing is scored or sent.
export async function runCode(item, source, runner) {
  let done;
  try { done = await runner.output(`${item.data[0].before}
${source}`); } catch { return NOT_RUN; }
  const { error, output } = done;
  if (error === 'Timeout') return TOO_LONG;
  if (error) return T(output + error, output + error);
  return output ? T(output, output) : SILENT;
}

// A test earns its point only if it passes on every data set, so typed-in answers do not pass.
async function checkCode(item, source, runner) {
  let got = 0;
  const errors = new Map(); // by English text, to show each once
  for (const t of item.tests) {
    let error = '';
    for (const d of item.data) {
      error = await runner.run([d.before, source, d.expect, t.code].join('\n'));
      if (error) break;
    }
    if (!error) { got++; continue; }
    // Python's own errors stay in English; failed checks use the translated message.
    const text = error === 'Timeout' ? TOO_LONG : error.startsWith('AssertionError') ? t.msg : T(error, error);
    errors.set(text.en, text);
    if (error === 'Timeout') break; // the other tests run the same code: do not wait again
  }
  // `ok` is not `got === points`: an unscored item has 0 points even when its tests fail.
  return { got: Math.min(got, pointsOf(item)), ok: got === item.tests.length, errors: [...errors.values()] };
}

const score = (item, { got, ok, errors }) => ({
  ok,
  en: [`${got} of ${pointsOf(item)} points`, ...errors.map(e => e.en)].join('\n'),
  uz: [`${pointsOf(item)} balldan ${got} ball`, ...errors.map(e => e.uz)].join('\n'),
});

export async function checkPart(part, answers, runner) {
  const results = {}, messages = {};
  let noPython = false;
  for (const item of part.items) {
    const value = answers[item.id] ?? '';
    if (item.type === 'written') {
      results[item.id] = null;
    } else if (item.type === 'predict') {
      const ok = norm(value) === norm(item.answer);
      const text = !ok ? WRONG : value.trim() === item.answer ? RIGHT : T(SHOWN.en + item.answer, SHOWN.uz + item.answer);
      results[item.id] = ok ? pointsOf(item) : 0;
      messages[item.id] = { ok, ...text };
    } else if (!value.trim()) {
      results[item.id] = 0;
      messages[item.id] = score(item, { got: 0, ok: false, errors: [] });
    } else {
      let done;
      if (!noPython) {
        try { done = await checkCode(item, value, runner); } catch { noPython = true; }
      }
      results[item.id] = done ? done.got : null;
      messages[item.id] = done ? score(item, done) : { ok: false, ...NOT_CHECKED };
    }
  }
  return { results, messages };
}
