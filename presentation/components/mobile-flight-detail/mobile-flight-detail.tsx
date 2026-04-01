import React, { useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EditSquareOutlined,
  FlightDeparture,
  FlightLanding,
} from '@/presentation/components/common/icons';
import { Spinner } from '@/presentation/components/design-system';
import { MobileText as Text } from '@/presentation/components/mobile/mobile-text';
import { TaskEditModal } from '@/presentation/components/task-edit-modal/task-edit-modal';
import type { FlightTaskActionTarget } from '@/presentation/controllers/use-flight-task-actions';
import type { MobileTaskEditModalController } from '@/presentation/controllers/use-mobile-flight-detail-controller';
import { getBottomSystemSpacing } from '@/presentation/utils/native-safe-area';
import type {
  MobileFlightDetailViewModel,
  MobileFlightProcessViewModel,
} from '@/presentation/view-models/mobile-flight-detail-view-model';

import { styles } from './mobile-flight-detail.styles';

interface MobileFlightDetailProps {
  viewModel: MobileFlightDetailViewModel | null;
  taskEditModal: MobileTaskEditModalController;
  loading?: boolean;
  error?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  onStartTask?: (
    task: MobileFlightProcessViewModel & FlightTaskActionTarget,
    time: string,
  ) => Promise<unknown>;
  onFinishTask?: (
    task: MobileFlightProcessViewModel & FlightTaskActionTarget,
    time: string,
  ) => Promise<unknown>;
  /** Marcar Marco: inicio+fin (o solo fin) con refresco de Gantt; preferido frente a start/finish sueltos */
  onCompleteHito?: (
    task: MobileFlightProcessViewModel & FlightTaskActionTarget,
    time: string,
    onlyFinish: boolean,
  ) => Promise<unknown>;
}

const renderContentState = (message: string) => {
  return (
    <View style={styles.stateContainer}>
      <View style={styles.stateCard}>
        <Text variant="label-lg" style={styles.stateText}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const getProcessStatusStyle = (task: MobileFlightProcessViewModel) => {
  if (task.statusTone === 'completed') {
    return styles.processStatusCompleted;
  }

  if (task.statusTone === 'in_progress') {
    return styles.processStatusInProgress;
  }

  return styles.processStatusPending;
};

const getProcessStatusTextColor = (task: MobileFlightProcessViewModel) => {
  return task.statusTone === 'completed' ? '#0b127e' : '#3b3128';
};

const getSummaryProcessStatusLabel = (task: MobileFlightProcessViewModel) => {
  if (task.statusTone === 'completed') {
    return 'Finalizado';
  }

  if (task.statusTone === 'in_progress') {
    return 'Em andamento';
  }

  return 'Pendente';
};

const getExpandedProcessActionStyle = (task: MobileFlightProcessViewModel) => {
  if (task.statusTone === 'completed') {
    return styles.processExpandedActionCompleted;
  }

  if (task.statusTone === 'in_progress') {
    return styles.processExpandedActionInProgress;
  }

  return styles.processExpandedActionPending;
};

const getExpandedProcessActionTextColor = (
  task: MobileFlightProcessViewModel,
) => {
  return task.statusTone === 'completed' ? '#0a0e80' : '#ffffff';
};

const getExpandedProcessActionLabel = (task: MobileFlightProcessViewModel) => {
  if (task.statusTone === 'completed') {
    return 'Finalizado';
  }

  if (task.statusTone === 'in_progress') {
    return 'Terminar';
  }

  return 'Començar';
};

const getLatestFlightProcesses = (tasks: MobileFlightProcessViewModel[]) => {
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const leftTimestamp = left.task.lastEventTimestamp;
      const rightTimestamp = right.task.lastEventTimestamp;

      if (leftTimestamp !== null || rightTimestamp !== null) {
        if (leftTimestamp === null) {
          return 1;
        }

        if (rightTimestamp === null) {
          return -1;
        }

        if (rightTimestamp !== leftTimestamp) {
          return rightTimestamp - leftTimestamp;
        }
      }

      return right.index - left.index;
    })
    .slice(0, 2)
    .map(({ task }) => task);
};

