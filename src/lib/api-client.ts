const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  // Add Auth Token if available (Client-side)
  if (typeof window !== "undefined") {
      const storage = localStorage.getItem("admin-auth-storage");
      if (storage) {
          try {
              const parsed = JSON.parse(storage);
              const token = parsed.state?.accessToken;
              if (token) {
                  headers["Authorization"] = `Bearer ${token}`;
              }
          } catch (e) {
              // Ignore invalid storage
          }
      }
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
        window.location.href = '/admin/login';
    }
    const errorBody = await res.text();
    console.error(`API Error: ${res.status} ${res.statusText} - ${errorBody}`);
    throw new Error(`Failed to fetch API: ${endpoint}`);
  }

  // Handle empty response for 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  try {
    return await res.json();
  } catch (err) {
    console.error(`JSON Parse Error for ${API_URL}${endpoint}`);
    // Clone response to read text since body might be used? No, json() consumes it.
    // But we failed to parse json, so body is consumed? 
    // Actually if json() fails, we can't read body again easily unless we cloned.
    // Let's modify approach: read text first? No, perf.
    // Let's just log that it failed.
    throw new Error(`Invalid JSON response from ${API_URL}${endpoint}`);
  }
}
