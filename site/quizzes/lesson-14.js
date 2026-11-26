// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });
const BROKEN = 'import requests\n\ndef get_user(user_id):\n    response = requests.get("https://api.example.com/users")\n    data = response.json\n    return data["name"]';

// The checker has no internet, so `requests` is replaced by a stand-in that answers from `pages`.
const server = pages => `import json, sys, types
class _Reply:
    def __init__(self, status, body):
        self.status_code = status
        self.ok = status < 400
        self.text = json.dumps(body)
        self._body = body
    def json(self):
        return self._body
    def raise_for_status(self):
        if not self.ok:
            raise RuntimeError(self.status_code)
_pages = ${pages}
def _get(url, params=None, timeout=None, **other):
    if params:
        url += "?" + "&".join(f"{k}={v}" for k, v in params.items())
    return _Reply(*_pages.get(url, (404, {"error": "not found"})))
requests = sys.modules["requests"] = types.SimpleNamespace(get=_get)`;

const USERS = '{"https://api.example.com/users/1": (200, {"name": "Ali"}), "https://api.example.com/users/2": (200, {"name": "Lola"}), "https://api.example.com/users/3": (500, {"error": "broken"})}';
const shop = (pages, expect) => ({
  before: server(`{f"https://api.example.com/products?page={n}": (200, body) for n, body in enumerate(${pages}, 1)}`),
  expect: `E = ${expect}`,
});

export default {
  id: 'lesson-14',
  title: T('The silent server', 'Jim server'),
  intro: T('Lesson 14: requests, APIs and JSON · about 45 minutes · pairs. The checker has no internet, so requests answers from a practice server. Predict first, compare with your partner, then press Check.',
    "14-dars: requests, API va JSON · taxminan 45 daqiqa · juftlikda. Tekshiruvchida internet yo'q, shuning uchun requests mashq serveridan javob oladi. Avval natijani taxmin qiling, sherigingiz bilan solishtiring, keyin Tekshirish tugmasini bosing."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'import json\nprint(json.loads(\'{"a": 1}\')["a"])', answer: '1' },
      { id: 'w2', type: 'predict', points: 0, code: 'status = 404\nprint(status < 400)', answer: 'False' },
    ]},
    { id: 'l1', title: T('Level 1: read the reply (4 points)', "1-bosqich: javobni o'qing (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 'import json\ndata = json.loads(\n    \'{"users": [{"name": "Ali"}, {"name": "Lola"}]}\')\nprint(data["users"][1]["name"], len(data["users"]))', answer: 'Lola 2',
        show: 'nested', why: T('Go step by step: the key users, then item 1, then the key name.', "Qadam-baqadam boring: users kaliti, keyin 1-element, so'ng name kaliti.") },
      { id: 'p2', type: 'predict', code: 'from urllib.parse import urlencode\nprint(urlencode({"q": "python", "page": 2}))', answer: 'q=python&page=2' },
      { id: 'p3', type: 'predict', code: 'import json\nprint(json.dumps({"ok": True, "x": None}))', answer: '{"ok": true, "x": null}' },
      { id: 'p4', type: 'predict', code: 'data = {"items": [{"price": 3}, {}]}\nprint(sum(i.get("price", 0) for i in data["items"]))', answer: '3' },
    ]},
    { id: 'l2', title: T('Level 2: the broken client (3 points)', '2-bosqich: buzilgan mijoz dasturi (3 ball)'), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('get_user should ask https://api.example.com/users/<id> and return the name, or None when the status is not 200. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "get_user https://api.example.com/users/<id> manziliga so'rov yuborib, ismni qaytarishi, holat kodi 200 bo'lmasa None qaytarishi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: BROKEN },
      { id: 'fix', type: 'code',
        prompt: T('Fix the function (2 points: one for correct names, one for failed requests).', "Funksiyani tuzating (2 ball: biri to'g'ri ismlar, biri muvaffaqiyatsiz so'rovlar uchun)."),
        hints: [T('Is json a value or a method? Which address is asked?', "json qiymatmi yoki metodmi? Qaysi manzilga so'rov yuborilyapti?"),
          T('Build the address with an f-string and check response.status_code first.', "Manzilni f-satr bilan tuzing va avval response.status_code ni tekshiring.")],
        start: BROKEN,
        data: [{ before: server(USERS), expect: '' }],
        tests: [
          { code: 'assert get_user(1) == "Ali" and get_user(2) == "Lola"', msg: T('the names are wrong', "ismlar noto'g'ri") },
          { code: 'assert get_user(99) is None and get_user(3) is None', msg: T('a failed request must give None', "muvaffaqiyatsiz so'rov None berishi kerak") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: collect every page (4 points)', "3-bosqich: barcha sahifalarni yig'ing (4 ball)"), cls: 'c3', items: [
      { id: 'pages', type: 'code',
        prompt: T('The address https://api.example.com/products takes a page number (params page=1, 2, …). Each reply is JSON with items (name, price, stock) and next (the next page number, or null). requests already works. Collect all pages and create:\n• names: the names of all products in order\n• value: the total of price × stock\n• pages: how many pages you read\n(3 points, one for each)',
          "https://api.example.com/products manzili sahifa raqamini oladi (params page=1, 2, …). Har bir javob items (name, price, stock) va next (keyingi sahifa raqami yoki null) bor JSON. requests allaqachon ishlaydi. Barcha sahifalarni yig'ib, quyidagilarni yarating:\n• names: barcha mahsulot nomlari tartib bilan\n• value: narx × qoldiq yig'indisi\n• pages: nechta sahifa o'qilgani\n(3 ball, har biri uchun bittadan)"),
        code: '{"items": [{"name": "tea", "price": 5, "stock": 2}], "next": 2}',
        hints: [T('Use a while loop that stops when next is None.', "next None bo'lganda to'xtaydigan while siklidan foydalaning."),
          T('Start with page = 1. After each reply, take page = data["next"].', "page = 1 dan boshlang. Har javobdan keyin page = data[\"next\"] ni oling.")],
        start: '',
        data: [
          shop('[{"items": [{"name": "tea", "price": 5, "stock": 2}], "next": 2}, {"items": [{"name": "pie", "price": 12, "stock": 0}, {"name": "bun", "price": 3, "stock": 4}], "next": 3}, {"items": [{"name": "jam", "price": 7, "stock": 1}], "next": None}]', '(["tea", "pie", "bun", "jam"], 29, 3)'),
          shop('[{"items": [{"name": "ink", "price": 2, "stock": 10}], "next": None}]', '(["ink"], 20, 1)'),
          shop('[{"items": [], "next": None}]', '([], 0, 1)'),
        ],
        tests: [
          { code: 'assert names == E[0]', msg: T('names is wrong: did you read every page?', "names noto'g'ri: barcha sahifalarni o'qidingizmi?") },
          { code: 'assert value == E[1]', msg: T('value is wrong', "value noto'g'ri") },
          { code: 'assert pages == E[2]', msg: T('pages is wrong', "pages noto'g'ri") },
        ] },
      { id: 'status', type: 'written',
        prompt: T('Why should a program check the status code and set a timeout? (1 point, your teacher marks it).', "Nega dastur holat kodini tekshirishi va timeout belgilashi kerak? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
