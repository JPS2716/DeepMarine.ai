let cachedBase = import.meta.env.VITE_API_BASE || null;

async function tryFetch(url, options = {}, timeoutMs = 3000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(t);
    return res;
  } catch (e) {
    clearTimeout(t);
    throw e;
  }
}

async function discoverBase() {
  if (cachedBase) {
    // eslint-disable-next-line no-console
    console.log('Using cached API base:', cachedBase);
    return cachedBase;
  }
  
  const candidateFromEnv = import.meta.env.VITE_API_BASE;
  if (candidateFromEnv) {
    try {
      const ok = await tryFetch(`${candidateFromEnv}/health`).then(r => r.ok);
      if (ok) {
        cachedBase = candidateFromEnv;
        // eslint-disable-next-line no-console
        console.log('Found API base from env:', cachedBase);
        return cachedBase;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Env API base failed:', candidateFromEnv, e);
    }
  }

  // eslint-disable-next-line no-console
  console.log('Discovering backend port (5050-5060)...');
  const start = 5050;
  const end = 5060;
  for (let p = start; p <= end; p += 1) {
    const base = `http://localhost:${p}`;
    try {
      const ok = await tryFetch(`${base}/health`).then(r => r.ok);
      if (ok) {
        cachedBase = base;
        // eslint-disable-next-line no-console
        console.log('✅ Found backend on port', p, ':', cachedBase);
        return cachedBase;
      }
    } catch (e) {
      // Silently continue to next port
    }
  }
  
  // Fallback to default
  cachedBase = 'http://localhost:5050';
  // eslint-disable-next-line no-console
  console.warn('⚠️ Backend not found, using fallback:', cachedBase);
  return cachedBase;
}

export async function detectImageBlob(blob) {
  let base;
  try {
    base = await discoverBase();
    // eslint-disable-next-line no-console
    console.log('Sending detection request to:', `${base}/detect`);
    
    const form = new FormData();
    form.append('file', blob, 'frame.jpg');
    
    const res = await fetch(`${base}/detect`, {
      method: 'POST',
      body: form
    });
    
    if (!res.ok) {
      const text = await res.text();
      const errorMsg = `Detection failed: ${res.status} ${text}`;
      // eslint-disable-next-line no-console
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    const data = await res.json();
    // eslint-disable-next-line no-console
    console.log('Detection successful:', data);
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('API call error:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error(`Cannot reach backend server. Make sure it's running on ${base || 'http://localhost:5050-5060'}`);
    }
    throw error;
  }
}


