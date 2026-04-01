import { Box, Text } from '@/presentation/components/design-system';
import { PlatformImage } from '@/presentation/components/platform-image';
import { styles } from './flight-gantt-empty-state.styles';

const airplaneOnService = {
  uri: 'https://hangar-statics.appslatam.com/images/illustrations/flight/FlightAirplaneHangar.svg',
};

export const FlightGanttEmptyState = () => {
  return (
    <Box style={styles.container}>
      <Box style={styles.imageWrapper}>
        <PlatformImage
          source={airplaneOnService}
          style={styles.image}
          contentFit="contain"
          accessibilityLabel="Aeronave no hangar"
        />
      </Box>

      <Box style={styles.textBlock}>
        <Text bold variant="heading-lg" color="primary" style={styles.title}>
          Não há voos selecionados
        </Text>
        <Text variant="heading-md" color="secondary" style={styles.subtitle}>
          Selecione um da fila de voos.
        </Text>
      </Box>
    </Box>
  );
};
