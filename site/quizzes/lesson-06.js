// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const BROKEN = 'days = 0\nfor km in runs:\n    total = 0\n    if km > 0:\n        total += km\n        days += 1\naverage = total / len(runs)';

export default {
  id: 'lesson-06',
  title: T('The marathon diary', 'Marafon kundaligi'),
  intro: T('Lesson 6: loops · about 35 minutes. Predict first, then press Check. Your typing is saved in this browser.',
    "6-dars: sikllar · taxminan 35 daqiqa. Avval natijani taxmin qiling, keyin Tekshirish tugmasini bosing. Yozganlaringiz shu brauzerda saqlanadi."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'for i in range(3):\n    print(i)', answer: '0 1 2' },
      { id: 'w2', type: 'predict', points: 0, code: 'print(list(range(2, 8, 2)))', answer: '[2, 4, 6]' },
    ]},
    { id: 'l1', title: T('Level 1: go round (4 points)', "1-bosqich: aylanib chiqing (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 'total = 0\nfor n in [1, 2, 3, 4]:\n    total += n\nprint(total)', answer: '10',
        show: 'total', why: T('total keeps its value between rounds: 1, 3, 6, 10.', "total aylanishlar orasida qiymatini saqlaydi: 1, 3, 6, 10.") },
      { id: 'p2', type: 'predict', code: 'n = 20\nsteps = 0\nwhile n > 1:\n    n //= 2\n    steps += 1\nprint(n, steps)', answer: '1 4',
        show: 'halve', why: T('20 becomes 10, 5, 2 and 1: four rounds.', "20 avval 10, keyin 5, 2 va 1 bo'ladi: to'rtta aylanish.") },
      { id: 'p3', type: 'predict', code: 'for i in range(5):\n    if i == 1:\n        continue\n    if i == 3:\n        break\n    print(i)', answer: '0 2' },
      { id: 'p4', type: 'predict', code: 'for i, letter in enumerate("ab", 1):\n    print(i, letter)', answer: '1 a 2 b' },
    ]},
    { id: 'l2', title: T('Level 2: the broken average (3 points)', "2-bosqich: buzilgan o'rtacha qiymat (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('runs holds kilometres per day. total should be all kilometres, and average the mean of the days with a run (0 if there was none). The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "runs har kungi kilometrlarni saqlaydi. total barcha kilometrlar, average esa yugurilgan kunlarning o'rtachasi bo'lishi kerak (yugurilmagan bo'lsa 0). Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: 'runs = [5, 0, 10, 3]\n' + BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the code (2 points). runs already exists: do not create it again.', "Kodni tuzating (2 ball). runs allaqachon mavjud: uni qaytadan yaratmang."),
        hints: [T('Print total inside the loop and watch it.', "total ni sikl ichida chiqarib, kuzating."),
          T('Where should total start? And what if days is 0?', "total qayerda boshlanishi kerak? days 0 bo'lsa-chi?")],
        start: BROKEN,
        data: [
          { before: 'runs = [5, 0, 10, 3]', expect: 'E = (18, 6.0)' },
          { before: 'runs = [0, 4]', expect: 'E = (4, 4.0)' },
          { before: 'runs = [0, 0]', expect: 'E = (0, 0)' },
        ],
        tests: [
          { code: 'assert total == E[0]', msg: T('total is wrong', "total noto'g'ri") },
          { code: 'assert abs(average - E[1]) < 1e-9', msg: T('average is wrong: count only days with a run, and handle no runs', "average noto'g'ri: faqat yugurilgan kunlarni sanang va yugurilmagan holatni ham hisobga oling") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: read the diary (4 points)', "3-bosqich: kundalikni o'qing (4 ball)"), cls: 'c3', items: [
      { id: 'diary', type: 'code',
        prompt: T('runs (kilometres per day) already exists. Use a loop. Create:\n• total: all kilometres\n• longest: the longest single run (0 if none)\n• streak: the largest number of days in a row with a run\n(3 points, one for each)',
          "runs (har kungi kilometrlar) allaqachon mavjud. Sikldan foydalaning. Quyidagilarni yarating:\n• total: barcha kilometrlar\n• longest: eng uzun bitta yugurish (bo'lmasa 0)\n• streak: ketma-ket yugurilgan kunlarning eng katta soni\n(3 ball, har biri uchun bittadan)"),
        code: 'runs = [5, 3, 0, 4, 4, 4, 0, 1]',
        hints: [T('Keep one variable for the current streak and another for the best one.', "Joriy ketma-ketlik uchun bitta, eng yaxshisi uchun boshqa o'zgaruvchi saqlang."),
          T('When km is 0, the current streak starts again from 0.', "km 0 bo'lsa, joriy ketma-ketlik yana 0 dan boshlanadi.")],
        start: '',
        data: [
          { before: 'runs = [5, 3, 0, 4, 4, 4, 0, 1]', expect: 'E = (21, 5, 3)' },
          { before: 'runs = [0, 0]', expect: 'E = (0, 0, 0)' },
          { before: 'runs = [2, 2, 2]', expect: 'E = (6, 2, 3)' },
          { before: 'runs = [1, 1, 0, 9]', expect: 'E = (11, 9, 2)' },
        ],
        tests: [
          { code: 'assert total == E[0]', msg: T('total is wrong for some diaries', "total ba'zi kundaliklarda noto'g'ri") },
          { code: 'assert longest == E[1]', msg: T('longest is wrong for some diaries', "longest ba'zi kundaliklarda noto'g'ri") },
          { code: 'assert streak == E[2]', msg: T('streak is wrong: a day without a run breaks it', "streak noto'g'ri: yugurilmagan kun ketma-ketlikni uzadi") },
        ] },
      { id: 'while', type: 'written',
        prompt: T('When would you choose while instead of for? Give an example (1 point, your teacher marks it).', "Qachon for o'rniga while ni tanlaysiz? Misol keltiring (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
