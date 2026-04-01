import { Platform } from 'react-native';

const webScrollHide =
  Platform.OS === 'web'
    ? {
      scrollbarWidth: 'none' as const,
      msOverflowStyle: 'none' as const,
    }
    : {};

export const styles = {
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
  },
  mainWrapper: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#f2f2f2',
    flexDirection: 'column',
  },
  tabsWrapper: {
    paddingTop: 28,
    overflow: 'hidden' as const,
  },
  tabsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabsScroll: {
    flexGrow: 0,
    ...webScrollHide,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0d12ab',
  },
  tabHover: {
    backgroundColor: '#f0f0f0',
  },
  tabLabel: {
    color: '#3a3a3a',
  },
  tabClose: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  tabCloseHidden: {
    opacity: 0,
  },
  tabCloseVisible: {
    opacity: 1,
  },
  placeholder: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    overflow: 'hidden' as const,
  },
  emptyStateCard: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    overflow: 'hidden' as const,
  },
  infoPanelCard: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 0,
    borderColor: 'transparent',
    overflow: 'hidden' as const,
  },
  commentsDrawerButtonWrapper: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 30,
    flexDirection: 'row',
    gap: 8,
  },
} as const;
