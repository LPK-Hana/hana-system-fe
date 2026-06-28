export const AUTH_COOKIE = 'hana_auth';

export function setAuthCookie() {
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearAuthCookie() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export async function login(username: string, password: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return username.trim() === 'admin' && password === 'admin';
}
