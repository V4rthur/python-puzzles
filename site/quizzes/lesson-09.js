// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const BROKEN = 'def read_total(path):\n    f = open(path, "w")\n    total = 0\n    for line in f:\n        total += int(line)\n    return total';
// The browser keeps files between checks, so every data set writes its own input and removes old output.
const FRESH = 'import os\nif os.path.exists("missing.txt"):\n    os.remove("missing.txt")\n';
const log = (text, total) => ({ before: `${FRESH}with open("log.txt", "w") as _f:\n    _f.write(${JSON.stringify(text)})`, expect: `E = ${total}` });
const scores = (text, expect) => ({ before: `import os\nif os.path.exists("best.txt"):\n    os.remove("best.txt")\nwith open("scores.txt", "w") as _f:\n    _f.write(${JSON.stringify(text)})`, expect: `E = ${expect}` });

export default {
  id: 'lesson-09',
  title: T('The damaged logbook', 'Shikastlangan jurnal'),
  intro: T('Lesson 9: exceptions and files · about 40 minutes · pairs. Predict first, compare with your partner, then press Check. Your typing is saved in this browser.',
    "9-dars: istisnolar va fayllar · taxminan 40 daqiqa · juftlikda. Avval natijani taxmin qiling, sherigingiz bilan solishtiring, keyin Tekshirish tugmasini bosing. Yozganlaringiz shu brauzerda saqlanadi."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'try:\n    int("a")\nexcept ValueError:\n    print("bad")', answer: 'bad' },
      { id: 'w2', type: 'predict', points: 0, code: 'print(len("a\\nb".splitlines()))', answer: '2' },
    ]},
    { id: 'l1', title: T('Level 1: catch it (4 points)', "1-bosqich: tutib oling (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 'try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print("A")\nfinally:\n    print("B")', answer: 'A B',
        show: 'flow', why: T('The error jumps to except. finally runs in every case.', "Xato except ga o'tadi. finally har qanday holatda ishlaydi.") },
      { id: 'p2', type: 'predict', code: 'try:\n    x = int("5")\nexcept ValueError:\n    print("E")\nelse:\n    print(x + 1)\nfinally:\n    print("done")', answer: '6 done' },
      { id: 'p3', type: 'predict', code: 'with open("t.txt", "w") as f:\n    f.write("a\\n")\nwith open("t.txt", "a") as f:\n    f.write("b\\n")\nprint(open("t.txt").read().split())', answer: "['a', 'b']" },
      { id: 'p4', type: 'predict', code: 'def f():\n    try:\n        return 1\n    finally:\n        print("bye")\nprint(f())', answer: 'bye 1' },
    ]},
    { id: 'l2', title: T('Level 2: the broken reader (3 points)', "2-bosqich: buzilgan o'quvchi funksiya (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('read_total should add up the whole numbers in a file, one per line. It should skip lines that are not numbers and return 0 when the file does not exist. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "read_total fayldagi har qatorda bittadan yozilgan butun sonlarni qo'shishi kerak. Son bo'lmagan qatorlarni o'tkazib yuborishi, fayl mavjud bo'lmasa 0 qaytarishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the function (2 points: one for reading, one for the missing file).', "Funksiyani tuzating (2 ball: biri o'qish, biri yo'q fayl uchun)."),
        hints: [T('What does the mode "w" do to a file?', "\"w\" rejimi faylga nima qiladi?"),
          T('Use two separate try blocks: one around open, one around int.', "Ikkita alohida try blokidan foydalaning: biri open uchun, biri int uchun.")],
        start: BROKEN,
        data: [log('5\n10\n', 15), log('3\nabc\n\n4\n', 7), log('', 0), log('x\n2\ny\n8', 10)],
        tests: [
          { code: 'assert read_total("log.txt") == E', msg: T('the total is wrong for some files', "ba'zi fayllarda yig'indi noto'g'ri") },
          { code: 'assert read_total("missing.txt") == 0 and not os.path.exists("missing.txt")', msg: T('a missing file must give 0 and must not be created', "yo'q fayl 0 berishi va yaratilmasligi kerak") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: rescue the scores (4 points)', "3-bosqich: natijalarni qutqaring (4 ball)"), cls: 'c3', items: [
      { id: 'rescue', type: 'code',
        prompt: T('The file scores.txt has lines like Ali,90. Some lines are damaged. Create:\n• scores: a dictionary from name to whole-number score, using only good lines\n• skipped: how many lines were damaged\n• a file best.txt containing the name with the highest score (empty if there is none)\n(3 points, one for each)',
          "scores.txt faylida Ali,90 kabi qatorlar bor. Ba'zi qatorlar shikastlangan. Quyidagilarni yarating:\n• scores: faqat to'g'ri qatorlardan tuzilgan, ismdan butun ballga lug'at\n• skipped: shikastlangan qatorlar soni\n• best.txt fayli: ichida eng yuqori ball olganning ismi (bo'lmasa bo'sh)\n(3 ball, har biri uchun bittadan)"),
        code: 'Ali,90\nbad line\nVali,x\nLola,95',
        hints: [T('Split each line at the comma inside a try block.', "Har bir qatorni try bloki ichida verguldan ajrating."),
          T('A wrong number of parts and a bad number both raise ValueError.', "Qismlar soni noto'g'ri bo'lsa ham, son buzuq bo'lsa ham ValueError chiqadi.")],
        start: '',
        data: [
          scores('Ali,90\nbad line\nVali,x\nLola,95\n', '({"Ali": 90, "Lola": 95}, 2, "Lola")'),
          scores('Ann,1\n', '({"Ann": 1}, 0, "Ann")'),
          scores('oops\n', '({}, 1, "")'),
          scores('Bek,70\nNur,40\na,b,c\n', '({"Bek": 70, "Nur": 40}, 1, "Bek")'),
        ],
        tests: [
          { code: 'assert scores == E[0]', msg: T('scores is wrong for some files', "scores ba'zi fayllarda noto'g'ri") },
          { code: 'assert skipped == E[1]', msg: T('skipped is wrong for some files', "skipped ba'zi fayllarda noto'g'ri") },
          { code: 'assert open("best.txt").read().strip() == E[2]', msg: T('best.txt has the wrong content', "best.txt ichidagi ma'lumot noto'g'ri") },
        ] },
      { id: 'bare', type: 'written',
        prompt: T('Why is except: without an error name risky? (1 point, your teacher marks it).', "Xato nomi ko'rsatilmagan except: nega xavfli? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
