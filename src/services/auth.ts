import { clearAuthTokens, type AuthTokens, setAuthTokens } from "@/services/auth-storage";
import { http } from "@/services/http";

type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  accessToken?: string;
  refreshToken?: string;
};

function parseTokens(payload: AuthResponse): AuthTokens {
  const accessToken = payload.access_token ?? payload.accessToken;
  const refreshToken = payload.refresh_token ?? payload.refreshToken;

  if (!accessToken) {
    throw new Error("Authentication response did not include an access token");
  }

  return { accessToken, refreshToken };
}

export async function login(payload: AuthPayload) {
  const { data } = await http.post<AuthResponse>("/auth/login", payload);
  const tokens = parseTokens(data);

  setAuthTokens(tokens);
  return tokens;
}

export async function register(payload: AuthPayload) {
  const { data } = await http.post<AuthResponse>("/auth/register", payload);
  const tokens = parseTokens(data);

  setAuthTokens(tokens);
  return tokens;
}

export function logout() {
  clearAuthTokens();
}
