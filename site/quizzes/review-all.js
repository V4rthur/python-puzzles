// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const BROKEN = 'def word_count(text, counts={}):\n    for word in text.split(" "):\n        counts[word] = 1\n    return counts';
const library = (csv, expect) => ({ before: `csv_text = ${JSON.stringify(csv)}`, expect: `E = ${expect}` });

export default {
  id: 'review-all',
  title: T('The final mission', 'Yakuniy topshiriq'),
  intro: T('Overall practice: the whole course · about 60 minutes. Predict first, then press Check.',
    "Umumiy amaliyot: butun kurs · taxminan 60 daqiqa. Avval natijani taxmin qiling, keyin Tekshirish tugmasini bosing."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'print(type(3 / 1).__name__)', answer: 'float' },
      { id: 'w2', type: 'predict', points: 0, code: 'print(len({"a": 1, "b": 2}))', answer: '2' },
    ]},
    { id: 'l1', title: T('Level 1: look closely (4 points)', "1-bosqich: diqqat bilan qarang (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 'print([x * x for x in range(5) if x % 2])', answer: '[1, 9]' },
      { id: 'p2', type: 'predict', code: 's = "a-b-c"\nprint(s.split("-")[::-1])', answer: "['c', 'b', 'a']" },
      { id: 'p3', type: 'predict', code: 'd = {"a": [1]}\ne = d.copy()\ne["a"].append(2)\nprint(d["a"])', answer: '[1, 2]' },
      { id: 'p4', type: 'predict', code: 'try:\n    [1][5]\nexcept LookupError as error:\n    print(type(error).__name__)', answer: 'IndexError' },
    ]},
    { id: 'l2', title: T('Level 2: the broken counter (3 points)', '2-bosqich: buzilgan sanagich (3 ball)'), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('word_count should return how many times each word appears, ignoring capital letters and the marks . , ! ? and each call must start from nothing. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "word_count har bir so'z necha marta uchrashini qaytarishi, bosh harflar va . , ! ? belgilarini hisobga olmasligi, har chaqiruv noldan boshlanishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the function (2 points: one for counting, one for clean words in separate calls).', "Funksiyani tuzating (2 ball: biri sanash, biri alohida chaqiruvlarda toza so'zlar uchun)."),
        hints: [T('What happens to the default dictionary between calls?', "Standart lug'at chaqiruvlar orasida nima bo'ladi?"), T('split() without an argument ignores extra spaces. get helps to count.', "Argumentsiz split() ortiqcha bo'sh joylarni e'tiborsiz qoldiradi. get sanashga yordam beradi.")],
        start: BROKEN,
        data: [{ before: '', expect: '' }],
        tests: [
          { code: 'assert word_count("a b a c a") == {"a": 3, "b": 1, "c": 1}', msg: T('the counting is wrong', "sanash noto'g'ri") },
          { code: 'assert word_count("Hi, hi!  HI?") == {"hi": 3} and word_count("") == {}', msg: T('capitals, marks, spaces or repeated calls are not handled', "bosh harflar, belgilar, bo'sh joylar yoki takroriy chaqiruvlar hisobga olinmagan") },
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
