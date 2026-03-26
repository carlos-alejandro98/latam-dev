⚙️ Configuration & Environments
Proyecto: AptoGantt Frontend
Stack: React Native (Expo)
Última actualización: 2026-01

🎯 Objetivo de esta documentación
Explicar cómo funciona la configuración de entornos en el proyecto y responder claramente a:

    *¿Qué es .env y qué NO es?
    *¿Por qué existe config/environment.ts?
    *¿Cómo cambiar URLs en producción?
    *¿Qué pasa si tengo múltiples APIs?
    *¿Cuándo necesito PR y cuándo NO?
    *¿Por qué siempre hay que recompilar en mobile?

🧠 Idea clave (leer primero)
🔑 En aplicaciones móviles, la configuración se inyecta en build time, no en runtime.
Por eso:

    ✅ Cambiar configuración mobile ⇒ rebuild
    ❌ Cambiar configuración web ⇒ NO necesariamente PR

📁 Archivos involucrados

✅ .env (archivo, NO carpeta)
*Archivo de texto plano
*Vive en la raíz del proyecto
*❌ NO se sube al repositorio
*✅ Contiene valores reales por entorno
Ejemplo:

    .env

        EXPO_PUBLIC_API_BASE_URL=https://api.prod.com
        EXPO_PUBLIC_ENV=production
        EXPO_PUBLIC_ENABLE_LOGS=false

✅ .env.example
*✅ SÍ se sube al repo
*❌ NO se usa en runtime
\*Sirve como documentación y onboarding

    .env.example

        EXPO_PUBLIC_API_BASE_URL=https://api.example.com
        EXPO_PUBLIC_ENV=development
        EXPO_PUBLIC_ENABLE_LOGS=true

✅ config/environment.ts
Archivo de código que:

    *Lee variables desde process.env
    *Las centraliza
    *Las tipa
    *Las valida
    *Falla rápido si falta algo

ej:
interface EnvironmentConfig {
apiBaseUrl: string;
environment: 'development' | 'production';
enableLogs: boolean;
}

        export const ENV: EnvironmentConfig = {
          apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL as string,
          environment: process.env.EXPO_PUBLIC_ENV as EnvironmentConfig['environment'],
          enableLogs: process.env.EXPO_PUBLIC_ENABLE_LOGS === 'true',
        };

        if (!ENV.apiBaseUrl) {
          throw new Error('EXPO_PUBLIC_API_BASE_URL is required');
        }

📌 Regla de oro:
❌ Nunca usar process.env fuera de este archivo.
✅ Toda la app consume configuración desde ENV.

🔗 Flujo completo de configuración

    .env (valores reales, fuera del repo)
    ↓
    Expo build
    ↓
    process.env.EXPO_PUBLIC_*
    ↓
    config/environment.ts
    ↓
    ENV (objeto tipado)
    ↓
    HttpClient
    ↓
    API calls

🌍 Múltiples APIs / Base URLs
Es completamente normal que el proyecto tenga más de un backend.

Ejemplos:

    *API de vuelos
    *API de tareas
    *API de autenticación
    *APIs de terceros

✅ Definición en .env
.env

    EXPO_PUBLIC_FLIGHTS_API_BASE_URL=https://api.flights.prod.com
    EXPO_PUBLIC_TASKS_API_BASE_URL=https://api.tasks.prod.com
    EXPO_PUBLIC_AUTH_API_BASE_URL=https://api.auth.prod.com

    EXPO_PUBLIC_ENV=production
    EXPO_PUBLIC_ENABLE_LOGS=false

✅ Centralización en environment.ts

    interface EnvironmentConfig {
    environment: 'development' | 'production';
    enableLogs: boolean;

    flightsApiBaseUrl: string;
    tasksApiBaseUrl: string;
    authApiBaseUrl: string;
    }

    export const ENV: EnvironmentConfig = {
    environment: process.env.EXPO_PUBLIC_ENV as EnvironmentConfig['environment'],
    enableLogs: process.env.EXPO_PUBLIC_ENABLE_LOGS === 'true',

    flightsApiBaseUrl:
        process.env.EXPO_PUBLIC_FLIGHTS_API_BASE_URL as string,
    tasksApiBaseUrl:
        process.env.EXPO_PUBLIC_TASKS_API_BASE_URL as string,
    authApiBaseUrl:
        process.env.EXPO_PUBLIC_AUTH_API_BASE_URL as string,
    };

    // Fail fast
    Object.entries(ENV).forEach(([key, value]) => {
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    });

✅ Un HttpClient por API (infraestructura)

