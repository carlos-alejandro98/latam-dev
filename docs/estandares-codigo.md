---
description: Estándares y convenciones de código
globs: '**/*.{ts,tsx,js,jsx}'
alwaysApply: false
---

# Estándares de código

Guía de Estándares de Código – React / React Native
Creado por Jose Antonio Guerrero Torrijo (STEFANINI), actualizado por última vez el sept 15, 2025 9 min de lectura

1. Convenciones de Nomenclatura
   1.1 Variables y Funciones
   1.1.1: Usar camelCase para variables y funciones
   1.1.2: Nombres descriptivos y en inglés
   1.1.3: Evitar abreviaciones innecesarias
   // ✅ Correcto
   const userEmail = 'user@example.com';
   function calculateTotalPrice() {}

// ❌ Incorrecto
const usrEml = 'user@example.com';
function calcTotPrc() {}
1.2 Constantes
1.2.1: Usar SCREAMING_SNAKE_CASE para constantes globales
1.2.2: Agrupar constantes relacionadas en objetos
// ✅ Correcto
const API_BASE_URL = 'https://api.flybag.com';
const CONFIG = {
MAX_FILE_SIZE: 5000000,
ALLOWED_EXTENSIONS: ['.jpg', '.png']
};
1.3 Componentes y Clases
1.3.1: Usar PascalCase para componentes React y clases
1.3.2: Nombres que reflejen la responsabilidad del componente
// ✅ Correcto
class UserService {}
const FlightBookingForm = () => {}

// ❌ Incorrecto
class userservice {}
const flightbookingform = () => {}
1.4 Archivos y Directorios
1.4.1: Usar kebab-case para nombres de archivos
1.4.2: Usar camelCase para directorios de funcionalidades
1.4.3: Extensiones apropiadas (.ts, .tsx, .js, .jsx)
✅ Correcto:
src/
components/
flight-booking-form.tsx
user-profile.tsx
services/
api-client.ts

❌ Incorrecto:
src/
Components/
FlightBookingForm.tsx
UserProfile.tsx 2. Estructura de Código
2.1 Imports y Exports
2.1.1: Agrupar imports: librerías externas → internas → relativos
2.1.2: Usar named exports por defecto
2.1.3: Ordenar imports alfabéticamente dentro de cada grupo
// ✅ Correcto
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { apiClient } from '@/services/api-client';
import { formatDate } from '@/utils/date-helpers';

import './flight-booking-form.css';
2.2 Funciones
2.2.1: Máximo 20 líneas por función
2.2.2: Una responsabilidad por función
2.2.3: Preferir arrow functions para funciones pequeñas
// ✅ Correcto
const calculateTax = (amount: number): number => {
return amount \* 0.16;
};

// ✅ Correcto para funciones complejas
function processFlightBooking(bookingData: BookingData): Promise<BookingResult> {
// Lógica compleja aquí
return result;
}
2.3 Componentes React
2.3.1: Máximo 200 líneas por componente
2.3.2: Extraer lógica compleja a custom hooks
2.3.3: Props type debe estar definida antes del componente
// ✅ Correcto
type FlightCardProps {
flight: Flight;
onSelect: (flightId: string) => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, onSelect }) => {
// Implementación
}; 3. TypeScript
3.1 Tipos e Interfaces
3.1.1: Preferir interfaces sobre types para objetos
3.1.2: Usar PascalCase para nombres de tipos e interfaces
3.1.3: Evitar any, usar unknown si es necesario
// ✅ Correcto
interface User {
id: string;
email: string;
profile?: UserProfile;
}

type Status = 'pending' | 'approved' | 'rejected';

// ❌ Incorrecto
interface user {
id: any;
email: any;
}
3.2 Anotaciones de Tipo
3.2.1: Anotar parámetros de función explícitamente
3.2.2: Permitir inferencia para variables simples
3.2.3: Anotar tipos de retorno para funciones públicas
// ✅ Correcto
function findUserById(id: string): Promise<User | null> {
const users = getUsers(); // Tipo inferido
return users.find(user => user.id === id) || null;
} 4. Comentarios y Documentación
4.1 Comentarios de Código
4.1.1: Comentar el "por qué", no el "qué"
4.1.2: Actualizar comentarios al cambiar código
4.1.3: Evitar comentarios obvios
// ✅ Correcto
// Aplicamos descuento especial para vuelos de madrugada para incentivar reservas
if (flight.departureTime < 6) {
price \*= 0.8;
}

