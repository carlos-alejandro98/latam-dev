import { describe, expect, it } from '@jest/globals';

import { resolveResponsiveState } from './use-responsive';

describe('resolveResponsiveState', () => {
  it('forces the controller web experience for web regardless of viewport size', () => {
    const state = resolveResponsiveState({
      width: 390,
      height: 844,
      isWeb: true,
      platformOS: 'web',
    });

    expect(state.isDesktop).toBe(true);
    expect(state.isTablet).toBe(false);
    expect(state.isMobile).toBe(false);
  });

  it('treats native iPad devices as tablet even if the viewport is narrow', () => {
    const state = resolveResponsiveState({
      width: 744,
      height: 1133,
      isWeb: false,
      platformOS: 'ios',
      isPad: true,
    });

    expect(state.isTablet).toBe(true);
    expect(state.isMobile).toBe(false);
    expect(state.isDesktop).toBe(false);
  });

  it('keeps native iPhone devices on the mobile experience regardless of landscape width', () => {
    const state = resolveResponsiveState({
      width: 844,
      height: 390,
      isWeb: false,
      platformOS: 'ios',
      isPad: false,
    });

    expect(state.isMobile).toBe(true);
    expect(state.isTablet).toBe(false);
    expect(state.isDesktop).toBe(false);
  });

  it('uses smallest-width heuristic for native Android tablets', () => {
    const state = resolveResponsiveState({
      width: 1280,
      height: 800,
      isWeb: false,
      platformOS: 'android',
    });

    expect(state.isTablet).toBe(true);
    expect(state.isMobile).toBe(false);
    expect(state.isDesktop).toBe(false);
  });

  it('keeps native Android phones on the mobile experience', () => {
    const state = resolveResponsiveState({
      width: 915,
      height: 412,
      isWeb: false,
      platformOS: 'android',
    });

    expect(state.isMobile).toBe(true);
    expect(state.isTablet).toBe(false);
    expect(state.isDesktop).toBe(false);
  });
});
