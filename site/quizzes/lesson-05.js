// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const BROKEN = 'if age < 18:\n    price = 5\nelif age < 7:\n    price = 0\nif age > 65:\n    price = 6\nelse:\n    price = 10';
const age = (n, price) => ({ before: `age = ${n}`, expect: `E = ${price}` });

export default {
  id: 'lesson-05',
  title: T('The ticket booth', 'Chipta kassasi'),
  intro: T('Lesson 5: conditional statements · about 30 minutes · pairs. Predict first, compare with your partner, then press Check. Your typing is saved in this browser.',
    "5-dars: shart operatorlari · taxminan 30 daqiqa · juftlikda. Avval natijani taxmin qiling, sherigingiz bilan solishtiring, keyin Tekshirish tugmasini bosing. Yozganlaringiz shu brauzerda saqlanadi."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'print(5 > 3)', answer: 'True' },
      { id: 'w2', type: 'predict', points: 0, code: 'print("a" == "A")', answer: 'False' },
    ]},
    { id: 'l1', title: T('Level 1: which way? (4 points)', "1-bosqich: qaysi yo'l? (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 'x = 7\nif x > 5:\n    print("A")\nelif x > 3:\n    print("B")\nelse:\n    print("C")', answer: 'A',
        show: 'branch', why: T('Only the first true branch runs, even if a later one is also true.', "Faqat birinchi rost shart bajariladi, keyingisi ham rost bo'lsa ham.") },
      { id: 'p2', type: 'predict', code: 'age = 18\nprint(age >= 18 and age < 19, not age == 18)', answer: 'True False' },
      { id: 'p3', type: 'predict', code: 'print(bool(0), bool(""), bool("0"))', answer: 'False False True' },
      { id: 'p4', type: 'predict', code: 'n = 15\nif n % 3 == 0:\n    print("fizz")\nif n % 5 == 0:\n    print("buzz")', answer: 'fizz buzz' },
    ]},
    { id: 'l2', title: T('Level 2: the broken price list (3 points)', "2-bosqich: buzilgan narxlar (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('Tickets: under 7 is free (0), 7 to 17 costs 5, 65 or older costs 6, everyone else pays 10. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "Chiptalar: 7 yoshgacha bepul (0), 7 dan 17 yoshgacha 5, 65 va undan kattalar 6, qolganlar 10 to'laydi. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        show: 'ages', why: T('Check the smallest group first and test the boundaries: 7, 18 and 65.', "Avval eng kichik guruhni tekshiring va chegaralarni sinang: 7, 18 va 65."),
        prompt: T('Fix the code (2 points: one for children, one for adults). age already exists: do not create it again.', "Kodni tuzating (2 ball: biri bolalar, biri kattalar uchun). age allaqachon mavjud: uni qaytadan yaratmang."),
        hints: [T('Try the ages 3, 18 and 65 on paper.', "3, 18 va 65 yoshlarni qog'ozda sinab ko'ring."),
          T('Use one chain of if, elif, elif, else.', "Bitta if, elif, elif, else zanjiridan foydalaning.")],
        start: BROKEN,
        data: [age(3, 0), age(7, 5), age(17, 5), age(18, 10), age(64, 10), age(65, 6), age(80, 6), age(6, 0)],
        tests: [
          { code: 'assert age >= 18 or price == E', msg: T('some price for children (under 18) is wrong', "bolalar (18 yoshgacha) narxlaridan biri noto'g'ri") },
          { code: 'assert age < 18 or price == E', msg: T('some price for adults (18 or older) is wrong', "kattalar (18 va undan katta) narxlaridan biri noto'g'ri") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: sell a ticket (4 points)', "3-bosqich: chipta soting (4 ball)"), cls: 'c3', items: [
      { id: 'sell', type: 'code',
        prompt: T('age, day and member (True or False) already exist. Create:\n• price: under 7 is 0, 7 to 17 is 5, 65 or older is 6, otherwise 10\n• total: on "wednesday" halve the price, then take 1 off for a member, but never go below 0\n• label: "free" when total is 0, otherwise "paid"\n(3 points, one for each)',
          "age, day va member (True yoki False) allaqachon mavjud. Quyidagilarni yarating:\n• price: 7 yoshgacha 0, 7 dan 17 gacha 5, 65 va undan katta bo'lsa 6, aks holda 10\n• total: \"wednesday\" kuni narx yarmiga tushadi, keyin a'zo uchun 1 ayiriladi, lekin 0 dan pastga tushmaydi\n• label: total 0 bo'lsa \"free\", aks holda \"paid\"\n(3 ball, har biri uchun bittadan)"),
        code: 'age = 70\nday = "wednesday"\nmember = True',
        hints: [T('Solve one value at a time: price first, then total, then label.', "Qiymatlarni birma-bir toping: avval price, keyin total, so'ng label."),
          T('The order matters: halve first, subtract after. Check for a result below 0.', "Tartib muhim: avval yarmini oling, keyin ayiring. Natija 0 dan kichik emasligini tekshiring.")],
        start: '',
        data: [
          { before: 'age = 70\nday = "wednesday"\nmember = True', expect: 'E = (6, 2, "paid")' },
          { before: 'age = 20\nday = "monday"\nmember = False', expect: 'E = (10, 10, "paid")' },
          { before: 'age = 5\nday = "wednesday"\nmember = True', expect: 'E = (0, 0, "free")' },
          { before: 'age = 12\nday = "wednesday"\nmember = False', expect: 'E = (5, 2.5, "paid")' },
          { before: 'age = 65\nday = "friday"\nmember = True', expect: 'E = (6, 5, "paid")' },
        ],
        tests: [
          { code: 'assert price == E[0]', msg: T('price is wrong for some ages', "price ba'zi yoshlarda noto'g'ri") },
          { code: 'assert abs(total - E[1]) < 1e-9', msg: T('total is wrong: check the order of the discounts and the lowest value', "total noto'g'ri: chegirmalar tartibi va eng kichik qiymatni tekshiring") },
          { code: 'assert label == E[2]', msg: T('label is wrong for some tickets', "label ba'zi chiptalarda noto'g'ri") },
        ] },
      { id: 'order', type: 'written',
        prompt: T('Why does the order of conditions matter in an if and elif chain? Give an example (1 point, your teacher marks it).', "if va elif zanjirida shartlar tartibi nega muhim? Misol keltiring (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
