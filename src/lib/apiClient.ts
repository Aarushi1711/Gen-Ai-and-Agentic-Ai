import { auth } from './firebase';

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch {
      // If we can't get a token, proceed without it
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
