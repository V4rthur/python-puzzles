// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const BS = 'from bs4 import BeautifulSoup\n';
const LIST = BS + `html = """<ul><li class="book">A</li>
<li class="book new">B</li><li>C</li></ul>"""
soup = BeautifulSoup(html, "html.parser")
`;
const BROKEN = 'soup = BeautifulSoup(html, "html.parser")\ntitles = soup.find("h2").text\nlinks = [a.text for a in soup.find_all("a")]';
const page = (html, expect) => ({ before: `${BS}html = ${JSON.stringify(html)}`, expect: `E = ${expect}` });
const row = (name, price, stock) => `<tr class="item"><td class="name">${name}</td><td class="price">$${price}</td><td class="stock">${stock}</td></tr>`;
const table = (rows, expect) => page(`<table><tr><th>Name</th><th>Price</th></tr>${rows}</table>`, expect);

export default {
  id: 'lesson-15',
  title: T('The web detective', 'Veb-tergovchi'),
  intro: T('Lesson 15: web scraping and Selenium · about 45 minutes · pairs. You practise on saved pages. The first check downloads Beautiful Soup. Predict first, compare with your partner, then press Check.',
    "15-dars: veb-skreyping va Selenium · taxminan 45 daqiqa · juftlikda. Saqlangan sahifalarda mashq qilasiz. Birinchi tekshiruvda Beautiful Soup yuklanadi. Avval natijani taxmin qiling, sherigingiz bilan solishtiring, keyin Tekshirish tugmasini bosing."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: LIST + 'print(soup.li.text)', answer: 'A' },
      { id: 'w2', type: 'predict', points: 0, code: LIST + 'print(len(soup.find_all("li")))', answer: '3' },
    ]},
    { id: 'l1', title: T('Level 1: search the page (4 points)', '1-bosqich: sahifadan qidiring (4 ball)'), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: LIST + 'print(len(soup.find_all("li", class_="book")))', answer: '2',
        show: 'select', why: T('Two items have the class book. One of them also has the class new.', "Ikkita elementda book klassi bor. Ulardan birida new klassi ham bor.") },
      { id: 'p2', type: 'predict', code: LIST + 'print(soup.select_one(".new").text, soup.find("p"))', answer: 'B None' },
      { id: 'p3', type: 'predict', code: BS + 'a = BeautifulSoup(\'<a href="/x">Go</a>\', "html.parser").a\nprint(a["href"], a.get("title"))', answer: '/x None' },
      { id: 'p4', type: 'predict', code: LIST + 'print([li.get_text() for li in soup.select("ul li")])', answer: "['A', 'B', 'C']" },
    ]},
    { id: 'l2', title: T('Level 2: the broken scraper (3 points)', '2-bosqich: buzilgan skraper (3 ball)'), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('titles should be the text of every h2 heading without outer spaces. links should be the addresses (href) of the links that have one. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "titles har bir h2 sarlavhaning chetdagi bo'sh joylarsiz matni bo'lishi kerak. links esa href ga ega havolalarning manzillari bo'lishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the code (2 points). html already exists: do not create it again.', "Kodni tuzating (2 ball). html allaqachon mavjud: uni qaytadan yaratmang."),
        hints: [T('How many headings does find give? What is inside a link tag?', "find nechta sarlavha beradi? Havola tegining ichida nima bor?"),
          T('get_text(strip=True) removes spaces. find_all("a", href=True) skips links without an address.', "get_text(strip=True) bo'sh joylarni olib tashlaydi. find_all(\"a\", href=True) manzilsiz havolalarni o'tkazib yuboradi.")],
        start: BROKEN,
        data: [
          page('<h2> News </h2><a href="/a">First</a><h2>Sport</h2><a>No address</a><a href="/b">Second</a>', '(["News", "Sport"], ["/a", "/b"])'),
          page('<h2>One</h2><p>text</p>', '(["One"], [])'),
          page('<a href="https://x.uz">x</a>', '([], ["https://x.uz"])'),
        ],
        tests: [
          { code: 'assert titles == E[0]', msg: T('titles is wrong for some pages', "titles ba'zi sahifalarda noto'g'ri") },
          { code: 'assert links == E[1]', msg: T('links must hold the addresses', "links manzillarni saqlashi kerak") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: read the price table (4 points)', "3-bosqich: narxlar jadvalini o'qing (4 ball)"), cls: 'c3', items: [
      { id: 'table', type: 'code',
        prompt: T('html (a page with a price table) already exists. Each product is a row with class item, and cells with classes name, price (like $12.50) and stock ("in stock" or "sold out"). Create:\n• products: a list of (name, price as a number) tuples\n• cheapest: the name of the cheapest product, or None if there are none\n• available: the names of the products in stock\n(3 points, one for each)',
          "html (narxlar jadvali bor sahifa) allaqachon mavjud. Har bir mahsulot item klassli qator, ichidagi kataklar name, price ($12.50 kabi) va stock (\"in stock\" yoki \"sold out\") klasslariga ega. Quyidagilarni yarating:\n• products: (nom, son ko'rinishidagi narx) kortejlari ro'yxati\n• cheapest: eng arzon mahsulot nomi, mahsulot bo'lmasa None\n• available: sotuvda bor mahsulotlar nomlari\n(3 ball, har biri uchun bittadan)"),
        code: `<tr class="item"><td class="name">Pen</td>
<td class="price">$2.50</td><td class="stock">in stock</td></tr>`,
        hints: [T('Loop over soup.select(".item") and use select_one inside each row.', "soup.select(\".item\") bo'yicha aylaning va har bir qator ichida select_one dan foydalaning."),
          T('Remove the $ sign before float. min can use a key function.', "float dan oldin $ belgisini olib tashlang. min kalit funksiyasini qabul qiladi.")],
        start: '',
        data: [
          table(row('Pen', '2.50', 'in stock') + row('Bag', '12.00', 'sold out') + row('Cup', '4.75', 'in stock'), '([("Pen", 2.5), ("Bag", 12.0), ("Cup", 4.75)], "Pen", ["Pen", "Cup"])'),
          table(row('Map', '9.00', 'sold out') + row('Key', '10.00', 'sold out'), '([("Map", 9.0), ("Key", 10.0)], "Map", [])'),
          table('', '([], None, [])'),
        ],
        tests: [
          { code: 'assert products == E[0]', msg: T('products is wrong: check the price type', "products noto'g'ri: narx turini tekshiring") },
          { code: 'assert cheapest == E[1]', msg: T('cheapest is wrong: compare numbers, not text', "cheapest noto'g'ri: matnni emas, sonlarni solishtiring") },
          { code: 'assert available == E[2]', msg: T('available is wrong', "available noto'g'ri") },
        ] },
      { id: 'selenium', type: 'written',
        prompt: T('When do you need Selenium instead of requests with Beautiful Soup? How do you wait for an element to appear? (1 point, your teacher marks it).', "Qachon requests va Beautiful Soup o'rniga Selenium kerak bo'ladi? Element paydo bo'lishini qanday kutasiz? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
