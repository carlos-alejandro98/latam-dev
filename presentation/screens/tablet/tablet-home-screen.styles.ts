export const styles = {
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f2f2f2',
    flexDirection: 'column' as const,
  },
  content: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#f2f2f2',
  },
  listOverlay: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row' as const,
  },
  listBackdrop: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  listPanel: {
    height: '100%',
    backgroundColor: '#ffffff',
  },
} as const;