// ❌ Incorrecto
// Multiplica el precio por 0.8
price \*= 0.8;
4.2 JSDoc
4.2.1: Documentar todas las funciones públicas con JSDoc
4.2.2: Incluir ejemplos para funciones complejas
4.2.3: Documentar parámetros y valores de retorno
/\*\*

- Calcula el precio final de un vuelo incluyendo impuestos y descuentos
- @param basePrice - Precio base del vuelo
- @param taxRate - Tasa de impuesto (0.16 por defecto)
- @param discountCode - Código de descuento opcional
- @returns Precio final calculado
- @example
- ```typescript

  ```
- const finalPrice = calculateFlightPrice(299.99, 0.16, 'SUMMER20');
- ```
   */
  function calculateFlightPrice(
    basePrice: number,
    taxRate: number = 0.16,
    discountCode?: string
  ): number {
    // Implementación
  }
  ```

5. Control de Errores
   5.1 Manejo de Errores
   5.1.1: Usar try-catch para operaciones que pueden fallar
   5.1.2: Crear clases de error específicas para el dominio
   5.1.3: Logear errores con contexto suficiente
   // ✅ Correcto
   class FlightBookingError extends Error {
   constructor(message: string, public code: string) {
   super(message);
   this.name = 'FlightBookingError';
   }
   }

async function bookFlight(flightId: string): Promise<BookingResult> {
try {
const result = await apiClient.bookFlight(flightId);
return result;
} catch (error) {
logger.error('Error booking flight', { flightId, error });
throw new FlightBookingError('Unable to book flight', 'BOOKING_FAILED');
}
}
5.2 Validación
5.2.1: Validar entrada en funciones públicas
5.2.2: Usar bibliotecas de validación (Zod, Yup)
5.2.3: Fallar rápido con mensajes claros
// ✅ Correcto
import { z } from 'zod';

const FlightSearchSchema = z.object({
origin: z.string().min(3, 'Origin must be at least 3 characters'),
destination: z.string().min(3, 'Destination must be at least 3 characters'),
departureDate: z.date().min(new Date(), 'Departure date must be in the future')
});

function searchFlights(params: unknown): Promise<Flight[]> {
const validatedParams = FlightSearchSchema.parse(params);
// Continuar con búsqueda
} 6. Testing
6.1 Estructura de Tests
6.1.1: Un archivo de test por archivo de código
6.1.2: Usar describe/it para estructura clara
6.1.3: Nombres descriptivos que expliquen el comportamiento
// ✅ Correcto: flight-service.test.ts
describe('FlightService', () => {
describe('searchFlights', () => {
it('should return flights when valid search parameters are provided', async () => {
// Test implementation
});

    it('should throw validation error when origin is missing', async () => {
      // Test implementation
    });

});
});
6.2 Cobertura y Calidad
6.2.1: Mínimo 80% de cobertura en funciones críticas
6.2.2: Mock dependencies externas
6.2.3: Probar casos límite y errores
// Ejemplo de test con cobertura
describe('FlightService', () => {
it('should calculate flight price correctly', () => {
const price = calculateFlightPrice(100, 0.2, 'WINTER20');
expect(price).toBe(80);
});

it('should throw error on invalid discount code', () => {
expect(() => calculateFlightPrice(100, 0.2, 'INVALID')).toThrow(Error);
});
}); 7. Performance
7.1 Optimización React
7.1.1: Usar React.memo para componentes que re-renderizan frecuentemente
7.1.2: Optimizar listas con keys únicas y estables
7.1.3: Lazy loading para componentes pesados
// ✅ Correcto
const FlightCard = React.memo<FlightCardProps>(({ flight, onSelect }) => {
return (
<div key={flight.id}>
{/_ Implementación _/}
</div>
);
});

