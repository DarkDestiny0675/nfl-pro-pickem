const REMEMBERED_USER_KEY = "proPickEm.rememberedUser";
const SESSION_USER_KEY = "proPickEm.sessionUser";

export function saveUserSession(user, rememberMe) {
  clearUserSession();
  const storage = rememberMe ? localStorage : sessionStorage;
  const key = rememberMe ? REMEMBERED_USER_KEY : SESSION_USER_KEY;
  storage.setItem(key, JSON.stringify(user));
}

export function loadUserSession() {
  const saved =
    localStorage.getItem(REMEMBERED_USER_KEY) ||
    sessionStorage.getItem(SESSION_USER_KEY);

  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    clearUserSession();
    return null;
  }
}

export function clearUserSession() {
  localStorage.removeItem(REMEMBERED_USER_KEY);
  sessionStorage.removeItem(SESSION_USER_KEY);
}
