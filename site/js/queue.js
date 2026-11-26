const PREFIX = 'pz:queue:';

// Unsent submissions, shared by all tabs. `storage` is localStorage (or null); `send` is api.js `submit`.
export function createQueue(storage, send) {
  const memory = new Map(); // items storage would not take: they last as long as the page
  const refused = new Set();
  let running = null;

  // One key per item and no read-modify-write, so tabs cannot overwrite each other's items.
  // An entry that cannot be read as an item is skipped and left where it is.
  const stored = () => {
    let keys = [];
    try { keys = Array.from({ length: storage.length }, (_, i) => storage.key(i)); } catch { /* storage blocked */ }
    return keys.filter(k => k?.startsWith(PREFIX)).flatMap(k => {
      try {
        const sub = JSON.parse(storage.getItem(k));
        return typeof sub?.id === 'string' && PREFIX + sub.id === k ? [sub] : [];
      } catch { return []; }
    });
  };
  // Oldest check first.
  const held = () => [...stored(), ...memory.values()]
    .sort((a, b) => String(a.checked_at).localeCompare(String(b.checked_at)));
  const status = () => {
    const list = held();
    // `unsaved`: how many exist only in this page; left out when there are none.
    return { waiting: list.length, rejected: list.filter(s => refused.has(s.id)).length,
      ...(memory.size && { unsaved: memory.size }) };
  };

  async function run() {
    const tried = new Set();
    try {
      await null; // so that `running` is set before the finally below can clear it
      for (let sub; (sub = held().find(s => !tried.has(s.id)));) {
        tried.add(sub.id);
        try { await send(sub); } catch (e) {
          if (!e?.rejected) break;
          refused.add(sub.id);
          continue;
        }
        memory.delete(sub.id);
        // If this fails the item is sent again later, and the server saves each id once.
        try { storage.removeItem(PREFIX + sub.id); } catch { /* see above */ }
      }
      return status();
    } finally { running = null; }
  }

  return {
    add(sub) {
      try {
        storage.setItem(PREFIX + sub.id, JSON.stringify(sub));
        return true;
      } catch {
        memory.set(sub.id, sub);
        return false;
      }
    },
    flush() {
      if (!running) running = run();
      return running;
    },
    status,
  };
}
