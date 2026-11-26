// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });

export default {
  id: 'lesson-01',
  title: T('Pizza night', 'Pitsa kechasi'),
  intro: T('Lesson 1: introduction and numbers · about 30 minutes · pairs. Predict first, compare with your partner, then press Check. Your typing is saved in this browser.',
    "1-dars: kirish va sonlar · taxminan 30 daqiqa · juftlikda. Avval natijani taxmin qiling, sherigingiz bilan solishtiring, keyin Tekshirish tugmasini bosing. Yozganlaringiz shu brauzerda saqlanadi."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'print(2 + 3 * 4)', answer: '14' },
      { id: 'w2', type: 'predict', points: 0, code: 'print(10 / 5)', answer: '2.0' },
    ]},
    { id: 'l1', title: T('Level 1: think like Python (4 points)', "1-bosqich: Python kabi o'ylang (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 'print(17 // 5, 17 % 5)', answer: '3 2', show: 'divide', why: T("17 makes 3 full groups of 5. The 2 lit cubes are left over.", "17 dan 5 talik 3 ta to'liq guruh chiqadi. Yoritilgan 2 ta kub qoldiq.") },
      { id: 'p2', type: 'predict', code: 'print(-7 // 2)', answer: '-4', show: 'floor', why: T("// always rounds down, and down from -3.5 is -4.", "// har doim pastga yaxlitlaydi: -3.5 dan pastda -4 turadi.") },
      { id: 'p3', type: 'predict', code: 'x = 5\ny = x\nx = x + 2\nprint(x, y)', answer: '7 5', show: 'names', why: T("y keeps pointing at 5. x moves to the new value.", "y hali ham 5 ga ishora qiladi. x yangi qiymatga o'tadi.") },
      { id: 'p4', type: 'predict', code: 'print(int(7.9), round(7.9), 6 / 3)', answer: '7 8 2.0', show: 'rounding', why: T("int cuts, round goes to the nearest, / always gives a float.", "int kasrni kesadi, round eng yaqin songa yaxlitlaydi, / har doim float beradi.") },
    ]},
    { id: 'l2', title: T('Level 2: the broken bill (3 points)', "2-bosqich: buzilgan hisob (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('Friends split a bill with a 10% tip. The price arrives as text. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "Do'stlar hisobni 10% choychaqa bilan teng bo'lishmoqchi. Narx matn ko'rinishida kelgan. Quyidagi kod noto'g'ri. Topgan barcha xatolaringizni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: 'price = "45"\npeople = 4\ntotal = price + price * 10 / 100\nshare = total // people' },
      { id: 'fix', type: 'code', show: 'share', why: T("/ keeps the decimals, so nobody pays too little.", "/ kasr qismini saqlaydi, shuning uchun hech kim kam to'lamaydi."),
        prompt: T('Fix the code (2 points). price and people already exist: do not create them again.', "Kodni tuzating (2 ball). price va people allaqachon mavjud: ularni qaytadan yaratmang."),
        hints: [T('What type is price?', 'price qaysi turga tegishli?'),
          T('Convert the text to a number. Then ask: should the friends lose the coins after the decimal point?', "Matnni songa aylantiring. Keyin o'ylang: kasr qismidagi pul yo'qolib ketishi kerakmi?")],
        start: 'total = price + price * 10 / 100\nshare = total // people',
        data: [
          { before: 'price = "45"\npeople = 4', expect: 'E = (49.5, 12.375)' },
          { before: 'price = "200"\npeople = 3', expect: 'E = (220, 220 / 3)' },
        ],
        tests: [
          { code: 'assert abs(total - E[0]) < 1e-9', msg: T('total is wrong', "total noto'g'ri") },
          { code: 'assert abs(share - E[1]) < 1e-9', msg: T('share is wrong: nobody should underpay', "share noto'g'ri: hech kim kam to'lamasligi kerak") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: order the pizzas (4 points)', "3-bosqich: pitsa buyurtma qiling (4 ball)"), cls: 'c3', items: [
      { id: 'order', type: 'code', show: 'pizzas', why: T("33 slices fill 4 pizzas and need 1 slice of a fifth.", "33 bo'lak 4 ta pitsani to'ldiradi va beshinchisidan yana 1 bo'lak kerak."),
        prompt: T('One pizza has 8 slices. people, each (slices per person) and price (for one pizza) already exist. Use only numbers and operators (no if, no import). Create:\n• pizzas: the smallest number of whole pizzas that is enough\n• left: the slices left over\n• cost: what each person pays, rounded to 2 decimal places\n(3 points, one for each)',
          "Bitta pitsada 8 bo'lak bor. people (odamlar soni), each (har kishiga bo'lak) va price (bitta pitsa narxi) allaqachon mavjud. Faqat sonlar va amallardan foydalaning (if va import ishlatilmaydi). Quyidagilarni yarating:\n• pizzas: yetarli bo'ladigan eng kam butun pitsalar soni\n• left: ortib qolgan bo'laklar soni\n• cost: har bir kishi to'laydigan summa, verguldan keyin 2 xonagacha yaxlitlangan\n(3 ball, har biri uchun bittadan)"),
        code: 'people = 11\neach = 3\nprice = 12',
        hints: [T('First find how many slices you need.', "Avval nechta bo'lak kerakligini toping."),
          T('Test your formula with 33 slices and with exactly 16. Adding a number before using // can help.', "Formulangizni 33 va aynan 16 bo'lak bilan sinab ko'ring. // amalidan oldin biror son qo'shish yordam berishi mumkin.")],
        start: '',
        data: [
          { before: 'people = 11\neach = 3\nprice = 12', expect: 'E = (5, 7, 5.45)' },
          { before: 'people = 8\neach = 2\nprice = 10', expect: 'E = (2, 0, 2.5)' },
          { before: 'people = 3\neach = 3\nprice = 15', expect: 'E = (2, 7, 10.0)' },
          { before: 'people = 7\neach = 2\nprice = 10', expect: 'E = (2, 2, 2.86)' },
        ],
        tests: [
          { code: 'assert pizzas == E[0]', msg: T('pizzas is wrong for some group sizes', "pizzas ba'zi holatlarda noto'g'ri") },
          { code: 'assert left == E[1]', msg: T('left is wrong for some group sizes', "left ba'zi holatlarda noto'g'ri") },
          { code: 'assert abs(cost - E[2]) < 1e-9', msg: T('cost is wrong: check the rounding', "cost noto'g'ri: yaxlitlashni tekshiring") },
        ] },
      { id: 'floor', type: 'written',
        prompt: T('Why is need // 8 not always the right number of pizzas? Give an example (1 point, your teacher marks it).', "Nega need // 8 har doim ham to'g'ri pitsa sonini bermaydi? Misol keltiring (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
