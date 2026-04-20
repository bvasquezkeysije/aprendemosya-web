export const AUTH_SESSION_KEY = "aprendemosya.authSession";
export const REMEMBERED_LOGIN_KEY = "aprendemosya.rememberedLogin";

export type AuthUserProfile = {
  userId: number;
  username: string;
  email: string;
  role: string;
  active: boolean;
  profileImageUrl: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
};

type StoredAuthSession = {
  userId: number;
};

export function resolveApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:8080";
  }

  const { hostname } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:8080";
  }

  return "https://api.aprendemosya.com";
}

export function readAuthSession(): StoredAuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession) as unknown;

    if (
      parsedSession &&
      typeof parsedSession === "object" &&
      typeof (parsedSession as StoredAuthSession).userId === "number"
    ) {
      return parsedSession as StoredAuthSession;
    }
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
  }

  return null;
}

export function writeAuthSession(user: Pick<AuthUserProfile, "userId">) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ userId: user.userId }));
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_KEY);
}

export function getDisplayName(user: AuthUserProfile) {
  return user.displayName?.trim() || user.username;
}

export function getUserInitials(user: AuthUserProfile) {
  const baseName = getDisplayName(user);
  const parts = baseName
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "AY";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
