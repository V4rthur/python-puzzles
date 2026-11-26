// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const PD = 'import pandas as pd\n';
const DF = PD + 'df = pd.DataFrame({"name": ["Ali", "Lola", "Vali"],\n                   "score": [70, 95, 60]})\n';
const BROKEN = 'df = pd.DataFrame(rows)\ndf.rename(columns={"scor": "score"})\ndf["bonus"] = df["score"] + 5';
const marks = (rows, expect) => ({ before: `${PD}rows = ${rows}`, expect: `E = ${expect}` });
const R1 = '[{"name": "Ali", "scor": 70}, {"name": "Lola", "scor": 98}]';
const R2 = '[{"name": "Vali", "scor": 100}, {"name": "Nur", "scor": 40}, {"name": "Bek", "scor": 96}]';

export default {
  id: 'lesson-18',
  title: T('The school register', 'Maktab jurnali'),
  intro: T('Lesson 18: Pandas DataFrame · about 45 minutes · pairs. The first check downloads Pandas, so it takes longer. Predict first, compare with your partner, then press Check.',
    "18-dars: Pandas DataFrame · taxminan 45 daqiqa · juftlikda. Birinchi tekshiruvda Pandas yuklanadi, shuning uchun uzoqroq davom etadi. Avval natijani taxmin qiling, sherigingiz bilan solishtiring, keyin Tekshirish tugmasini bosing."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: DF + 'print(df.shape)', answer: '(3, 2)' },
      { id: 'w2', type: 'predict', points: 0, code: DF + 'print(list(df.columns))', answer: "['name', 'score']" },
    ]},
    { id: 'l1', title: T('Level 1: read the table (4 points)', "1-bosqich: jadvalni o'qing (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: DF + 'print(df["score"].max(), len(df))', answer: '95 3' },
      { id: 'p2', type: 'predict', code: DF + 'df["passed"] = df["score"] >= 65\nprint(df["passed"].sum())', answer: '2',
        show: 'newcolumn', why: T('The new column holds True or False. Adding them counts the True values.', "Yangi ustun True yoki False saqlaydi. Ularni qo'shsak, True lar soni chiqadi.") },
      { id: 'p3', type: 'predict', code: DF + 'print(df.iloc[1]["name"], df.loc[0, "score"])', answer: 'Lola 70' },
      { id: 'p4', type: 'predict', code: DF + 's = df.sort_values("score")\nprint(s.iloc[0]["name"], df.iloc[0]["name"])', answer: 'Vali Ali' },
    ]},
    { id: 'l2', title: T('Level 2: the broken register (3 points)', "2-bosqich: buzilgan jurnal (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('rows has a misspelled key scor. df should have a column score, and a column bonus that is score plus 5 but never above 100. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "rows da scor kaliti xato yozilgan. df da score ustuni va score ga 5 qo'shilgan, lekin 100 dan oshmaydigan bonus ustuni bo'lishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the code (2 points). rows already exists: do not create it again.', "Kodni tuzating (2 ball). rows allaqachon mavjud: uni qaytadan yaratmang."),
        hints: [T('Does rename change df itself?', "rename df ning o'zini o'zgartiradimi?"), T('A Series has a method that limits values from above.', "Series da qiymatlarni yuqoridan cheklaydigan metod bor.")],
        start: BROKEN,
        data: [marks(R1, '([70, 98], [75, 100])'), marks(R2, '([100, 40, 96], [100, 45, 100])')],
        tests: [
          { code: 'assert list(df["score"]) == E[0] and "scor" not in df.columns', msg: T('the score column is not right', "score ustuni to'g'ri emas") },
          { code: 'assert list(df["bonus"]) == E[1]', msg: T('bonus is wrong: it must never pass 100', "bonus noto'g'ri: u 100 dan oshmasligi kerak") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: rank the class (4 points)', "3-bosqich: sinfni reytinglang (4 ball)"), cls: 'c3', items: [
      { id: 'rank', type: 'code',
        prompt: T('rows (dictionaries with name, math and python) already exists. Create:\n• df: a DataFrame with the extra columns total and average (average of the two subjects, rounded to 1 decimal)\n• top: the name with the highest total\n• ranking: a list of names from highest total to lowest\n(3 points, one for each)',
          "rows (name, math va python kalitli lug'atlar) allaqachon mavjud. Quyidagilarni yarating:\n• df: total va average (ikki fanning o'rtachasi, 1 xonagacha yaxlitlangan) ustunlari qo'shilgan DataFrame\n• top: total i eng yuqori bo'lganning ismi\n• ranking: total i kattadan kichikka tartiblangan ismlar ro'yxati\n(3 ball, har biri uchun bittadan)"),
        code: 'rows = [{"name": "Ali", "math": 80, "python": 91},\n        {"name": "Lola", "math": 95, "python": 90}]',
        hints: [T('You can add two columns with +.', "Ikki ustunni + bilan qo'shish mumkin."), T('sort_values can sort from high to low.', "sort_values kattadan kichikka saralay oladi.")],
        start: '',
        data: [
          marks('[{"name": "Ali", "math": 80, "python": 91}, {"name": "Lola", "math": 95, "python": 90}]', '([171, 185], [85.5, 92.5], ["Lola", "Ali"])'),
          marks('[{"name": "A", "math": 50, "python": 50}, {"name": "B", "math": 40, "python": 45}, {"name": "C", "math": 99, "python": 70}]', '([100, 85, 169], [50.0, 42.5, 84.5], ["C", "A", "B"])'),
        ],
        tests: [
          { code: 'assert list(df["total"]) == E[0] and list(df["average"]) == E[1]', msg: T('total or average is wrong', "total yoki average noto'g'ri") },
          { code: 'assert top == E[2][0]', msg: T('top is wrong', "top noto'g'ri") },
          { code: 'assert list(ranking) == E[2] and isinstance(ranking, list)', msg: T('ranking must be a list of names, highest first', "ranking eng yuqorisidan boshlangan ismlar ro'yxati bo'lishi kerak") },
        ] },
      { id: 'series', type: 'written',
        prompt: T('What is the difference between a Series and a DataFrame? (1 point, your teacher marks it).', "Series va DataFrame ning farqi nima? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
