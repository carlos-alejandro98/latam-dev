interface JwtPayload {
  exp?: number;
  email?: string;
  name?: string;
  /** Azure AD: first name */
  given_name?: string;
  /** Azure AD: last name */
  family_name?: string;
  oid?: string;
  preferred_username?: string;
  roles?: string[];
  sub?: string;
  upn?: string;
  [key: string]: unknown;
}

const decodeBase64Url = (value: string): string => {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalizedValue.length % 4;
  const paddedValue =
    padding === 0 ? normalizedValue : `${normalizedValue}${'='.repeat(4 - padding)}`;

  if (typeof globalThis.atob !== 'function') {
    throw new Error('Base64 decoder is not available in the current runtime');
  }

  return globalThis.atob(paddedValue);
};

export const decodeJwtPayload = (token: string): JwtPayload => {
  const [, payload] = token.split('.');

  if (!payload) {
    throw new Error('JWT payload is missing');
  }

  return JSON.parse(decodeBase64Url(payload)) as JwtPayload;
};

export const validateJwtExpiration = (token: string): boolean => {
  try {
    const payload = decodeJwtPayload(token);

    if (typeof payload.exp !== 'number') {
      return false;
    }

    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

/**
 * Extracts the display name from an Azure AD id_token.
 * Priority: given_name + family_name → name → preferred_username → empty string.
 */
/**
 * Stable subject for per-user storage keys (e.g. flight selection in localStorage).
 * Prefer `sub`, then Azure `oid`.
 */
export const extractAuthSubjectForStorageKey = (
  idToken: string | undefined,
): string | null => {
  if (!idToken) {
    return null;
  }

  try {
    const payload = decodeJwtPayload(idToken);

    if (typeof payload.sub === 'string' && payload.sub.length > 0) {
      return payload.sub;
    }

    if (typeof payload.oid === 'string' && payload.oid.length > 0) {
      return payload.oid;
    }

    return null;
  } catch {
    return null;
  }
};

export const extractUserNameFromToken = (token: string): string => {
  if (!token) return '';
  try {
    const payload = decodeJwtPayload(token);

    if (payload.given_name || payload.family_name) {
      return `${payload.given_name ?? ''} ${payload.family_name ?? ''}`.trim();
    }

    if (payload.name) return payload.name;
    if (payload.preferred_username) return payload.preferred_username;

    return '';
  } catch {
    return '';
  }
};
