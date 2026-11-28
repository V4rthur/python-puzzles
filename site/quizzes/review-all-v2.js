// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const BROKEN = 'rows = con.execute("SELECT item, qty FROM sales").fetchall()\ndf = pd.DataFrame(rows)\ntotals = df.groupby("item")["qty"].count()\nfig, ax = plt.subplots()\nax.plot(totals)';
// Charts stay open between checks, so every data set starts by closing them.
const START = 'import sqlite3\nimport pandas as pd\nimport matplotlib.pyplot as plt\nplt.close("all")\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE sales (item TEXT, qty INT)")\n';
const sales = (rows, expect) => ({ before: `${START}con.executemany("INSERT INTO sales VALUES (?, ?)", ${rows})`, expect: `E = ${expect}` });
const library = (csv, expect) => ({ before: `csv_text = ${JSON.stringify(csv)}`, expect: `E = ${expect}` });

export default {
  id: 'review-all-v2',
  title: T('The final mission', 'Yakuniy topshiriq'),
  intro: T('Overall practice: the whole course · about 60 minutes. Predict first, then press Check.',
    "Umumiy amaliyot: butun kurs · taxminan 60 daqiqa. Avval natijani taxmin qiling, keyin Tekshirish tugmasini bosing."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'print(type(3 / 1).__name__)', answer: 'float' },
      { id: 'w2', type: 'predict', points: 0, code: 'print(len({"a": 1, "b": 2}))', answer: '2' },
    ]},
    { id: 'l1', title: T('Level 1: look closely (4 points)', "1-bosqich: diqqat bilan qarang (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE t (name TEXT, qty INT)")\ncon.executemany("INSERT INTO t VALUES (?, ?)", [("tea", 2), ("pie", 5), ("tea", 4)])\nprint(con.execute("SELECT name, SUM(qty) FROM t GROUP BY name ORDER BY name").fetchall())', answer: "[('pie', 5), ('tea', 6)]", show: 'sqlgroup', why: T("GROUP BY adds the quantities of each name. ORDER BY puts pie first.", "GROUP BY har bir nomning miqdorini qo'shadi. ORDER BY pie ni birinchi qo'yadi.") },
      { id: 'p2', type: 'predict', code: 'import pandas as pd\ndf = pd.DataFrame({"city": ["A", "B", "A"], "temp": [10, 30, 20]})\nprint(df[df["temp"] > 15]["city"].tolist())', answer: "['B', 'A']", show: 'warm', why: T("Only temperatures above 15 stay, so their cities are B and A.", "Faqat 15 dan yuqori haroratlar qoladi, ularning shaharlari B va A.") },
      { id: 'p3', type: 'predict', code: 'd = {"a": [1]}\ne = d.copy()\ne["a"].append(2)\nprint(d["a"])', answer: '[1, 2]', show: 'shallow', why: T("copy makes a new dictionary, but both still hold the same list.", "copy yangi lug'at yasaydi, lekin ikkalasida ham o'sha bitta ro'yxat turadi.") },
      { id: 'p4', type: 'predict', code: 'try:\n    [1][5]\nexcept LookupError as error:\n    print(type(error).__name__)', answer: 'IndexError', show: 'caught', why: T("IndexError is a kind of LookupError, so except catches it.", "IndexError LookupError ning bir turi, shuning uchun except uni ushlaydi.") },
    ]},
    { id: 'l2', title: T('Level 2: the broken report (3 points)', '2-bosqich: buzilgan hisobot (3 ball)'), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('con is a database with the table sales(item, qty). totals should hold the quantity sold of each item, and a bar chart titled Sales by item should show it. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "con ichida sales(item, qty) jadvali bor baza. totals har bir mahsulotdan sotilgan miqdorni saqlashi, Sales by item sarlavhali ustunli diagramma esa uni ko'rsatishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the code (2 points: one for totals, one for the chart). con, pd and plt already exist.', "Kodni tuzating (2 ball: biri totals, biri diagramma uchun). con, pd va plt allaqachon mavjud."),
        hints: [T('fetchall gives rows without column names. pd.read_sql_query keeps them.', "fetchall qatorlarni ustun nomlarisiz beradi. pd.read_sql_query nomlarni saqlaydi."),
          T('Quantity sold is a total, not a count. ax.bar draws bars and ax.set_title adds the title.', "Sotilgan miqdor yig'indi, qatorlar soni emas. ax.bar ustunlar chizadi, ax.set_title sarlavha qo'shadi.")],
        start: BROKEN,
        data: [
          sales('[("tea", 2), ("pie", 5), ("tea", 4)]', '{"pie": 5, "tea": 6}'),
          sales('[("bun", 7), ("bun", 1), ("jam", 3), ("tea", 2), ("jam", 3)]', '{"bun": 8, "jam": 6, "tea": 2}'),
        ],
        tests: [
          { code: 'assert dict(totals) == E', msg: T('totals is wrong: add up the quantity of each item', "totals noto'g'ri: har bir mahsulot miqdorini qo'shing") },
          { code: 'ax = plt.gca()\nax.figure.canvas.draw()\nheights = [p.get_height() for p in ax.patches]\nassert len(heights) == len(E) and dict(zip([t.get_text() for t in ax.get_xticklabels()], heights)) == E and ax.get_title() == "Sales by item"', msg: T('the chart is not right: check the bars and the title', "diagramma to'g'ri emas: ustunlar va sarlavhani tekshiring") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: run the library (4 points)', '3-bosqich: kutubxonani boshqaring (4 ball)'), cls: 'c3', items: [
      { id: 'library', type: 'code',
        prompt: T('csv_text has a header title,author,year,copies and one book per line. Some lines are damaged. Write a class Book with title, author, year, copies (numbers as int). Then create:\n• books: a list of Book objects from the good lines\n• by_author: a dictionary from author to the total copies\n• report: JSON text {"oldest": title of the oldest book or null, "skipped": number of damaged lines}\n(3 points, one for each)',
          "csv_text da title,author,year,copies sarlavhasi va har qatorda bitta kitob bor. Ba'zi qatorlar shikastlangan. title, author, year, copies (sonlar int) ega Book klassini yozing. Keyin quyidagilarni yarating:\n• books: to'g'ri qatorlardan Book obyektlari ro'yxati\n• by_author: muallifdan umumiy nusxalar soniga lug'at\n• report: JSON matni {\"oldest\": eng eski kitob nomi yoki null, \"skipped\": shikastlangan qatorlar soni}\n(3 ball, har biri uchun bittadan)"),
        code: 'title,author,year,copies\nSea,Ali,1999,3\nbroken line',
        hints: [T('csv.reader or split can read the lines. Skip the header.', "Qatorlarni csv.reader yoki split bilan o'qish mumkin. Sarlavhani o'tkazib yuboring."),
          T('A damaged line raises ValueError when you unpack it or convert the numbers.', "Shikastlangan qator ajratishda yoki sonni aylantirishda ValueError beradi.")],
        start: '',
        data: [
          library('title,author,year,copies\nSea,Ali,1999,3\nbroken line\nSky,Lola,1980,2\nSun,Ali,2005,x\nMap,Ali,2010,1\n', '([("Sea", 1999, 3), ("Sky", 1980, 2), ("Map", 2010, 1)], {"Ali": 4, "Lola": 2}, {"oldest": "Sky", "skipped": 2})'),
          library('title,author,year,copies\n', '([], {}, {"oldest": None, "skipped": 0})'),
          library('title,author,year,copies\nOne,Bek,2001,5\nTwo,Bek,1900,5\n', '([("One", 2001, 5), ("Two", 1900, 5)], {"Bek": 10}, {"oldest": "Two", "skipped": 0})'),
        ],
        tests: [
          { code: 'assert all(isinstance(b, Book) for b in books) and [(b.title, b.year, b.copies) for b in books] == E[0]', msg: T('books is wrong: check damaged lines and number types', "books noto'g'ri: shikastlangan qatorlar va son turlarini tekshiring") },
          { code: 'assert by_author == E[1]', msg: T('by_author is wrong', "by_author noto'g'ri") },
          { code: 'import json\nassert json.loads(report) == E[2]', msg: T('report is wrong', "report noto'g'ri") },
        ] },
      { id: 'debug', type: 'written',
        prompt: T('Your program gives a wrong result with no error. Describe the steps you take to find the cause (1 point, your teacher marks it).', "Dasturingiz xato chiqarmasdan noto'g'ri natija beryapti. Sababini topish uchun qanday qadamlar qo'yasiz? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('What can you build now that you could not build at the start of the course?', "Kurs boshida qila olmagan, hozir esa qila oladigan narsangiz nima?") },
    ]},
  ],
};
