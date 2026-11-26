// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const PD = 'import pandas as pd\n';
const DF = PD + `df = pd.DataFrame({"shop": ["A", "A", "B", "B", "B"],
                   "item": ["tea", "pie", "tea", "tea", "bun"],
                   "qty":  [3, 5, 2, 4, 1]})
`;
const BROKEN = 'totals = df.groupby("shop")["qty"].mean()\nbest = totals.max()';
const frame = data => `${PD}df = pd.DataFrame(${data})`;
const S1 = '{"shop": ["A", "A", "B"], "item": ["tea", "pie", "tea"], "qty": [2, 3, 4], "price": [5.0, 12.0, 5.0]}';
const S2 = '{"shop": ["X", "Y", "Y", "Y"], "item": ["bun", "tea", "tea", "pie"], "qty": [20, 3, 4, 5], "price": [2.0, 5.0, 5.0, 10.0]}';
const case_ = (data, expect) => ({ before: frame(data), expect: `E = ${expect}` });

export default {
  id: 'lesson-20',
  title: T('The coffee chain', "Qahvaxonalar tarmog'i"),
  intro: T('Lesson 20: grouping in Pandas · about 45 minutes · pairs. The first check downloads Pandas, so it takes longer. Predict first, compare with your partner, then press Check.',
    "20-dars: Pandas da guruhlash · taxminan 45 daqiqa · juftlikda. Birinchi tekshiruvda Pandas yuklanadi, shuning uchun uzoqroq davom etadi. Avval natijani taxmin qiling, sherigingiz bilan solishtiring, keyin Tekshirish tugmasini bosing."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: DF + 'print(df["qty"].sum())', answer: '15' },
      { id: 'w2', type: 'predict', points: 0, code: DF + 'print(df["shop"].nunique())', answer: '2' },
    ]},
    { id: 'l1', title: T('Level 1: split and combine (4 points)', "1-bosqich: ajrating va birlashtiring (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: DF + 'print(df.groupby("shop")["qty"].sum()["B"])', answer: '7',
        show: 'groups', why: T('Shop B has 2, 4 and 1, which add up to 7.', "B do'konda 2, 4 va 1 bor, ularning yig'indisi 7.") },
      { id: 'p2', type: 'predict', code: DF + 'print(df.groupby("item").size()["tea"])', answer: '3' },
      { id: 'p3', type: 'predict', code: DF + 'g = df.groupby("shop")["qty"].agg(["min", "max"])\nprint(g.loc["B", "min"], g.loc["B", "max"])', answer: '1 4' },
      { id: 'p4', type: 'predict', code: DF + 'print(df["item"].value_counts().index[0])', answer: 'tea' },
    ]},
    { id: 'l2', title: T('Level 2: the broken ranking (3 points)', "2-bosqich: buzilgan reyting (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('totals should be the total quantity per shop, and best the name of the shop with the highest total. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "totals har bir do'kon bo'yicha umumiy son, best esa eng katta umumiy sonli do'kon nomi bo'lishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the code (2 points). df already exists: do not create it again.', "Kodni tuzating (2 ball). df allaqachon mavjud: uni qaytadan yaratmang."),
        hints: [T('Is the mean the same as the total?', "O'rtacha qiymat umumiy yig'indi bilan bir xilmi?"), T('One method gives the largest value, another gives its label.', "Bir metod eng katta qiymatni, boshqasi uning yorlig'ini beradi.")],
        start: BROKEN,
        data: [case_(S1, '({"A": 5, "B": 4}, "A")'), case_(S2, '({"X": 20, "Y": 12}, "X")'),
          case_('{"shop": ["P", "Q", "Q"], "item": ["a", "a", "a"], "qty": [5, 3, 3]}', '({"P": 5, "Q": 6}, "Q")')],
        tests: [
          { code: 'assert totals.to_dict() == E[0]', msg: T('totals is wrong', "totals noto'g'ri") },
          { code: 'assert best == E[1]', msg: T('best must be the shop name', "best do'kon nomi bo'lishi kerak") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: write the monthly report (4 points)', '3-bosqich: oylik hisobot yozing (4 ball)'), cls: 'c3', items: [
      { id: 'report', type: 'code',
        prompt: T('df (shop, item, qty, price) already exists. Create:\n• per_shop: a dictionary from shop to revenue (qty × price added up)\n• top_item: the item with the largest total quantity\n• average: a dictionary from shop to the mean quantity per sale, rounded to 2 decimals\n(3 points, one for each)',
          "df (shop, item, qty, price) allaqachon mavjud. Quyidagilarni yarating:\n• per_shop: do'kondan tushumga (qty × price yig'indisi) lug'at\n• top_item: umumiy soni eng katta bo'lgan mahsulot\n• average: do'kondan bitta savdodagi o'rtacha songa (2 xonagacha yaxlitlangan) lug'at\n(3 ball, har biri uchun bittadan)"),
        code: `df = pd.DataFrame(${S1})`,
        hints: [T('Add a revenue column first.', "Avval tushum ustunini qo'shing."), T('to_dict turns a grouped result into a dictionary.', "to_dict guruhlangan natijani lug'atga aylantiradi.")],
        start: '',
        data: [
          case_(S1, '({"A": 46.0, "B": 20.0}, "tea", {"A": 2.5, "B": 4.0})'),
          case_(S2, '({"X": 40.0, "Y": 85.0}, "bun", {"X": 20.0, "Y": 4.0})'),
          case_('{"shop": ["Z", "Z", "Z"], "item": ["pie", "pie", "tea"], "qty": [1, 1, 1], "price": [3.0, 3.0, 3.0]}', '({"Z": 9.0}, "pie", {"Z": 1.0})'),
        ],
        tests: [
          { code: 'assert per_shop == E[0]', msg: T('per_shop is wrong', "per_shop noto'g'ri") },
          { code: 'assert top_item == E[1]', msg: T('top_item must be chosen by total quantity', "top_item umumiy son bo'yicha tanlanishi kerak") },
          { code: 'assert average == E[2]', msg: T('average is wrong', "average noto'g'ri") },
        ] },
      { id: 'split', type: 'written',
        prompt: T('Describe what groupby does in your own words: what is split, applied and combined? (1 point, your teacher marks it).', "groupby nima qilishini o'z so'zingiz bilan tushuntiring: nima ajratiladi, qo'llanadi va birlashtiriladi? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
