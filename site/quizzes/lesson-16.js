// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const BOOKS = 'import sqlite3\ncon = sqlite3.connect(":memory:")\ncon.execute("CREATE TABLE b (title TEXT, year INT)")\ncon.executemany("INSERT INTO b VALUES (?, ?)",\n                [("A", 2001), ("B", 1999), ("C", 2010)])\n';
const BROKEN = 'def find(con, author):\n    query = "SELECT title FROM books WHERE author = \'" + author + "\'"\n    return con.execute(query).fetchone()';
const library = `import sqlite3
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE books (title TEXT, author TEXT)")
con.executemany("INSERT INTO books VALUES (?, ?)", [("Zoo", "Ali"), ("Ant", "Ali"), ("Sea", "O'Brien"), ("Sky", "Lola")])`;
const sales = (rows, row, expect) => ({
  before: `import sqlite3
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE sales (product TEXT, qty INT, price REAL)")
con.executemany("INSERT INTO sales VALUES (?, ?, ?)", ${rows})
new = ${row}`,
  expect: `E = ${expect}`,
});

export default {
  id: 'lesson-16',
  title: T('The library catalogue', 'Kutubxona katalogi'),
  intro: T('Lesson 16: databases with SQLite · about 45 minutes · pairs. The first check downloads SQLite, so it takes a little longer. Predict first, compare with your partner, then press Check.',
    "16-dars: SQLite ma'lumotlar bazasi · taxminan 45 daqiqa · juftlikda. Birinchi tekshiruvda SQLite yuklanadi, shuning uchun biroz uzoqroq davom etadi. Avval natijani taxmin qiling, sherigingiz bilan solishtiring, keyin Tekshirish tugmasini bosing."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'import sqlite3\ncon = sqlite3.connect(":memory:")\nprint(con.execute("SELECT 2 + 3").fetchone())', answer: '(5,)' },
      { id: 'w2', type: 'predict', points: 0, code: 'import sqlite3\ncon = sqlite3.connect(":memory:")\nprint(con.execute("SELECT \'a\' || \'b\'").fetchone()[0])', answer: 'ab' },
    ]},
    { id: 'l1', title: T('Level 1: ask the database (4 points)', "1-bosqich: bazadan so'rang (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: BOOKS + 'print(con.execute(\n    "SELECT COUNT(*) FROM b WHERE year > 2000").fetchone()[0])', answer: '2',
        show: 'query', why: T('WHERE keeps the rows from 2001 and 2010.', "WHERE 2001 va 2010-yilgi qatorlarni qoldiradi.") },
      { id: 'p2', type: 'predict', code: BOOKS + 'print(con.execute(\n    "SELECT title FROM b ORDER BY year").fetchall())', answer: "[('B',), ('A',), ('C',)]" },
      { id: 'p3', type: 'predict', code: BOOKS + 'cur = con.execute("SELECT title FROM b")\ncur.fetchone()\nprint(cur.fetchone()[0], len(cur.fetchall()))', answer: 'B 1' },
      { id: 'p4', type: 'predict', code: BOOKS + 'con.execute("UPDATE b SET year = year + 1")\nprint(con.execute(\n    "SELECT MIN(year), MAX(year) FROM b").fetchone())', answer: '(2000, 2011)' },
    ]},
    { id: 'l2', title: T('Level 2: the unsafe search (3 points)', "2-bosqich: xavfli qidiruv (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('find should return a list of the titles by one author, in alphabetical order, safely for any name. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "find bitta muallifning kitob nomlari ro'yxatini alifbo tartibida, istalgan ism uchun xavfsiz tarzda qaytarishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the function (2 points: one for the result, one for safety). The table books(title, author) already exists.', "Funksiyani tuzating (2 ball: biri natija, biri xavfsizlik uchun). books(title, author) jadvali allaqachon mavjud."),
        hints: [T('How many rows does fetchone give? What happens with the name O\'Brien?', "fetchone nechta qator beradi? O'Brien ismi bilan nima bo'ladi?"),
          T('Use a ? placeholder and pass the value separately.', "? belgisidan foydalaning va qiymatni alohida uzating.")],
        start: BROKEN,
        data: [{ before: library, expect: '' }],
        tests: [
          { code: 'assert find(con, "Ali") == ["Ant", "Zoo"] and find(con, "Lola") == ["Sky"]', msg: T('the result must be a sorted list of titles', "natija nomlarning saralangan ro'yxati bo'lishi kerak") },
          { code: 'assert find(con, "O\'Brien") == ["Sea"] and find(con, "x\' OR \'1\'=\'1") == []', msg: T('names with quotes break the search or leak rows', "qo'shtirnoqli ismlar qidiruvni buzadi yoki ortiqcha qatorlarni chiqaradi") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: close the shop (4 points)', "3-bosqich: do'konni yoping (4 ball)"), cls: 'c3', items: [
      { id: 'report', type: 'code',
        prompt: T('con (a database with table sales(product, qty, price)) and new (one more row) already exist. Create, in this order:\n• total: all revenue (qty × price) before adding new, 0 if the table is empty\n• best: the product with the highest revenue before adding new, None if empty\n• then insert new, commit, and set rows to the number of rows\n(3 points, one for each)',
          "con (sales(product, qty, price) jadvalli baza) va new (yana bitta qator) allaqachon mavjud. Quyidagilarni shu tartibda yarating:\n• total: new qo'shilishidan oldingi umumiy tushum (qty × price), jadval bo'sh bo'lsa 0\n• best: new qo'shilishidan oldin eng ko'p tushum keltirgan mahsulot, bo'sh bo'lsa None\n• keyin new ni qo'shing, commit qiling va rows ga qatorlar sonini yozing\n(3 ball, har biri uchun bittadan)"),
        code: 'new = ("tea", 1, 5.0)',
        hints: [T('SQL can add up with SUM and group with GROUP BY.', "SQL SUM bilan qo'shadi va GROUP BY bilan guruhlaydi."),
          T('SUM of no rows is NULL, which becomes None. fetchone gives None when there is no row.', "Qatorlar bo'lmasa SUM NULL beradi, u None ga aylanadi. Qator bo'lmasa fetchone None qaytaradi.")],
        start: '',
        data: [
          sales('[("tea", 2, 5.0), ("pie", 1, 12.0), ("tea", 1, 5.0)]', '("bun", 3, 4.0)', '(27.0, "tea", 4)'),
          sales('[]', '("tea", 1, 5.0)', '(0, None, 1)'),
          sales('[("a", 10, 1.0), ("b", 1, 20.0)]', '("a", 100, 1.0)', '(30.0, "b", 3)'),
        ],
        tests: [
          { code: 'assert total == E[0]', msg: T('total is wrong for some shops', "total ba'zi do'konlarda noto'g'ri") },
          { code: 'assert best == E[1]', msg: T('best is wrong: add up each product first', "best noto'g'ri: avval har bir mahsulot bo'yicha qo'shing") },
          { code: 'assert rows == E[2] and not con.in_transaction', msg: T('rows is wrong, or the change was not committed', "rows noto'g'ri yoki o'zgarish commit qilinmagan") },
        ] },
      { id: 'safe', type: 'written',
        prompt: T('Why is a ? placeholder safer than joining strings into a query? (1 point, your teacher marks it).', "Nega ? belgisi so'rovga satrlarni qo'shib yozishdan xavfsizroq? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