const getExpandedProcessDurationLabel = (
  task: MobileFlightProcessViewModel,
) => {
  return task.statusTone === 'completed' ? 'Duracion' : 'Tempo en curso';
};

const getSummaryMetrics = (task: MobileFlightProcessViewModel) => {
  if (task.statusTone === 'completed') {
    return [
      {
        key: 'end',
        value: task.endTimeLabel,
        label: 'Hora de Término',
      },
    ];
  }

  return [
    {
      key: 'scheduled',
      value: task.scheduledValue,
      label: 'Programado',
    },
    {
      key: 'estimated',
      value: task.estimatedValue,
      label: 'Lançamento estimado',
    },
  ];
};

export const MobileFlightDetail: React.FC<MobileFlightDetailProps> = ({
  viewModel,
  taskEditModal,
  loading,
  error,
  refreshing = false,
  onRefresh,
}) => {
  const insets = useSafeAreaInsets();
  const bottomSafeSpacing = getBottomSystemSpacing(insets.bottom);
  const [activeLeg, setActiveLeg] = useState<'arrival' | 'departure'>(
    'departure',
  );
  const scrollViewRef = useRef<ScrollView>(null);
  const [boardingSectionOffset, setBoardingSectionOffset] = useState(0);

  useEffect(() => {
    setActiveLeg('departure');
  }, [
    viewModel?.arrival.flightNumber,
    viewModel?.departure.flightNumber,
    viewModel?.arrival.dateLabel,
    viewModel?.departure.dateLabel,
  ]);

  if (loading && !viewModel) {
    return (
      <View style={styles.stateContainer}>
        <Spinner size="normal" />
      </View>
    );
  }

  if (error && !viewModel) {
    return renderContentState('Nao foi possivel carregar o detalhe do voo.');
  }

  if (!viewModel) {
    return renderContentState(
      'Deslize da esquerda para a direita para abrir a fila de voos.',
    );
  }

  const activeFlight = viewModel[activeLeg];
  const summaryProcesses = getLatestFlightProcesses(viewModel.processCards);

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              (styles.scrollContent.paddingBottom ?? 0) + bottomSafeSpacing,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2c31c9"
              colors={['#2c31c9']}
              progressViewOffset={12}
            />
          ) : undefined
        }
      >
        <View style={styles.legToggleRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: activeLeg === 'arrival' }}
            onPress={() => setActiveLeg('arrival')}
            style={[
              styles.legToggleButton,
              activeLeg === 'arrival'
                ? styles.legToggleButtonActive
                : styles.legToggleButtonInactive,
            ]}
          >
            <FlightLanding
              size={24}
              color={activeLeg === 'arrival' ? '#ffffff' : '#2c31c9'}
            />
            <Text
              variant="heading-sm"
              style={[
                styles.legToggleText,
                activeLeg === 'arrival' ? styles.legToggleTextActive : null,
              ]}
            >
              Arrival
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: activeLeg === 'departure' }}
            onPress={() => setActiveLeg('departure')}
            style={[
              styles.legToggleButton,
              activeLeg === 'departure'
                ? styles.legToggleButtonActive
                : styles.legToggleButtonInactive,
            ]}
          >
            <FlightDeparture
              size={24}
              color={activeLeg === 'departure' ? '#ffffff' : '#2c31c9'}
            />
            <Text
              variant="heading-sm"
              style={[
                styles.legToggleText,
                activeLeg === 'departure' ? styles.legToggleTextActive : null,
              ]}
            >
              Departure
            </Text>
          </Pressable>
        </View>

        <View style={[styles.card, styles.detailCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.flightHeaderTitleRow}>
              <Text variant="heading-md" style={styles.sectionTitle}>
                {activeFlight.title}
              </Text>
              <Text variant="heading-sm" style={styles.stationTitle} italic>
                {activeFlight.stationLabel}
              </Text>
            </View>
            <View style={styles.gateLabelBlock}>
              <Text variant="label-md" style={styles.gateLabel}>
                PORTÃO
              </Text>
            </View>
          </View>

          <View style={styles.flightSummaryRow}>
            <View style={styles.flightNumberRow}>
              <Text variant="display-md" style={styles.flightNumber}>
                {activeFlight.flightNumber}
              </Text>
              <View style={styles.dateBadge}>
                <Text variant="heading-xs" style={styles.dateBadgeText}>
                  {activeFlight.dateLabel}
                </Text>
              </View>
            </View>

            <View style={styles.flightSummaryRight}>
              {/* <View style={styles.badgeRow}>
                <View style={styles.neutralBadge}>
                  <Text variant="heading-xs" style={styles.badgeText}>
                    {activeFlight.prefixLabel}
                  </Text>
                </View>
                {activeFlight.serviceBadgeLabel ? (
                  <View style={styles.softBadge}>
                    <Text variant="heading-xs" style={styles.badgeText}>
                      {activeFlight.serviceBadgeLabel}
                    </Text>
                  </View>
                ) : null}
                {activeFlight.terminalBadgeLabel ? (
                  <View style={styles.neutralBadge}>
                    <Text variant="heading-xs" style={styles.badgeText}>
                      {activeFlight.terminalBadgeLabel}
                    </Text>
                  </View>
                ) : null}
              </View> */}
              <Text variant="display-sm" style={styles.gateValue}>
                {activeFlight.gateLabel}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statsLeft}>
              {activeFlight.primaryStats.map((stat) => (
                <View key={stat.label} style={styles.statColumn}>
                  <Text variant="label-sm" style={styles.statLabel}>
                    {stat.label}
                  </Text>
                  <Text variant="display-md" style={styles.flightNumber}>
                    {stat.value}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.statsRight}>
              <View style={styles.statDivider} />
              <View style={styles.actionTimeColumn}>
                <Text
                  variant="label-sm"
                  style={[styles.statLabel, styles.statLabelRight]}
                  numberOfLines={1}
                >
                  {activeFlight.actionTime.label}
                </Text>
                <Text
                  variant="display-md"
                  style={styles.flightNumber}
                  numberOfLines={1}
                >
                  {activeFlight.actionTime.value}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* <View style={styles.card}>
          <View style={styles.sectionHeaderRowPax}>
            <Text variant="label-lg">PAX</Text>
            <Text variant="label-md" style={styles.sectionLink}>
              Ver detalhes
            </Text>
          </View>

          <View style={styles.paxMetricsRow}>
            <View style={styles.paxMetric}>
              <Text variant="label-sm" style={styles.paxLabel}>
                Total
              </Text>
              <Text variant="heading-lg" style={styles.paxValue}>
                {viewModel.pax.total}
              </Text>
            </View>
            <View style={styles.paxDivider} />
            <View style={styles.paxMetric}>
              <Text variant="label-sm" style={styles.paxLabel}>
                A bordo
              </Text>
              <Text variant="heading-lg" style={styles.paxValue}>
                {viewModel.pax.onboard}
              </Text>
            </View>
            <View style={styles.paxMetric}>
              <Text variant="label-sm" style={styles.paxLabel}>
                Restante
              </Text>
              <Text variant="heading-lg" style={styles.paxValue}>
                {viewModel.pax.remaining}
              </Text>
            </View>
          </View>
        </View> */}

        {/* TODO: PNAE panel will be added in a future increment.
      <View style={styles.card}>
        <View style={styles.sectionHeaderRow}>
          <Text variant="heading-xs" style={styles.sectionHeaderTitle}>
            PNAE
          </Text>
          <Text variant="label-md" style={styles.sectionLink}>
            Ver detalhes
          </Text>
        </View>

        <View style={styles.pnaeGrid}>
          {viewModel.pnae.items.map((item) => (
            <View
              key={item.id}
              style={styles.pnaePill}
              accessibilityLabel={`${item.label}: ${item.value}`}
            >
              {renderPnaeIcon(item)}
              <Text variant="heading-sm" style={styles.pnaeValue}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
      */}

        <View style={styles.processesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text variant="display-sm" style={styles.titleVoos}>
              Processos de Voo
            </Text>
            <Pressable
              onPress={() =>
                scrollViewRef.current?.scrollTo({
                  y: Math.max(0, boardingSectionOffset - 12),
                  animated: true,
                })
              }
            >
              <Text variant="label-md" style={styles.sectionLink}>
                Ver outros
              </Text>
            </Pressable>
          </View>

          {summaryProcesses.length ? (
            <View style={styles.processCards}>
              {summaryProcesses.map((task) => {
                const metrics = getSummaryMetrics(task);

                return (
                  <View key={task.id} style={styles.processCard}>
                    <View style={styles.processHeaderRow}>
                      <View style={styles.processHeaderCapsule}>
                        <View style={styles.processTitleChip}>
                          <Text
                            variant="heading-xs"
                            style={styles.processTitleChipText}
                            numberOfLines={1}
                          >
                            {task.title}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.processStatusChip,
                            getProcessStatusStyle(task),
                          ]}
                        >
                          <Text
                            variant="heading-xs"
                            style={{
                              ...styles.processStatusChipText,
                              color: getProcessStatusTextColor(task),
                            }}
                            numberOfLines={1}
                          >
                            {getSummaryProcessStatusLabel(task)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.processMetricsCard}>
                      <View style={styles.processMetricsRow}>
                        {metrics.map((metric, index) => (
                          <React.Fragment key={metric.key}>
                            <View
                              style={[
                                styles.processMetric,
                                metrics.length === 1
                                  ? styles.processMetricSingle
                                  : null,
                              ]}
                            >
                              <Text
                                variant="heading-md"
                                style={styles.processMetricValue}
                              >
                                {metric.value}
                              </Text>
                              <Text
                                variant="label-md"
                                style={styles.processMetricLabel}
                              >
                                {metric.label}
                              </Text>
                            </View>
                            {index < metrics.length - 1 ? (
                              <View style={styles.processMetricDivider} />
                            ) : null}
                          </React.Fragment>
                        ))}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.processEmptyCard}>
              <Text variant="label-lg" style={styles.stateText}>
                Nenhum processo disponivel.
              </Text>
            </View>
          )}
        </View>

        <View
          style={styles.boardingProcessesSection}
          onLayout={(event) => {
            setBoardingSectionOffset(event.nativeEvent.layout.y);
          }}
        >
          <View style={styles.sectionHeaderRow}>
            <Text variant="display-sm" style={styles.titleVoos}>
              Processos de Embarque
            </Text>
          </View>

          {viewModel.processCards.length ? (
            <View style={styles.processCards}>
              {viewModel.processCards.map((task: MobileFlightProcessViewModel) => {
                const isHito = String(task.tipoEvento ?? '').toUpperCase() === 'HITO';

                return (
                <View key={task.id} style={styles.processCardExpanded}>
                  <View style={styles.processExpandedHeader}>
                    <Text
                      variant="heading-md"
                      style={styles.processExpandedTitle}
                    >
                      {task.title}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Editar ${task.title}`}
                      style={[
                        styles.processEditButton,
                        taskEditModal.isReadOnly ? { opacity: 0.45 } : null,
                      ]}
                      onPress={() => taskEditModal.open(task)}
                      disabled={taskEditModal.isReadOnly}
                    >
                      <EditSquareOutlined size={24} color="#0a0e80" />
                    </Pressable>
                  </View>

                  <View style={[
                    styles.processExpandedGrid,
                    isHito ? { justifyContent: 'center' } : undefined,
                  ]}>
                    {isHito ? (
                      <>
                        <View
                          style={[
                            styles.processExpandedMetric,
                            { flex: undefined, minWidth: 100 },
                          ]}
                        >
                          <Text
                            variant="heading-md"
                            style={styles.processExpandedMetricValue}
                            numberOfLines={1}
                          >
                            {task.scheduledRangeLabel.split(' - ')[0] ?? '--'}
                          </Text>
                          <Text
                            variant="label-md"
                            style={styles.processExpandedMetricLabel}
                          >
                            Programado
                          </Text>
                        </View>
                        <View style={styles.processExpandedDivider} />
                        <View
                          style={[
                            styles.processExpandedMetric,
                            { flex: undefined, minWidth: 100 },
                          ]}
                        >
                          <Text
                            variant="heading-md"
                            style={styles.processExpandedMetricValue}
                          >
                            {task.startTimeLabel}
                          </Text>
                          <Text
                            variant="label-md"
                            style={styles.processExpandedMetricLabel}
                          >
                            Hora de Marco
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View
                          style={[
                            styles.processExpandedMetric,
                            styles.processExpandedMetricScheduled,
                          ]}
                        >
                          <Text
                            variant="heading-md"
                            style={styles.processExpandedMetricValue}
                            numberOfLines={1}
                          >
                            {task.scheduledRangeLabel.replace(' - ', ' / ')}
                          </Text>
                          <Text
                            variant="label-md"
                            style={styles.processExpandedMetricLabel}
                          >
                            Programado
                          </Text>
                        </View>
                        <View style={styles.processExpandedDivider} />
                        <View
                          style={[
                            styles.processExpandedMetric,
                            styles.processExpandedMetricCompact,
                          ]}
                        >
                          <Text
                            variant="heading-md"
                            style={styles.processExpandedMetricValue}
                          >
                            {task.startTimeLabel}
                          </Text>
                          <Text
                            variant="label-md"
                            style={styles.processExpandedMetricLabel}
                          >
                            Inicio
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.processExpandedMetric,
                            styles.processExpandedMetricCompact,
                          ]}
                        >
                          <Text
                            variant="label-md"
                            style={styles.processExpandedMetricValue}
                          >
                            {task.endTimeLabel}
                          </Text>
                          <Text
                            variant="label-md"
                            style={styles.processExpandedMetricLabel}
                          >
                            Termino
                          </Text>
                        </View>
                      </>
                    )}
                  </View>

                  <View style={[
                    styles.processExpandedFooter,
                    isHito ? { justifyContent: 'center' } : undefined,
                  ]}>
                    {!isHito ? (
                      <View style={styles.processExpandedDuration}>
                        <Text
                          variant="label-lg"
                          style={styles.processExpandedMetricValue}
                        >
                          {task.durationLabel}
                        </Text>
                        <Text
                          variant="label-md"
                          style={styles.processExpandedMetricLabel}
                        >
                          {getExpandedProcessDurationLabel(task)}
                        </Text>
                      </View>
                    ) : null}

                    {isHito ? (
                      task.statusTone === 'completed' ? (
                        <View
                          style={[
                            styles.processExpandedAction,
                            styles.processExpandedActionCompleted,
                          ]}
                        >
                          <Text
                            variant="heading-sm"
                            style={{ color: '#0a0e80' }}
                          >
                            Marco finalizado
                          </Text>
                        </View>
                      ) : (
                        <Pressable
                          style={[
                            styles.processExpandedAction,
                            { backgroundColor: '#6B0FC7' },
                            taskEditModal.isReadOnly ? { opacity: 0.45 } : null,
                          ]}
                          onPress={() => {
                            taskEditModal.open(task);
                          }}
                          disabled={taskEditModal.isReadOnly}
                        >
                          <Text
                            variant="heading-sm"
                            style={{ color: '#ffffff' }}
                          >
                            Marcar Marco
                          </Text>
                        </Pressable>
                      )
                    ) : (
                      <Pressable
                        style={[
                          styles.processExpandedAction,
                          getExpandedProcessActionStyle(task),
                          taskEditModal.isReadOnly ? { opacity: 0.45 } : null,
                        ]}
                        onPress={() => {
                          taskEditModal.open(task);
                        }}
                        disabled={taskEditModal.isReadOnly}
                      >
                        <Text
                          variant="heading-sm"
                          style={{
                            color: getExpandedProcessActionTextColor(task),
                          }}
                        >
                          {getExpandedProcessActionLabel(task)}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.processEmptyCard}>
              <Text variant="label-lg" style={styles.stateText}>
                Nenhum processo disponivel.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TaskEditModal
        controller={taskEditModal}
        TextComponent={Text}
        modalStyles={styles}
        labels={{
          startLabel: 'Start',
          endLabel: 'End',
          commentPlaceholder: 'Comentário',
          restartLabel: 'Restablecer proceso',
          submitLabel: 'Guardar',
          submittingLabel: 'Guardando...',
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
