/**
 * Security utilities for the application
 */

/**
 * Rate limiting check
 * In production, this should call the backend API to check rate limits
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  maxRequests: number = 60
): Promise<boolean> {
  // In development, always allow
  if (import.meta.env.DEV) {
    return true;
  }

  try {
    // TODO: Call backend API to check rate limit
    // For now, use simple client-side check (not secure, implement server-side)
    const key = `ratelimit_${identifier}_${endpoint}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      localStorage.setItem(key, JSON.stringify({
        count: 1,
        resetAt: Date.now() + 60000, // 1 minute
      }));
      return true;
    }

    const data = JSON.parse(stored);
    
    // Reset if time window has passed
    if (Date.now() > data.resetAt) {
      localStorage.setItem(key, JSON.stringify({
        count: 1,
        resetAt: Date.now() + 60000,
      }));
      return true;
    }

    // Check if under limit
    if (data.count < maxRequests) {
      data.count++;
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    }

    return false;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Fail open to not block legitimate users
  }
}

/**
 * Generate secure random token
 */
export function generateToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash sensitive data (for client-side only, use bcrypt on server)
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Secure session storage
 */
export const secureStorage = {
  set(key: string, value: any, expiresIn: number = 7 * 24 * 60 * 60 * 1000) {
    const item = {
      value,
      expiresAt: Date.now() + expiresIn,
    };
    try {
      sessionStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to set secure storage:', error);
    }
  },

  get(key: string): any | null {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      if (Date.now() > parsed.expiresAt) {
        sessionStorage.removeItem(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.error('Failed to get secure storage:', error);
      return null;
    }
  },

  remove(key: string) {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove secure storage:', error);
    }
  },

  clear() {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear secure storage:', error);
    }
  },
};

/**
 * CSRF token management
 */
export const csrf = {
  generate(): string {
    const token = generateToken();
    secureStorage.set('csrf_token', token, 24 * 60 * 60 * 1000); // 24 hours
    return token;
  },

  get(): string | null {
    return secureStorage.get('csrf_token');
  },

  verify(token: string): boolean {
    const storedToken = secureStorage.get('csrf_token');
    return storedToken === token;
  },
};
