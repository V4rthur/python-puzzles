// Worker for createRunner (checker.js): posts {id: 0, ready} or {id: 0, failed}, then answers each {id, code} with {id, error, fatal, output}.
// A program that imports a data library first gets {id, loading}, or {id, unavailable} if the library cannot be fetched.
const BASE = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';

(async () => {
  importScripts(BASE + 'pyodide.js');
  const py = await loadPyodide();
  // Printed text of the current program, capped so a printing loop cannot fill memory.
  let output = '', decoder = new TextDecoder(); // libraries may print while they load, before any program
  py.setStdout({ write: bytes => {
    if (output.length < 2000) output = (output + decoder.decode(bytes, { stream: true })).slice(0, 2000);
    return bytes.length;
  } });
  const flush = () => { try { py.runPython('import sys; sys.stdout.flush()'); } catch {} };
  // Downloaded and imported once, outside the program's time limit.
  const ready = new Set();
  const PACKAGES = { sqlite3: 'sqlite3', numpy: 'numpy', pandas: 'pandas', bs4: 'beautifulsoup4', matplotlib: 'matplotlib' }; // import name: download name
  const prepare = async (id, code) => {
    const needed = Object.keys(PACKAGES).filter(name => !ready.has(name) &&
      new RegExp(`^\\s*(import|from)\\s+${name}\\b`, 'm').test(code));
    if (!needed.length) return true;
    postMessage({ id, loading: true });
    for (const name of needed) {
      try {
        await py.loadPackage(PACKAGES[name]);
        // A worker has no screen, so Matplotlib must draw into memory.
        py.runPython(name === 'matplotlib' ? 'import os; os.environ["MPLBACKEND"] = "Agg"\nimport matplotlib.pyplot' : `import ${name}`);
        ready.add(name);
      } catch {
        postMessage({ id, unavailable: name });
        return false;
      }
    }
    postMessage({ id, loading: false });
    return true;
  };
  // The current chart as base64 PNG ('' if none), then every chart is closed.
  const chart = () => {
    if (!ready.has('matplotlib')) return '';
    try {
      return py.runPython(`def _chart():
    import base64, io
    import matplotlib.pyplot as plt
    if not plt.get_fignums():
        return ""
    out = io.BytesIO()
    plt.gcf().savefig(out, format="png", dpi=90, bbox_inches="tight")
    plt.close("all")
    return base64.b64encode(out.getvalue()).decode()
_chart()`);
    } catch { return ''; }
  };
  onmessage = async ({ data: { id, code } }) => {
    if (!await prepare(id, code)) return;
    let globals;
    output = '';
    decoder = new TextDecoder();
    try {
      globals = py.toPy({}); // fresh for each program
      py.runPython(code, { globals });
      flush();
      postMessage({ id, error: '', output, image: chart() });
    } catch (e) {
      // Anything but a Python error means the interpreter itself broke. `error` must not be empty: that means success.
      flush();
      postMessage({ id, output, error: String(e.message).trim().split('\n').pop() || e.name || 'Error', fatal: e.name !== 'PythonError' });
    } finally { globals?.destroy(); }
  };
  postMessage({ id: 0, ready: true });
})().catch(e => postMessage({ id: 0, failed: String(e) }));
