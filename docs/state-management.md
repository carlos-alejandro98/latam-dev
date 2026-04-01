🧠 State Management – **Redux vs Zustand**
    **Proyecto**: AptoGantt Frontend
    **Stack**: React Native (Expo)
    **Arquitectura**: Clean + Hexagonal
    **Última actualización**: 2026‑01

🎯 Objetivo de este documento
Definir claramente:

    *Cuándo usar Redux Toolkit
    *Cuándo usar Zustand
    *Cuándo NO usar estado global
    *Dónde vive cada tipo de estado
    *Qué errores evitar
    
📌 Este documento existe para **evitar caos**, no para debatir.

🧠 Principio Fundamental
    **No todo estado es igual.**
    **No todo estado debe ser global.**

Elegir mal el gestor de estado es una de las principales fuentes de deuda técnica en proyectos grandes.

🧱 Tipos de Estado en el Proyecto
Antes de elegir una librería, clasifica el estado:

1️⃣ Estado de Dominio (Business State)
    Datos críticos del negocio
    Persisten en el tiempo
    Usados por múltiples pantallas
    Provienen del backend
    Requieren trazabilidad y debugging

✅ Ejemplo real en el proyecto

    Flight[]
    Estado de vuelos activos
    Estado de tareas operativas
    Estado del Gantt

2️⃣ Estado de UI (Presentation State)
    -Estado efímero
    -Solo afecta una pantalla o componente
    -No representa reglas de negocio
    -No necesita persistencia

✅ Ejemplos

    Modal abierto/cerrado
    Filtro seleccionado
    Tab activo
    Scroll position

3️⃣ Estado Local (Component State)
    -Vive y muere en el componente
    -No se comparte
    -Totalmente aislado
    
✅ Ejemplo

`const [isExpanded, setIsExpanded] = useState(false);`

✅ Decisión Oficial del Proyecto

    Tipo de estado      Herramienta
   Dominio / Negocio   ✅ Redux Toolkit
   UI / Efímero        ✅ Zustand
   Local               ✅ useState / useReducer

👉 **No hay excepciones.**

🟪 **Redux Toolkit – Estado de Dominio**
✅ Cuándo usar Redux
Usa Redux **SI Y SOLO SI** el estado:

    -Representa negocio
    -Proviene del backend
    -Debe persistir
    -Es compartido entre features
    -Debe ser debuggeable

✅ Ejemplo REAL del proyecto (correcto)

// store/slices/flights-slice.ts
    `interface FlightsState {`
        `data: Flight[];`
        `loading: boolean;`
        `error?: string;`
    `}`

`export const fetchActiveFlights = createAsyncThunk(`
    `'flights/fetchActive',`
    `async () => {`
    `return container.getActiveFlightsUseCase.execute();`
    `}`
`);`

📌 **Punto clave**
Redux **NO** llama Axios.
Redux **NO** conoce infraestructura.
Redux **llama casos de uso.**

🚫 Errores comunes con Redux (NO permitidos)
    ❌ Usar Redux para modales
    ❌ Usar Redux para filtros locales
    ❌ Acceder a Redux desde application/
    ❌ Importar store/ en UI
    ❌ Mutar estado fuera de reducers

✅ Acceso correcto a Redux (Adapter Pattern)

// presentation/adapters/redux/flights-store-adapter.ts
`export const useFlightsStoreAdapter = () => {`
    `const dispatch = useDispatch<AppDispatch>();`
    `const flights = useSelector((state) => state.flights.data);`
    `const loading = useSelector((state) => state.flights.loading);`
    ``
    `return {`
        `flights,`
        `loading,`
        `loadFlights: () => dispatch(fetchActiveFlights()),`
    `};`
`};`

📌 **Regla clave**
Redux **solo se accede vía adapters.**

🟨 **Zustand – Estado de UI**

✅ **Cuándo usar Zustand**
Usa Zustand cuando el estado:

    -Es solo de UI
    -No representa negocio
    -Vive en una o pocas pantallas
    -No necesita persistencia global

✅ Ejemplos recomendados

    Modal abierto / cerrado
    Filtro seleccionado
    Panel expandido
    Modo de vista (grid/list)

✅ Ejemplo recomendado de Zustand

`import { create } from 'zustand';`
``
`interface GanttUiState {`
    `selectedTaskId?: string;`
    `isDetailsPanelOpen: boolean;`
    `openDetails: (taskId: string) => void;`
    `closeDetails: () => void;`
`}`
``
`export const useGanttUiStore = create<GanttUiState>((set) => ({`
    `selectedTaskId: undefined,`
    `isDetailsPanelOpen: false,`
    `openDetails: (taskId) =>`
        `set({ selectedTaskId: taskId, isDetailsPanelOpen: true }),`
    `closeDetails: () =>`
        `set({ selectedTaskId: undefined, isDetailsPanelOpen: false }),`
`}));`

📌 Zustand **NO reemplaza Redux**
📌 Zustand **NO maneja dominio**

🚫 Errores comunes con Zustand **(NO permitidos)**
    ❌ Usar Zustand para datos del backend
    ❌ Usar Zustand para vuelos, tareas o Gantt core
    ❌ Usar Zustand como “Redux más simple”
    ❌ Acceder a Zustand desde casos de uso

🟦 Estado Local – **useState / useReducer**

✅ **Cuándo usar estado local**
    -Estado privado del componente
    -No compartido
    -No persistente
    -Muy simple

✅ Ejemplo

`const [isExpanded, setIsExpanded] = useState(false);`

📌 Si el componente empieza a tener **muchos hooks**, extraer a custom hook (Regla 10.3).

🔄 Flujo Correcto de Estado **(Regla de Oro)**

    UI
    ↓
    Controller (Hook)
    ↓
    Redux Adapter
    ↓
    Redux Slice
    ↓
    Use Case
    ↓
    Domain / API

❌ Nunca al revés
❌ Nunca saltarse capas

✅ Checklist rápido para decidir
Antes de crear estado nuevo, pregúntate:

    1. ¿Representa negocio?
        ✅ Sí → Redux
        ❌ No → seguir

    2. ¿Se comparte entre pantallas?
        ✅ Sí → Redux
        ❌ No → seguir

    3. ¿Es solo UI?
        ✅ Sí → Zustand
        ❌ No → useState
        
🚦 **Reglas NO negociables**
✅ DO
    -Redux solo para dominio
    -Zustand solo para UI
    -Acceso vía adapters
    -Casos de uso orquestan

❌ DON’T
    -Redux para modales
    -Zustand para dominio
    -Estado global innecesario
    -Acceso directo a store

🏁 **Conclusión**
Esta estrategia:
    ✔ Evita Redux inflado
    ✔ Evita estado duplicado
    ✔ Facilita debugging
    ✔ Escala con el equipo
    ✔ Encaja con Clean Architecture

- **No se trata de usar menos librerías,**
- **se trata de usar cada una para lo que sirve.**
