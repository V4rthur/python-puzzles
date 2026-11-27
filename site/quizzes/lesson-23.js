// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const PLT = 'import matplotlib.pyplot as plt\n';
const AX = PLT + 'fig, ax = plt.subplots()\n';
const BROKEN = 'fig, ax = plt.subplots()\nax.plot(df["month"], df["sales"].sum())\nax.xlabel = "Month"';
// Charts stay open between checks, so every data set starts by closing them.
const START = 'import pandas as pd\nimport matplotlib.pyplot as plt\nplt.close("all")\n';
const sales = (months, values) => ({ before: `${START}df = pd.DataFrame({"month": ${months}, "sales": ${values}})`, expect: `E = (${months}, ${values})` });
const shops = (data, expect) => ({ before: `${START}df = pd.DataFrame(${data})`, expect: `E = ${expect}` });

export default {
  id: 'lesson-23',
  title: T('The chart studio', 'Diagrammalar ustaxonasi'),
  intro: T('Lesson 23: Matplotlib with NumPy and Pandas · about 45 minutes. Press Run to see your chart. The first run downloads the libraries, so it takes longer.',
    "23-dars: Matplotlib, NumPy va Pandas bilan · taxminan 45 daqiqa. Diagrammangizni ko'rish uchun Ishga tushirish tugmasini bosing. Birinchi ishga tushirishda kutubxonalar yuklanadi, shuning uchun uzoqroq davom etadi."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: AX + 'ax.plot([1, 2, 3])\nprint(len(ax.lines))', answer: '1' },
      { id: 'w2', type: 'predict', points: 0, code: AX + 'ax.set_title("Hi")\nprint(ax.get_title())', answer: 'Hi' },
    ]},
    { id: 'l1', title: T('Level 1: read the chart (4 points)', "1-bosqich: diagrammani o'qing (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: AX + 'line = ax.plot([1, 2, 3], [2, 4, 8])[0]\nprint([int(y) for y in line.get_ydata()])', answer: '[2, 4, 8]' },
      { id: 'p2', type: 'predict', code: AX + 'bars = ax.bar(["a", "b", "c"], [3, 5, 2])\nprint(len(ax.patches), int(max(b.get_height() for b in bars)))', answer: '3 5',
        show: 'bars', why: T('bar draws one rectangle for each value. The tallest is 5.', "bar har bir qiymat uchun bitta to'rtburchak chizadi. Eng balandi 5.") },
      { id: 'p3', type: 'predict', code: AX + 'ax.plot([1, 2])\nax.plot([2, 1])\nax.legend(["up", "down"])\nprint(len(ax.lines), ax.get_legend() is not None)', answer: '2 True' },
      { id: 'p4', type: 'predict', code: PLT + 'fig, axes = plt.subplots(2, 3)\nprint(axes.shape, axes[1, 2] is axes[-1, -1])', answer: '(2, 3) True' },
    ]},
    { id: 'l2', title: T('Level 2: the broken chart (3 points)', '2-bosqich: buzilgan diagramma (3 ball)'), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('The code should draw a bar chart of sales for each month, titled Sales, with the y axis labelled Sales. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "Kod har oy uchun savdo ustunli diagrammasini chizishi, sarlavhasi Sales va y o'qining yozuvi Sales bo'lishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the code (2 points: one for the bars, one for the labels). df (month, sales) and plt already exist.', "Kodni tuzating (2 ball: biri ustunlar, biri yozuvlar uchun). df (month, sales) va plt allaqachon mavjud."),
        hints: [T('What does sum() give: one number or one for each month?', "sum() nima beradi: bitta sonmi yoki har oy uchun alohidami?"),
          T('Labels are set by calling methods, for example set_ylabel.', "Yozuvlar metodlarni chaqirib o'rnatiladi, masalan set_ylabel.")],
        start: BROKEN,
        data: [sales('["Jan", "Feb", "Mar"]', '[10, 25, 15]'), sales('["Apr", "May"]', '[7, 3]')],
        tests: [
          { code: 'ax = plt.gca()\nax.figure.canvas.draw()\nassert [p.get_height() for p in ax.patches] == E[1] and [t.get_text() for t in ax.get_xticklabels()] == E[0]', msg: T('the bars do not match the months and sales', "ustunlar oylar va savdoga mos emas") },
          { code: 'ax = plt.gca()\nassert ax.get_title() == "Sales" and ax.get_ylabel() == "Sales" and len(ax.patches) == len(E[1])', msg: T('the title or the y label is missing', "sarlavha yoki y o'qi yozuvi yo'q") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: build the dashboard (4 points)', '3-bosqich: boshqaruv panelini tuzing (4 ball)'), cls: 'c3', items: [
      { id: 'board', type: 'code',
        prompt: T('df (shop, month, qty) and plt already exist. Make one figure with two charts side by side:\n• left: a bar chart of the total qty for each shop, shops in alphabetical order, titled By shop\n• right: a line chart of the total qty for each month, months in the order they appear, titled By month\n• also create best: the shop with the largest total\n(3 points: left chart, right chart, best)',
          "df (shop, month, qty) va plt allaqachon mavjud. Yonma-yon ikkita diagrammali bitta figura yarating:\n• chapda: har bir do'konning umumiy qty ustunli diagrammasi, do'konlar alifbo tartibida, sarlavhasi By shop\n• o'ngda: har oyning umumiy qty chiziqli diagrammasi, oylar uchrash tartibida, sarlavhasi By month\n• shuningdek best yarating: umumiy soni eng katta do'kon\n(3 ball: chap diagramma, o'ng diagramma, best)"),
        code: 'df = pd.DataFrame({"shop": ["B", "A", "B"],\n                   "month": ["Jan", "Jan", "Feb"], "qty": [3, 5, 4]})',
        hints: [T('plt.subplots(1, 2) gives two axes in one figure.', "plt.subplots(1, 2) bitta figurada ikkita o'q beradi."),
          T('groupby sorts the keys. Pass sort=False to keep the order they appear in.', "groupby kalitlarni saralaydi. Uchrash tartibini saqlash uchun sort=False bering.")],
        start: '',
        data: [
          shops('{"shop": ["B", "A", "B", "A"], "month": ["Jan", "Jan", "Feb", "Feb"], "qty": [3, 5, 9, 1]}', '([6, 12], [8, 10], "B")'),
          shops('{"shop": ["C", "A", "B"], "month": ["Sep", "Oct", "Aug"], "qty": [20, 2, 3]}', '([2, 3, 20], [20, 2, 3], "C")'),
        ],
        tests: [
          { code: 'left = plt.gcf().axes[0]\nassert len(plt.gcf().axes) == 2 and left.get_title() == "By shop" and [p.get_height() for p in left.patches] == E[0]', msg: T('the left chart is not right', "chap diagramma to'g'ri emas") },
          { code: 'right = plt.gcf().axes[1]\nassert right.get_title() == "By month" and len(right.lines) == 1 and list(right.lines[0].get_ydata()) == E[1]', msg: T('the right chart is not right: check the month order', "o'ng diagramma to'g'ri emas: oylar tartibini tekshiring") },
          { code: 'assert best == E[2]', msg: T('best is wrong', "best noto'g'ri") },
        ] },
      { id: 'labels', type: 'written',
        prompt: T('When do you choose a bar chart and when a line chart? (1 point, your teacher marks it).', "Qachon ustunli, qachon chiziqli diagramma tanlanadi? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
