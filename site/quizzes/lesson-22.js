// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const PD = 'import pandas as pd\n';
const AB = PD + `a = pd.DataFrame({"id": [1, 2], "name": ["Ali", "Lola"]})
b = pd.DataFrame({"id": [2, 3], "grade": [5, 4]})
`;
const BROKEN = 'report = pd.concat([students, grades])\nreport["grade"] = report["grade"].fillna(0)';
const school = (ids, names, gids, grades, expect) => ({
  before: `${PD}students = pd.DataFrame({"id": ${ids}, "name": ${names}})\ngrades = pd.DataFrame({"student_id": ${gids}, "grade": ${grades}})`,
  expect: `E = ${expect}`,
});
const month = (jan, feb, prices, expect) => ({
  before: `${PD}jan = pd.DataFrame(${jan})\nfeb = pd.DataFrame(${feb})\nprices = pd.DataFrame(${prices})`,
  expect: `E = ${expect}`,
});
const PRICES = '{"product": ["tea", "pie", "bun"], "price": [5.0, 12.0, 3.0]}';

export default {
  id: 'lesson-22',
  title: T('The two spreadsheets', 'Ikkita elektron jadval'),
  intro: T('Lesson 22: combining objects in Pandas · about 45 minutes. The first check downloads Pandas, so it takes longer. Predict first, then press Check.',
    "22-dars: Pandas da obyektlarni birlashtirish · taxminan 45 daqiqa. Birinchi tekshiruvda Pandas yuklanadi, shuning uchun uzoqroq davom etadi. Avval natijani taxmin qiling, keyin Tekshirish tugmasini bosing."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: AB + 'print(a.shape)', answer: '(2, 2)' },
      { id: 'w2', type: 'predict', points: 0, code: AB + 'print(len(pd.concat([a, a])))', answer: '4' },
    ]},
    { id: 'l1', title: T('Level 1: put them together (4 points)', "1-bosqich: birlashtiring (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: AB + 'print(pd.concat([a, a]).index.tolist())', answer: '[0, 1, 0, 1]' },
      { id: 'p2', type: 'predict', code: AB + 'm = pd.merge(a, b, on="id")\nprint(len(m), m["name"].tolist())', answer: "1 ['Lola']",
        show: 'merge', why: T('An inner merge keeps only the id that both tables have: 2.', "Inner birlashtirish faqat ikkala jadvalda bor id ni qoldiradi: 2.") },
      { id: 'p3', type: 'predict', code: AB + 'm = pd.merge(a, b, on="id", how="left")\nprint(len(m), m["grade"].isna().sum())', answer: '2 1' },
      { id: 'p4', type: 'predict', code: AB + 'm = pd.merge(a, b, on="id", how="outer")\nprint(sorted(m["id"].tolist()))', answer: '[1, 2, 3]' },
    ]},
    { id: 'l2', title: T('Level 2: the broken report (3 points)', "2-bosqich: buzilgan hisobot (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('students has id and name. grades has student_id and grade. report should list every student once, with name and grade, and 0 when there is no grade. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "students da id va name, grades da student_id va grade bor. report har bir talabani bir marta, ismi va bahosi bilan ko'rsatishi, baho bo'lmasa 0 qo'yishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the code (2 points). students and grades already exist: do not create them again.', "Kodni tuzating (2 ball). students va grades allaqachon mavjud: ularni qaytadan yaratmang."),
        hints: [T('concat stacks tables. Which function matches rows by a key?', "concat jadvallarni ustma-ust qo'yadi. Qaysi funksiya qatorlarni kalit bo'yicha moslaydi?"),
          T('The key columns have different names, and no student may disappear.', "Kalit ustunlar turlicha nomlangan va birorta talaba yo'qolmasligi kerak.")],
        start: BROKEN,
        data: [
          school('[1, 2, 3]', '["Ali", "Lola", "Vali"]', '[3, 1]', '[4, 5]', '[("Ali", 5), ("Lola", 0), ("Vali", 4)]'),
          school('[7, 8]', '["Nur", "Bek"]', '[9]', '[5]', '[("Nur", 0), ("Bek", 0)]'),
        ],
        tests: [
          { code: 'assert list(report["name"]) == [n for n, g in E]', msg: T('every student must appear exactly once', "har bir talaba aniq bir marta chiqishi kerak") },
          { code: 'assert list(zip(report["name"], report["grade"])) == E', msg: T('the grades do not match the students', "baholar talabalarga mos emas") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: join the months (4 points)', "3-bosqich: oylarni birlashtiring (4 ball)"), cls: 'c3', items: [
      { id: 'join', type: 'code',
        prompt: T('jan and feb (product, qty) and prices (product, price) already exist. Create:\n• both: one DataFrame with the rows of jan then feb, numbered 0, 1, 2, …\n• totals: a dictionary from product to total quantity\n• revenue: the total of quantity × price for both months\n(3 points, one for each)',
          "jan va feb (product, qty) hamda prices (product, price) allaqachon mavjud. Quyidagilarni yarating:\n• both: avval jan, keyin feb qatorlari joylashgan, 0, 1, 2, … tartibida raqamlangan bitta DataFrame\n• totals: mahsulotdan umumiy songa lug'at\n• revenue: ikki oy bo'yicha son × narx yig'indisi\n(3 ball, har biri uchun bittadan)"),
        code: 'jan = pd.DataFrame({"product": ["tea", "pie"], "qty": [2, 1]})\nfeb = pd.DataFrame({"product": ["tea"], "qty": [3]})',
        hints: [T('concat has an option that renumbers the rows.', "concat da qatorlarni qayta raqamlaydigan parametr bor."), T('Merge with prices, then multiply two columns.', "prices bilan birlashtiring, keyin ikki ustunni ko'paytiring.")],
        start: '',
        data: [
          month('{"product": ["tea", "pie"], "qty": [2, 1]}', '{"product": ["tea"], "qty": [3]}', PRICES, '(["tea", "pie", "tea"], {"tea": 5, "pie": 1}, 37.0)'),
          month('{"product": ["bun"], "qty": [10]}', '{"product": ["bun", "pie"], "qty": [5, 2]}', PRICES, '(["bun", "bun", "pie"], {"bun": 15, "pie": 2}, 69.0)'),
        ],
        tests: [
          { code: 'assert list(both["product"]) == E[0] and list(both.index) == list(range(len(E[0])))', msg: T('both must hold all rows with new numbers', "both barcha qatorlarni yangi raqamlar bilan saqlashi kerak") },
          { code: 'assert totals == E[1]', msg: T('totals is wrong', "totals noto'g'ri") },
          { code: 'assert abs(revenue - E[2]) < 1e-9', msg: T('revenue is wrong', "revenue noto'g'ri") },
        ] },
      { id: 'how', type: 'written',
        prompt: T('What is the difference between an inner and a left merge? Give a case for each (1 point, your teacher marks it).', "Inner va left birlashtirishning farqi nima? Har biriga misol keltiring (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
