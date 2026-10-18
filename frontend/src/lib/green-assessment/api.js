const API_ROOT = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export const API_BASE_URL = `${API_ROOT}/api/green-assessment`;

export async function fetchFromApi(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data?.detail || data?.message || message;
    } catch (_) {
      // Keep the status-based fallback for non-JSON responses.
    }
    throw new Error(message);
  }

  return response.json();
}