// infrastructure/http/flights-http-client.ts

    import axios from 'axios';
    import { ENV } from '@/config/environment';

    export const FlightsHttpClient = axios.create({
    baseURL: ENV.flightsApiBaseUrl,
    timeout: 10000,
    });

📌 Regla:
❌ No reutilizar el mismo Axios para APIs distintas.

🚀 Producción: ¿qué pasa cuando cambia la base URL?
✅ Hecho importante (mobile)
📱 En mobile SIEMPRE hay que recompilar para cambiar configuración.
Esto es una limitación de la plataforma, no del proyecto.

✅ Caso correcto (sin PR)
El backend cambia de:

    https://api.prod.com

a:

    https://api.prod-v2.com

Pasos: 1. Cambiar la variable de entorno en el entorno de build
.env
EXPO_PUBLIC_API_BASE_URL=https://api.prod-v2.com

    2. Ejecutar un nuevo build:
       en termminal
        eas build --profile production

    3. Subir el APK / AAB a Google Play

✅ NO hay cambios de código
✅ NO hay PR
✅ Solo nuevo build

❌ Cuándo SÍ necesitas PR
Cambio ¿PR?
Cambio de dominio / IP ❌
Cambio de entorno ❌
Nuevo endpoint ✅
Cambio de contrato de API ✅
Nueva feature ✅

🧩 ¿Dónde agregar nuevas variables?
👉 Siempre en ambos lugares, cada uno con su rol.

✅ Regla clara

        Lugar	            Rol
        .env	        Define valores
    environment.ts	    Lee, tipa y valida

✅ Ejemplo: agregar Sentry
.env

    EXPO_PUBLIC_SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/123

environment.ts

    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN as string,

❌ Nunca acceder directamente a process.env desde otros archivos.

🔐 Seguridad
❌ Nunca hardcodear URLs, tokens o claves
✅ Usar siempre variables de entorno
✅ Rotar valores sin tocar código
✅ .env nunca se sube al repo

✅ Resumen final (para el equipo)
✔ .env es un archivo, no una carpeta
✔ .env define valores, no lógica
✔ environment.ts centraliza y valida
✔ Cambios de configuración ⇒ rebuild obligatorio
✔ Cambios de configuración ⇒ NO requieren PR
✔ Cambios de lógica ⇒ SÍ requieren PR

# ⚙️ Creación Automática del archivo .env

El proyecto genera automáticamente el archivo **.env** a partir de **.env.example** durante la ejecución de:

`npm install`

Esta generación ocurre **únicamente si el archivo .env no existe previamente.**

# 🎯 Objetivo

Este mecanismo tiene como finalidad:

    - Evitar que cada nuevo desarrollador tenga que crear el archivo .env manualmente
    - Reducir errores humanos durante el onboarding
    - Mantener una experiencia de desarrollo consistente en todo el equipo
    - Respetar las políticas de seguridad del proyecto

# 🧠 Cómo funciona

    - .env.example actúa como plantilla versionada y documentada
    - Durante npm install, un script verifica si existe el archivo .env
    - Si no existe, se crea automáticamente copiando el contenido de .env.example
    - Si ya existe, no se sobrescribe bajo ninguna circunstancia

## 📌 Cada desarrollador puede luego ajustar los valores de su .env local según su entorno (dev, QA, prod, etc.).

# 🔐 Seguridad

    ❌ El archivo .env NUNCA se sube al repositorio
    ✅ Solo .env.example es versionado
    ✅ No se incluyen secretos reales en el repositorio
    ✅ En CI/CD y producción, las variables se definen directamente en el pipeline o proveedor de build

Este enfoque cumple con las reglas de seguridad y manejo de secretos definidas en el proyecto.

# ✅ Beneficios

    ✔ Onboarding rápido para nuevos desarrolladores
    ✔ Configuración consistente entre entornos
    ✔ Cero riesgo de exponer secretos en Git
    ✔ Compatible con CI/CD
    ✔ Escalable para equipos grandes

## 📌 Nota importante

La creación automática del .env **no reemplaza** la responsabilidad del desarrollador de: - Revisar los valores generados - Ajustarlos según su entorno local - Asegurarse de que las variables requeridas estén correctamente definidas

# 🏁 Resumen

**.env.example define la estructura.**
**.env define los valores locales.**
**El proyecto automatiza el proceso sin comprometer seguridad.**

🏁 Conclusión
Este sistema de configuración:

    Cumple las reglas de seguridad (8.2)
    Escala a múltiples APIs
    Evita PRs innecesarios
    Es estándar en apps móviles grandes
    Reduce errores humanos en producción

El código no debe cambiar cuando cambia la infraestructura.
