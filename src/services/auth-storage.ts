export const ACCESS_COOKIE_NAME = "opengym_access_token";

const ACCESS_TOKEN_KEY = "opengym.accessToken";
const REFRESH_TOKEN_KEY = "opengym.refreshToken";

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function setAuthCookie(accessToken: string) {
  if (!isBrowser()) {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ACCESS_COOKIE_NAME}=${encodeURIComponent(accessToken)}; Path=/; SameSite=Lax${secure}`;
}

function clearAuthCookie() {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${ACCESS_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export function getAccessToken() {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAuthTokens(tokens: AuthTokens) {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  setAuthCookie(tokens.accessToken);
}

export function clearAuthTokens() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  clearAuthCookie();
}
