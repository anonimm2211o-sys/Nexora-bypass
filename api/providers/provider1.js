export default async function bypass(url) {
  const apiUrl = `https://izen.lol/api?url=${encodeURIComponent(url)}`;
  const resp = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Nexora-Bypass/1.0',
      'Accept': 'application/json'
    },
  });
  if (!resp.ok) return { success: false };
  const data = await resp.json();
  const dest = data.destination || data.url || data.result || null;
  if (dest && dest !== url) {
    return { success: true, destination: dest, source: 'izen.lol' };
  }
  return { success: false };
}