const store = new Map();

export function rateLimit(ip) {
  const now = Date.now();
  const entry = store.get(ip);
  if (!entry) {
    store.set(ip, now + 30000);
    return true;
  }
  if (now < entry) {
    return false;
  }
  store.set(ip, now + 30000);
  return true;
}
