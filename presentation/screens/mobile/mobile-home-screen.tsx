import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppHeader,
  HEADER_HEIGHT_MOBILE,
} from '@/presentation/components/app-header';
import { MobileFlightDetail } from '@/presentation/components/mobile-flight-detail';
import { MobileFlightList } from '@/presentation/components/mobile-flight-list';
import { useFlightListController } from '@/presentation/controllers/use-flight-list-controller';
import { useHomeController } from '@/presentation/controllers/use-home-controller';
import { useMobileFlightDetailController } from '@/presentation/controllers/use-mobile-flight-detail-controller';
import { useFlightRealtimeUpdates } from '@/presentation/hooks/use-flight-realtime-updates';

import { styles } from './mobile-home-screen.styles';

const EDGE_SWIPE_WIDTH = 40;
const OPEN_DRAWER_DISTANCE = 32;
const CLOSE_DRAWER_DISTANCE = 54;

export const MobileHomeScreen = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const drawerWidth = Math.max(width, 320);
  /** Debe quedar por debajo del header; si no, el borde izq. (40px, zIndex 10) roba toques del menú. */
  const edgeSwipeZoneTop = HEADER_HEIGHT_MOBILE + insets.top;
  const {
    flights,
    loading,
    selectedFlight,
    selectedFlightId,
    selectedFlightIds,
    openFlightSingle,
    reloadFlights,
  } = useHomeController();
  const flightListController = useFlightListController({ flights });
  const mobileFlightDetail = useMobileFlightDetailController(selectedFlight);
  const [isDrawerOpen, setIsDrawerOpen] = useState(!selectedFlightId);
  const [refreshing, setRefreshing] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  /** First frame: snap position only; keep drawer mounted so the flight list is not remounted. */
  const drawerPositionInitialized = useRef(false);

  useFlightRealtimeUpdates();

  // Solo reaccionar a cambios de `selectedFlightId`; el objeto vuelo cambia de referencia con parches Redux.
  useEffect(() => {
    if (!selectedFlightId) {
      setIsDrawerOpen(true);
      return;
    }

    setIsDrawerOpen(false);
  }, [selectedFlightId]);

  useEffect(() => {
    const closedX = -drawerWidth;

    if (!drawerPositionInitialized.current) {
      drawerPositionInitialized.current = true;
      translateX.setValue(isDrawerOpen ? 0 : closedX);
      return;
    }

    if (isDrawerOpen) {
      translateX.setValue(closedX);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(translateX, {
      toValue: closedX,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [drawerWidth, isDrawerOpen, translateX]);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    if (!selectedFlight) {
      return;
    }

    setIsDrawerOpen(false);
  };

  const handleSelectFlight = (flightId: string) => {
    openFlightSingle(flightId);
    setIsDrawerOpen(false);
  };

  const handleRefresh = useCallback(async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      await Promise.allSettled([reloadFlights(), mobileFlightDetail.reload()]);
    } finally {
      setRefreshing(false);
    }
  }, [mobileFlightDetail, refreshing, reloadFlights]);

  const edgePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (_, gestureState) => {
          return !isDrawerOpen && gestureState.x0 <= EDGE_SWIPE_WIDTH;
        },
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (isDrawerOpen) {
            return false;
          }

          return (
            gestureState.x0 <= EDGE_SWIPE_WIDTH &&
            gestureState.dx > 12 &&
            Math.abs(gestureState.dy) < 24
          );
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > OPEN_DRAWER_DISTANCE) {
            handleOpenDrawer();
          }
        },
      }),
    [isDrawerOpen],
  );

  const drawerPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (!isDrawerOpen || !selectedFlight) {
            return false;
          }

          return gestureState.dx < -12 && Math.abs(gestureState.dy) < 24;
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -CLOSE_DRAWER_DISTANCE) {
            handleCloseDrawer();
          }
        },
      }),
    [isDrawerOpen, selectedFlight],
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="HUB CONTROL CENTER"
        subtitle="COMPASS"
        layoutVariant="mobile"
        showMenuButton
        onMenuPress={handleOpenDrawer}
        onHelpPress={() => {}}
        onNotificationPress={() => {}}
        onAvatarPress={() => {}}
        showNotification
      />
      <View style={styles.content}>
        <View style={styles.detailColumn}>
          <MobileFlightDetail
            viewModel={mobileFlightDetail.viewModel}
            taskEditModal={mobileFlightDetail.taskEditModal}
            loading={mobileFlightDetail.loading}
            error={mobileFlightDetail.error}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onStartTask={mobileFlightDetail.taskActions.startTask}
            onFinishTask={mobileFlightDetail.taskActions.finishTask}
            onCompleteHito={mobileFlightDetail.taskActions.completeHitoTask}
          />
        </View>
      </View>

      {!isDrawerOpen ? (
        <View
          style={[styles.edgeSwipeZone, { top: edgeSwipeZoneTop }]}
          pointerEvents="box-only"
          {...edgePanResponder.panHandlers}
        />
      ) : null}

      <View
        style={styles.drawerOverlay}
        pointerEvents={isDrawerOpen ? 'box-none' : 'none'}
      >
        {selectedFlight && isDrawerOpen ? (
          <Pressable
            style={styles.drawerBackdrop}
            onPress={handleCloseDrawer}
          />
        ) : null}
        <Animated.View
          style={[
            styles.drawerPanel,
            {
              width: drawerWidth,
              transform: [{ translateX }],
            },
          ]}
          {...drawerPanResponder.panHandlers}
        >
          <MobileFlightList
            flights={flightListController.flights}
            loading={loading}
            searchQuery={flightListController.searchQuery}
            orderBy={flightListController.orderBy}
            selectedDateKey={flightListController.selectedDateKey}
            availableDateKeys={flightListController.availableDateKeys}
            selectedFlightId={selectedFlightId}
            selectedFlightIds={selectedFlightIds}
            onClose={handleCloseDrawer}
            canClose={Boolean(selectedFlight)}
            onSearchChange={flightListController.setSearchQuery}
            onOrderChange={flightListController.setOrderBy}
            onDateChange={flightListController.setSelectedDateKey}
            onPreviousDate={flightListController.goToPreviousDate}
            onNextDate={flightListController.goToNextDate}
            onSelectFlight={handleSelectFlight}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </Animated.View>
      </View>
    </View>
  );
};
