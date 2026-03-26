🧾 Descripción del PR
¿Qué problema resuelve este PR?
Explica brevemente el contexto funcional o técnico.
Enfócate en el “por qué”, no solo en el “qué”.

¿Qué se ha cambiado?
[ ] Nueva funcionalidad
[ ] Corrección de bug
[ ] Refactor
[ ] Performance
[ ] Infra / Config
[ ] Documentación
[ ] Tests
Describe los cambios principales realizados.

🧱 Arquitectura (OBLIGATORIO – Clean + Hexagonal)

✅ Flujo arquitectónico respetado
Este PR respeta el flujo acordado:

    Screen
    ↓
    Controller (Hook)
    ↓
    UseCase (application/useCases)
    ↓
    Port (application/ports)
    ↓
    Adapter (infrastructure / redux)

[ ] La UI NO llama APIs directamente
[ ] La UI NO importa Redux directamente
[ ] Toda lógica de negocio vive en application/useCases
[ ] Todo acceso externo pasa por ports + adapters

✅ Casos de uso
[ ] La lógica de negocio vive en application/useCases
[ ] El use case NO importa React, Redux ni Axios
[ ] El use case usa ports, no implementaciones concretas
[ ] El use case tiene una responsabilidad clara

📌 Archivos impactados:
    application/useCases/____________________

✅ Ejemplo correcto (ya usado en el proyecto):

    container.getActiveFlightsUseCase.execute();

✅ Redux correctamente encapsulado

[ ] useSelector / useDispatch solo en:
    "presentation/adapters/redux/"
[ ] Ningún screen, controller o useCase importa "store/"
[ ] Redux se usa como detalle de implementación

✅ Ejemplo correcto:

    useFlightsStoreAdapter();

📊 Datos (Regla CRÍTICA 10.1)

✅ No transformación de datos
[ ] Los datos se muestran exactamente como vienen del backend
[ ] No se renombran campos (flightId ≠ flight_id)
[ ] No se formatean fechas u horas en el frontend
[ ] Las interfaces TypeScript coinciden 1:1 con el API

✅ Correcto (actual):

    staTime: string;
    stdDate: string;
    ganttIniciado: boolean;

❌ Incorrecto:

    startTime
    formattedDate


⚡ Performance (Regla CRÍTICA 10.2)

✅ Renderizado de listas
[ ] Se usa FlatList para listas dinámicas
[ ] ❌ .map() NO se usa para listas grandes
[ ] keyExtractor usa un ID estable (no index)

✅ Obligatorio:

    <FlatList
      data={flights}
      keyExtractor={(item) => item.flightId}
      renderItem={...}
    />

✅ Configuración de FlatList (requerida)
[ ] removeClippedSubviews={true}
[ ] initialNumToRender={10}
[ ] maxToRenderPerBatch={5}
[ ] windowSize={5}
⚠️ Si falta → PR NO se aprueba

🧠 Hooks y Controllers (Regla 10.3)
✅ Simplicidad
[ ] El screen usa pocos hooks (máx. 2–3)
[ ] Lógica compleja extraída a custom hook
[ ] No hay lógica de negocio en el componente UI

✅ Ejemplo correcto:

    useHomeController → useFlightsStoreAdapter

🔐 Seguridad

✅ Environment
[ ] No hay URLs hardcodeadas
[ ] HttpClient usa ENV.apiBaseUrl
[ ] .env.example actualizado si aplica

❌ Incorrecto:

    baseURL: 'https://...'

✅ Correcto:

    baseURL: ENV.apiBaseUrl

✅ Errores
[ ] Errores críticos usan clases de dominio
[ ] No se muestran errores técnicos crudos en UI
[ ] Logs tienen contexto (flightId, acción, etc.)

🧪 Testing
✅ Tests
[ ] Casos de uso nuevos tienen test
[ ] Dependencias externas mockeadas
[ ] Se cubren casos de error

✅ Ejemplo esperado:

    describe('GetActiveFlightsUseCase', () => {
      it('should return active flights', async () => {});
    });

🧹 Código y estándares
✅ Estilo
[ ] Nombres en inglés y descriptivos
[ ] camelCase / PascalCase / kebab-case correctos
[ ] Funciones ≤ 20 líneas
[ ] Componentes ≤ 200 líneas
✅ Imports
[ ] Ordenados: externos → internos → relativos
[ ] Sin imports no utilizados
[ ] Uso correcto de alias (@/)

🧬 Git & PR hygiene
✅ Commits
[ ] Commits atómicos
[ ] Conventional Commits
[ ] Mensajes claros y descriptivos
✅ Ejemplo:

    feat(flights): load active flights in home screen

✅ Revisión
[ ] Checklist completo ✅
[ ] PR revisado por al menos 1 dev
[ ] Screenshots o video si hay cambios UI

✅ Resultado Esperado
    Este PR:
        *Mantiene la arquitectura
        *No degrada performance
        *No rompe reglas del equipo
        *Escala a largo plazo