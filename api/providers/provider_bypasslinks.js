export default async function bypass(url) {
  try {
    const response = await fetch(
      `https://bypass-links.com/api/bypass?url=${encodeURIComponent(url)}`,
      {
        headers: {
          'User-Agent': 'Nexora-Bypass/1.0',
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) return { success: false };

    const data = await response.json();
    
    if (data.success && data.destination) {
      return {
        success: true,
        destination: data.destination,
        source: 'BypassLinks (instant)'
      };
    }
    
    return { success: false };
  } catch (error) {
    return { success: false };
  }
}