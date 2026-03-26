🏗 Arquitectura Frontend – AptoGantt (Clean + Hexagonal)
📌 Contexto del Proyecto
AptoGantt es una aplicación móvil para la gestión operativa de vuelos en aeropuerto, cubriendo el flujo completo:

    Bajada de pasajeros
    Ejecución de tareas operativas
    Seguimiento de hitos
    Planificación mediante carta Gantt dinámica
    Actualización en tiempo real de estados y horarios

El frontend debe ser:

    Performante en dispositivos móviles
    Escalable en funcionalidades
    Mantenible por equipos grandes
    Independiente de librerías específicas

🎯 Objetivos de la Arquitectura
    Separar responsabilidades de forma estricta
    Proteger la lógica de negocio
    Evitar acoplamiento a React, Redux o Axios
    Facilitar testing y refactor futuro
    Soportar tiempo real (polling / WebSocket)
    Garantizar performance (listas grandes, Gantt)

🧠 Principios Arquitectónicos
    Dependencias siempre hacia el dominio
    Redux y Axios son detalles de implementación
    La UI no conoce infraestructura
    Toda lógica de negocio vive en casos de uso
    Todo acceso externo pasa por ports + adapters
    El frontend NO transforma datos del backend

🧱 Capas de la Arquitectura

    Screen (Expo Router)
    ↓
    Controller (Hook)
    ↓
    Application (Use Case)
    ↓
    Port
    ↓
    Adapter (API / Redux)
    ↓
    Backend / Store

📁 Estructura REAL del Proyecto

    app/                             # Expo Router (pantallas)
    presentation/
    ├── screens/                     # Screens (UI pura)
    │   └── homeScreen/
    ├── controllers/                 # Controllers (Hooks)
    ├── adapters/
    │   └── redux/                   # Redux adapters (encapsulación)
    components/                      # Componentes UI reutilizables

    application/
    ├── useCases/                    # Casos de uso
    └── ports/                       # Interfaces (contratos)

    domain/
    └── entities/                    # Entidades de negocio

    infrastructure/
    ├── api/                         # Repositorios API
    ├── http/                        # Axios + helpers HTTP

    store/
    └── slices/                      # Redux Toolkit slices

    dependencyInjection/
    └── container.ts                 # Inyección de dependencias

    config/
    └── environment.ts               # Variables de entorno

    shared/, utils/, constants/      # Utilidades comunes

📌 Nota: Existen carpetas features/ legacy.
Las nuevas funcionalidades deben seguir esta arquitectura.

🟦 Domain – Núcleo del Negocio
Qué es
Contiene modelos puros del negocio.
No depende de React, Redux, Axios ni Expo.

Ejemplo real

// domain/entities/flight.ts
export interface Flight {
  flightId: string;
  numberArrival: string;
  numberDeparture: string;
  origin: string;
  destination: string;
  prefix: string;
  staTime: string;
  staDate: string;
  stdTime: string;
  stdDate: string;
  ganttIniciado: boolean;
}

Reglas
❌ No importar nada externo
❌ No transformar datos
✅ Coincidir 1:1 con backend

🟩 Application – Casos de Uso
Qué es
Orquesta la lógica de negocio.
Decide qué hacer, no cómo hacerlo.

Ejemplo real

// application/useCases/get-active-flights-use-case.ts
export class GetActiveFlightsUseCase {
  constructor(
    private readonly flightRepo: FlightRepositoryPort
  ) {}

  async execute(): Promise<Flight[]> {
    return this.flightRepo.getActiveFlights();
  }
}

Reglas
✅ Usa ports
❌ No conoce Redux
❌ No conoce Axios
✅ Testeable en aislamiento

🔌 Ports – Contratos
Qué son
Interfaces que definen qué necesita el negocio.

// application/ports/flight-repository-port.ts
export interface FlightRepositoryPort {
  getActiveFlights(): Promise<Flight[]>;
}
📌 Permite cambiar REST → WebSocket sin tocar casos de uso.

🟥 Infrastructure – Detalles Técnicos
Qué es
Implementaciones concretas de servicios externos.

Ejemplo real

// infrastructure/api/flight-api-repository.ts
export class FlightApiRepository implements FlightRepositoryPort {
  async getActiveFlights() {
    return httpGet<Flight[]>('/api/v1/tracking/active-flights-v2');
  }
}
HTTP Client
ts

// infrastructure/http/http-client.ts
export const HttpClient = axios.create({
  baseURL: ENV.apiBaseUrl,
  timeout: 10000,
});

Reglas
✅ Implementa ports
❌ No se usa directamente en UI

🟨 Presentation – UI (React / React Native)
Screens

// presentation/screens/homeScreen/home-screen.tsx
export const HomeScreen = () => {
  const { flights, loading } = useHomeController();
  ...
};
Controllers (Hooks)
ts

// presentation/controllers/use-home-controller.ts
export const useHomeController = () => {
  const { flights, loading, loadFlights } =
    useFlightsStoreAdapter();

  useEffect(() => {
    loadFlights();
  }, [loadFlights]);

  return { flights, loading };
};
📌 El controller adapta la UI, no decide negocio.

🔌 Redux Adapter (Encapsulación)

// presentation/adapters/redux/flights-store-adapter.ts
export const useFlightsStoreAdapter = () => {
  const dispatch = useDispatch<AppDispatch>();
  const flights = useSelector((state) => state.flights.data);
  const loading = useSelector((state) => state.flights.loading);

  return {
    flights,
    loading,
    loadFlights: () => dispatch(fetchActiveFlights()),
  };
};

Reglas
✅ Redux solo aquí
❌ No importar store/ en screens ni use cases

🟪 Store – Redux Toolkit

// store/slices/flights-slice.ts
export const fetchActiveFlights = createAsyncThunk(
  'flights/fetchActive',
  async () => {
    return container.getActiveFlightsUseCase.execute();
  }
);
📌 Redux usa casos de uso, no al revés.

⚙️ Dependency Injection

// dependencyInjection/container.ts
const flightRepository = new FlightApiRepository();

export const container = {
  getActiveFlightsUseCase: new GetActiveFlightsUseCase(
    flightRepository
  ),
};
Beneficios:
    Cambio de implementaciones
    Testing
    Escalabilidad
     
⚡ Performance (Regla CRÍTICA)
❌ Prohibido
flights.map(...)

✅ Obligatorio
<FlatList
  data={flights}
  keyExtractor={(item) => item.flightId}
  renderItem={...}
  removeClippedSubviews
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={5}
/>

🔐 Seguridad y Configuración

// config/environment.ts
if (!ENV.apiBaseUrl) {
  throw new Error('EXPO_PUBLIC_API_BASE_URL is required');
}
❌ No hardcodear URLs
✅ Usar .env


🚦 Reglas de Oro del Equipo
✅ DO
    *Usar casos de uso
    *Encapsular Redux
    *Usar FlatList
    *Mantener dominio puro
❌ DON’T
    *Axios en UI
    *Redux en application/domain
    *Transformar datos
    *.map() en listas grandes

🏁 Conclusión
Esta arquitectura:
    
    ✔ Ya está funcionando en el proyecto
    ✔ Escala a tiempo real y Gantt
    ✔ Protege el negocio
    ✔ Facilita onboarding
    ✔ Reduce deuda técnica
    
La UI cambia.
Las librerías cambian.
El negocio debe sobrevivir.