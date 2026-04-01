import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { AppPressable } from '@/presentation/components/common/app-pressable';
import { Box, Text } from '@/presentation/components/design-system';
import { formatDate } from '@/presentation/view-models/flight-view-model';

import type { FlightListDateSelectorProps } from './flight-list-date-selector.types';
import {
  CalendarOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
} from './icons';
import { styles } from './flight-list.styles';

export const FlightListDateSelector: React.FC<FlightListDateSelectorProps> = ({
  colors,
  selectedDateKey,
  availableDateKeys,
  onDateChange,
  onPreviousDate,
  onNextDate,
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const selectedIndex = useMemo(() => {
    if (!selectedDateKey || !Array.isArray(availableDateKeys)) {
      return -1;
    }

    return availableDateKeys.indexOf(selectedDateKey);
  }, [selectedDateKey, availableDateKeys]);

  const prevDisabled = selectedIndex <= 0;
  const nextDisabled =
    selectedIndex < 0 ||
    selectedIndex >= (availableDateKeys?.length ?? 0) - 1;
  const formattedDate = formatDate(selectedDateKey ?? '') || '--/--/----';
  const isDatePickerDisabled = availableDateKeys.length === 0;

  const handleDateSelect = (key: string) => {
    onDateChange(key);
    setCalendarOpen(false);
  };

  return (
    <Box
      style={{
        ...styles.dateSelectorBlock,
        backgroundColor: colors.surfacePrimary,
        borderBottomColor: colors.borderPrimary,
      }}
    >
      <AppPressable
        onPress={onPreviousDate}
        disabled={prevDisabled}
        style={{
          ...styles.dateNavButton,
          backgroundColor: colors.interactionSoftDefault,
          opacity: prevDisabled ? 0.4 : 1,
        }}
        accessibilityLabel="Fecha anterior"
      >
        <ChevronLeftOutlined size={28} color="#ffffff" />
      </AppPressable>

      <AppPressable
        onPress={() => setCalendarOpen(true)}
        disabled={isDatePickerDisabled}
        style={{
          ...styles.datePickerButton,
          borderColor: colors.borderPrimary,
          opacity: isDatePickerDisabled ? 0.5 : 1,
        }}
        accessibilityLabel="Seleccionar fecha de vuelos"
      >
        <Box style={styles.datePickerIconWrapper}>
          <CalendarOutlined size={24} color={colors.textPrimary} />
        </Box>
        <Text variant="label-lg">{formattedDate}</Text>
      </AppPressable>

      <AppPressable
        onPress={onNextDate}
        disabled={nextDisabled}
        style={{
          ...styles.dateNavButton,
          backgroundColor: colors.interactionSoftDefault,
          opacity: nextDisabled ? 0.4 : 1,
        }}
        accessibilityLabel="Fecha siguiente"
      >
        <ChevronRightOutlined size={28} color="#ffffff" />
      </AppPressable>

      <Modal
        visible={calendarOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarOpen(false)}
      >
        <Pressable
          style={styles.datePickerModalBackdrop}
          onPress={() => setCalendarOpen(false)}
        >
          <View
            style={{
              ...styles.datePickerModalCard,
              backgroundColor: colors.surfacePrimary,
              borderColor: colors.borderPrimary,
            }}
          >
            <View style={styles.datePickerModalHeader}>
              <Text variant="heading-sm" style={styles.datePickerModalTitle}>
                Seleccionar fecha
              </Text>
              <AppPressable
                onPress={() => setCalendarOpen(false)}
                accessibilityLabel="Cerrar selector de fecha"
              >
                <Text
                  variant="label-md"
                  style={{
                    ...styles.datePickerModalCloseText,
                    color: colors.interactionSoftDefault,
                  }}
                >
                  Cerrar
                </Text>
              </AppPressable>
            </View>

            <ScrollView
              style={styles.datePickerModalList}
              contentContainerStyle={styles.datePickerModalListContent}
              showsVerticalScrollIndicator={false}
            >
              {availableDateKeys.map((dateKey) => {
                const selected = dateKey === selectedDateKey;

                return (
                  <AppPressable
                    key={dateKey}
                    onPress={() => handleDateSelect(dateKey)}
                    style={{
                      ...styles.datePickerModalOption,
                      borderColor: selected
                        ? colors.interactionSoftDefault
                        : colors.borderPrimary,
                      backgroundColor: selected
                        ? '#eef0fd'
                        : colors.surfacePrimary,
                    }}
                    accessibilityLabel={`Seleccionar fecha ${formatDate(dateKey)}`}
                  >
                    <Text
                      variant="label-lg"
                      style={{
                        ...styles.datePickerModalOptionText,
                        color: selected
                          ? colors.interactionSoftDefault
                          : colors.textPrimary,
                      }}
                    >
                      {formatDate(dateKey)}
                    </Text>
                  </AppPressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </Box>
  );
};
