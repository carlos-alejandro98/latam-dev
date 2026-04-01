# 🛠 Scripts del Design System – scripts/design-system

**Proyecto:** AptoGantt  
**Última actualización:** 2026-02

---

## 🎯 Objetivo de este documento

Explicar el **CLI y los scripts** que generan y verifican el wrapper del Design System: comandos disponibles, configuración, qué hace cada paso del pipeline y cómo añadir o modificar componentes cuando Hangar cambia.

---

## 📌 Qué hace este módulo

Los scripts en **`scripts/design-system/`**:

1. **Generan** los wrappers en `presentation/components/design-system/` a partir de una configuración (Hangar web + mobile).
2. **Verifican** tamaño de bundle y versión de Hangar.
3. **Detectan** cambios breaking en las props de los componentes (snapshot de props).

Todo es **auto-generado** a partir de **`config/design-system.config.ts`**. No se editan a mano los archivos generados en `presentation/components/design-system/` (salvo casos excepcionales).

---

## 📂 Estructura de la carpeta scripts/design-system

```
scripts/design-system/
├── cli/
│   ├── index.ts           # Punto de entrada: npm run ds
│   └── ds.command.ts      # Mapa de comandos (build, verify, props, check)
├── config/
│   └── design-system.config.ts   # Lista de componentes y rutas de Hangar
├── core/
│   ├── ast.service.ts     # Generación de tipos (props) desde Hangar
│   ├── template.service.ts # Plantilla de los wrappers .web / .native
│   └── file.service.ts   # Escritura de archivos solo si cambian
├── build.ts               # Genera wrappers, barrels y tipos
├── verify.ts              # Bundle size + snapshot versión Hangar
├── props-snapshot.ts      # Snapshot de props y detección de breaking changes
└── README.md              # Resumen rápido (este doc es la versión completa)
```

---

## 🖥 Comandos disponibles

Se ejecutan con **`npm run ds [comando]`**. Si no se pasa comando, se ejecuta el pipeline completo.

| Comando | Descripción |
|--------|-------------|
| `npm run ds` | **Pipeline completo:** build → verify → props |
| `npm run ds build` | Genera/actualiza todos los wrappers y barrels desde la config |
| `npm run ds verify` | Verifica tamaño del bundle (límite 200 KB) y avisa si cambió la versión de Hangar |
| `npm run ds props` | Genera o compara el snapshot de props; falla si hay breaking changes |
| `npm run ds check` | Ejecuta verify + props (sin build) |

---

## ⚙️ Configuración: design-system.config.ts

**Ubicación:** `scripts/design-system/config/design-system.config.ts`

Aquí se define **qué componentes** tiene el Design System y **desde dónde** se importan en Hangar.

### Interfaz de un componente

```ts
interface DesignSystemComponent {
  name: string;              // Nombre en PascalCase (ej. 'Button', 'CheckBox')
  webImportPath?: string;    // Ruta para web (ej. '@hangar/web-components/core/Button')
  nativeImportPath?: string; // Ruta para native (ej. '@hangar/mobile-components')
  hasChildren?: boolean;     // Opcional, para componentes con hijos
}
```

- **name:** Nombre del componente en el proyecto (y nombre de la carpeta en kebab-case).
- **webImportPath:** Si existe, se genera `nombre.web.tsx` y se exporta en `index.web.ts`. Puede ser un subpath (ej. `@hangar/web-components/core/Checkbox`). El último segmento del path se usa como nombre de export en Hangar (ej. `Checkbox` para CheckBox).
- **nativeImportPath:** Si existe, se genera `nombre.native.tsx` y se exporta en `index.native.ts`. Suele ser el paquete completo `@hangar/mobile-components`.
- Al menos uno de `webImportPath` o `nativeImportPath` debe estar definido.

### Ejemplo: añadir un componente nuevo

Si Hangar añade un componente **Accordion** y quieres exponerlo en el Design System:

1. Abrir **`scripts/design-system/config/design-system.config.ts`**.
2. Añadir un objeto en el array **`DESIGN_SYSTEM_COMPONENTS`**:

```ts
{
  name: 'Accordion',
  webImportPath: '@hangar/web-components/core/Accordion',
  nativeImportPath: '@hangar/mobile-components',
  hasChildren: true,  // opcional
}
```

3. Ejecutar **`npm run ds`** (o al menos **`npm run ds build`**).

Se crearán/actualizarán:

- `presentation/components/design-system/accordion/`
- `accordion.types.ts`, `accordion.web.tsx`, `accordion.native.tsx`, `index.ts`
- Y los barrels raíz `index.ts`, `index.web.ts`, `index.native.ts`.

### Casos frecuentes

| Caso | Config |
|------|--------|
| Solo web | Solo `webImportPath` (ej. Modal, Popover). |
| Solo native | Solo `nativeImportPath` (ej. Avatar, Menu). |
| Nombre distinto en Hangar | En web, el último segmento del path es el export real (ej. `.../Checkbox` → export `Checkbox` para el componente `CheckBox`). |

---

## 🔄 Pipeline paso a paso

### 1. Build (`build.ts`)

**Qué hace:**

