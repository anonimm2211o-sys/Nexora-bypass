export default async function bypass(url) {
  try {
    const apiUrl = `https://izen.lol/userscript?url=${encodeURIComponent(url)}&apikey=&time=0`;
    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      redirect: 'manual' // penting: biar ga di-follow otomatis
    });

    // Cek Location header
    const location = resp.headers.get('location');
    if (location && location !== url) {
      return { success: true, destination: location, source: 'izen.lol (userscript)' };
    }

    // Kalo ga ada Location, coba parse HTML
    const text = await resp.text();
    const match = text.match(/window\.location\.(?:replace|href)\s*=\s*['"]([^'"]+)['"]/);
    if (match && match[1] && match[1] !== url) {
      return { success: true, destination: match[1], source: 'izen.lol (userscript)' };
    }

    return { success: false };
  } catch (_) {
    return { success: false };
  }
}
