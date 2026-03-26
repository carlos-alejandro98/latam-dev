import { Text, View } from "react-native";

import { PlatformImage } from "@/presentation/components/platform-image";

import { styles } from "./flight-gantt-empty-state.styles";

const airplaneOnService = {
  uri: "https://hangar-statics.appslatam.com/images/illustrations/flight/FlightAirplaneHangar.svg",
};

export const FlightGanttEmptyState = () => {
  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <PlatformImage
          source={airplaneOnService}
          style={styles.image}
          contentFit="contain"
          accessibilityLabel="Aeronave no hangar"
        />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}> Não há voos selecionados</Text>
        <Text style={styles.subtitle}>Selecione um da fila de voos.</Text>
      </View>
    </View>
  );
};
