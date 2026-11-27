// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });

export default {
  id: 'lesson-02',
  title: T('The secret message', 'Maxfiy xabar'),
  intro: T('Lesson 2: strings · about 30 minutes. Predict first, then press Check. Your typing is saved in this browser.',
    "2-dars: satrlar · taxminan 30 daqiqa. Avval natijani taxmin qiling, keyin Tekshirish tugmasini bosing. Yozganlaringiz shu brauzerda saqlanadi."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'print(len("data"))', answer: '4' },
      { id: 'w2', type: 'predict', points: 0, code: 'print("ha" * 3)', answer: 'hahaha' },
    ]},
    { id: 'l1', title: T('Level 1: read the letters (4 points)', "1-bosqich: harflarni o'qing (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 's = "Python"\nprint(s[0], s[-1])', answer: 'P n',
        show: 'ends', why: T('Counting starts at 0, and -1 is the last letter.', "Sanash 0 dan boshlanadi, -1 esa oxirgi harf.") },
      { id: 'p2', type: 'predict', code: 's = "Python"\nprint(s[1:4], s[::-1])', answer: 'yth nohtyP',
        show: 'slice', why: T('s[1:4] takes positions 1, 2 and 3. A step of -1 reads backwards.', "s[1:4] 1, 2 va 3-o'rinlarni oladi. -1 qadam teskari o'qiydi.") },
      { id: 'p3', type: 'predict', code: 's = "banana"\nprint(s.count("a"), s.find("n"), s.find("z"))', answer: '3 2 -1',
        show: 'count', why: T('There are three letters a. The first n is at position 2. find gives -1 when nothing is found.', "a harfi uchta. Birinchi n 2-o'rinda. Hech narsa topilmasa, find -1 qaytaradi.") },
      { id: 'p4', type: 'predict', code: 'name = "ali"\nname.upper()\nprint(name, name.title())', answer: 'ali Ali',
        show: 'frozen', why: T('String methods make a new string. The old one never changes.', "Satr metodlari yangi satr yaratadi. Eskisi hech qachon o'zgarmaydi.") },
    ]},
    { id: 'l2', title: T('Level 2: the broken greeting (3 points)', "2-bosqich: buzilgan salomlashuv (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('The program should greet a person with a clean name: no extra spaces, and a capital first letter in each word. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "Dastur odamni tozalangan ism bilan kutib olishi kerak: ortiqcha bo'sh joylarsiz va har bir so'z bosh harf bilan. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: 'raw = "  aLiSHER  "\nage = 20\nname = raw.title()\nname.strip()\nmessage = "Hello, " + name + "! Age: " + age' },
      { id: 'fix', type: 'code',
        show: 'clean', why: T('strip returns a new string, so keep it. str turns the number into text.', "strip yangi satr qaytaradi, uni saqlab qo'ying. str sonni matnga aylantiradi."),
        prompt: T('Fix the code (2 points). raw and age already exist: do not create them again.', "Kodni tuzating (2 ball). raw va age allaqachon mavjud: ularni qaytadan yaratmang."),
        hints: [T('Print name between two symbols to see the spaces.', "Bo'sh joylarni ko'rish uchun name ni ikki belgi orasida chiqaring."),
          T('What does name.strip() change? Also check the type of age.', "name.strip() nimani o'zgartiradi? age ning turini ham tekshiring.")],
        start: 'name = raw.title()\nname.strip()\nmessage = "Hello, " + name + "! Age: " + age',
        data: [
          { before: 'raw = "  aLiSHER  "\nage = 20', expect: 'E = ("Alisher", "Hello, Alisher! Age: 20")' },
          { before: 'raw = " dILNOZA karimova "\nage = 19', expect: 'E = ("Dilnoza Karimova", "Hello, Dilnoza Karimova! Age: 19")' },
        ],
        tests: [
          { code: 'assert name == E[0]', msg: T('name is wrong: check spaces and capital letters', "name noto'g'ri: bo'sh joylar va bosh harflarni tekshiring") },
          { code: 'assert message == E[1]', msg: T('message is wrong: check every space and symbol', "message noto'g'ri: har bir bo'sh joy va belgini tekshiring") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: decode the message (4 points)', "3-bosqich: xabarni oching (4 ball)"), cls: 'c3', items: [
      { id: 'decode', type: 'code',
        show: 'decode', why: T('Remove the outer spaces, read backwards, then put spaces in place of the dashes.', "Chetdagi bo'sh joylarni olib tashlang, teskari o'qing, keyin chiziqchalar o'rniga bo'sh joy qo'ying."),
        prompt: T('A message was written backwards, with dashes instead of spaces and extra spaces around it. secret already exists. Use only string tools (no if, no loops). Create:\n• text: the readable message\n• letters: how many characters text has, not counting spaces\n• tag: the first and last character of text, in capital letters\n(3 points, one for each)',
          "Xabar teskari yozilgan, bo'sh joylar o'rniga chiziqcha qo'yilgan va atrofida ortiqcha bo'sh joylar bor. secret allaqachon mavjud. Faqat satr vositalaridan foydalaning (if va sikl ishlatilmaydi). Quyidagilarni yarating:\n• text: o'qiladigan xabar\n• letters: text dagi bo'sh joylardan tashqari belgilar soni\n• tag: text ning birinchi va oxirgi belgisi, bosh harflarda\n(3 ball, har biri uchun bittadan)"),
        code: 'secret = "  nohtyP-evol-I  "',
        hints: [T('Do one step at a time and use Run to see each result.', "Bir qadamdan bajaring va har bir natijani ko'rish uchun Ishga tushirish tugmasidan foydalaning."),
          T('A slice can read backwards. replace works for dashes, and also for removing spaces before counting.', "Kesim teskari o'qiy oladi. replace chiziqchalar uchun ham, sanashdan oldin bo'sh joylarni olib tashlash uchun ham yaraydi.")],
        start: '',
        data: [
          { before: 'secret = "  nohtyP-evol-I  "', expect: 'E = ("I love Python", 11, "IN")' },
          { before: 'secret = "atad-daer "', expect: 'E = ("read data", 8, "RA")' },
          { before: 'secret = " sgnirts"', expect: 'E = ("strings", 7, "SS")' },
        ],
        tests: [
          { code: 'assert text == E[0]', msg: T('text is wrong for some messages', "text ba'zi xabarlarda noto'g'ri") },
          { code: 'assert letters == E[1]', msg: T('letters is wrong: spaces do not count', "letters noto'g'ri: bo'sh joylar sanalmaydi") },
          { code: 'assert tag == E[2]', msg: T('tag is wrong for some messages', "tag ba'zi xabarlarda noto'g'ri") },
        ] },
      { id: 'frozen', type: 'written',
        prompt: T('Why does name.upper() on its own line not change name? How do you keep the result? (1 point, your teacher marks it).', "Nega alohida qatordagi name.upper() name ni o'zgartirmaydi? Natijani qanday saqlab qolasiz? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
