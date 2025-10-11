import type { QueryFunction } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Check if response is HTML (login page) instead of JSON error
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      if (res.status === 401) {
        throw new Error(
          '401: Oturum süresi dolmuş. Lütfen tekrar giriş yapın.'
        );
      }
      throw new Error(
        `${res.status}: Sunucu HTML sayfası döndürdü (JSON bekleniyor)`
      );
    }

    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  headers?: Record<string, string>
): Promise<Response>;
export async function apiRequest(url: string): Promise<Response>;
export async function apiRequest(
  methodOrUrl: string,
  urlOrData?: string | unknown,
  data?: unknown | undefined,
  headers?: Record<string, string>
): Promise<Response> {
  // Determine signature without using `arguments`
  const isGetSignature = typeof urlOrData === 'undefined';
  const method = isGetSignature ? 'GET' : methodOrUrl;
  const url = isGetSignature ? methodOrUrl : (urlOrData as string);
  const requestData = isGetSignature ? undefined : data;
  const requestHeaders = isGetSignature ? undefined : headers;

  // Get token from localStorage
  const token = localStorage.getItem('token');

  const res = await fetch(url, {
    method,
    headers: {
      ...(requestData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...requestHeaders,
    },
    body: requestData ? JSON.stringify(requestData) : undefined,
    credentials: 'include',
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = 'returnNull' | 'throw';
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    const res = await fetch(queryKey.join('/') as string, {
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (unauthorizedBehavior === 'returnNull' && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);

    // Check content-type before parsing JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error(
        `API yanıtı JSON değil. Content-Type: ${contentType || 'yok'}. İçerik: ${text.substring(0, 100)}...`
      );
    }

    return res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: 'throw' }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
