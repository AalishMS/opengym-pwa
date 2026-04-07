export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
};

export function requireApiUrl() {
  if (!env.apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  return env.apiUrl;
}
