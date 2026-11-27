import { pointsOf } from './core.js';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
import { submit } from './api.js';
import { createQueue } from './queue.js';

export const T = (en, uz) => ({ en, uz });

// Text only ever goes in as text: names and answers are never read as HTML.
export function el(tag, props = {}, ...kids) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...kids);
  return node;
}

// Replaces the node's content with both languages; the language button decides which one shows.
export function tx(node, text) {
  node.textContent = '';
  node.append(el('span', { className: 'en', lang: 'en', textContent: text.en }),
    el('span', { className: 'uz', lang: 'uz', textContent: text.uz }));
  return node;
}

export const configured = Boolean(SUPABASE_URL && SUPABASE_KEY);
export const NOT_CONFIGURED = T('This site is not set up yet (not configured). Ask your teacher.',
  "Sayt hali sozlanmagan. O'qituvchingizga murojaat qiling.");

export const statusText = ({ waiting, rejected, unsaved }) =>
  rejected > 0 && unsaved ? T('Ask your teacher: some answers were not accepted. Keep this page open and show it to your teacher.',
    "O'qituvchingizga murojaat qiling: ba'zi javoblar qabul qilinmadi. Sahifani yopmang va uni o'qituvchingizga ko'rsating.")
  : unsaved ? T('Not sent yet. This browser could not save your answers. Keep this page open until it says Sent; press Check again to retry.',
    "Hali yuborilmadi. Brauzer javoblaringizni saqlay olmadi. \"Yuborildi\" yozuvi chiqmaguncha sahifani yopmang; qayta urinish uchun Tekshirish tugmasini bosing.")
  : rejected > 0 ? T('Ask your teacher: some answers were not accepted. They are kept in this browser.',
    "O'qituvchingizga murojaat qiling: ba'zi javoblar qabul qilinmadi. Ular shu brauzerda saqlanib turibdi.")
  : waiting > 0 ? T('Not sent yet. Your answers are kept in this browser and will be sent later.',
    "Hali yuborilmadi. Javoblaringiz shu brauzerda saqlanadi va keyinroq yuboriladi.")
  : T('Sent', 'Yuborildi');

// Sends queued answers on page load, when the connection returns, and when called after a check.
export function startSync(node, storage) {
  // Without a project address a request would look like a refusal, so nothing is sent.
  const queue = createQueue(storage, configured ? submit : () => Promise.reject(new Error('not configured')));
  const flush = async (report = false) => {
    const had = queue.status().waiting;
    if (report || had) tx(node, T('Sending…', 'Yuborilmoqda…'));
    const status = await queue.flush();
    if (report || had || status.waiting) tx(node, statusText(status));
  };
  addEventListener('online', () => flush());
  flush();
  return { add: queue.add, flush };
}

// The server refuses a level over 20000 characters of JSON for good (db/setup.sql), so stop well before that.
export const tooLong = answers => JSON.stringify(answers).length > 15000;

export const tabLabel = title => T(title.en.split(':')[0], title.uz.split(':')[0]);

const HEADINGS = { predict: T('What is printed?', 'Ekranga nima chiqadi?'), code: T('Write the code', 'Kodni yozing'), written: T('Explain', 'Tushuntiring') };
export const heading = type => HEADINGS[type];

// What Enter should indent the next line with, given the current line up to the cursor.
export const indentAfter = line => line.match(/^ */)[0] + (line.trimEnd().endsWith(':') ? '    ' : '');

// crypto.randomUUID is missing before Safari 15.4 and on plain http.
export function makeId(source = globalThis.crypto) {
  if (source.randomUUID) return source.randomUUID();
  const b = source.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 15) | 64;
  b[8] = (b[8] & 63) | 128;
  const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
