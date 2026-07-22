export default async function bypass(url) {
  const apiUrl = `https://rtaoexe.xyz/bypass?url=${encodeURIComponent(url)}`;
  const resp = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Nexora-Bypass/1.0',
      'Accept': 'application/json'
    },
  });
  if (!resp.ok) return { success: false };
  const data = await resp.json();
  const dest = data.destination || data.result || data.url || null;
  if (dest && dest !== url) {
    return { success: true, destination: dest, source: 'rtaoexe.xyz' };
  }
  return { success: false };
}