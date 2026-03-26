# 📋 FlightList – Análisis arquitectónico y estrategia

**Proyecto:** AptoGantt  
**Última actualización:** 2026-02

---

## 🎯 Objetivo

Este documento describe el **flujo arquitectónico** del componente **FlightList**, por qué se unifica en un solo componente multiplataforma y cómo queda ubicado en **presentation/components** para reutilización (home + tablet).

---

## 📌 Situación actual

### Ubicación

- **Antes:** `presentation/screens/homeScreen/components/flight-list/`
- **Problema:** Es un componente de lista reutilizable que también se usará en la pantalla de tablet; no debería vivir dentro de una pantalla concreta.

### Variantes

| Archivo | Uso | Contenido |
|--------|-----|-----------|
| **flight-list.web.tsx** | Build web | Lista completa: búsqueda, orden, secciones (Meus Voos / Otros Voos), colapso, cards con design-system (Box, Chip, Tag, Text, TextField, Spinner), iconos Hangar web, styled-components, `useTheme`. |
| **flight-list.native.tsx** | Build native | Lista mínima: solo FlatList + Text/View de React Native, sin design-system. Es un stub, no la misma UI. |

### Flujo de datos (home-screen)

```
HomeScreen
  → useHomeController()        (flights, loading, selectedFlightId, selectedFlightIds, selectFlight)
  → useWindowDimensions()       (width para ancho del panel)
  → FlightList
       props: flights, loading, selectedFlightId, selectedFlightIds, onSelectFlight
  → Internamente: estado local (collapsed, searchQuery, orderBy), useTheme(), filtrado y ordenación
```

La lista no conoce Redux ni APIs; recibe todo por props. El controller (useHomeController) vive en la pantalla y podría vivir igual en la pantalla tablet.

---

## 🧠 Por qué un solo componente (sin .web / .native)

1. **Design-system ya resuelve la plataforma**  
   `Button`, `Text`, `Box`, `Chip`, `Tag`, `TextField`, `Spinner` se importan de `@/presentation/components/design-system`. En web Metro usa la variante `.web` y en native la `.native`. No hace falta duplicar la lógica de FlightList en dos archivos.

2. **Misma UI en todos los contextos**  
   La lista debe verse igual en:
   - Web desktop  
   - Web tablet  
   - Android (celular y tablet)  

   Un solo TSX que use solo design-system + React Native (FlatList, Pressable, useWindowDimensions) cumple eso sin separar por plataforma.

3. **La separación .web / .native era por Hangar**  
   Antes la diferencia era “Hangar web vs Hangar mobile”. Eso ya está encapsulado en la carpeta design-system; no hace falta reflejarlo de nuevo en FlightList.

4. **Excepciones mínimas**  
   Lo único que puede seguir siendo por plataforma son:
   - **Iconos:** si no están todos en el design-system, un barrel local `icons.web.ts` / `icons.native.ts` que reexporte los mismos nombres desde `@hangar/react-icons` y `@hangar/react-native-icons`.
   - **Estilos:** un solo **flight-list.styles.ts** compartido entre web y native; propiedades solo web (p. ej. `cursor`, `transition`) se ignoran en React Native sin problema.

---

## ✅ Estrategia adoptada

| Aspecto | Decisión |
|---------|----------|
| **Ubicación** | `presentation/components/flight-list/` (reutilizable por home y tablet). |
| **Archivo principal** | Un solo **flight-list.tsx** (sin .web / .native). |
| **UI** | Solo componentes de **design-system** + primitivos de **react-native** (FlatList, Pressable, useWindowDimensions). |
| **Iconos** | Barrel **icons.web.ts** / **icons.native.ts** que reexportan los mismos nombres desde Hangar (web y react-native-icons). El TSX importa desde `./icons`. |
| **Estilos** | Un solo **flight-list.styles.ts** con estilos compatibles con web y RN, o **.styles.web.ts** y **.styles.native.ts** si hace falta algo específico por plataforma. |
| **Tipos / eventos** | Evitar `ChangeEvent<HTMLInputElement>`. Callback de búsqueda como `(value: string) => void` y dentro del componente adaptar lo que devuelva el TextField del design-system (web: `event.target.value`, native: `event.nativeEvent.text` o similar). |
| **Constantes** | **flight-list.constants.ts** sin cambios; se reutiliza (p. ej. `getFlightListPanelWidth`). |

---

## 📁 Estructura objetivo

```
presentation/components/flight-list/
├── index.ts                    # export FlightList, getFlightListPanelWidth
├── flight-list.tsx             # componente único (usa design-system + ./icons)
├── flight-list.constants.ts
├── flight-list.styles.ts       # o .styles.web.ts + .styles.native.ts si se necesita
├── icons.web.ts                # re-export iconos @hangar/react-icons
└── icons.native.ts             # re-export iconos @hangar/react-native-icons (mismos nombres)
```

Las pantallas (home, tablet) importan:

```ts
import { FlightList, getFlightListPanelWidth } from '@/presentation/components/flight-list';
```

---

## 🔄 Flujo de datos (sin cambios conceptuales)

- **Props de FlightList:** `flights`, `loading`, `selectedFlightId`, `selectedFlightIds`, `onSelectFlight`.
- **Estado local de FlightList:** `collapsed`, `searchQuery`, `orderBy`, `expandedSections`.
- **Tema:** `useTheme()` (styled-components); en native debe existir ThemeProvider de styled-components/native para que los tokens sigan funcionando.
- **Controller:** Sigue en la pantalla (useHomeController en HomeScreen; en tablet se usará su propio controller o uno compartido que proporcione las mismas props).

---

## 🏁 Resumen

- **FlightList** pasa a ser un componente reutilizable en **presentation/components**.
- Un solo **flight-list.tsx** que usa **design-system** y un barrel de **iconos** por plataforma; no hace falta separar por .web / .native el componente en sí.
- La misma lista sirve para web desktop, web tablet y Android (celular y tablet).
- Home y tablet solo cambian el import a `@/presentation/components/flight-list`.
