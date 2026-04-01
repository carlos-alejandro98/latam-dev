❗ **Error Handling & Logging**
    **Proyecto**: AptoGantt Frontend
    **Stack**: React Native (Expo)
    **Arquitectura**: Clean Architecture + Hexagonal
    **Última actualización**: 2026‑01

# 🎯 Objetivo de este documento

Definir **cómo se manejan los errores en el proyecto**, de forma que:

    -Los errores sean predecibles
    -El usuario tenga mensajes claros
    -El equipo tenga contexto para debugging
    -La arquitectura no se degrade
    -El dominio no dependa de la UI

# 🧠 Principio Fundamental (NO negociable)

   **Los errores son parte del dominio, no de la UI.**

La UI **muestra errores**,
pero **NO decide qué error existe.**

# 🧱 Tipos de Errores en el Proyecto
En el proyecto distinguimos **4 tipos de errores**, cada uno con su lugar claro.

## 1️⃣ Errores de Dominio (Business Errors) ✅
### Qué son
Errores que representan **reglas del negocio.**

Ejemplos:
    -Vuelo no encontrado
    -Gantt ya iniciado
    -Operación no permitida
    -Estado inválido de vuelo

## 📍 Dónde viven

domain/errors/

## ✅ Ejemplo correcto

// domain/errors/flight-error.ts
`export class FlightError extends Error {`
    `constructor(`
        `message: string,`
        `public readonly code: string`
    `) {`
        `super(message);`
        `this.name = 'FlightError';`
    `}`
`}`

✅ Son semánticos
✅ Tienen código
✅ No dependen de React ni Redux

## 2️⃣ Errores de Aplicación (Use Case Errors)
### Qué son
Errores que ocurren **durante la ejecución de un caso de uso.**

Ejemplos:

    -Error al obtener vuelos
    -Error al iniciar Gantt
    -Error de validación previa

## 📍 Dónde se manejan

application/useCases/
✅ Ejemplo correcto

`import { FlightError } from '@/domain/errors/flight-error';`
``
`export class GetActiveFlightsUseCase {`
    `async execute(): Promise<Flight[]> {`
        `try {`
            `return await this.flightRepo.getActiveFlights();`
        `} catch (error) {`
            `throw new FlightError(`
                `'Unable to load active flights',`
                `'FLIGHTS_LOAD_FAILED'`
            `);`
        `}`
    `}`
`}`

### 📌 El caso de uso:
    -Traduce errores técnicos → errores de dominio
    -NO expone Axios errors
    -NO expone mensajes crudos

## 3️⃣ Errores de Infraestructura (Technical Errors)
### Qué son
Errores provenientes de:
    -Axios
    -Network
    -Timeouts
    -APIs externas

## 📍 Dónde viven

infrastructure/

## ✅ Regla clave
❌ **Nunca** propagar errores de Axios a la UI
✅ Siempre encapsularlos

Ejemplo:

// infrastructure/api/flight-api-repository.ts

`async getActiveFlights() {`
    `try {`
        `return await httpGet<Flight[]>('/api/v1/tracking/active-flights-v2');`
    `} catch (error) {`
        `throw error; // será traducido en el use case`
    `}`
`}`

## 📌 La infraestructura NO decide mensajes de usuario.

## 4️⃣ Errores de UI (Presentation Errors)
### Qué son
Errores visuales o de experiencia.

Ejemplos:
    -ErrorBoundary
    -Pantalla de fallback
    -Mensajes de error amigables

### 📍 Dónde viven
presentation/

### ✅ Error Boundary recomendado
// presentation/components/error-boundary.tsx

`export class ErrorBoundary extends React.Component<`
    `React.PropsWithChildren,`
    `{ hasError: boolean }`
    ``
    `> {`
    `> state = { hasError: false };`
    ``
    `static getDerivedStateFromError() {`
        `return { hasError: true };`
    `}`
    ``
    `render() {`
    `if (this.state.hasError) {`
        `return <Text>Something went wrong</Text>;`
    `}`
    ``
    `    return this.props.children;`
    ``
    `}`
`}`

### 📌 Nunca mostrar stack traces al usuario.

## 🔄 Flujo Correcto de Errores (end‑to‑end)

    Infrastructure (Axios error)
    ↓
    Use Case (traduce a error de dominio)
    ↓
    Redux (almacena error semántico)
    ↓
    Adapter
    ↓
    Controller
    ↓
    UI (mensaje amigable)

❌ Nunca al revés
❌ Nunca saltarse capas

# 🟪 Redux y Errores
## ✅ Estado de error en slices

`interface FlightsState {`
    `data: Flight[];`
    `loading: boolean;`
    `error?: string;`
`}`

## ✅ Manejo en reducer

`.addCase(fetchActiveFlights.rejected, (state, action) => {`
    `state.loading = false;`
    `state.error = action.error.message;`
`});`

### 📌 Redux NO genera errores, solo los almacena.

# 🎮 Controllers y Errores
Los controllers:
    -NO crean errores
    -NO hacen lógica
    -Solo exponen estado a la UI

`export const useHomeController = () => {`
    `const { flights, loading, error } = useFlightsStoreAdapter();`
    `return { flights, loading, error };`
`};`

# 🖥 UI y Mensajes de Error
## ✅ Ejemplo correcto

`if (error) {`
    `return <Text>{error}</Text>;`
`}`

📌 El mensaje viene ya “traducido” desde el dominio.

# 📋 Logging (Producción)
## ✅ Logger central (recomendado)

// shared/utils/logger.ts
`import { ENV } from '@/config/environment';`

`export const logger = {`
    `error: (message: string, context?: unknown) => {`
        `console.error(message, context);`
    `},`
`};`

## ✅ Dónde logear
✅ Use cases (errores críticos)
✅ Infrastructure (errores técnicos)

❌ UI
❌ Components

# 🔐 Seguridad (CRÍTICO)
❌ No mostrar:
    -Stack traces
    -Mensajes de Axios
    -Errores crudos de backend

✅ Mostrar:
    -Mensajes claros
    -Textos de negocio
    -Códigos internos solo para logs

# 🚫 Antipatterns (NO permitidos)
❌ catch(error) { return error; }
❌ console.log(error) en UI
❌ Mostrar error.message de Axios directamente
❌ Lógica de errores en componentes

# ✅ Checklist rápido
Antes de subir un PR:
    [ ] ¿El error es de dominio?
    [ ] ¿Se traduce en el use case?
    [ ] ¿Redux solo lo almacena?
    [ ] ¿La UI solo lo muestra?
    [ ] ¿No se expone error técnico?

Si alguna respuesta es ❌ → **PR NO aprobado.**

# 🏁 Conclusión
Este manejo de errores:
    ✔ Protege al usuario
    ✔ Protege la arquitectura
    ✔ Facilita debugging
    ✔ Escala a tiempo real
    ✔ Evita deuda técnica

**Un error bien manejado es parte de un sistema confiable.**