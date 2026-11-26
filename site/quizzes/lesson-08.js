// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const BROKEN = 'def average(numbers):\n    total = 0\n    for n in numbers:\n        total += n\n        return total / len(numbers)';

export default {
  id: 'lesson-08',
  title: T('The calculator that forgot', 'Unutuvchan kalkulyator'),
  intro: T('Lesson 8: functions · about 35 minutes · pairs. Predict first, compare with your partner, then press Check. Your typing is saved in this browser.',
    "8-dars: funksiyalar · taxminan 35 daqiqa · juftlikda. Avval natijani taxmin qiling, sherigingiz bilan solishtiring, keyin Tekshirish tugmasini bosing. Yozganlaringiz shu brauzerda saqlanadi."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'def two():\n    return 2\nprint(two() + 1)', answer: '3' },
      { id: 'w2', type: 'predict', points: 0, code: 'def show(x):\n    print(x)\nr = show(5)\nprint(r)', answer: '5 None' },
    ]},
    { id: 'l1', title: T('Level 1: call it (4 points)', "1-bosqich: chaqiring (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 'def add(a, b=10):\n    return a + b\nprint(add(1), add(1, 2), add(b=1, a=5))', answer: '11 3 6' },
      { id: 'p2', type: 'predict', code: 'x = 5\ndef change():\n    x = 10\nchange()\nprint(x)', answer: '5',
        show: 'scope', why: T('x inside the function is a new local name. It disappears when the function ends.', "Funksiya ichidagi x yangi lokal nom. Funksiya tugagach u yo'qoladi.") },
      { id: 'p3', type: 'predict', code: 'def total(*numbers):\n    return sum(numbers)\nprint(total(), total(1, 2, 3))', answer: '0 6' },
      { id: 'p4', type: 'predict', code: 'def add(item, box=[]):\n    box.append(item)\n    return len(box)\nprint(add("a"), add("b"))', answer: '1 2' },
    ]},
    { id: 'l2', title: T('Level 2: the broken average (3 points)', "2-bosqich: buzilgan o'rtacha qiymat (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('average should return the mean of a list, and 0 for an empty list. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "average ro'yxatning o'rtachasini, bo'sh ro'yxat uchun esa 0 qaytarishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the function (2 points: one for normal lists, one for the empty list).', "Funksiyani tuzating (2 ball: biri oddiy ro'yxatlar, biri bo'sh ro'yxat uchun)."),
        hints: [T('How many times does the loop run before return?', "return dan oldin sikl necha marta aylanadi?"),
          T('Look at the indentation of return, then think about len([]).', "return ning chekinishiga qarang, keyin len([]) haqida o'ylang.")],
        start: BROKEN,
        data: [{ before: '', expect: '' }],
        tests: [
          { code: 'assert average([2, 4, 6]) == 4 and average([10]) == 10 and average([1, 2]) == 1.5', msg: T('the average of some lists is wrong', "ba'zi ro'yxatlarning o'rtachasi noto'g'ri") },
          { code: 'assert average([]) == 0', msg: T('an empty list must give 0', "bo'sh ro'yxat 0 berishi kerak") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: build the shop tools (4 points)', "3-bosqich: do'kon vositalarini yarating (4 ball)"), cls: 'c3', items: [
      { id: 'shop', type: 'code',
        prompt: T('Write three functions:\n• discount(prices, percent=10): a new list with each price reduced by percent, rounded to 2 decimals; prices must not change\n• cheapest(prices): the smallest price, or None for an empty list\n• summary(*prices): a tuple (how many, their sum)\n(3 points, one for each)',
          "Uchta funksiya yozing:\n• discount(prices, percent=10): har bir narx percent foizga kamaytirilgan, 2 xonagacha yaxlitlangan yangi ro'yxat; prices o'zgarmasligi kerak\n• cheapest(prices): eng kichik narx, bo'sh ro'yxat uchun None\n• summary(*prices): kortej (soni, yig'indisi)\n(3 ball, har biri uchun bittadan)"),
        hints: [T('Write and test one function at a time with Run.', "Funksiyalarni birma-bir yozib, Ishga tushirish bilan sinang."),
          T('Return values, do not print them. Build a new list for discount.', "Qiymatlarni chiqarmang, qaytaring. discount uchun yangi ro'yxat tuzing.")],
        start: '',
        data: [{ before: '', expect: '' }],
        tests: [
          { code: 'p = [100, 50, 19.98]\nassert discount(p) == [90.0, 45.0, 17.98] and discount(p, 50) == [50.0, 25.0, 9.99] and p == [100, 50, 19.98]', msg: T('discount is wrong, or it changed prices', "discount noto'g'ri yoki prices ni o'zgartirgan") },
          { code: 'assert cheapest([5, 2, 9]) == 2 and cheapest([7]) == 7 and cheapest([]) is None', msg: T('cheapest is wrong for some lists', "cheapest ba'zi ro'yxatlarda noto'g'ri") },
          { code: 'assert summary(1, 2, 3) == (3, 6) and summary() == (0, 0) and summary(4) == (1, 4)', msg: T('summary is wrong for some calls', "summary ba'zi chaqiruvlarda noto'g'ri") },
        ] },
      { id: 'return', type: 'written',
        prompt: T('What is the difference between print and return inside a function? (1 point, your teacher marks it).', "Funksiya ichida print va return ning farqi nima? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
