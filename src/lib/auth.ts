const KEY = "medimind_auth_token";
const USER_KEY = "medimind_auth_user";

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(KEY));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function getUser(): { id: number; email: string; name: string } | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

export function setUserProfile(user: { id: number; email: string; name: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("auth-change"));
}

export function signIn(token: string, user?: { id: number; email: string; name: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, token);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new Event("auth-change"));
}

export function signOut() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("auth-change"));
}
