import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  ArrowBackOutlined,
  SearchOutlined,
  SyncOutlined,
} from '@hangar/react-native-icons/core/interaction';

import { EditSquareOutlined } from '@/presentation/components/flight-list/icons';
import { Spinner, Text } from '@/presentation/components/design-system';
import { TaskEditModal } from '@/presentation/components/task-edit-modal/task-edit-modal';
import type { TaskEditModalController } from '@/presentation/controllers/use-task-edit-modal-controller';
import type { FlightTaskActionTarget } from '@/presentation/controllers/use-flight-task-actions';
import type {
  TabletFlightDetailViewModel,
  TabletFlightLegViewModel,
  TabletFlightTaskViewModel,
  TabletTaskCategory,
} from '@/presentation/view-models/tablet-flight-detail-view-model';

import { styles } from './tablet-flight-detail.styles';

interface TabletFlightDetailProps {
  viewModel: TabletFlightDetailViewModel | null;
  filteredTasks: TabletFlightTaskViewModel[];
  filterOptions: Array<{ id: TabletTaskCategory; label: string }>;
  searchDraft: string;
  activeCategory: TabletTaskCategory;
  loading?: boolean;
  refreshing?: boolean;
  error?: string;
  onBack: () => void;
  onSearchDraftChange: (value: string) => void;
  onApplySearch: () => void;
  onCategoryChange: (value: TabletTaskCategory) => void;
  onReload: () => void | Promise<void>;
  taskEditModal: TaskEditModalController<TabletFlightTaskViewModel>;
  onStartTask: (
    task: TabletFlightTaskViewModel & FlightTaskActionTarget,
    time: string,
  ) => Promise<unknown>;
  onFinishTask: (
    task: TabletFlightTaskViewModel & FlightTaskActionTarget,
    time: string,
  ) => Promise<unknown>;
}

