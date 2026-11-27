// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const BROKEN = 'import math\n\narea = pi * radius ** 2\ncans = math.floor(area / 10)';
const room = (radius, cans) => ({ before: `radius = ${radius}`, expect: `E = ${cans}` });
const route = points => ({ before: `points = ${points}`, expect: '' });

export default {
  id: 'lesson-11',
  title: T('The borrowed toolbox', 'Ijaraga olingan asboblar qutisi'),
  intro: T('Lesson 11: modules, packages and virtual environments · about 35 minutes. Predict first, then press Check. Your typing is saved in this browser.',
    "11-dars: modullar, paketlar va virtual muhitlar · taxminan 35 daqiqa. Avval natijani taxmin qiling, keyin Tekshirish tugmasini bosing. Yozganlaringiz shu brauzerda saqlanadi."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'import math\nprint(math.sqrt(9))', answer: '3.0' },
      { id: 'w2', type: 'predict', points: 0, code: 'from math import pi\nprint(round(pi, 2))', answer: '3.14' },
    ]},
    { id: 'l1', title: T('Level 1: import it (4 points)', "1-bosqich: import qiling (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 'import math\nprint(math.floor(-2.5), math.ceil(-2.5))', answer: '-3 -2',
        show: 'between', why: T('floor goes down to -3. ceil goes up to -2.', "floor pastga, -3 ga boradi. ceil yuqoriga, -2 ga boradi.") },
      { id: 'p2', type: 'predict', code: 'import math as m\nfrom math import sqrt\nprint(sqrt(16), m.sqrt is sqrt)', answer: '4.0 True' },
      { id: 'p3', type: 'predict', code: '# this file is run directly\nprint(__name__)', answer: '__main__' },
      { id: 'p4', type: 'predict', code: 'import random\nrandom.seed(1)\nfirst = random.random()\nrandom.seed(1)\nprint(random.random() == first)', answer: 'True' },
    ]},
    { id: 'l2', title: T('Level 2: the broken painter (3 points)', "2-bosqich: buzilgan bo'yoqchi (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('area is the area of a round floor, and cans is how many paint cans to buy (one can covers 10 square metres). The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "area dumaloq polning yuzi, cans esa nechta bo'yoq bankasi sotib olish kerakligi (bitta banka 10 kvadrat metrga yetadi). Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: 'radius = 3\n' + BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the code (2 points). radius already exists: do not create it again.', "Kodni tuzating (2 ball). radius allaqachon mavjud: uni qaytadan yaratmang."),
        hints: [T('Where does the name pi live?', "pi nomi qayerda turadi?"), T('Can you buy part of a can?', "Bankaning bir qismini sotib olish mumkinmi?")],
        start: BROKEN,
        data: [room(3, 3), room(5, 8), room(1, 1), room(10, 32)],
        tests: [
          { code: 'import math\nassert abs(area - math.pi * radius ** 2) < 1e-6', msg: T('area is wrong: use the exact value of pi', "area noto'g'ri: pi ning aniq qiymatidan foydalaning") },
          { code: 'assert cans == E', msg: T('cans is wrong for some rooms', "cans ba'zi xonalarda noto'g'ri") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: plan the route (4 points)', "3-bosqich: yo'nalishni rejalang (4 ball)"), cls: 'c3', items: [
      { id: 'route', type: 'code',
        prompt: T('points (a list of (x, y) places) already exists. Use the math module. Create:\n• legs: a list of distances between neighbouring points, each rounded to 2 decimals\n• total: the whole length, rounded to 2 decimals only at the end\n• buses: how many buses are needed if one bus covers 5 units\n(3 points, one for each)',
          "points ((x, y) joylar ro'yxati) allaqachon mavjud. math modulidan foydalaning. Quyidagilarni yarating:\n• legs: qo'shni nuqtalar orasidagi masofalar ro'yxati, har biri 2 xonagacha yaxlitlangan\n• total: umumiy uzunlik, faqat oxirida 2 xonagacha yaxlitlangan\n• buses: bitta avtobus 5 birlik yursa, nechta avtobus kerak\n(3 ball, har biri uchun bittadan)"),
        code: 'points = [(0, 0), (3, 4), (3, 10)]',
        hints: [T('math.dist gives the distance between two points.', "math.dist ikki nuqta orasidagi masofani beradi."),
          T('zip(points, points[1:]) gives neighbouring pairs.', "zip(points, points[1:]) qo'shni juftliklarni beradi.")],
        start: '',
        data: [route('[(0, 0), (3, 4), (3, 10)]'), route('[(0, 0), (1, 1), (2, 2), (3, 3), (4, 4)]'), route('[(5, 5)]'), route('[(0, 0), (10, 0)]')],
        tests: [
          { code: 'import math\nD = [math.dist(a, b) for a, b in zip(points, points[1:])]\nassert legs == [round(d, 2) for d in D]', msg: T('legs is wrong for some routes', "legs ba'zi yo'nalishlarda noto'g'ri") },
          { code: 'import math\nD = [math.dist(a, b) for a, b in zip(points, points[1:])]\nassert total == round(sum(D), 2)', msg: T('total is wrong: round only once, at the end', "total noto'g'ri: faqat oxirida bir marta yaxlitlang") },
          { code: 'import math\nD = [math.dist(a, b) for a, b in zip(points, points[1:])]\nassert buses == math.ceil(sum(D) / 5)', msg: T('buses is wrong for some routes', "buses ba'zi yo'nalishlarda noto'g'ri") },
        ] },
      { id: 'venv', type: 'written',
        prompt: T('Why does each project need its own virtual environment? Write the command that creates one (1 point, your teacher marks it).', "Nega har bir loyihaga o'z virtual muhiti kerak? Uni yaratadigan buyruqni yozing (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
