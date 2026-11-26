import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

// Errors from the server carry .status and .code; network failures have neither.
async function call(path, { method = 'GET', body, headers } = {}, token) {
  // A hung request would hold up the send queue. Not AbortSignal.timeout: older Safari lacks it.
  const abort = new AbortController(), timer = setTimeout(() => abort.abort(), 20000);
  let res, text;
  try {
    res = await fetch(SUPABASE_URL + path, {
      method,
      signal: abort.signal,
      headers: {
        apikey: SUPABASE_KEY,
        // Only a signed-in user's token: a publishable key is not accepted as Bearer.
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    text = await res.text();
  } finally { clearTimeout(timer); }
  if (!res.ok) {
    let info;
    try { info = JSON.parse(text); } catch { /* not JSON: a proxy or gateway page */ }
    throw Object.assign(new Error(info?.message || info?.msg || info?.error_description || `HTTP ${res.status}`),
      { status: res.status, code: info?.error_code || info?.code });
  }
  return text ? JSON.parse(text) : null;
}

// `path` is relative to /rest/v1/, for example 'groups?order=code'.
export const rest = (path, options, token) => call(`/rest/v1/${path}`, options, token);

const rpc = (name, args) => rest(`rpc/${name}`, { method: 'POST', body: args });

export const checkGroup = async code => await rpc('check_group', { p_code: code }) === true;

export async function submit(s) {
  try {
    await rpc('submit', { p_id: s.id, p_code: s.group_code, p_name: s.name, p_quiz: s.quiz, p_part: s.part,
      p_answers: s.answers, p_results: s.results, p_checked_at: s.checked_at });
  } catch (e) {
    // Rejected: sending the same thing again will not help. Timeouts and rate limits will.
    if (e.status >= 400 && e.status < 500 && e.status !== 408 && e.status !== 429) e.rejected = true;
    throw e;
  }
}

export const signIn = async (email, password) =>
  (await call('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } })).access_token;

// `path` needs an `order=` with a unique tie-break, or pages can overlap.
// The project's "Max rows" must stay at 1000 or more: a capped block looks like the last one.
export async function fetchAll(path, token) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    // Query parameters, not Range headers: those would need their own CORS allowance.
    const block = await rest(`${path}${path.includes('?') ? '&' : '?'}limit=1000&offset=${from}`, {}, token);
    rows.push(...block);
    if (block.length < 1000) return rows;
  }
}
