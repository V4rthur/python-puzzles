// Runs before the first paint so a saved choice does not flash the wrong theme or language.
(function () {
  var saved = function (key) { try { return localStorage.getItem(key); } catch (e) { return null; } };
  document.documentElement.setAttribute('data-theme', saved('pz:theme') === 'light' ? 'light' : 'dark');
  document.documentElement.setAttribute('data-lang', saved('pz:lang') === 'uz' ? 'uz' : 'en');
})();
