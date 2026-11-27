// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });

export default {
  id: 'review-1-6',
  title: T('The café that lost its orders', "Buyurtmalarini yo'qotgan kafe"),
  intro: T('Review of lessons 1–6 · about 40 minutes. Predict first, then press Check. Your typing is saved in this browser.',
    "1–6-darslarni takrorlash · taxminan 40 daqiqa. Avval natijani taxmin qiling, keyin Tekshirish tugmasini bosing. Yozganlaringiz shu brauzerda saqlanadi."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'print(17 // 5, 17 % 5)', answer: '3 2' },
      { id: 'w2', type: 'predict', points: 0, code: 'print("Python"[1:4])', answer: 'yth' },
    ]},
    { id: 'l1', title: T('Level 1: read the till (4 points)', "1-bosqich: kassani o'qing (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 'print(7 / 2, 2 ** 3)', answer: '3.5 8' },
      { id: 'p2', type: 'predict', code: 's = "  Tea,Coffee "\nprint(s.strip().lower().split(","))', answer: "['tea', 'coffee']" },
      { id: 'p3', type: 'predict', code: 'a = [10, 20, 30]\nb = a\nb.append(40)\nt = (a[0], len(a))\nprint(t)', answer: '(10, 4)' },
      { id: 'p4', type: 'predict', code: 'd = {"tea": 2}\nd["tea"] += 1\nd["pie"] = 1\nprint(len(d), d["tea"], len(set("banana")))', answer: '2 3 3' },
    ]},
    { id: 'l2', title: T('Level 2: the broken labels (3 points)', "2-bosqich: buzilgan yorliqlar (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('Each order needs one label: 10 cups or more is "big", 5 or more is "medium", otherwise "small". The code below is wrong. Describe every bug you find (1 point, your teacher marks it).',
          "Har bir buyurtmaga bitta yorliq kerak: 10 yoki undan ko'p piyola bo'lsa \"big\", 5 yoki undan ko'p bo'lsa \"medium\", aks holda \"small\". Quyidagi kod noto'g'ri. Topgan barcha xatolaringizni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: 'orders = [3, 12, 7]\nlabels = []\nfor n in orders:\n    if n >= 5:\n        label = "medium"\n    elif n >= 10:\n        label = "big"\n    else:\n        label = "small"\nlabels.append(label)' },
      { id: 'fix', type: 'code',
        prompt: T('Fix the code (2 points). The list orders already exists: do not create it again.', "Kodni tuzating (2 ball). orders ro'yxati allaqachon mavjud: uni qaytadan yaratmang."),
        hints: [T('Trace the loop on paper with 12 cups.', "Siklni 12 piyola uchun qog'ozda qadamma-qadam bajarib chiqing."),
          T('Look at the order of the conditions, then at the indentation of the last line.', "Shartlarning tartibiga, keyin oxirgi qatorning chekinishiga (indentation) e'tibor bering.")],
        start: 'labels = []\nfor n in orders:\n    if n >= 5:\n        label = "medium"\n    elif n >= 10:\n        label = "big"\n    else:\n        label = "small"\nlabels.append(label)',
        data: [
          { before: 'orders = [3, 12, 7]', expect: 'E = ["small", "big", "medium"]' },
          { before: 'orders = [10, 5, 4, 9]', expect: 'E = ["big", "medium", "small", "medium"]' },
        ],
        tests: [
          { code: 'assert len(labels) == len(E)', msg: T('there must be one label for each order', "har bir buyurtma uchun bitta yorliq bo'lishi kerak") },
          { code: 'assert labels == E', msg: T('some labels are wrong: check 5 and 10 or more', "ba'zi yorliqlar noto'g'ri: \"5 yoki undan ko'p\" va \"10 yoki undan ko'p\" shartlarini tekshiring") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: close the day (4 points)', "3-bosqich: kunni yakunlang (4 ball)"), cls: 'c3', items: [
      { id: 'day', type: 'code',
        prompt: T('menu (item → price) and order (list of items) already exist. Create:\n• total: the price of all ordered items that are on the menu\n• missing: a set of ordered items that are not on the menu\n• final: total with 10% off if total is 30 or more, otherwise total\n(3 points, one for each)',
          "menu (mahsulot → narx) va order (mahsulotlar ro'yxati) allaqachon mavjud. Quyidagilarni yarating:\n• total: buyurtmadagi menyuda bor barcha mahsulotlarning umumiy narxi\n• missing: buyurtmadagi menyuda yo'q mahsulotlar to'plami (set)\n• final: total 30 yoki undan katta bo'lsa, 10% chegirma qilingan total, aks holda total\n(3 ball, har biri uchun bittadan)"),
        code: 'menu = {"tea": 5, "coffee": 8, "pie": 12}\norder = ["coffee", "pie", "tea", "coffee", "soup"]',
        hints: [T('Start with total = 0 and an empty set. Visit each item once.', "total = 0 va bo'sh to'plamdan boshlang. Har bir mahsulotni bir martadan ko'rib chiqing."),
          T('Use "if item in menu". Calculate final after the loop ends.', "\"if item in menu\" shartidan foydalaning. final ni sikl tugagandan keyin hisoblang.")],
        start: '# write your code here\n',
        data: [
          { before: 'menu = {"tea": 5, "coffee": 8, "pie": 12}\norder = ["coffee", "pie", "tea", "coffee", "soup"]', expect: 'E = (33, {"soup"}, 29.7)' },
          { before: 'menu = {"juice": 10, "bun": 4}\norder = ["juice", "juice", "juice"]', expect: 'E = (30, set(), 27)' },
          { before: 'menu = {"juice": 10, "bun": 4}\norder = ["bun", "cake", "cake", "fish"]', expect: 'E = (4, {"cake", "fish"}, 4)' },
          { before: 'menu = {"juice": 10, "bun": 9}\norder = ["juice", "juice", "bun"]', expect: 'E = (29, set(), 29)' },
        ],
        tests: [
          { code: 'assert total == E[0]', msg: T('total is wrong for some orders', "total ba'zi buyurtmalarda noto'g'ri") },
          { code: 'assert missing == E[1]', msg: T('missing is wrong for some orders', "missing ba'zi buyurtmalarda noto'g'ri") },
          { code: 'assert abs(final - E[2]) < 1e-9', msg: T('final is wrong: check the discount at 30 or more', "final noto'g'ri: 30 va undan katta summadagi chegirmani tekshiring") },
        ] },
      { id: 'set', type: 'written', prompt: T('Why is a set a better choice than a list for missing? (1 point, your teacher marks it)', "Nega missing uchun ro'yxat (list) emas, to'plam (set) yaxshiroq? (1 ball, o'qituvchi baholaydi)") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
