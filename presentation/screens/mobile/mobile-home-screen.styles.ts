export const styles = {
  container: {
    flex: 1,
    backgroundColor: '#efeff4',
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center' as const,
  },
  detailColumn: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center' as const,
  },
  drawerOverlay: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row' as const,
    zIndex: 20,
  },
  drawerBackdrop: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.34)',
  },
  drawerPanel: {
    height: '100%',
    width: '100%',
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 6, height: 0 },
    elevation: 10,
  },
  /** top se define en pantalla (debajo del header) para no tapar el botón menú. */
  edgeSwipeZone: {
    position: 'absolute' as const,
    left: 0,
    bottom: 0,
    width: 40,
    zIndex: 10,
  },
} as const;
