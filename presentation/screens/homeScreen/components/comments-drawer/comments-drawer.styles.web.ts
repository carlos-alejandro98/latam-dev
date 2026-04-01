import type { CSSProperties } from 'react';

const sharedStyles = {
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'row',
    zIndex: 40,
  } satisfies CSSProperties,
  drawer: {
    backgroundColor: '#ffffff',
    borderRight: '1px solid #d9d9d9',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    boxSizing: 'border-box',
    overflow: 'hidden',
  } satisfies CSSProperties,
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(21, 29, 47, 0.24)',
  } satisfies CSSProperties,
  backdropPressable: {
    width: '100%',
    height: '100%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  } satisfies CSSProperties,
  header: {
    padding: '16px 16px 0px 16px',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
  } satisfies CSSProperties,
  closeButton: {
    marginRight: 6,
    width: 32,
    height: 32,
    border: 'none',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  } satisfies CSSProperties,
  processSection: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  } satisfies CSSProperties,
  timeButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 4,
  } satisfies CSSProperties,
  timeFields: {
    display: 'flex',
    flexDirection: 'row',
    gap: 14,
    paddingTop: 6,
  } satisfies CSSProperties,
  commentsSection: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  } satisfies CSSProperties,
  commentsList: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: "12px 24px",
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  } satisfies CSSProperties,
  title: {
    fontSize: 32,
  },
  commentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexDirection: 'row',
    minHeight: 32,
  } satisfies CSSProperties,
  authorBadge: {
    minWidth: 36,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#ebeefe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 6px',
    flexShrink: 0,
  } satisfies CSSProperties,
  commentTime: {
    flexShrink: 0,
    color: '#9E9E9E',
  } satisfies CSSProperties,
  commentBubble: {
    flex: 1,
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 0,
  } satisfies CSSProperties,
  composer: {
    padding: '8px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexDirection: 'row',
  } satisfies CSSProperties,
  composerInputWrapper: {
    flex: 1,
  } satisfies CSSProperties,
} as const;

export const styles = sharedStyles;

export const getDrawerStyle = (
  drawerWidth: number,
  isDrawerVisible: boolean,
  animationDurationMs: number,
): CSSProperties => {
  return {
    ...styles.drawer,
    width: 'max-content',
    minWidth: '338px',
    maxWidth: '338px',
    transform: `translateX(${isDrawerVisible ? '0%' : '-100%'})`,
    transition: `transform ${animationDurationMs}ms ease`,
  };
};

export const getBackdropStyle = (
  isDrawerVisible: boolean,
  animationDurationMs: number,
): CSSProperties => {
  return {
    ...styles.backdrop,
    opacity: isDrawerVisible ? 1 : 0,
    transition: `opacity ${animationDurationMs}ms ease`,
  };
};