// Lazy loading
const HeavyReportComponent = lazy(() => import('./heavy-report-component'));
7.2 Llamadas API
7.2.1: Implementar debouncing para búsquedas
7.2.2: Cachear resultados cuando sea apropiado
7.2.3: Usar paginación para listas grandes
// Ejemplo de debouncing
import { useState, useEffect } from 'react';
import { debounce } from 'lodash';

function SearchComponent() {
const [query, setQuery] = useState('');
const [results, setResults] = useState([]);

const debouncedSearch = debounce(async (query) => {
const response = await apiClient.searchFlights(query);
setResults(response.data);
}, 300);

useEffect(() => {
if (query) {
debouncedSearch(query);
} else {
setResults([]);
}
}, [query]);
} 8. Seguridad
8.1 Validación y Sanitización
8.1.1: Nunca confiar en datos del cliente
8.1.2: Sanitizar inputs antes de mostrar
8.1.3: Usar HTTPS para todas las comunicaciones
// ✅ Correcto
import DOMPurify from 'dompurify';

function displayUserComment(comment: string): string {
// Sanitizar HTML para evitar XSS
const sanitizedComment = DOMPurify.sanitize(comment);
return sanitizedComment;
}

function validateEmail(email: string): boolean {
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return emailRegex.test(email) && email.length <= 254;
}

// ❌ Incorrecto
function displayUserComment(comment: string): string {
// Directamente insertar HTML sin sanitizar
return comment; // Vulnerable a XSS
}
8.2 Manejo de Secretos
8.2.1: No hardcodear credenciales en el código
8.2.2: Usar variables de entorno para configuración
8.2.3: Rotar tokens y claves regularmente
// ✅ Correcto
const config = {
apiKey: process.env.FLYBAG_API_KEY,
databaseUrl: process.env.DATABASE_URL,
jwtSecret: process.env.JWT_SECRET
};

if (!config.apiKey) {
throw new Error('FLYBAG_API_KEY environment variable is required');
}

// ❌ Incorrecto
const config = {
apiKey: 'sk-1234567890abcdef', // Hardcodeado
databaseUrl: 'postgres://user:password@localhost:5432/flybag',
jwtSecret: 'mi-secreto-super-secreto'
};

# .env.example

FLYBAG_API_KEY=your_api_key_here
DATABASE_URL=your_database_url_here
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development 9. Git y Versionado
9.1 Commits
9.1.1: Commits atómicos y descriptivos
9.1.2: Usar conventional commits
9.1.3: Máximo 50 caracteres en el subject

# ✅ Correcto

feat(booking): add flight cancellation functionality
fix(auth): resolve token refresh issue
docs(api): update endpoint documentation
refactor(search): optimize flight search algorithm
test(booking): add unit tests for booking service
chore(deps): update React to version 18.2.0

# Con scope y breaking change

feat(api)!: change booking response format
fix(search): handle empty search results gracefully

# Con cuerpo del mensaje

feat(booking): add flight cancellation functionality

- Add cancel booking endpoint
- Implement refund calculation logic
- Update booking status in database
- Send cancellation email to user

Closes #123

# ❌ Incorrecto

update stuff
fix bug
changes
asdf
WIP
todo
9.2 Branches
9.2.1: Usar feature branches para desarrollo
9.2.2: Nombres descriptivos: feature/flight-booking, fix/auth-issue
9.2.3: Rebase antes de merge para mantener historia limpia

# ✅ Correcto - Estructura de branches

main
├── develop
├── feature/flight-cancellation-system
├── feature/user-profile-redesign
├── fix/booking-validation-error
├── hotfix/critical-payment-bug
└── release/v2.1.0

# ✅ Correcto - Comandos de branch

git checkout -b feature/flight-search-filters
git checkout -b fix/auth-token-expiry
git checkout -b hotfix/payment-gateway-timeout

# Rebase antes de merge

git checkout feature/flight-search-filters
git rebase develop
git checkout develop
git merge --no-ff feature/flight-search-filters

# ❌ Incorrecto

