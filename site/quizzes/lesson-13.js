// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const BROKEN = 'import json\nfrom datetime import datetime\n\ndata = json.load(raw)\nday = datetime.strptime(data["date"], "%Y-%d-%m")\ndays_left = day - datetime(2026, 1, 1)';
const note = (date, expect) => ({ before: `raw = '{"date": "${date}"}'`, expect: `E = ${expect}` });
const EVENTS = `raw = '[{"name": "Fair", "date": "2026-05-10"}, {"name": "Exam", "date": "2026-04-01"}, {"name": "Trip", "date": "2026-03-01"}]'`;
const plan = (today, expect) => ({ before: `${EVENTS}\ntoday = "${today}"`, expect: `E = ${expect}` });

export default {
  id: 'lesson-13',
  title: T('The lost schedule', "Yo'qolgan jadval"),
  intro: T('Lesson 13: datetime and JSON · about 40 minutes. Predict first, then press Check. Your typing is saved in this browser.',
    "13-dars: datetime va JSON · taxminan 40 daqiqa. Avval natijani taxmin qiling, keyin Tekshirish tugmasini bosing. Yozganlaringiz shu brauzerda saqlanadi."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'from datetime import date\nprint(date(2026, 1, 5).year)', answer: '2026' },
      { id: 'w2', type: 'predict', points: 0, code: 'import json\nprint(json.dumps([1, 2]))', answer: '[1, 2]' },
    ]},
    { id: 'l1', title: T('Level 1: read the clock (4 points)', "1-bosqich: soatni o'qing (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 'from datetime import date, timedelta\nprint(date(2026, 1, 31) + timedelta(days=1))', answer: '2026-02-01' },
      { id: 'p2', type: 'predict', code: 'from datetime import date\nprint((date(2026, 3, 1) - date(2026, 2, 1)).days)', answer: '28',
        show: 'february', why: T('February 2026 has 28 days: four full weeks.', "2026-yil fevralida 28 kun bor: to'rtta to'liq hafta.") },
      { id: 'p3', type: 'predict', code: 'import json\nd = json.loads(\'{"ok": true, "n": null}\')\nprint(d["ok"], d["n"])', answer: 'True None' },
      { id: 'p4', type: 'predict', code: 'from datetime import datetime\nd = datetime(2026, 11, 26, 9, 5)\nprint(d.strftime("%d.%m.%Y %H:%M"))', answer: '26.11.2026 09:05' },
    ]},
    { id: 'l2', title: T('Level 2: the broken reminder (3 points)', "2-bosqich: buzilgan eslatma (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('raw is JSON text with a date written year-month-day. day should hold that date, and days_left the number of days from 1 January 2026 to it. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "raw ichida yil-oy-kun tartibida yozilgan sanali JSON matni bor. day shu sanani, days_left esa 2026-yil 1-yanvardan o'sha sanagacha bo'lgan kunlar sonini saqlashi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: 'raw = \'{"date": "2026-03-15"}\'\n' + BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the code (2 points). raw already exists: do not create it again.', "Kodni tuzating (2 ball). raw allaqachon mavjud: uni qaytadan yaratmang."),
        hints: [T('One json function reads files, another reads text.', "json ning bir funksiyasi fayllarni, boshqasi matnni o'qiydi."),
          T('Check the order in the date format, and the type of a difference between dates.', "Sana formatidagi tartibni va sanalar ayirmasining turini tekshiring.")],
        start: BROKEN,
        data: [note('2026-03-15', '(3, 15, 73)'), note('2026-01-02', '(1, 2, 1)'), note('2026-12-31', '(12, 31, 364)')],
        tests: [
          { code: 'assert (day.month, day.day) == E[:2]', msg: T('day holds the wrong date', "day da noto'g'ri sana") },
          { code: 'assert type(days_left) is int and days_left == E[2]', msg: T('days_left must be a whole number of days', "days_left kunlarning butun soni bo'lishi kerak") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: find the next event (4 points)', "3-bosqich: keyingi tadbirni toping (4 ball)"), cls: 'c3', items: [
      { id: 'next', type: 'code',
        prompt: T('raw (JSON text: a list of events with name and date) and today (year-month-day text) already exist. Create:\n• upcoming: the names of events on or after today, earliest first\n• wait: days from today to the first of them, or None if there are none\n• report: JSON text of {"count": how many, "names": upcoming}\n(3 points, one for each)',
          "raw (JSON matni: nomi va sanasi bor tadbirlar ro'yxati) va today (yil-oy-kun matni) allaqachon mavjud. Quyidagilarni yarating:\n• upcoming: bugun yoki undan keyingi tadbirlarning nomlari, eng yaqini birinchi\n• wait: bugundan ularning birinchisigacha bo'lgan kunlar, bo'lmasa None\n• report: {\"count\": soni, \"names\": upcoming} ning JSON matni\n(3 ball, har biri uchun bittadan)"),
        code: 'raw = \'[{"name": "Exam", "date": "2026-04-01"}, ...]\'\ntoday = "2026-04-01"',
        hints: [T('date.fromisoformat turns "2026-04-01" into a date.', "date.fromisoformat \"2026-04-01\" ni sanaga aylantiradi."),
          T('Sort the events by date before taking the names.', "Nomlarni olishdan oldin tadbirlarni sana bo'yicha saralang.")],
        start: '',
        data: [plan('2026-04-01', '(["Exam", "Fair"], 0)'), plan('2026-01-01', '(["Trip", "Exam", "Fair"], 59)'), plan('2027-01-01', '([], None)'), plan('2026-04-02', '(["Fair"], 38)')],
        tests: [
          { code: 'assert upcoming == E[0]', msg: T('upcoming is wrong for some days', "upcoming ba'zi kunlarda noto'g'ri") },
          { code: 'assert wait == E[1]', msg: T('wait is wrong for some days', "wait ba'zi kunlarda noto'g'ri") },
          { code: 'import json\nassert type(report) is str and json.loads(report) == {"count": len(E[0]), "names": E[0]}', msg: T('report must be correct JSON text', "report to'g'ri JSON matni bo'lishi kerak") },
        ] },
      { id: 'text', type: 'written',
        prompt: T('Why are dates saved in JSON as text, and what must the reader of the file do? (1 point, your teacher marks it).', "Nega JSON da sanalar matn sifatida saqlanadi va faylni o'quvchi nima qilishi kerak? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
