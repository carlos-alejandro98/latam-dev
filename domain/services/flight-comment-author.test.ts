import { describe, expect, it } from '@jest/globals';

import {
  normalizeFlightCommentAuthorLabel,
  resolveFlightCommentAuthorLabel,
  toFlightCommentAuthorCode,
} from './flight-comment-author';

describe('flight-comment-author', () => {
  it('maps authenticated roles to their comment labels', () => {
    expect(resolveFlightCommentAuthorLabel({
      role: 'controller',
      surface: 'web',
    })).toBe('Controller');

    expect(resolveFlightCommentAuthorLabel({
      role: 'above_the_wing',
      surface: 'tablet',
    })).toBe('Embarque');

    expect(resolveFlightCommentAuthorLabel({
      role: 'below_the_wing',
      surface: 'mobile',
    })).toBe('DOT');
  });

  it('falls back by device when the user has no role', () => {
    expect(resolveFlightCommentAuthorLabel({
      role: null,
      surface: 'web',
    })).toBe('Controller');

    expect(resolveFlightCommentAuthorLabel({
      role: null,
      surface: 'mobile',
    })).toBe('Embarque');

    expect(resolveFlightCommentAuthorLabel({
      role: null,
      surface: 'tablet',
    })).toBe('OPE');
  });

  it('preserves known labels and keeps initials for free-text names', () => {
    expect(normalizeFlightCommentAuthorLabel('controller')).toBe('Controller');
    expect(normalizeFlightCommentAuthorLabel('Embarque')).toBe('Embarque');
    expect(normalizeFlightCommentAuthorLabel('ope')).toBe('OPE');

    expect(toFlightCommentAuthorCode('Controller')).toBe('Controller');
    expect(toFlightCommentAuthorCode('Juan Perez')).toBe('JP');
  });
});
