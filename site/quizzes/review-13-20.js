// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const BROKEN = 'orders = json.loads(raw)\ndf = pd.DataFrame(orders)\ndf["total"] = df["qty"] + df["price"]\ndaily = df.groupby("date")["total"].mean().to_dict()';
const IMPORTS = 'import json\nimport sqlite3\nimport pandas as pd\nfrom datetime import date';
const orders = (data, expect) => ({ before: `${IMPORTS}\nraw = '${data}'`, expect: `E = ${expect}` });
const O1 = '[{"date": "2026-03-02", "qty": 2, "price": 5}, {"date": "2026-03-02", "qty": 1, "price": 12}, {"date": "2026-03-03", "qty": 4, "price": 3}]';
const O2 = '[{"date": "2026-05-01", "qty": 10, "price": 2}]';
const shop = (data, prices, expect) => ({
  before: `${IMPORTS}
raw = '${data}'
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE prices (item TEXT, price REAL)")
con.executemany("INSERT INTO prices VALUES (?, ?)", ${prices})`,
  expect: `E = ${expect}`,
});
const PRICES = '[("tea", 5.0), ("pie", 12.0), ("bun", 3.0)]';

export default {
  id: 'review-13-20',
  title: T('The data office', "Ma'lumotlar bo'limi"),
  intro: T('Practice for lessons 13–20: dates, JSON, databases, NumPy and Pandas · about 55 minutes · pairs. The first check downloads the libraries. Predict first, compare with your partner, then press Check.',
    "13–20-darslar bo'yicha amaliyot: sanalar, JSON, ma'lumotlar bazasi, NumPy va Pandas · taxminan 55 daqiqa · juftlikda. Birinchi tekshiruvda kutubxonalar yuklanadi. Avval natijani taxmin qiling, sherigingiz bilan solishtiring, keyin Tekshirish tugmasini bosing."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'import json\nprint(len(json.loads("[1, 2, 3]")))', answer: '3' },
      { id: 'w2', type: 'predict', points: 0, code: 'import numpy as np\nprint(np.mean([2, 4]))', answer: '3.0' },
    ]},
    { id: 'l1', title: T('Level 1: one question per tool (4 points)', "1-bosqich: har bir vositaga bitta savol (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 'from datetime import date\nd = date.fromisoformat("2026-03-02")\nprint(d.month, d.day)', answer: '3 2' },
      { id: 'p2', type: 'predict', code: 'import sqlite3\ncon = sqlite3.connect(":memory:")\nq = "SELECT SUM(x) FROM (SELECT 2 AS x UNION ALL SELECT 3)"\nprint(con.execute(q).fetchone())', answer: '(5,)' },
      { id: 'p3', type: 'predict', code: 'import numpy as np\na = np.array([[1, 2], [3, 4]])\nprint(a.sum(axis=0).tolist())', answer: '[4, 6]' },
      { id: 'p4', type: 'predict', code: 'import pandas as pd\ndf = pd.DataFrame({"k": ["x", "y", "x"], "v": [1, 2, 3]})\nprint(df.groupby("k")["v"].sum().to_dict())', answer: "{'x': 4, 'y': 2}" },
    ]},
    { id: 'l2', title: T('Level 2: the broken revenue (3 points)', '2-bosqich: buzilgan tushum hisobi (3 ball)'), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('raw is JSON text with orders. df should have a column total (quantity times price), and daily should be a dictionary from date to the revenue of that day. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "raw ichida buyurtmalar yozilgan JSON matni bor. df da total ustuni (son × narx), daily esa sanadan shu kungi tushumga lug'at bo'lishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the code (2 points). raw, json and pd already exist.', "Kodni tuzating (2 ball). raw, json va pd allaqachon mavjud."),
        hints: [T('How do you calculate the money from one order?', "Bitta buyurtmadan tushgan pul qanday hisoblanadi?"), T('Revenue of a day is a total, not an average.', "Kunlik tushum o'rtacha emas, yig'indi.")],
        start: BROKEN,
        data: [orders(O1, '([10, 12, 12], {"2026-03-02": 22, "2026-03-03": 12})'), orders(O2, '([20], {"2026-05-01": 20})')],
        tests: [
          { code: 'assert list(df["total"]) == E[0]', msg: T('the total column is wrong', "total ustuni noto'g'ri") },
          { code: 'assert daily == E[1]', msg: T('daily is wrong', "daily noto'g'ri") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: join the database (4 points)', "3-bosqich: bazani ulang (4 ball)"), cls: 'c3', items: [
      { id: 'office', type: 'code',
        prompt: T('raw (JSON orders with date, item, qty) and con (a database with the table prices(item, price)) already exist. Create:\n• per_item: a dictionary from item to revenue (qty × price from the database)\n• best_day: the date text with the largest revenue\n• weekday: the English weekday name of best_day, for example Monday\n(3 points, one for each)',
          "raw (date, item, qty li JSON buyurtmalar) va con (prices(item, price) jadvalli baza) allaqachon mavjud. Quyidagilarni yarating:\n• per_item: mahsulotdan tushumga lug'at (qty × bazadagi narx)\n• best_day: eng katta tushumli sana matni\n• weekday: best_day ning inglizcha hafta kuni nomi, masalan Monday\n(3 ball, har biri uchun bittadan)"),
        code: 'raw = \'[{"date": "2026-03-02", "item": "tea", "qty": 2}, ...]\'',
        hints: [T('pd.read_sql_query reads a table into a DataFrame. Then merge on item.', "pd.read_sql_query jadvalni DataFrame ga o'qiydi. Keyin item bo'yicha birlashtiring."),
          T('date.fromisoformat(...).strftime("%A") gives the weekday name.', "date.fromisoformat(...).strftime(\"%A\") hafta kuni nomini beradi.")],
        start: '',
        data: [
          shop('[{"date": "2026-03-02", "item": "tea", "qty": 2}, {"date": "2026-03-03", "item": "pie", "qty": 3}, {"date": "2026-03-02", "item": "bun", "qty": 1}]', PRICES, '({"tea": 10.0, "pie": 36.0, "bun": 3.0}, "2026-03-03", "Tuesday")'),
          shop('[{"date": "2026-03-06", "item": "bun", "qty": 9}, {"date": "2026-03-07", "item": "tea", "qty": 1}, {"date": "2026-03-07", "item": "tea", "qty": 2}]', PRICES, '({"bun": 27.0, "tea": 15.0}, "2026-03-06", "Friday")'),
          // The best day is not the day with the largest single order.
          shop('[{"date": "2026-04-01", "item": "pie", "qty": 2}, {"date": "2026-04-02", "item": "tea", "qty": 3}, {"date": "2026-04-02", "item": "pie", "qty": 1}]', PRICES, '({"pie": 36.0, "tea": 15.0}, "2026-04-02", "Thursday")'),
        ],
        tests: [
          { code: 'assert per_item == E[0]', msg: T('per_item is wrong', "per_item noto'g'ri") },
          { code: 'assert best_day == E[1]', msg: T('best_day is wrong: add up each day first', "best_day noto'g'ri: avval har bir kunni qo'shing") },
          { code: 'assert weekday == E[2]', msg: T('weekday is wrong', "weekday noto'g'ri") },
        ] },
      { id: 'choose', type: 'written',
        prompt: T('When would you do a calculation in SQL, and when in Pandas? (1 point, your teacher marks it).', "Hisob-kitobni qachon SQL da, qachon Pandas da bajarasiz? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which topic from lessons 13–20 do you want to practise more?', "13–20-darslardagi qaysi mavzuni ko'proq mashq qilmoqchisiz?") },
    ]},
  ],
};
