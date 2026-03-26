# 📁 Estructura del Design System – presentation/components/design-system

**Proyecto:** AptoGantt  
**Última actualización:** 2026-02

---

## 🎯 Objetivo de este documento

Explicar cómo está organizada la carpeta **`presentation/components/design-system`**: qué archivos hay, para qué sirve cada uno, por qué existen tres barrels (`index.ts`, `index.web.ts`, `index.native.ts`) y cómo se debe importar el Design System en el resto del proyecto.

---

## 📌 Qué es esta carpeta

Es el **adaptador (wrapper)** del Design System basado en **Hangar** para el proyecto. No es Hangar en sí: es una capa que:

- Unifica el uso de **@hangar/web-components** (web) y **@hangar/mobile-components** (native).
- Expone una única API para el resto de la app (`Button`, `Text`, `Alert`, etc.).
- Permite cambiar o sustituir Hangar en el futuro sin tocar pantallas ni componentes de negocio.

**Regla de arquitectura:** En el proyecto **nunca** se importa directamente desde `@hangar/web-components` ni `@hangar/mobile-components`. Siempre se importa desde `@/presentation/components/design-system`.

---

## 📂 Árbol de la estructura

```
presentation/components/design-system/
├── index.ts              # Barrel genérico (exporta desde carpetas)
├── index.web.ts          # Barrel solo web (compatibilidad styled-components, etc.)
├── index.native.ts       # Barrel solo native (compatibilidad por plataforma)
│
├── alert/
│   ├── index.ts          # Re-exporta el componente y tipos
│   ├── alert.types.ts    # Tipos de props (alias de Hangar)
│   ├── alert.web.tsx     # Wrapper para web (Hangar web)
│   └── alert.native.tsx  # Wrapper para native (Hangar mobile)
│
├── button/
│   ├── index.ts
│   ├── button.types.ts
│   ├── button.web.tsx
│   └── button.native.tsx
│
├── text/
│   ├── index.ts
│   ├── text.types.ts
│   ├── text.web.tsx
│   └── text.native.tsx
│
└── ... (resto de componentes con la misma estructura)
```

Cada componente sigue el mismo patrón: una carpeta en **kebab-case** (ej. `check-box`, `icon-button`) con los archivos descritos abajo.

---

## 📄 Descripción de cada tipo de archivo

### 1. Barrel raíz: `index.ts`, `index.web.ts`, `index.native.ts`

| Archivo          | Uso | Contenido |
|------------------|-----|-----------|
| **index.ts**     | Barrel genérico. Exporta desde `./alert`, `./button`, etc. El bundler (Metro) resuelve luego la extensión `.web` o `.native` según la plataforma. | `export { Alert } from './alert';` |
| **index.web.ts** | Barrel **solo web**. Usado en builds web para cargar únicamente variantes `.web` y evitar dependencias de React Native / styled-components native. **Necesario para compatibilidad** (styled-components y demás). | `export { Alert } from './alert/alert.web';` |
| **index.native.ts** | Barrel **solo native**. Usado en builds mobile para cargar únicamente variantes `.native`. **Necesario para compatibilidad** por plataforma. | `export { Alert } from './alert/alert.native';` |

**Por qué tres barrels:**  
Si solo existiera `index.ts`, en algunos setups (p. ej. con styled-components u otras librerías con builds distintos para web y native) se pueden mezclar dependencias entre plataformas y romper el build. Los barrels `index.web.ts` e `index.native.ts` fuerzan que en web solo se use código web y en native solo código native, evitando esos conflictos.

---

### 2. Por cada componente: carpeta `nombre-componente/`

#### `index.ts` (dentro de la carpeta del componente)

- Re-exporta el componente y sus tipos.
- Apunta a `./nombre` (sin extensión) para que Metro elija `.web.tsx` o `.native.tsx` según la plataforma.

Ejemplo (`button/index.ts`):

```ts
export { Button } from './button';
export type { ButtonProps } from './button.types';
```

#### `nombre.types.ts` (ej. `button.types.ts`)

- Define el tipo de las props del componente.
- Se genera a partir de Hangar con `ComponentProps<typeof HangarComponent>`.
- **Auto-generado** por el script `ds build`. No editar a mano.

#### `nombre.web.tsx` (ej. `button.web.tsx`)

- Wrapper del componente para **web**.
- Importa desde **@hangar/web-components** y reexpone el componente con el mismo nombre y tipos del proyecto.
- **Auto-generado** por `ds build`. No editar a mano.

#### `nombre.native.tsx` (ej. `button.native.tsx`)

- Wrapper del componente para **native**.
- Importa desde **@hangar/mobile-components** y reexpone el componente.
- **Auto-generado** por `ds build`. No editar a mano.

**Nota:** Algunos componentes solo tienen `.web` (p. ej. Modal, Popover) o solo `.native` (p. ej. Avatar, Menu). Eso depende de la configuración en `scripts/design-system/config/design-system.config.ts`.

---

## 🔄 Cómo se resuelve la plataforma

1. La app importa: `import { Button, Text } from '@/presentation/components/design-system'`.
2. Según el build (web o native), el bundler usa:
   - **Web:** `index.web.ts` → exporta desde `./button/button.web`, etc.
   - **Native:** `index.native.ts` → exporta desde `./button/button.native`, etc.
3. Así solo entra en el bundle la variante correcta y se evitan conflictos de dependencias entre web y native.

---

## ✅ Reglas de uso

| Regla | Descripción |
|-------|-------------|
| **Siempre importar desde el wrapper** | `import { Button } from '@/presentation/components/design-system'` |
| **Nunca importar Hangar directo** | No usar `import { Button } from '@hangar/web-components/...'` en screens ni componentes de negocio. |
| **No editar archivos auto-generados** | Los que tienen el comentario `Generated by ds:build` se regeneran con `npm run ds`. |
| **Solo wrappers** | Esta carpeta no debe contener lógica de negocio ni estado de dominio; solo componentes de UI que delegan en Hangar. |

---

## 📐 Relación con el resto del proyecto

```
presentation/
├── components/
│   ├── design-system/     ← Solo wrappers Hangar (esta carpeta)
│   └── business/          ← Componentes de negocio (FlightCard, etc.) que SÍ importan del design-system
├── screens/                ← Pantallas que importan del design-system o de business
└── ...
```

Los componentes de negocio y las pantallas importan desde `@/presentation/components/design-system`; no deben importar desde Hangar.

---

## 🏁 Resumen

| Concepto | Resumen |
|----------|---------|
| **Qué es** | Adaptador de Hangar para web + native en un solo API. |
| **Estructura** | Una carpeta por componente (kebab-case) con `index.ts`, `*.types.ts`, `*.web.tsx`, `*.native.tsx`. |
| **Tres barrels** | `index.ts` genérico; `index.web.ts` e `index.native.ts` para compatibilidad y builds por plataforma. |
| **Archivos** | Casi todo es auto-generado por `npm run ds`; no editar manualmente los que indican `ds:build`. |
| **Uso** | Siempre `from '@/presentation/components/design-system'`; nunca desde Hangar directo. |

Para añadir componentes nuevos o cambiar la configuración, se usa la config y los scripts documentados en **design-system-scripts.md**.
