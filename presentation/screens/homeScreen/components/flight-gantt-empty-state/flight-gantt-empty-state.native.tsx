import { Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { FLIGHT_AIRPLANE_HANGAR_SVG } from '@/presentation/assets/images/flight-airplane-hangar-svg';

import { styles } from './flight-gantt-empty-state.styles';

export const FlightGanttEmptyState = (): JSX.Element => {
  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <SvgXml
          xml={FLIGHT_AIRPLANE_HANGAR_SVG}
          width="100%"
          height="100%"
        />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}> Não há voos selecionados</Text>
        <Text style={styles.subtitle}>Selecione um da fila de voos.</Text>
      </View>
    </View>
  );
};