const nowHHmm = (): string => {
  const currentDate = new Date();
  return `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
};

const renderFlightLeg = (leg: TabletFlightLegViewModel) => (
  <View style={styles.flightBlock}>
    <View style={styles.flightCardHeader}>
      <View style={styles.flightHeaderTitleRow}>
        <Text variant="heading-md" style={styles.sectionTitle}>
          {leg.title}
        </Text>
        <Text variant="heading-sm" style={styles.stationTitle} italic>
          {leg.stationLabel}
        </Text>
      </View>
      <View style={styles.gateLabelBlock}>
        <Text variant="label-md" style={styles.gateLabel}>
          BOX
        </Text>
      </View>
    </View>
    <View style={styles.flightSummaryRow}>
      <View style={styles.flightNumberRow}>
        <Text variant="display-md" style={styles.flightNumber}>
          {leg.flightNumber}
        </Text>
        <View style={styles.dateBadge}>
          <Text variant="heading-xs" style={styles.dateBadgeText}>
            {leg.dateLabel}
          </Text>
        </View>
      </View>

      <View style={styles.flightSummaryRight}>
        {leg.badges.length ? (
          <View style={styles.badgeRow}>
            {leg.badges.map((badge) => (
              <View
                key={`${leg.title}-${badge.label}`}
                style={
                  badge.tone === 'soft' ? styles.softBadge : styles.neutralBadge
                }
              >
                <Text variant="heading-xs" style={styles.badgeText}>
                  {badge.label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        <Text variant="display-md" style={styles.boxValue}>
          {leg.boxValue}
        </Text>
      </View>
    </View>

    <View style={styles.statsRow}>
      <View style={styles.statsLeft}>
        {leg.primaryStats.map((stat) => (
          <View key={`${leg.title}-${stat.label}`} style={styles.statColumn}>
            <Text variant="label-sm" style={styles.statLabel}>
              {stat.label}
            </Text>
            <Text variant="display-md" style={styles.statValue}>
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.statsRight}>
        <View style={styles.statDivider} />
        <View style={styles.actionColumn}>
          <Text
            variant="label-sm"
            style={{ ...styles.statLabel, ...styles.statLabelRight }}
          >
            {leg.actionTimeLabel}
          </Text>
          <Text
            variant="display-md"
            style={{ ...styles.statValue, ...styles.statValueRight }}
          >
            {leg.actionTimeValue}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const renderContentState = (message: string) => (
  <View style={styles.detailMessage}>
    <View style={styles.detailMessageCard}>
      <Text variant="label-lg">{message}</Text>
    </View>
  </View>
);

const renderStatusBadge = (task: TabletFlightTaskViewModel) => {
  if (task.statusTone === 'completed') {
    return (
      <View style={styles.statusBadgeCompleted}>
        <Text variant="label-sm" style={styles.statusBadgeCompletedText}>
          {task.statusLabel}
        </Text>
      </View>
    );
  }

  if (task.statusTone === 'in_progress') {
    return (
      <View style={styles.statusBadgeInProgress}>
        <View style={styles.inProgressDot} />
        <Text variant="label-sm" style={styles.statusBadgeInProgressText}>
          {task.statusLabel}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.statusBadge}>
      <Text variant="label-sm" style={styles.statusBadgeText}>
        {task.statusLabel}
      </Text>
    </View>
  );
};

export const TabletFlightDetail = ({
  viewModel,
  filteredTasks,
  filterOptions,
  searchDraft,
  activeCategory,
  loading,
  refreshing = false,
  error,
  onBack,
  onSearchDraftChange,
  onApplySearch,
  onCategoryChange,
  onReload,
  taskEditModal,
  onStartTask,
  onFinishTask,
}: TabletFlightDetailProps) => {
  const { width } = useWindowDimensions();
  const isMobile = Platform.OS !== 'web' && width < 768;
  const sidebarWidth = Math.max(360, Math.min(430, width * 0.33));
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const refreshSpinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!refreshing) {
      refreshSpinValue.stopAnimation();
      refreshSpinValue.setValue(0);
      return;
    }

    refreshSpinValue.setValue(0);
    const animation = Animated.loop(
      Animated.timing(refreshSpinValue, {
        toValue: 1,
        duration: 850,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
        isInteraction: false,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
      refreshSpinValue.stopAnimation();
      refreshSpinValue.setValue(0);
    };
  }, [refreshSpinValue, refreshing]);

  const refreshIconStyle = {
    transform: [
      {
        rotate: refreshSpinValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  const handleReload = useCallback(() => {
    void onReload();
  }, [onReload]);

  const handleStart = useCallback(
    async (task: TabletFlightTaskViewModel) => {
      if (taskEditModal.isReadOnly || actionLoading) {
        return;
      }

      setActionLoading(task.instanceId);
      try {
        await onStartTask(task, nowHHmm());
      } finally {
        setActionLoading(null);
      }
    },
    [actionLoading, onStartTask, taskEditModal.isReadOnly],
  );

  const handleFinish = useCallback(
    async (task: TabletFlightTaskViewModel) => {
      if (taskEditModal.isReadOnly || actionLoading) {
        return;
      }

      setActionLoading(task.instanceId);
      try {
        await onFinishTask(task, nowHHmm());
      } finally {
        setActionLoading(null);
      }
    },
    [actionLoading, onFinishTask, taskEditModal.isReadOnly],
  );

  if (loading && !viewModel) {
    return (
      <View style={styles.detailMessage}>
        <Spinner size="normal" />
      </View>
    );
  }

  if (error && !viewModel) {
    return renderContentState('No se pudo cargar el detalle del vuelo.');
  }

  if (!viewModel) {
    return renderContentState('Selecciona un vuelo para ver el detalle.');
  }

  return (
    <>
      <View style={styles.container}>
        <View style={[styles.sidebar, { width: sidebarWidth }]}>
          <ScrollView contentContainerStyle={styles.sidebarScrollContent}>
            <View style={styles.sidebarTop}>
              <Pressable style={styles.backButton} onPress={onBack}>
                <ArrowBackOutlined size={24} color="#2c31c9" />
                <Text
                  variant="heading-md"
                  style={{ color: '#2c31c9', fontWeight: 700 }}
                >
                  Trocar Voo
                </Text>
              </Pressable>
              <View style={styles.headerMetrics}>
                <View style={styles.headerMetric}>
                  <Text variant="label-sm" style={styles.headerMetricLabel}>
                    PREFIXO
                  </Text>
                  <Text variant="heading-sm" style={styles.headerMetricValue}>
                    {viewModel.header.registrationLabel}
                  </Text>
                </View>
                <View style={styles.headerMetric}>
                  <Text variant="label-sm" style={styles.headerMetricLabel}>
                    FLOTA
                  </Text>
                  <Text variant="heading-sm" style={styles.headerMetricValue}>
                    {viewModel.header.fleetLabel}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.flightLegsCard}>
              {renderFlightLeg(viewModel.arrival)}
              <View style={styles.flightLegDivider} />
              {renderFlightLeg(viewModel.departure)}
            </View>

            <View style={styles.tatRow}>
              <Text variant="label-lg" style={styles.tatLabel}>
                TEMPO DISPONIVEL (TAT)
              </Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text
                  variant="heading-md"
                  style={{
                    ...styles.tatValue,
                    color: viewModel.header.availableTimeDelayed
                      ? '#C8001E'
                      : styles.tatValue.color,
                  }}
                >
                  {viewModel.header.availableTimeLabel}
                </Text>
                {/* <Text
                  variant="label-sm"
                  style={{
                    color:
                      viewModel.header.mtdTone === 'delayed'
                        ? '#C8001E'
                        : viewModel.header.mtdTone === 'ahead'
                          ? '#07605B'
                          : '#6f6f6f',
                  }}
                >
                  {viewModel.header.mtdLabel}
                </Text> */}
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={styles.mainPanel}>
          <View style={styles.topPanel}>
            <View style={styles.toolbar}>
              <View style={styles.searchField}>
                <SearchOutlined size={24} color="#303030" />
                <TextInput
                  value={searchDraft}
                  onChangeText={onSearchDraftChange}
                  onSubmitEditing={onApplySearch}
                  placeholder="Procurar processos"
                  placeholderTextColor="#757575"
                  style={styles.searchInput}
                />
              </View>
              <Pressable style={styles.toolbarButton} onPress={onApplySearch}>
                <SearchOutlined size={24} color="#ffffff" />
                <Text
                  variant="heading-sm"
                  style={{ color: '#ffffff', fontWeight: 700 }}
                >
                  Procurar
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.reloadButton,
                  refreshing
                    ? { backgroundColor: '#eef0fd', opacity: 0.9 }
                    : null,
                  isMobile && styles.reloadButtonMobile,
                ]}
                onPress={handleReload}
                disabled={refreshing}
              >
                <Animated.View style={refreshIconStyle}>
                  <SyncOutlined size={32} color="#2c31c9" />
                </Animated.View>
              </Pressable>
            </View>
            <View style={styles.categoryRow}>
              {filterOptions.map((filter) => {
                const isActive = filter.id === activeCategory;
                return (
                  <Pressable
                    key={filter.id}
                    style={[
                      styles.categoryButton,
                      isActive ? styles.categoryButtonActive : null,
                    ]}
                    onPress={() => onCategoryChange(filter.id)}
                  >
                    <Text
                      variant="heading-lg"
                      style={{
                        color: isActive ? '#ffffff' : '#303030',
                        fontWeight: 700,
                      }}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <ScrollView
            style={styles.taskScroll}
            contentContainerStyle={styles.taskListContent}
          >
            {loading && !filteredTasks.length
              ? renderContentState('Cargando procesos...')
              : filteredTasks.length
                ? filteredTasks.map((task) => {
                    const isActing = actionLoading === task.instanceId;

                    return (
                      <View key={task.instanceId} style={styles.taskCard}>
                        <View style={styles.taskCardHeader}>
                          <Text variant="display-md" style={styles.taskTitle}>
                            {task.title}
                          </Text>

                          <View style={styles.taskHeaderRight}>
                            <Pressable
                              style={[
                                styles.taskEditButton,
                                taskEditModal.isReadOnly
                                  ? styles.taskActionBtnDisabled
                                  : null,
                              ]}
                              onPress={() => taskEditModal.open(task)}
                              disabled={taskEditModal.isReadOnly}
                            >
                              <EditSquareOutlined size={24} color="#0A0E80" />
                            </Pressable>
                          </View>
                        </View>

                        <View style={styles.taskBodyRow}>
                          <View style={styles.taskMetricsSummary}>
                            <View style={styles.taskMetricsRow}>
                              <View style={styles.taskMetric}>
                                <Text
                                  variant="heading-xl"
                                  style={styles.taskMetricValue}
                                >
                                  {task.scheduledRangeLabel}
                                </Text>
                                <Text
                                  variant="label-lg"
                                  style={styles.taskMetricLabel}
                                >
                                  Programado
                                </Text>
                              </View>
                              <View style={styles.taskMetricDivider} />
                              <View style={styles.taskMetric}>
                                <Text
                                  variant="heading-xl"
                                  style={styles.taskMetricValue}
                                >
                                  {task.startTimeLabel}
                                </Text>
                                <Text
                                  variant="label-lg"
                                  style={styles.taskMetricLabel}
                                >
                                  Inicio
                                </Text>
                              </View>
                              <View style={styles.taskMetricDivider} />
                              <View style={styles.taskMetric}>
                                <Text
                                  variant="heading-xl"
                                  style={styles.taskMetricValue}
                                >
                                  {task.endTimeLabel}
                                </Text>
                                <Text
                                  variant="label-lg"
                                  style={styles.taskMetricLabel}
                                >
                                  Termino
                                </Text>
                              </View>
                              <View style={styles.taskMetricDivider} />
                              <View style={styles.taskMetric}>
                                <Text
                                  variant="heading-xl"
                                  style={styles.taskMetricValue}
                                >
                                  {task.durationLabel}
                                </Text>
                                <Text
                                  variant="label-lg"
                                  style={styles.taskMetricLabel}
                                >
                                  Tempo en curso
                                </Text>
                              </View>
                            </View>
                          </View>

                          <View style={styles.taskActionWrap}>
                            {task.statusTone === 'completed' ? (
                              <View
                                style={[
                                  styles.taskAction,
                                  styles.taskActionCompleted,
                                ]}
                              >
                                <Text
                                  variant="heading-xs"
                                  style={styles.taskActionBtnFinalizadoText}
                                >
                                  Finalizado
                                </Text>
                              </View>
                            ) : task.statusTone === 'in_progress' ? (
                              <Pressable
                                style={[
                                  styles.taskAction,
                                  styles.taskActionInProgress,
                                  (isActing || taskEditModal.isReadOnly) &&
                                    styles.taskActionBtnDisabled,
                                ]}
                                disabled={isActing || taskEditModal.isReadOnly}
                                onPress={() => {
                                  if (!isActing && !taskEditModal.isReadOnly) {
                                    void handleFinish(task);
                                  }
                                }}
                              >
                                {isActing ? (
                                  <ActivityIndicator
                                    size="small"
                                    color="#ffffff"
                                  />
                                ) : (
                                  <Text
                                    variant="heading-xs"
                                    style={styles.taskActionBtnText}
                                  >
                                    Terminar
                                  </Text>
                                )}
                              </Pressable>
                            ) : (
                              <Pressable
                                style={[
                                  styles.taskAction,
                                  styles.taskActionPending,
                                  (isActing || taskEditModal.isReadOnly) &&
                                    styles.taskActionBtnDisabled,
                                ]}
                                disabled={isActing || taskEditModal.isReadOnly}
                                onPress={() => {
                                  if (!isActing && !taskEditModal.isReadOnly) {
                                    void handleStart(task);
                                  }
                                }}
                              >
                                {isActing ? (
                                  <ActivityIndicator
                                    size="small"
                                    color="#ffffff"
                                  />
                                ) : (
                                  <Text
                                    variant="heading-xs"
                                    style={styles.taskActionBtnText}
                                  >
                                    Començar
                                  </Text>
                                )}
                              </Pressable>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })
                : renderContentState('No hay procesos para el filtro actual.')}
          </ScrollView>
        </View>
      </View>

      <TaskEditModal
        controller={taskEditModal}
        TextComponent={Text}
        modalStyles={styles}
        labels={{
          startLabel: 'Hora de Início',
          endLabel: 'Hora de Término',
          commentPlaceholder: 'Comentário',
          restartLabel: 'Reiniciar proceso',
          submitLabel: 'Enviar',
          submittingLabel: 'Enviando...',
        }}
        variants={{
          title: 'display-md',
          fieldLabel: 'heading-sm',
          button: 'heading-lg',
          error: 'body-md',
        }}
      />
    </>
  );
};
