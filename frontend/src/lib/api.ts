// Minimal API helper that prefers using Vite proxy (relative paths).
// If you want to call an absolute backend URL, you can set VITE_API_URL
// and pass a full URL as `path`.
const VITE_API_URL = (import.meta as any).env?.VITE_API_URL;

function makeUrl(path: string) {
  // If a full URL is provided, use it as-is.
  if (/^https?:\/\//.test(path)) return path;
  // If VITE_API_URL is set, prefix it; otherwise return the relative path
  // so Vite's dev server proxy (configured for /scl) can forward requests.
  if (VITE_API_URL) return `${VITE_API_URL}${path}`;
  return path.startsWith('/') ? path : `/${path}`;
}

export async function apiFetch(path: string, opts?: RequestInit) {
  const url = makeUrl(path);
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

// default export intentionally omitted; use named `apiFetch` instead

// Bulk email trigger helper. Requires caller to provide a bearer token
// (e.g., dev bypass 'dev' or a Firebase idToken) because backend enforces
// auth. Scope should be 'school' or 'college'. If targetId is omitted and
// caller isn't admin, backend will default to uid.
export async function triggerBulkEmail(params: {
  subject: string;
  body: string;
  scope: 'school' | 'college';
  htmlBody?: string;
  targetId?: string; // optional override (admin only)
  previewOnly?: boolean;
  idToken: string; // authorization token
}) {
  const { idToken, ...rest } = params;
  const res = await fetch(makeUrl('/bulk-email'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(rest),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`BulkEmail ${res.status}: ${txt}`);
  }
  return res.json();
}
