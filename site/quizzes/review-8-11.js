// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const BROKEN = 'class CsvFileHandler:\n    def __init__(self, path):\n        path = path\n\n    def read(self):\n        f = open(self.path)\n        return f.readlines()';
// The browser keeps files between checks, so every data set writes its own input.
const FILES = `import os
for _name in ("people.csv", "missing.csv", "stock.csv", "new.csv"):
    if os.path.exists(_name):
        os.remove(_name)
with open("people.csv", "w") as _f:
    _f.write("name,age\\nAli,20\\nLola,31\\n")`;

export default {
  id: 'review-8-11',
  title: T('The CSV workshop', 'CSV ustaxonasi'),
  intro: T('Practice for lessons 8–11: functions, files, exceptions, classes and modules · about 50 minutes. Predict first, then press Check.',
    "8–11-darslar bo'yicha amaliyot: funksiyalar, fayllar, istisnolar, klasslar va modullar · taxminan 50 daqiqa. Avval natijani taxmin qiling, keyin Tekshirish tugmasini bosing."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'print(len("a,b,c".split(",")))', answer: '3' },
      { id: 'w2', type: 'predict', points: 0, code: 'import csv\nprint(list(csv.reader(["a,b"])))', answer: "[['a', 'b']]" },
    ]},
    { id: 'l1', title: T('Level 1: remember the tools (4 points)', "1-bosqich: vositalarni eslang (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 'def f(a, *rest, k=1):\n    return len(rest) + k\nprint(f(1, 2, 3), f(1, k=5))', answer: '3 5' },
      { id: 'p2', type: 'predict', code: 'import csv, io\ntext = io.StringIO("name,age\\nAli,20\\n")\nrows = list(csv.DictReader(text))\nprint(rows[0]["age"] + "1")', answer: '201' },
      { id: 'p3', type: 'predict', code: 'class Box:\n    def __len__(self):\n        return 0\nb = Box()\nprint(len(b), bool(b))', answer: '0 False' },
      { id: 'p4', type: 'predict', code: 'from collections import Counter\nprint(Counter("banana").most_common(1))', answer: "[('a', 3)]" },
    ]},
    { id: 'l2', title: T('Level 2: the broken handler (3 points)', '2-bosqich: buzilgan fayl boshqaruvchisi (3 ball)'), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('CsvFileHandler(path).read() should return a list of dictionaries, one for each row, and an empty list when the file does not exist. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "CsvFileHandler(path).read() har bir qator uchun bittadan lug'at ro'yxatini, fayl mavjud bo'lmasa bo'sh ro'yxat qaytarishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the class (2 points: one for reading, one for the missing file).', "Klassni tuzating (2 ball: biri o'qish, biri yo'q fayl uchun)."),
        hints: [T('Where is self.path created?', "self.path qayerda yaratiladi?"), T('csv.DictReader gives dictionaries. Catch FileNotFoundError.', "csv.DictReader lug'atlar beradi. FileNotFoundError ni ushlang.")],
        start: BROKEN,
        data: [{ before: FILES, expect: '' }],
        tests: [
          { code: 'assert CsvFileHandler("people.csv").read() == [{"name": "Ali", "age": "20"}, {"name": "Lola", "age": "31"}]', msg: T('the rows are not read correctly', "qatorlar to'g'ri o'qilmadi") },
          { code: 'assert CsvFileHandler("missing.csv").read() == []', msg: T('a missing file must give an empty list', "yo'q fayl bo'sh ro'yxat berishi kerak") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: finish the handler (4 points)', '3-bosqich: fayl boshqaruvchisini tugating (4 ball)'), cls: 'c3', items: [
      { id: 'handler', type: 'code',
        prompt: T('Write a class CsvFileHandler(path, fields) with:\n• write(rows): save the header and the rows (dictionaries), replacing the file\n• read(): a list of dictionaries, empty if there is no file\n• add(row): append one row; write the header first if the file does not exist\n• total(column): the sum of the numbers in a column, skipping values that are not numbers\n(3 points: write and read, add, total)',
          "CsvFileHandler(path, fields) klassini yozing:\n• write(rows): sarlavha va qatorlarni (lug'atlar) saqlaydi, faylni almashtiradi\n• read(): lug'atlar ro'yxati, fayl bo'lmasa bo'sh\n• add(row): bitta qator qo'shadi; fayl bo'lmasa avval sarlavhani yozadi\n• total(column): ustundagi sonlar yig'indisi, son bo'lmagan qiymatlar o'tkazib yuboriladi\n(3 ball: write va read, add, total)"),
        hints: [T('csv.DictWriter has writeheader, writerow and writerows. Open with newline="".', "csv.DictWriter da writeheader, writerow va writerows bor. newline=\"\" bilan oching."),
          T('os.path.exists tells you whether the header is needed. Convert with float inside try.', "os.path.exists sarlavha kerak yoki yo'qligini aytadi. try ichida float ga aylantiring.")],
        start: '',
        data: [{ before: FILES, expect: '' }],
        tests: [
          { code: 'h = CsvFileHandler("stock.csv", ["item", "qty"])\nh.write([{"item": "old", "qty": 1}])\nh.write([{"item": "tea", "qty": 2}, {"item": "pie", "qty": 5}])\nassert h.read() == [{"item": "tea", "qty": "2"}, {"item": "pie", "qty": "5"}]', msg: T('write and read do not work together', "write va read birga ishlamayapti") },
          { code: 'h = CsvFileHandler("new.csv", ["item", "qty"])\nassert h.read() == []\nh.add({"item": "a", "qty": 1})\nh.add({"item": "b", "qty": 2})\nassert h.read() == [{"item": "a", "qty": "1"}, {"item": "b", "qty": "2"}]', msg: T('add is wrong: check the header', "add noto'g'ri: sarlavhani tekshiring") },
          { code: 'h = CsvFileHandler("stock.csv", ["item", "qty"])\nh.write([{"item": "a", "qty": 2}, {"item": "b", "qty": "x"}, {"item": "c", "qty": 3.5}])\nassert h.total("qty") == 5.5 and CsvFileHandler("missing.csv", ["qty"]).total("qty") == 0', msg: T('total is wrong for bad values or a missing file', "buzuq qiymat yoki yo'q fayl uchun total noto'g'ri") },
        ] },
      { id: 'with', type: 'written',
        prompt: T('Why is a class a good choice for working with one file, and why open files with with? (1 point, your teacher marks it).', "Nega bitta fayl bilan ishlash uchun klass qulay va nega fayllar with bilan ochiladi? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which topic from lessons 8–11 do you want to practise more?', "8–11-darslardagi qaysi mavzuni ko'proq mashq qilmoqchisiz?") },
    ]},
  ],
};
