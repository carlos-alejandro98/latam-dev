export type FlightCommentSurface = 'web' | 'mobile' | 'tablet';

const AUTHOR_CODE_FALLBACK = 'OPS';

const COMMENT_AUTHOR_ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  viewer: 'Viewer',
  controller: 'Controller',
  above_the_wing: 'Embarque',
  below_the_wing: 'DOT',
};

const COMMENT_AUTHOR_FALLBACK_LABELS: Record<FlightCommentSurface, string> = {
  web: 'Controller',
  mobile: 'Embarque',
  tablet: 'OPE',
};

const COMMENT_AUTHOR_LABEL_ALIASES: Record<string, string> = {
  admin: 'Admin',
  viewer: 'Viewer',
  controller: 'Controller',
  embarque: 'Embarque',
  above_the_wing: 'Embarque',
  'above the wing': 'Embarque',
  dot: 'DOT',
  below_the_wing: 'DOT',
  'below the wing': 'DOT',
  ope: 'OPE',
};

const normalizeAliasKey = (value: string): string => {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
};

export const normalizeFlightCommentAuthorLabel = (
  value?: string | null,
): string | undefined => {
  if (!value) {
    return undefined;
  }

  return COMMENT_AUTHOR_LABEL_ALIASES[normalizeAliasKey(value)];
};

export const resolveFlightCommentAuthorLabel = ({
  role,
  surface,
}: {
  role?: string | null;
  surface: FlightCommentSurface;
}): string => {
  if (role) {
    return COMMENT_AUTHOR_ROLE_LABELS[role] ?? role;
  }

  return COMMENT_AUTHOR_FALLBACK_LABELS[surface];
};

export const toFlightCommentAuthorCode = (value?: string | null): string => {
  const normalizedLabel = normalizeFlightCommentAuthorLabel(value);

  if (normalizedLabel) {
    return normalizedLabel;
  }

  const normalizedValue = value?.trim() ?? '';

  if (!normalizedValue) {
    return AUTHOR_CODE_FALLBACK;
  }

  const parts = normalizedValue
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z0-9]/g, ''))
    .filter(Boolean);

  if (parts.length === 0) {
    return AUTHOR_CODE_FALLBACK;
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 3).toUpperCase();
  }

  return parts
    .slice(0, 3)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
};
