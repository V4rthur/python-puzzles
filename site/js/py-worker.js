// Worker for createRunner (checker.js): posts {id: 0, ready} or {id: 0, failed}, then answers each {id, code} with {id, error, fatal, output}.
const BASE = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';

(async () => {
  importScripts(BASE + 'pyodide.js');
  const py = await loadPyodide();
  // Printed text of the current program, capped so a printing loop cannot fill memory.
  let output = '', decoder;
  py.setStdout({ write: bytes => {
    if (output.length < 2000) output = (output + decoder.decode(bytes, { stream: true })).slice(0, 2000);
    return bytes.length;
  } });
  const flush = () => { try { py.runPython('import sys; sys.stdout.flush()'); } catch {} };
  onmessage = ({ data: { id, code } }) => {
    let globals;
    output = '';
    decoder = new TextDecoder();
    try {
      globals = py.toPy({}); // fresh for each program
      py.runPython(code, { globals });
      flush();
      postMessage({ id, error: '', output });
    } catch (e) {
      // Anything but a Python error means the interpreter itself broke. `error` must not be empty: that means success.
      flush();
      postMessage({ id, output, error: String(e.message).trim().split('\n').pop() || e.name || 'Error', fatal: e.name !== 'PythonError' });
    } finally { globals?.destroy(); }
  };
  postMessage({ id: 0, ready: true });
})().catch(e => postMessage({ id: 0, failed: String(e) }));
