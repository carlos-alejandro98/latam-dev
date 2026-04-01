📱🌐 **Web vs Mobile – Estrategia de Plataforma**
    **Proyecto**: AptoGantt Frontend
    **Stack**: React Native (Expo)
    **Arquitectura**: Clean Architecture + Hexagonal
    **Última actualización**: 2026‑01

# 🎯 Objetivo de este documento
Definir claramente:
    -Qué diferencias existen entre **Web y Mobile**
    -Dónde se toman esas decisiones (configuración vs UI)
    -Qué está permitido y qué NO
    -Cómo evitar condicionales caóticos en componentes
    -Cómo escalar a nuevas plataformas sin deuda técnica
    
🧠 Principio Fundamental **(NO negociable)**
    **Las diferencias entre Web y Mobile se resuelven en CONFIGURACIÓN e INFRAESTRUCTURA,**
    **NO en los componentes de UI.**

Si ves muchos:

`Platform.OS === 'web'`

en screens → 🚨 **mal síntoma.**

# 🧱 Plataformas soportadas
## Plataforma	   Soporte
   Web (Expo Web)	 ✅
   Android	         ✅
   iOS	             ✅

Todas comparten **el mismo código base.**

# 🧩 Dónde se decide la plataforma
✅ Archivo oficial
config/platform.ts

`import { Platform } from 'react-native';`
``
`export type PlatformType = 'web' | 'mobile';`
``
`export const PLATFORM: PlatformType =`
`  Platform.OS === 'web' ? 'web' : 'mobile';`
``
`export const IS_WEB = PLATFORM === 'web';`
`export const IS_MOBILE = PLATFORM === 'mobile';`

# 📌 Regla de equipo
❌ No usar Platform.OS directamente en componentes
✅ Usar siempre IS_WEB / IS_MOBILE

# 🌍 Diferencias FUNCIONALES entre Web y Mobile
## ✅ Funcionalidades SOLO Web
    -Hotkeys / shortcuts (FlightGanttHotkey.tsx)
    -Hover interactions
    -Navegación con teclado
    -Viewports grandes

## ✅ Funcionalidades SOLO Mobile
    -Haptics
    -Gestures nativas
    -SafeArea
    -Optimización agresiva de memoria

# 🎛 Feature flags por plataforma
## 📁 Configuración centralizada

config/features.ts

`import { IS_WEB } from './platform';`
``
`export const FEATURES = {`
`  enableHotkeys: IS_WEB,`
`  enableHoverInteractions: IS_WEB,`
`  enableNativeHaptics: !IS_WEB,`
`};`

## ✅ Uso correcto

`if (FEATURES.enableHotkeys) {`
`  // lógica web`
`}`

❌ No condicionales por plataforma en UI directamente

# 🌐 APIs por plataforma (caso real)

En algunos escenarios:
    -Web → API con CORS / BFF
    -Mobile → API directa

## ✅ Decisión en configuración, NO en repositorios

// config/environment.ts
`import { IS_WEB } from './platform';`
``
`export const ENV = {`
`  flightsApiBaseUrl: IS_WEB`
`    ? process.env.EXPO_PUBLIC_FLIGHTS_API_BASE_URL_WEB`
`    : process.env.EXPO_PUBLIC_FLIGHTS_API_BASE_URL,`
`};`

📌 FlightApiRepository no sabe si es web o mobile.

# ⚡ Performance por plataforma
## ✅ Configuración global de FlatList

// shared/constants/flatlist-config.ts
`import { IS_WEB } from '@/config/platform';`
``
`export const DEFAULT_FLATLIST_CONFIG = {`
`  removeClippedSubviews: !IS_WEB,`
`  initialNumToRender: IS_WEB ? 20 : 10,`
`  maxToRenderPerBatch: IS_WEB ? 10 : 5,`
`  windowSize: IS_WEB ? 7 : 5,`
`};`

📌 La UI **no decide performance**, la plataforma sí.

# 🎨 Layout y UX
    -Web:
        *Máximo ancho
        *Hover
        *Scroll largo
    -Mobile:
        *SafeArea
        *Touch-first
        *Menor densidad visual

👉 Estas decisiones deben ir en **config/layout**.ts, no en componentes.

# 🚫 Antipatterns (NO permitidos)

    ❌ Platform.OS en cada screen
    ❌ Duplicar componentes WebComponent / MobileComponent
    ❌ Decidir APIs en UI
    ❌ Lógica de negocio dependiente de plataforma

# ✅ Checklist para nuevas features

Antes de implementar algo nuevo, pregúntate:

    -¿Funciona igual en Web y Mobile?
    -¿Debe estar detrás de un feature flag?
    -¿Es una decisión de plataforma o de UI?
    -¿Puedo resolverlo en config/?

Si la respuesta es “sí” → **no va en el componente.**

# 🏁 Conclusión
Esta estrategia:

    ✔ Evita condicionales desordenados
    ✔ Escala a Web + Mobile sin duplicar código
    ✔ Mantiene Clean Architecture
    ✔ Facilita onboarding
    ✔ Reduce deuda técnica a largo plazo

**Una sola base de código.**
**Múltiples plataformas.**
**Decisiones claras.**

