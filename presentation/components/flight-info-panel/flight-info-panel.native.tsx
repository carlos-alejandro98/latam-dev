import { Text, View } from 'react-native';

import type { FlightInfoPanelProps } from './flight-info-panel.types';

export const FlightInfoPanel = ({
  viewModel,
  loading,
  error,
}: FlightInfoPanelProps) => {
  if (loading) {
    return (
      <View>
        <Text>Cargando detalle del vuelo...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>No se pudo cargar el detalle del vuelo.</Text>
      </View>
    );
  }

  if (!viewModel) {
    return null;
  }

  return (
    <View>
      <Text>
        {viewModel.arrival.flightNumber} - {viewModel.departure.flightNumber}
      </Text>
      <Text>
        {viewModel.arrival.station} - {viewModel.departure.station}
      </Text>
    </View>
  );
};
