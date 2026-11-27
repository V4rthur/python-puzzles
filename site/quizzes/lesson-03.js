// Note: answers are readable in the page source, so use this for practice, not graded exams.
const T = (en, uz) => ({ en, uz });

export default {
  id: 'lesson-03',
  title: T('The mixed-up playlist', 'Aralashib ketgan pleylist'),
  intro: T('Lesson 3: lists and tuples · about 30 minutes. Predict first, then press Check. Your typing is saved in this browser.',
    "3-dars: ro'yxatlar va kortejlar · taxminan 30 daqiqa. Avval natijani taxmin qiling, keyin Tekshirish tugmasini bosing. Yozganlaringiz shu brauzerda saqlanadi."),
  parts: [
    { id: 'warmup', title: T('Warm-up: what is printed? (not scored)', "Mashq: ekranga nima chiqadi? (baholanmaydi)"), items: [
      { id: 'w1', type: 'predict', points: 0, code: 'print([1, 2, 3][1])', answer: '2' },
      { id: 'w2', type: 'predict', points: 0, code: 'print(len((5, 6)))', answer: '2' },
    ]},
    { id: 'l1', title: T('Level 1: follow the list (4 points)', "1-bosqich: ro'yxatni kuzating (4 ball)"), cls: 'c1', items: [
      { id: 'p1', type: 'predict', code: 'songs = ["a", "b", "c"]\nsongs.append("d")\nprint(songs[-1], len(songs))', answer: 'd 4',
        show: 'append', why: T('append adds one item to the end of the same list.', "append shu ro'yxatning oxiriga bitta element qo'shadi.") },
      { id: 'p2', type: 'predict', code: 'n = [5, 1, 4]\nprint(sorted(n), n)', answer: '[1, 4, 5] [5, 1, 4]' },
      { id: 'p3', type: 'predict', code: 'a = [1, 2]\nb = a\nc = a.copy()\na.append(3)\nprint(len(b), len(c))', answer: '3 2',
        show: 'copy', why: T('a and b are two names for one list. c is a separate copy.', "a va b bitta ro'yxatning ikki nomi. c esa alohida nusxa.") },
      { id: 'p4', type: 'predict', code: 't = (10, 20, 30)\nx, y, z = t\nprint(z, t[::2])', answer: '30 (10, 30)' },
    ]},
    { id: 'l2', title: T('Level 2: the broken scoreboard (3 points)', "2-bosqich: buzilgan natijalar jadvali (3 ball)"), cls: 'c2', items: [
      { id: 'why', type: 'written',
        prompt: T('top should hold the two highest scores, highest first, and scores must not change. The code below is wrong. Describe every problem you find (1 point, your teacher marks it).',
          "top da eng yuqori ikkita natija, kattasi birinchi bo'lib turishi kerak va scores o'zgarmasligi kerak. Quyidagi kod noto'g'ri. Topgan barcha xatolarni tushuntiring (1 ball, o'qituvchi baholaydi)."),
        code: 'scores = [70, 90, 80]\nordered = scores.sort()\ntop = ordered[0:2]' },
      { id: 'fix', type: 'code',
        show: 'sort', why: T('sorted makes a new list. sort changes the list and returns None.', "sorted yangi ro'yxat yaratadi. sort esa ro'yxatning o'zini o'zgartiradi va None qaytaradi."),
        prompt: T('Fix the code (2 points). scores already exists: do not create it again.', "Kodni tuzating (2 ball). scores allaqachon mavjud: uni qaytadan yaratmang."),
        hints: [T('Print what scores.sort() gives back.', "scores.sort() nima qaytarishini chiqarib ko'ring."),
          T('There is a function that returns a new sorted list. It can sort from high to low.', "Yangi saralangan ro'yxat qaytaradigan funksiya bor. U kattadan kichikka ham saralay oladi.")],
        start: 'ordered = scores.sort()\ntop = ordered[0:2]',
        data: [
          { before: 'scores = [70, 90, 80]', expect: 'E = ([90, 80], [70, 90, 80])' },
          { before: 'scores = [5, 1, 9, 7]', expect: 'E = ([9, 7], [5, 1, 9, 7])' },
          { before: 'scores = [3, 1, 3]', expect: 'E = ([3, 3], [3, 1, 3])' },
        ],
        tests: [
          { code: 'assert top == E[0]', msg: T('top is wrong for some score lists', "top ba'zi ro'yxatlarda noto'g'ri") },
          { code: 'assert top == E[0] and scores == E[1]', msg: T('scores must stay as it was, and top must be right', "scores o'zgarmasligi va top to'g'ri bo'lishi kerak") },
        ] },
    ]},
    { id: 'l3', title: T('Level 3: rebuild the queue (4 points)', "3-bosqich: navbatni qayta tuzing (4 ball)"), cls: 'c3', items: [
      { id: 'queue', type: 'code',
        prompt: T('playlist (a list of songs) and new (one song) already exist. Do not change playlist. No if, no loops. Create:\n• queue: new first, then the songs of playlist without its first song, then that first song at the end\n• count: how many songs queue has\n• ends: a tuple with the first and last song of queue\n(3 points, one for each)',
          "playlist (qo'shiqlar ro'yxati) va new (bitta qo'shiq) allaqachon mavjud. playlist ni o'zgartirmang. if va sikl ishlatilmaydi. Quyidagilarni yarating:\n• queue: avval new, keyin playlist ning birinchisidan boshqa qo'shiqlari, oxirida esa o'sha birinchi qo'shiq\n• count: queue dagi qo'shiqlar soni\n• ends: queue ning birinchi va oxirgi qo'shig'idan iborat kortej\n(3 ball, har biri uchun bittadan)"),
        code: 'playlist = ["rain", "sun", "wind"]\nnew = "snow"',
        hints: [T('Lists can be joined with +. A slice can skip the first item.', "Ro'yxatlarni + bilan qo'shish mumkin. Kesim birinchi elementni o'tkazib yubora oladi."),
          T('[new] is a list with one song. playlist[1:] is everything after the first.', "[new] bitta qo'shiqli ro'yxat. playlist[1:] birinchisidan keyingi hamma element.")],
        start: '',
        data: [
          { before: 'playlist = ["rain", "sun", "wind"]\nnew = "snow"', expect: 'E = (["snow", "sun", "wind", "rain"], 4, ("snow", "rain"), ["rain", "sun", "wind"])' },
          { before: 'playlist = ["one"]\nnew = "two"', expect: 'E = (["two", "one"], 2, ("two", "one"), ["one"])' },
          { before: 'playlist = ["a", "b", "c", "d"]\nnew = "e"', expect: 'E = (["e", "b", "c", "d", "a"], 5, ("e", "a"), ["a", "b", "c", "d"])' },
        ],
        tests: [
          { code: 'assert queue == E[0] and playlist == E[3]', msg: T('queue is wrong, or playlist was changed', "queue noto'g'ri yoki playlist o'zgarib ketgan") },
          { code: 'assert count == E[1]', msg: T('count is wrong for some playlists', "count ba'zi ro'yxatlarda noto'g'ri") },
          { code: 'assert type(ends) is tuple and ends == E[2]', msg: T('ends must be a tuple with the first and last song', "ends birinchi va oxirgi qo'shiqdan iborat kortej bo'lishi kerak") },
        ] },
      { id: 'names', type: 'written',
        prompt: T('After b = a, why does a.append(3) also change b? How do you avoid it? (1 point, your teacher marks it).', "b = a dan keyin nega a.append(3) b ni ham o'zgartiradi? Buning oldini qanday olasiz? (1 ball, o'qituvchi baholaydi).") },
      { id: 'reflect', type: 'written', points: 0, prompt: T('Which answer surprised you, and what did you believe before?', "Qaysi javob sizni ajablantirdi va oldin qanday o'ylagan edingiz?") },
    ]},
  ],
};
