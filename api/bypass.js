export default async function handler(req, res) {
  // Set CORS biar aman (opsional)
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ status: 'error', message: 'Parameter URL diperlukan.' });
  }

  // Validasi URL biar gak asal
  try {
    new URL(url);
  } catch (_) {
    return res.status(400).json({ status: 'error', message: 'URL tidak valid.' });
  }

  // Daftar endpoint bypass gratis (diurutin prioritas)
  const apis = [
    `https://api.bypass.vip/?url=${encodeURIComponent(url)}`,
    `https://bypass-api.com/api?url=${encodeURIComponent(url)}`,
    `https://bypass.pm/api/v1/bypass?url=${encodeURIComponent(url)}`,
  ];

  for (const apiUrl of apis) {
    try {
      const response = await fetch(apiUrl, {
        headers: { 'User-Agent': 'Nexora-Bypass/1.0' },
        timeout: 10000, // 10 detik
      });

      if (!response.ok) continue;

      const data = await response.json();

      // Cek struktur response dari bypass.vip biasanya: { status: 'success', destination: '...' }
      // Bypass-api: { success: true, result: '...' }
      const destination = data.destination || data.result || data.url || data.bypassed || null;

      if (destination && destination !== url) {
        return res.status(200).json({
          status: 'success',
          destination: destination,
          source: apiUrl.split('?')[0],
        });
      }
    } catch (e) {
      // Coba API selanjutnya
      continue;
    }
  }

  // Kalo semua gagal
  return res.status(500).json({
    status: 'error',
    message: 'Semua endpoint bypass gagal. Coba lagi nanti.',
  });
}