git checkout -b jose-branch
git checkout -b test
git checkout -b fix
git checkout -b new-stuff

10.1 Manejo de Datos - Principio de Responsabilidad ⚠️
10.1.1: No Transformar Datos en Frontend Principio: El frontend debe mostrar los datos tal como los envía el backend, sin transformaciones.
¿Por qué esta regla?
Simplicidad: Menos lógica en el frontend = menos bugs
Consistencia: Los datos se ven igual en toda la aplicación
Performance: Sin transformaciones innecesarias
Mantenibilidad: Cambios de formato se hacen solo en backend
Cómo aplicarlo:
Usar los nombres de campos exactos del API
No convertir tipos de datos en el frontend
No formatear fechas o números en componentes
Las interfaces TypeScript deben reflejar la estructura del backend
Ejemplos de lo que NO hacer:
Cambiar flight_number a flightNumber
Formatear fechas con toLocaleDateString() en componentes
Convertir user_profile.first_name a user.firstName
10.1.2: Mantener Estructura Original del Backend Regla: Los tipos TypeScript deben coincidir exactamente con la respuesta del API.
Beneficios:
Consistencia entre frontend y backend
Menos mapeo de datos innecesario
Debugging más fácil - los datos se ven igual en network tab y en código
Actualizaciones simples - cambios en backend se reflejan automáticamente
10.2 Renderizado y Performance - FlatList Obligatorio
10.2.1: Regla Obligatoria - FlatList en lugar de .map() Regla: Para cualquier lista con más de 5-10 elementos, usar FlatList en lugar de .map().
¿Por qué esta regla?
Performance: .map() renderiza TODOS los elementos inmediatamente
Memoria: FlatList solo renderiza elementos visibles + buffer
Scroll suave: Virtualización automática para listas grandes
Mobile-first: Optimizado específicamente para React Native
Cuándo usar cada uno:
FlatList: Listas de vuelos, equipajes, usuarios, notificaciones, historial
ScrollView + .map(): Solo para listas muy pequeñas (<5 elementos) y estáticas
10.2.2: Configuración Recomendada de FlatList Para obtener máximo performance, configurar estas props:
Props básicas obligatorias:
keyExtractor: Usar ID único, no index
renderItem: Componente memoizado si es posible
data: Array directo del estado
Props de optimización recomendadas:
removeClippedSubviews={true}: Mejora memoria
initialNumToRender={10}: Renderiza pocos elementos inicialmente
maxToRenderPerBatch={5}: Renderiza en lotes pequeños
windowSize={5}: Mantiene buffer pequeño
getItemLayout: Solo si todos los elementos tienen la misma altura
10.3 Estado y Hooks - Simplicidad Primero
10.3.1: Regla de Hooks Mínimos Principio: Los componentes deben tener la menor cantidad posible de hooks de estado.
¿Por qué menos hooks?
Simplicidad: Componentes más fáciles de entender y mantener
Performance: Menos re-renders innecesarios
Testing: Más fácil de testear con menos estado
Debugging: Menos lugares donde pueden ocurrir bugs
Límites recomendados por componente:
useState: Máximo 2-3 por componente
useMemo: Solo si hay cálculos realmente costosos
useCallback: Solo si se pasa a componentes memoizados
useEffect: Máximo 2 por componente
¿Qué hacer cuando tienes muchos hooks?
Extraer a custom hook - Agrupa lógica relacionada
Dividir el componente - Si hace demasiadas cosas
Mover lógica al backend - Si es procesamiento de datos
10.3.2: Custom Hooks - Estrategia de Extracción Regla: Cualquier lógica que usa más de 1 hook debe extraerse a un custom hook.
Beneficios de custom hooks:
Reutilización: La misma lógica en múltiples componentes
Testing: Se puede testear la lógica independientemente
Simplicidad: Componentes se enfocan solo en UI
Mantenibilidad: Cambios de lógica en un solo lugar
Casos comunes para custom hooks:
Búsquedas con debouncing
Llamadas a APIs con loading/error
Validación de formularios
Suscripciones a datos en tiempo real
