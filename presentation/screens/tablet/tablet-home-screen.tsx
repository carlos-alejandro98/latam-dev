import { useEffect, useRef } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';

import { AppHeader } from '@/presentation/components/app-header';
import { TabletFlightDetail } from '@/presentation/components/tablet-flight-detail';
import { getResolvedFlightListPanelWidth } from '@/presentation/components/flight-list';
import { TabletFlightList } from '@/presentation/components/tablet-flight-list';
import { useTabletFlightDetailController } from '@/presentation/controllers/use-tablet-flight-detail-controller';
import { useFlightListController } from '@/presentation/controllers/use-flight-list-controller';
import { useHomeController } from '@/presentation/controllers/use-home-controller';
import { useFlightRealtimeUpdates } from '@/presentation/hooks/use-flight-realtime-updates';

import { styles } from './tablet-home-screen.styles';

export const TabletHomeScreen = () => {
  const { width } = useWindowDimensions();
  const panelWidth = getResolvedFlightListPanelWidth(width);
  const {
    flights,
    loading,
    initialLoading,
    selectedFlight,
    selectedFlightId,
    selectedFlightIds,
    openFlightSingle,
  } = useHomeController();
  const flightListController = useFlightListController({ flights });
  const tabletFlightDetail = useTabletFlightDetailController(selectedFlight);
  const initializedRef = useRef(false);
  const isFlightsLoading = loading || initialLoading;
  const isBootstrappingSelection =
    !initializedRef.current &&
    !selectedFlight &&
    flightListController.flights.length > 0;
  useFlightRealtimeUpdates();

  useEffect(() => {
    if (initializedRef.current || isFlightsLoading || !flightListController.flights.length) {
      return;
    }

    if (!selectedFlight) {
      openFlightSingle(flightListController.flights[0].flightId);
    }

    flightListController.collapse();
    initializedRef.current = true;
  }, [
    flightListController,
    flightListController.flights,
    isFlightsLoading,
    openFlightSingle,
    selectedFlight,
  ]);

  const handleOpenFlightList = () => {
    flightListController.expand();
  };

  const handleSelectFlight = (flightId: string) => {
    openFlightSingle(flightId);
    flightListController.collapse();
  };

  const handleCollapseFlightList = () => {
    if (!selectedFlight) {
      return;
    }

    flightListController.collapse();
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="HUB CONTROL CENTER"
        subtitle="COMPASS"
        layoutVariant="tablet"
        showMenuButton
        onMenuPress={handleOpenFlightList}
        onHelpPress={() => {}}
        onNotificationPress={() => {}}
        onAvatarPress={() => {}}
        showNotification={false}
      />
      <View style={styles.content}>
        <TabletFlightDetail
          viewModel={tabletFlightDetail.viewModel}
          filteredTasks={tabletFlightDetail.filteredTasks}
          filterOptions={tabletFlightDetail.filterOptions}
          searchDraft={tabletFlightDetail.searchDraft}
          activeCategory={tabletFlightDetail.activeCategory}
          loading={
            tabletFlightDetail.loading || isFlightsLoading || isBootstrappingSelection
          }
          refreshing={tabletFlightDetail.reloading}
          error={tabletFlightDetail.error}
          onBack={handleOpenFlightList}
          onSearchDraftChange={tabletFlightDetail.setSearchDraft}
          onApplySearch={tabletFlightDetail.applySearch}
          onCategoryChange={tabletFlightDetail.setActiveCategory}
          onReload={tabletFlightDetail.reload}
          taskEditModal={tabletFlightDetail.taskEditModal}
          onStartTask={tabletFlightDetail.taskActions.startTask}
          onFinishTask={tabletFlightDetail.taskActions.finishTask}
        />
      </View>

      {!flightListController.collapsed ? (
        <View style={styles.listOverlay} pointerEvents="box-none">
          {selectedFlight ? (
            <Pressable
              style={styles.listBackdrop}
              onPress={handleCollapseFlightList}
            />
          ) : null}
          <View style={[styles.listPanel, { width: panelWidth }]}>
            <TabletFlightList
              flights={flightListController.flights}
              loading={isFlightsLoading}
              searchQuery={flightListController.searchQuery}
              orderBy={flightListController.orderBy}
              selectedDateKey={flightListController.selectedDateKey}
              availableDateKeys={flightListController.availableDateKeys}
              selectedFlightId={selectedFlightId}
              selectedFlightIds={selectedFlightIds}
              onClose={handleCollapseFlightList}
              canClose={Boolean(selectedFlight)}
              onSearchChange={flightListController.setSearchQuery}
              onOrderChange={flightListController.setOrderBy}
              onDateChange={flightListController.setSelectedDateKey}
              onPreviousDate={flightListController.goToPreviousDate}
              onNextDate={flightListController.goToNextDate}
              onSelectFlight={handleSelectFlight}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
};
