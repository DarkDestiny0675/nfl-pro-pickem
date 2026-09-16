const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

/*const API_BASE_URLS = [
  configuredBaseUrl,
  "https://localhost:7021/api",
  "http://localhost:5020/api",
].filter(Boolean);*/

const API_BASE_URLS = [
  configuredBaseUrl,
  "https://nfl.pickem.api.elahforgestudios.com/api",
].filter(Boolean);

async function readError(response) {
  try {
    const error = await response.json();
    return error.message || "API request failed.";
  } catch {
    return `API request failed with status ${response.status}.`;
  }
}

export async function apiFetch(endpoint, options = {}) {
  let networkError;

  for (const baseUrl of API_BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        networkError = error;
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    "The NFL Pro Pick 'Em API is unavailable. Start NFLProPickEm.API and verify it is listening on HTTPS 7021 or HTTP 5020.",
    { cause: networkError },
  );
}
