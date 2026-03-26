🚀 Guía para Crear una Nueva Feature

🎯 Objetivo
Agregar nuevas funcionalidades:

    Sin romper la arquitectura
    Sin degradar performance
    Sin meter lógica en la UI
    Cumpliendo TODAS las reglas del proyecto

🧭 Regla Base (NO negociable)
Toda feature nueva sigue este flujo:

    Screen
    ↓
    Controller (Hook)
    ↓
    Use Case
    ↓
    Port
    ↓
    Adapter (API / Redux)

🥇 Paso 1: Definir el Caso de Uso
📍 application/useCases

Ejemplo

// application/useCases/start-flight-gantt-use-case.ts
export class StartFlightGanttUseCase {
  constructor(
    private readonly flightRepository: FlightRepositoryPort
  ) {}

  async execute(flightId: string): Promise<void> {
    return this.flightRepository.startGantt(flightId);
  }
}
✅ Una responsabilidad
✅ Sin React
✅ Sin Redux
✅ Sin Axios

🥈 Paso 2: Definir el Port
📍 application/ports

// application/ports/flight-repository-port.ts
export interface FlightRepositoryPort {
  startGantt(flightId: string): Promise<void>;
}
📌 El port define qué necesita el negocio, no cómo.

🥉 Paso 3: Implementar el Adapter (API)
📍 infrastructure/api

// infrastructure/api/flight-api-repository.ts
export class FlightApiRepository implements FlightRepositoryPort {
  async startGantt(flightId: string): Promise<void> {
    return httpPost(`/api/v1/gantt/start/${flightId}`, {});
  }
}
✅ Axios encapsulado
✅ Usa HttpClient
✅ No se importa en UI

🟣 Paso 4: Registrar en el Container (DI)
📍 dependencyInjection/container.ts

const flightRepository = new FlightApiRepository();

export const container = {
  ...container,
  startFlightGanttUseCase: new StartFlightGanttUseCase(
    flightRepository
  ),
};
📌 Nunca instanciar use cases en UI

🟠 Paso 5: (Opcional) Redux Slice
📍 store/slices

export const startFlightGantt = createAsyncThunk(
  'gantt/start',
  async (flightId: string) => {
    return container.startFlightGanttUseCase.execute(flightId);
  }
);
✅ Redux llama casos de uso
❌ Casos de uso NO conocen Redux

🟡 Paso 6: Redux Adapter
📍 presentation/adapters/redux

export const useGanttStoreAdapter = () => {
  const dispatch = useDispatch<AppDispatch>();

  return {
    startGantt: (flightId: string) =>
      dispatch(startFlightGantt(flightId)),
  };
};
✅ Redux encapsulado
✅ Adapter + Facade

🔵 Paso 7: Controller (Hook)
📍 presentation/controllers

export const useGanttController = () => {
  const ganttStore = useGanttStoreAdapter();

  const startGantt = (flightId: string) => {
    ganttStore.startGantt(flightId);
  };

  return { startGantt };
};
📌 El controller adapta, no decide.

🟢 Paso 8: Screen (UI)
📍 presentation/screens

export const GanttScreen = () => {
  const { startGantt } = useGanttController();

  return (
    <Button
      title="Start Gantt"
      onPress={() => startGantt('FLIGHT_ID')}
    />
  );
};

✅ UI simple
✅ Sin lógica
✅ Hooks mínimos

⚡ Performance (OBLIGATORIO)
Si la feature muestra listas:

✅ FlatList SIEMPRE

<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  removeClippedSubviews
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={5}
/>
❌ .map() prohibido

✅ Checklist rápido antes de abrir PR
    [ ] Caso de uso creado
    [ ] Port definido
    [ ] Adapter implementado
    [ ] DI actualizado
    [ ] Redux encapsulado
    [ ] Controller simple
    [ ] UI sin lógica
    [ ] FlatList usado si aplica
    [ ] Datos sin transformar

🏁 Conclusión
Si sigues estos pasos:

    ✔ La arquitectura se mantiene
    ✔ El código escala
    ✔ El equipo trabaja alineado
    ✔ El Gantt en tiempo real es viable

No es más código.
Es mejor código.

