import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  View,
  useWindowDimensions,
} from 'react-native';

import { AppHeader } from '@/presentation/components/app-header';
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
  const drawerWidth = Math.max(width, 320);
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(!selectedFlight);
  const [isDrawerMounted, setIsDrawerMounted] = useState(!selectedFlight);
  const [refreshing, setRefreshing] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  useFlightRealtimeUpdates();

  useEffect(() => {
    if (!selectedFlight) {
      setIsDrawerOpen(true);
      return;
    }

    setIsDrawerOpen(false);
  }, [selectedFlight]);

  useEffect(() => {
    if (isDrawerOpen) {
      setIsDrawerMounted(true);
      translateX.setValue(-drawerWidth);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (!isDrawerMounted) {
      return;
    }

    Animated.timing(translateX, {
      toValue: -drawerWidth,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsDrawerMounted(false);
      }
    });
  }, [drawerWidth, isDrawerMounted, isDrawerOpen, translateX]);

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
          />
        </View>
      </View>

      {!isDrawerOpen ? (
        <View
          style={styles.edgeSwipeZone}
          pointerEvents="box-only"
          {...edgePanResponder.panHandlers}
        />
      ) : null}

      {isDrawerMounted ? (
        <View style={styles.drawerOverlay} pointerEvents="box-none">
          {selectedFlight ? (
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
      ) : null}
    </View>
  );
};
