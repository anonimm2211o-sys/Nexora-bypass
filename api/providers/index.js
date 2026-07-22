import providerBypassLinks from './provider_bypasslinks.js';
import provider1 from './provider1.js';
import provider2 from './provider2.js';
import { withTimeout } from '../utils/timeout.js';

const PROVIDERS = [
  { name: 'BypassLinks (Instant)', fn: providerBypassLinks },
  { name: 'izen.lol', fn: provider1 },
  { name: 'rtaoexe.xyz', fn: provider2 },
];

export async function runProviders(url) {
  for (const prov of PROVIDERS) {
    try {
      console.log(`[${prov.name}] Trying...`);
      const result = await withTimeout(prov.fn(url), 10000);
      if (result && result.success) {
        console.log(`[${prov.name}] ✅ Success — ${result.destination}`);
        return result;
      } else {
        console.log(`[${prov.name}] ❌ Failed`);
      }
    } catch (err) {
      console.log(`[${prov.name}] ❌ Failed: ${err.message}`);
    }
  }
  return { success: false };
}
