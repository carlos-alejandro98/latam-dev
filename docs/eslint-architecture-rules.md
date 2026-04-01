🧱 ESLint – Reglas Arquitectónicas del Proyecto
Proyecto: AptoGantt Frontend
Stack: React Native (Expo) + TypeScript
Arquitectura: Clean Architecture + Hexagonal
Última actualización: 2026‑01

🎯 Objetivo de este documento
Este documento explica POR QUÉ existen ciertas reglas de ESLint en el proyecto.

📌 Si ESLint falla, NO es un problema de estilo.
📌 Es una violación arquitectónica.

Las reglas aquí descritas:

Protegen la arquitectura
Evitan bugs reales
Eliminan decisiones subjetivas en PR
Hacen que el repositorio se “defienda solo”
🧠 Principio clave
ESLint no solo valida código.
ESLint valida arquitectura.

No usamos ESLint para:

Formato
Opiniones personales
Preferencias individuales
✅ Usamos ESLint para:

Hacer cumplir Clean Architecture
Evitar acoplamientos peligrosos
Mantener el proyecto escalable en el tiempo
🧱 Capas y Dependencias Permitidas
Flujo OBLIGATORIO de dependencias:

text

Screen
↓
Controller (Hook)
↓
Application (Use Case)
↓
Domain
Y para accesos externos:

text

Use Case
↓
Port
↓
Adapter (Redux / API)
📌 Nunca al revés.

🟦 Domain – Núcleo del Negocio (REGLA CRÍTICA)
✅ Qué PUEDE hacer
Definir entidades
Definir errores de dominio
Definir interfaces puras
❌ Qué NO puede hacer (bloqueado por ESLint)
Importar React / React Native
Importar Redux
Importar Axios
Importar infrastructure
Importar presentation
Importar shared utils
📌 El dominio debe ser 100% puro y portable.

Si ESLint falla aquí → la arquitectura está siendo violada.

🟩 Application – Casos de Uso
✅ Permitido
Importar Domain
Importar Ports
Orquestar reglas de negocio
❌ Prohibido
Importar Redux
Importar presentation
Importar infrastructure
Importar shared utilities
📌 Los casos de uso deciden QUÉ hacer, no CÓMO hacerlo.

🟨 Presentation – UI, Controllers y Adapters
Screens
✅ Usan Controllers
❌ No importan Redux
❌ No importan APIs
❌ No importan container

Controllers (Hooks)
✅ Importan adapters
✅ Adaptan datos a la UI
❌ No importan infrastructure
❌ No importan store
❌ No importan container

📌 Controllers adaptan, no deciden negocio.

🔌 Redux – Encapsulación Obligatoria
Regla CRÍTICA
Redux NUNCA se importa directamente fuera de:

presentation/adapters/redux/

ESLint bloquea:

@/store/**
../store/**
en:

Screens
Controllers
Application
Domain
📌 Redux es un detalle de implementación, no parte del negocio.

⚙️ Dependency Injection (container)
✅ Uso permitido SOLO en:
store/
dependencyInjection/
❌ Prohibido en:
Screens
Controllers
Application
Tests unitarios
📌 Importar container en UI dispara ENV y rompe tests.
ESLint lo bloquea automáticamente.

🔐 Variables de Entorno (process.env)
Regla absoluta
❌ Nunca usar process.env directamente
✅ Usar config/environment.ts

ESLint bloquea cualquier acceso a:

ts

process.env.\*
excepto en:

ts

config/environment.ts
📌 Esto garantiza:

Seguridad
Centralización
Fallo rápido
Tests estables
🟥 Infrastructure – Detalles Técnicos
✅ Permitido
Implementar ports
Usar Axios
Usar HttpClient
Usar ENV
❌ Prohibido
Importar desde UI
Importar desde controllers
Importar desde application
📌 La UI nunca conoce infraestructura.

⚡ Performance – Regla FlatList (CRÍTICA)
ESLint bloquea automáticamente en presentation/screens:

❌

ts

items.map(...)
items.filter(...).map(...)
✅

tsx

<FlatList
  data={items}
  keyExtractor={...}
  renderItem={...}
/>
📌 Esto es obligatorio por:

Performance mobile
Memoria
Scroll fluido
Listas grandes (Gantt, vuelos, tareas)
🧪 Tests – Reglas Importantes
Tests unitarios
✅ Mockear dependencias
✅ Testear una capa a la vez

❌ No importar:

container
store
infrastructure (excepto tests de infra)
📌 Si un test dispara ENV, está mal aislado.

🧠 Shared – Qué SÍ y qué NO
✅ Permitido
shared/constants en UI (ej: FlatList config)
shared/types en presentation
❌ Prohibido
shared/ en domain
shared/ en application
📌 El core del negocio no depende de utilidades transversales.

🚨 ¿Qué hacer cuando ESLint falla?
Leer el mensaje completo
Identificar:
¿Qué capa soy?
¿Qué capa estoy intentando importar?
Revisar el flujo arquitectónico
Mover la lógica a la capa correcta
❌ NO desactivar la regla
Si dudas: 👉 Consulta docs/arquitectura-proyecto.md
👉 Consulta docs/new-feature-guide.md

✅ Resumen Final
Este sistema de ESLint:

✅ Protege la arquitectura
✅ Evita errores humanos
✅ Reduce bugs en producción
✅ Facilita testing
✅ Hace PRs objetivos
✅ Escala a equipos grandes
Si ESLint falla, el código NO se mergea.
No es negociable.

🏁 Nota final para el equipo
No buscamos perfección académica.
Buscamos claridad, orden y sostenibilidad.

La UI cambia.
Las librerías cambian.
El negocio debe sobrevivir a todo eso.
