// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const PD = 'import pandas as pd\n';
const DF = PD + `df = pd.DataFrame({"name": ["Ali", "Lola", "Vali", "Nur"],
                   "age": [17, 25, 31, 22],
                   "city": ["Tashkent", "Samarkand", "Tashkent", "Bukhara"]})
`;
const BROKEN = 'names = df[df.age > 20 and df.city == city]["name"]';
const people = (names, ages, cities) => `${PD}df = pd.DataFrame({"name": ${names}, "age": ${ages}, "city": ${cities}})`;
const P1 = people('["Ali", "Lola", "Vali", "Nur"]', '[17, 25, 31, 22]', '["Tashkent", "Samarkand", "Tashkent", "Bukhara"]');
const P2 = people('["Zed", "Ann", "Bek"]', '[40, 18, 20]', '["Khiva", "Khiva", "Khiva"]');
const when = (frame, city, expect) => ({ before: `${frame}\ncity = "${city}"`, expect: `E = ${expect}` });

export default {
  id: 'lesson-19',
  title: T("The detective's files", 'Tergovchining hujjatlari'),
  intro: T('Lesson 19: selecting and filtering in Pandas · about 45 minutes. The first check downloads Pandas, so it takes longer. Predict first, then press Check.',
    "19-dars: Pandas da tanlash va filtrlash · taxminan 45 daqiqa. Birinchi tekshiruvda Pandas yuklanadi, shuning uchun uzoqroq davom etadi. Avval natijani taxmin qiling, keyin Tekshirish tugmasini bosing."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: DF + 'print(df["age"].tolist())', answer: '[17, 25, 31, 22]' },
      { id: 'w2', type: 'predict', points: 0, code: DF + 'print(len(df[df["age"] > 20]))', answer: '3' },
    ]},
    { id: 'l1', title: T('Level 1: pick the rows (4 points)', "1-bosqich: qatorlarni tanlang (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: DF + 'print(df.loc[df["age"] > 24, "name"].tolist())', answer: "['Lola', 'Vali']" },
      { id: 'p2', type: 'predict', code: DF + 'adults = df[(df.age >= 18) & (df.city == "Tashkent")]\nprint(len(adults))', answer: '1' },
      { id: 'p3', type: 'predict', code: DF + 'print(len(df.loc[0:1]), len(df.iloc[0:1]))', answer: '2 1',
        show: 'slices', why: T('loc includes the end label. iloc stops before the end position.', "loc oxirgi yorliqni ham oladi. iloc oxirgi o'rindan oldin to'xtaydi.") },
      { id: 'p4', type: 'predict', code: DF + 'few = df[df.city.isin(["Samarkand", "Bukhara"])]\nprint(few["name"].tolist())', answer: "['Lola', 'Nur']" },
    ]},
    { id: 'l2', title: T('Level 2: the broken search (3 points)', "2-bosqich: buzilgan qidiruv (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('names should be a list of the people older than 20 who live in city. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "names city shahrida yashaydigan 20 yoshdan kattalarning ro'yxati bo'lishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the code (2 points). df and city already exist: do not create them again.', "Kodni tuzating (2 ball). df va city allaqachon mavjud: ularni qaytadan yaratmang."),
        hints: [T('and compares two single values, not two columns.', "and ikkita ustunni emas, ikkita yakka qiymatni solishtiradi."),
          T('Put each condition in brackets and join them with &. Finish with a list.', "Har bir shartni qavsga oling va & bilan bog'lang. Natijani ro'yxatga aylantiring.")],
        start: BROKEN,
        data: [when(P1, 'Tashkent', '["Vali"]'), when(P2, 'Khiva', '["Zed"]'), when(P1, 'Khiva', '[]')],
        tests: [
          { code: 'assert list(names) == E', msg: T('the wrong people were chosen', "noto'g'ri odamlar tanlangan") },
          { code: 'assert type(names) is list and names == E', msg: T('names must be a plain list', "names oddiy ro'yxat bo'lishi kerak") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: build the case (4 points)', "3-bosqich: ishni tuzing (4 ball)"), cls: 'c3', items: [
      { id: 'case', type: 'code',
        prompt: T('df (name, age, city) and city already exist. Create:\n• adults: a DataFrame with only the people aged 18 or more\n• local: the names of everyone in city, in alphabetical order, as a list\n• youngest: the name of the youngest person in city, or None if nobody lives there\n(3 points, one for each)',
          "df (name, age, city) va city allaqachon mavjud. Quyidagilarni yarating:\n• adults: faqat 18 va undan katta yoshdagilar kirgan DataFrame\n• local: city dagi barcha odamlarning ismlari, alifbo tartibida, ro'yxat ko'rinishida\n• youngest: city dagi eng yosh odamning ismi, u yerda hech kim yashamasa None\n(3 ball, har biri uchun bittadan)"),
        code: 'city = "Tashkent"',
        hints: [T('Filter once for the city and use the result twice.', "Shahar bo'yicha bir marta filtrlang va natijadan ikki marta foydalaning."),
          T('idxmin gives the index of the smallest value. Check for an empty table first.', "idxmin eng kichik qiymatning indeksini beradi. Avval jadval bo'sh emasligini tekshiring.")],
        start: '',
        data: [
          when(P1, 'Tashkent', '(["Lola", "Vali", "Nur"], ["Ali", "Vali"], "Ali")'),
          when(P2, 'Khiva', '(["Zed", "Ann", "Bek"], ["Ann", "Bek", "Zed"], "Ann")'),
          when(P1, 'Khiva', '(["Lola", "Vali", "Nur"], [], None)'),
        ],
        tests: [
          { code: 'assert list(adults["name"]) == E[0] and list(adults.columns) == ["name", "age", "city"]', msg: T('adults is wrong for some data', "adults ba'zi ma'lumotlarda noto'g'ri") },
          { code: 'assert local == E[1]', msg: T('local must be a sorted list of names', "local ismlarning saralangan ro'yxati bo'lishi kerak") },
          { code: 'assert youngest == E[2]', msg: T('youngest is wrong for some cities', "youngest ba'zi shaharlarda noto'g'ri") },
        ] },
      { id: 'loc', type: 'written',
        prompt: T('When do you use loc and when iloc? (1 point, your teacher marks it).', "Qachon loc, qachon iloc ishlatiladi? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