1. Crea la carpeta base `presentation/components/design-system/` si no existe.
2. Por cada componente en la config:
   - Crea la carpeta del componente (kebab-case).
   - Genera **`nombre.types.ts`** (props desde Hangar vía `ComponentProps`).
   - Si tiene `webImportPath`, genera **`nombre.web.tsx`** (wrapper que importa desde Hangar web).
   - Si tiene `nativeImportPath`, genera **`nombre.native.tsx`** (wrapper que importa desde Hangar mobile).
   - Genera **`index.ts`** del componente (export del componente y tipos).
3. Genera el **barrel raíz** `index.ts` (export desde cada carpeta).
4. Genera **`index.web.ts`** e **`index.native.ts`** con rutas explícitas a cada `carpeta/archivo.web` o `carpeta/archivo.native`.
5. Valida que no falten ni sobren carpetas respecto a la config.

**Archivos que toca:** Todo lo que está bajo `presentation/components/design-system/` y tiene el comentario *Generated by ds:build*.

---

### 2. Verify (`verify.ts`)

**Qué hace:**

1. **Bundle size:** Empaqueta solo la variante web del Design System (con externals para react, react-dom, styled-components, @hangar/web-components) y comprueba que el tamaño no supere **200 KB**. Si se supera, el comando falla.
2. **Versión Hangar:** Lee las versiones de `@hangar/web-components` y `@hangar/mobile-components` del `package.json` y las compara con un snapshot guardado en **`scripts/design-system/.hangar-snapshot.json`**. Si cambió la versión, muestra un **warning** y sugiere ejecutar de nuevo **`npm run ds`**. No hace fallar el pipeline.

**No hace:** No comprueba que cada wrapper esté “en uso” en el código; los wrappers pueden existir sin usarse (p. ej. mientras los diseños siguen cambiando).

---

### 3. Props snapshot (`props-snapshot.ts`)

**Qué hace:**

1. **Genera** un snapshot de las props de cada componente leyendo los tipos desde Hangar (web o native según corresponda). El snapshot se guarda en **`scripts/design-system/.props-snapshot.json`**.
2. Si ya existe snapshot, **compara** el estado actual con el anterior:
   - **Falla** si se eliminó una prop, cambió su tipo o pasó de opcional a obligatoria (breaking).
   - **Avisa** (warning) si una prop pasó de obligatoria a opcional.

Así se detectan cambios breaking en Hangar al ejecutar **`npm run ds`** o **`npm run ds props`**.

**Si falla por breaking:** Revisar el mensaje (p. ej. “Prop X became required”), ajustar usos del componente en el proyecto y volver a ejecutar **`npm run ds props`** hasta que el snapshot se actualice y pase.

---

## 📄 Archivos generados (resumen)

| Ruta | Descripción |
|------|-------------|
| `presentation/components/design-system/<nombre>/` | Carpeta del componente (kebab-case). |
| `.../nombre.types.ts` | Tipos de props (alias de Hangar). |
| `.../nombre.web.tsx` | Wrapper web (si tiene `webImportPath`). |
| `.../nombre.native.tsx` | Wrapper native (si tiene `nativeImportPath`). |
| `.../index.ts` | Barrel del componente. |
| `presentation/components/design-system/index.ts` | Barrel raíz genérico. |
| `presentation/components/design-system/index.web.ts` | Barrel solo web. |
| `presentation/components/design-system/index.native.ts` | Barrel solo native. |

---

## 🔧 Cuando Hangar cambia

### Hangar añade un componente

1. Añadir el componente en **`config/design-system.config.ts`** (ver sección de configuración).
2. Ejecutar **`npm run ds`**.

### Hangar modifica un componente existente (p. ej. cambia props)

1. Actualizar dependencias si cambió la versión del paquete:  
   `npm update @hangar/web-components @hangar/mobile-components`
2. Ejecutar **`npm run ds`**.
3. Si **props** falla por breaking (prop eliminada, tipo distinto, required nuevo), corregir los usos en el proyecto y volver a ejecutar **`npm run ds props`** hasta que pase.

### Hangar actualiza versión (solo versión en package.json)

- Al ejecutar **`npm run ds`**, **verify** mostrará un warning indicando que la versión cambió y sugerirá ejecutar de nuevo **`npm run ds`**. No es necesario hacer nada más salvo volver a correr el pipeline si quieres regenerar todo y actualizar snapshots.

---

## 🚦 Reglas rápidas

| Acción | Comando o pasos |
|--------|------------------|
| Añadir componente nuevo | Editar config → `npm run ds` |
| Cambio de versión Hangar | `npm update` (si aplica) → `npm run ds` |
| Solo regenerar archivos | `npm run ds build` |
| Solo verificar (sin generar) | `npm run ds check` |
| Ver comandos | `npm run ds` sin argumentos (muestra ayuda si el comando no existe) |

---

## 🏁 Resumen

| Concepto | Resumen |
|----------|---------|
| **Entrada** | `npm run ds` (pipeline completo) o `npm run ds build | verify | props | check` |
| **Config** | `scripts/design-system/config/design-system.config.ts` |
| **Build** | Genera wrappers, tipos y barrels en `presentation/components/design-system/`. |
| **Verify** | Límite 200 KB de bundle web; aviso si cambia versión Hangar. |
| **Props** | Snapshot de props y detección de breaking changes. |
| **Añadir componente** | Objeto en la config con `name` y al menos `webImportPath` o `nativeImportPath` → `npm run ds`. |

La estructura resultante en **presentation** se documenta en **design-system-estructura.md**.
