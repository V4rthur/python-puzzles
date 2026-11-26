// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const BROKEN = 'class Account:\n    history = []\n\n    def __init__(self, owner, balance=0):\n        owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance + amount\n        self.history.append(amount)';

export default {
  id: 'lesson-10',
  title: T('The mixed-up bank', 'Chalkashgan bank'),
  intro: T('Lesson 10: classes · about 40 minutes · pairs. Predict first, compare with your partner, then press Check. Your typing is saved in this browser.',
    "10-dars: klasslar · taxminan 40 daqiqa · juftlikda. Avval natijani taxmin qiling, sherigingiz bilan solishtiring, keyin Tekshirish tugmasini bosing. Yozganlaringiz shu brauzerda saqlanadi."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'class A:\n    x = 1\nprint(A.x)', answer: '1' },
      { id: 'w2', type: 'predict', points: 0, code: 'class P:\n    def __init__(self, n):\n        self.n = n\nprint(P("a").n)', answer: 'a' },
    ]},
    { id: 'l1', title: T('Level 1: meet the objects (4 points)', "1-bosqich: obyektlar bilan tanishing (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 'class Dog:\n    def __init__(self, name):\n        self.name = name\n    def bark(self):\n        return self.name + " woof"\nprint(Dog("Rex").bark())', answer: 'Rex woof' },
      { id: 'p2', type: 'predict', code: 'class C:\n    count = 0\n    def __init__(self):\n        C.count += 1\nC()\nC()\nprint(C.count)', answer: '2' },
      { id: 'p3', type: 'predict', code: 'class Bag:\n    items = []\na = Bag()\nb = Bag()\na.items.append("pen")\nprint(len(b.items))', answer: '1',
        show: 'shared', why: T('A list written in the class body is one list shared by every object.', "Klass tanasida yozilgan ro'yxat barcha obyektlar uchun bitta umumiy ro'yxat.") },
      { id: 'p4', type: 'predict', code: 'class A:\n    def hi(self):\n        return "A"\nclass B(A):\n    def hi(self):\n        return super().hi() + "B"\nprint(B().hi())', answer: 'AB' },
    ]},
    { id: 'l2', title: T('Level 2: the broken account (3 points)', "2-bosqich: buzilgan hisob raqami (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('Each account should remember its owner, its balance and its own history of deposits. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "Har bir hisob egasini, balansini va o'zining to'ldirishlar tarixini eslab qolishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the class (2 points: one for owner and balance, one for separate histories).', "Klassni tuzating (2 ball: biri ega va balans, biri alohida tarix uchun)."),
        hints: [T('Make two accounts and print both histories.', "Ikkita hisob yarating va ikkalasining tarixini chiqaring."),
          T('Everything that belongs to one object starts with self. and is created in __init__.', "Bitta obyektga tegishli hamma narsa self. bilan boshlanadi va __init__ ichida yaratiladi.")],
        start: BROKEN,
        data: [{ before: '', expect: '' }],
        tests: [
          { code: 'a = Account("Ali", 100)\na.deposit(50)\nassert a.owner == "Ali" and a.balance == 150 and Account("Vali").balance == 0', msg: T('owner or balance is wrong', "ega yoki balans noto'g'ri") },
          { code: 'a = Account("A")\nb = Account("B")\na.deposit(5)\nassert a.history == [5] and b.history == []', msg: T('each account needs its own history', "har bir hisobning o'z tarixi bo'lishi kerak") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: build the cart (4 points)', "3-bosqich: savatcha yarating (4 ball)"), cls: 'c3', items: [
      { id: 'cart', type: 'code',
        prompt: T('Write a class Cart with:\n• add(name, price, qty=1): adding the same name again increases its quantity and keeps the newest price\n• total(): the sum of price times quantity\n• len(cart): the total quantity\n• str(cart): text like 3 items, total 25\n(3 points: total, quantity, and the text with separate carts)',
          "Cart klassini yozing:\n• add(name, price, qty=1): bir xil nom qayta qo'shilsa, soni ortadi va eng yangi narx saqlanadi\n• total(): narx va son ko'paytmalarining yig'indisi\n• len(cart): umumiy soni\n• str(cart): 3 items, total 25 kabi matn\n(3 ball: total, son hamda alohida savatchalar uchun matn)"),
        hints: [T('A dictionary from name to [price, qty] is enough.', "Nomdan [narx, son] ga lug'at yetarli."),
          T('len calls __len__ and str calls __str__.', "len __len__ ni, str esa __str__ ni chaqiradi.")],
        start: '',
        data: [{ before: '', expect: '' }],
        tests: [
          { code: 'c = Cart()\nc.add("tea", 5, 2)\nc.add("pie", 12)\nassert c.total() == 22\nc.add("tea", 6)\nassert c.total() == 30\nassert Cart().total() == 0', msg: T('total is wrong', "total noto'g'ri") },
          { code: 'c = Cart()\nassert len(c) == 0\nc.add("tea", 5, 2)\nc.add("tea", 5, 3)\nc.add("pie", 1)\nassert len(c) == 6', msg: T('len must give the total quantity', "len umumiy sonni berishi kerak") },
          { code: 'a = Cart()\nb = Cart()\na.add("tea", 5, 2)\na.add("pie", 15)\nassert str(a) == "3 items, total 25" and str(b) == "0 items, total 0"', msg: T('the text is wrong, or the carts share items', "matn noto'g'ri yoki savatchalar mahsulotlarni bo'lishyapti") },
        ] },
      { id: 'self', type: 'written',
        prompt: T('What is self, and why does every method need it? (1 point, your teacher marks it).', "self nima va nega har bir metodga u kerak? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
