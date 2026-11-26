// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const BROKEN = 'average = temps.sum() / 7\nwarm = temps > 20';
const NP = 'import numpy as np\n';
const week = (values, expect) => ({ before: `${NP}temps = np.array(${values})`, expect: `E = ${expect}` });
const days = (data, expect) => ({
  before: `import numpy as np\nimport pandas as pd\ntemps = pd.Series(${data})`,
  expect: `E = ${expect}`,
});

export default {
  id: 'lesson-17',
  title: T('The weather station', 'Ob-havo stansiyasi'),
  intro: T('Lesson 17: NumPy and Pandas Series · about 45 minutes · pairs. The first check downloads the libraries, so it takes longer. Predict first, compare with your partner, then press Check.',
    "17-dars: NumPy va Pandas Series · taxminan 45 daqiqa · juftlikda. Birinchi tekshiruvda kutubxonalar yuklanadi, shuning uchun uzoqroq davom etadi. Avval natijani taxmin qiling, sherigingiz bilan solishtiring, keyin Tekshirish tugmasini bosing."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: NP + 'a = np.array([1, 2, 3])\nprint((a * 2).tolist())', answer: '[2, 4, 6]' },
      { id: 'w2', type: 'predict', points: 0, code: NP + 'print(np.array([1, 2, 3]).sum())', answer: '6' },
    ]},
    { id: 'l1', title: T('Level 1: think in arrays (4 points)', "1-bosqich: massivlar bilan o'ylang (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: NP + 'a = np.arange(6).reshape(2, 3)\nprint(a.shape, a[1, 2])', answer: '(2, 3) 5' },
      { id: 'p2', type: 'predict', code: NP + 'a = np.array([5, 12, 7])\nprint(a[a > 6].tolist())', answer: '[12, 7]',
        show: 'mask', why: T('a > 6 gives False, True, True. Only the True places are kept.', "a > 6 False, True, True beradi. Faqat True o'rinlar qoladi.") },
      { id: 'p3', type: 'predict', code: NP + 'items = [1, 2]\na = np.array([1, 2])\nprint(items * 2, (a * 2).tolist())', answer: '[1, 2, 1, 2] [2, 4]' },
      { id: 'p4', type: 'predict', code: 'import pandas as pd\ns = pd.Series([10, 20, 30], index=["a", "b", "c"])\nprint(s["b"], s.iloc[-1], s.sum())', answer: '20 30 60' },
    ]},
    { id: 'l2', title: T('Level 2: the broken forecast (3 points)', "2-bosqich: buzilgan prognoz (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('temps is an array of temperatures. average should be their mean, and warm the temperatures above 20. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "temps haroratlar massivi. average ularning o'rtachasi, warm esa 20 dan yuqori haroratlar bo'lishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the code (2 points). temps already exists: do not create it again.', "Kodni tuzating (2 ball). temps allaqachon mavjud: uni qaytadan yaratmang."),
        hints: [T('Does every array have seven values?', "Har bir massivda yettita qiymat bormi?"), T('A condition gives True and False. Use it to choose values.', "Shart True va False beradi. Undan qiymatlarni tanlash uchun foydalaning.")],
        start: BROKEN,
        data: [week('[18, 25, 22, 15, 30, 19, 18]', '(21.0, [25, 22, 30])'), week('[10, 20, 30]', '(20.0, [30])'), week('[5, 6]', '(5.5, [])')],
        tests: [
          { code: 'assert abs(average - E[0]) < 1e-9', msg: T('average is wrong for some arrays', "average ba'zi massivlarda noto'g'ri") },
          { code: 'assert isinstance(warm, np.ndarray) and warm.tolist() == E[1]', msg: T('warm must hold the temperatures above 20', "warm 20 dan yuqori haroratlarni saqlashi kerak") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: repair the sensor data (4 points)', "3-bosqich: datchik ma'lumotlarini tiklang (4 ball)"), cls: 'c3', items: [
      { id: 'repair', type: 'code',
        prompt: T('temps (a Series with day names as its index, some values missing) already exists. Create:\n• filled: the Series with missing values replaced by the mean of the others, rounded to 1 decimal\n• hottest: the day name with the highest value in filled\n• above: how many values in filled are above the mean of filled\n(3 points, one for each)',
          "temps (indeksi kun nomlari bo'lgan, ba'zi qiymatlari yo'q Series) allaqachon mavjud. Quyidagilarni yarating:\n• filled: yo'q qiymatlar qolganlarining o'rtachasi bilan (1 xonagacha yaxlitlab) to'ldirilgan Series\n• hottest: filled da eng yuqori qiymatli kun nomi\n• above: filled da o'z o'rtachasidan yuqori qiymatlar soni\n(3 ball, har biri uchun bittadan)"),
        code: 'temps = pd.Series({"Mon": 20.0, "Tue": np.nan, "Wed": 26.0, "Thu": 21.0})',
        hints: [T('mean() already ignores missing values.', "mean() yo'q qiymatlarni o'zi e'tiborsiz qoldiradi."),
          T('Look at fillna, idxmax, and adding up a condition.', "fillna, idxmax va shartni qo'shib sanashni ko'rib chiqing.")],
        start: '',
        data: [
          days('{"Mon": 20.0, "Tue": np.nan, "Wed": 26.0, "Thu": 21.0}', '([20.0, 22.3, 26.0, 21.0], "Wed", 1)'),
          days('{"Sat": np.nan, "Sun": 10.0}', '([10.0, 10.0], "Sat", 0)'),
          days('{"A": 1.0, "B": 9.0, "C": 8.0}', '([1.0, 9.0, 8.0], "B", 2)'),
        ],
        tests: [
          { code: 'assert list(filled.index) == list(temps.index) and np.allclose(filled.values, E[0])', msg: T('filled is wrong for some data', "filled ba'zi ma'lumotlarda noto'g'ri") },
          { code: 'assert hottest == E[1]', msg: T('hottest must be the day name', "hottest kun nomi bo'lishi kerak") },
          { code: 'assert above == E[2]', msg: T('above is wrong for some data', "above ba'zi ma'lumotlarda noto'g'ri") },
        ] },
      { id: 'vector', type: 'written',
        prompt: T('Why is a * 2 on an array usually better than a loop? (1 point, your teacher marks it).', "Nega massivda a * 2 odatda sikldan yaxshiroq? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
