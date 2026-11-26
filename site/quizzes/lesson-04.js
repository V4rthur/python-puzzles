// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });

export default {
  id: 'lesson-04',
  title: T('Who came to the party?', 'Ziyofatga kim keldi?'),
  intro: T('Lesson 4: dictionaries and sets · about 30 minutes · pairs. Predict first, compare with your partner, then press Check. Your typing is saved in this browser.',
    "4-dars: lug'atlar va to'plamlar · taxminan 30 daqiqa · juftlikda. Avval natijani taxmin qiling, sherigingiz bilan solishtiring, keyin Tekshirish tugmasini bosing. Yozganlaringiz shu brauzerda saqlanadi."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'd = {"a": 1}\nprint(d["a"])', answer: '1' },
      { id: 'w2', type: 'predict', points: 0, code: 'print(len({1, 1, 2}))', answer: '2' },
    ]},
    { id: 'l1', title: T('Level 1: look it up (4 points)', "1-bosqich: qidirib toping (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 'd = {"tea": 5, "pie": 12}\nd["tea"] = 6\nd["bun"] = 3\nprint(len(d), d["tea"])', answer: '3 6',
        show: 'update', why: T('An old key gets a new value. A new key adds a pair.', "Mavjud kalit yangi qiymat oladi. Yangi kalit esa yangi juftlik qo'shadi.") },
      { id: 'p2', type: 'predict', code: 'd = {"a": 1}\nprint(d.get("b"), d.get("b", 0), "a" in d)', answer: 'None 0 True' },
      { id: 'p3', type: 'predict', code: 'a = {1, 2, 3}\nb = {3, 4}\nprint(a & b, len(a | b))', answer: '{3} 4',
        show: 'overlap', why: T('& keeps what both sets have. | keeps everything once.', "& ikkala to'plamda bor elementlarni qoldiradi. | hammasini bir martadan oladi.") },
      { id: 'p4', type: 'predict', code: 'd = {"x": 1, "y": 2}\nprint(list(d), sum(d.values()))', answer: "['x', 'y'] 3" },
    ]},
    { id: 'l2', title: T('Level 2: the broken menu (3 points)', "2-bosqich: buzilgan menyu (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('price should be the price of item, or 0 when it is not on the menu. names should be the set of item names. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "price item ning narxi bo'lishi, u menyuda bo'lmasa 0 bo'lishi kerak. names esa taom nomlari to'plami bo'lishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: 'prices = {"tea": 5, "coffee": 8}\nitem = "juice"\nprice = prices[item]\nnames = prices.values()' },
      { id: 'fix', type: 'code',
        prompt: T('Fix the code (2 points). prices and item already exist: do not create them again. No if.', "Kodni tuzating (2 ball). prices va item allaqachon mavjud: ularni qaytadan yaratmang. if ishlatilmaydi."),
        hints: [T('What happens when you ask for a key that is not there?', "Mavjud bo'lmagan kalitni so'rasangiz, nima bo'ladi?"),
          T('A dictionary method can return a default value. Which part of a dictionary holds the names?', "Lug'atning bitta metodi standart qiymat qaytara oladi. Nomlar lug'atning qaysi qismida turadi?")],
        start: 'price = prices[item]\nnames = prices.values()',
        data: [
          { before: 'prices = {"tea": 5, "coffee": 8}\nitem = "juice"', expect: 'E = (0, {"tea", "coffee"})' },
          { before: 'prices = {"tea": 5, "coffee": 8}\nitem = "tea"', expect: 'E = (5, {"tea", "coffee"})' },
          { before: 'prices = {"bun": 4}\nitem = "bun"', expect: 'E = (4, {"bun"})' },
        ],
        tests: [
          { code: 'assert price == E[0]', msg: T('price is wrong for some items', "price ba'zi taomlarda noto'g'ri") },
          { code: 'assert type(names) is set and names == E[1]', msg: T('names must be a set of the item names', "names taom nomlari to'plami bo'lishi kerak") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: check the guests (4 points)', "3-bosqich: mehmonlarni tekshiring (4 ball)"), cls: 'c3', items: [
      { id: 'guests', type: 'code',
        prompt: T('invited (a set of names) and came (a list of names, some written twice) already exist. No if, no loops. Create:\n• absent: a set of invited people who did not come\n• extra: a set of people who came without an invitation\n• present: the number of invited people who came\n(3 points, one for each)',
          "invited (ismlar to'plami) va came (ismlar ro'yxati, ba'zilari ikki marta yozilgan) allaqachon mavjud. if va sikl ishlatilmaydi. Quyidagilarni yarating:\n• absent: taklif qilingan, lekin kelmaganlar to'plami\n• extra: taklifsiz kelganlar to'plami\n• present: taklif qilinganlardan nechtasi kelgani\n(3 ball, har biri uchun bittadan)"),
        code: 'invited = {"Ali", "Vali", "Lola"}\ncame = ["Lola", "Sami", "Ali", "Lola"]',
        hints: [T('Turn the list into a set first.', "Avval ro'yxatni to'plamga aylantiring."),
          T('Sets have operations for difference (-) and for what both share (&).', "To'plamlarda ayirma (-) va umumiy qism (&) amallari bor.")],
        start: '',
        data: [
          { before: 'invited = {"Ali", "Vali", "Lola"}\ncame = ["Lola", "Sami", "Ali", "Lola"]', expect: 'E = ({"Vali"}, {"Sami"}, 2)' },
          { before: 'invited = {"Ann"}\ncame = ["Ann", "Ann", "Ann"]', expect: 'E = (set(), set(), 1)' },
          { before: 'invited = {"Bek", "Nur"}\ncame = ["Zed"]', expect: 'E = ({"Bek", "Nur"}, {"Zed"}, 0)' },
        ],
        tests: [
          { code: 'assert absent == E[0]', msg: T('absent is wrong for some parties', "absent ba'zi holatlarda noto'g'ri") },
          { code: 'assert extra == E[1]', msg: T('extra is wrong for some parties', "extra ba'zi holatlarda noto'g'ri") },
          { code: 'assert present == E[2]', msg: T('present is wrong: count each person once', "present noto'g'ri: har bir odamni bir marta sanang") },
        ] },
      { id: 'lost', type: 'written',
        prompt: T('Why does turning came into a set help here, and what information is lost? (1 point, your teacher marks it).', "came ni to'plamga aylantirish bu yerda nega foydali va qanday ma'lumot yo'qoladi? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
