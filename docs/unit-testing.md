📄 docs/unit-testing.md
Ubicación: docs/unit-testing.md
Estado: Documento oficial del proyecto
Aplica a: Todo el frontend AptoGantt

🧪 Pruebas Unitarias – AptoGantt Frontend
Proyecto: AptoGantt
Stack: React Native (Expo) + TypeScript
Arquitectura: Clean Architecture + Hexagonal
Test Runner: Jest
Última actualización: 2026‑01

🎯 Objetivo de las pruebas unitarias
Las pruebas unitarias existen para:

Validar lógica de negocio
Proteger la arquitectura
Permitir refactor sin miedo
Evitar regresiones
Documentar comportamiento esperado
📌 No buscamos 100% de coverage.
📌 Buscamos tests útiles, rápidos y aislados.

🧠 Principio clave
Una prueba unitaria testea UNA capa,
y mockea TODAS las demás.

Si un test:

dispara ENV
importa container
accede a Redux real
hace requests HTTP reales
👉 NO es unitario.

🧱 Qué se testea (y qué NO)
✅ Se testea
Capa Qué se valida
domain Entidades, errores, lógica pura
application Casos de uso
infrastructure Adapters (API, HTTP)
presentation/controllers Controllers (hooks)
shared Utils puros (si aplica)
❌ NO se testea
Screens (UI completa) → testing visual / e2e
Redux store real
Axios real
Expo Router
Configuración de Expo
📁 Estructura de tests
📌 Un archivo de test por archivo de código
📌 El test vive junto al código

Ejemplo real del proyecto:

text

application/useCases/
├── get-active-flights-use-case.ts
├── get-active-flights-use-case.test.ts ✅
🟦 Tests de Domain
🎯 Objetivo
Validar reglas puras del negocio.

✅ Reglas
No mocks
No React
No Redux
No Axios
📌 Actualmente el dominio es simple (interfaces), no requiere tests.

🟩 Tests de Application (Use Cases)
🎯 Objetivo
Validar reglas de negocio y orquestación.

✅ Reglas obligatorias
Mockear ports
No importar infraestructura
No importar Redux
No usar container
✅ Ejemplo REAL (actual)
ts

import { describe, it, expect, jest } from "@jest/globals";

import type { Flight } from "@/domain/entities/flight";
import type { FlightRepositoryPort } from "../ports/flight-repository-port";
import { GetActiveFlightsUseCase } from "./get-active-flights-use-case";

describe("GetActiveFlightsUseCase", () => {
it("should return active flights from repository", async () => {
const flightsMock: Flight[] = [
{
flightId: "FL001",
numberArrival: "LA123",
numberDeparture: "LA124",
origin: "SCL",
destination: "LIM",
prefix: "LA",
staTime: "10:00",
staDate: "2026-01-01",
stdTime: "11:00",
stdDate: "2026-01-01",
ganttIniciado: false,
},
];

    const repositoryMock: FlightRepositoryPort = {
      getActiveFlights: jest.fn().mockResolvedValue(flightsMock),
    };

    const useCase = new GetActiveFlightsUseCase(repositoryMock);

    const result = await useCase.execute();

    expect(result).toEqual(flightsMock);
    expect(repositoryMock.getActiveFlights).toHaveBeenCalledTimes(1);

});
});
✅ Este test es referencia oficial del proyecto.

🟥 Tests de Infrastructure (Adapters API)
🎯 Objetivo
Validar que el adapter:

Llame al endpoint correcto
Use el método HTTP correcto
✅ Reglas
Mockear http-methods
No Axios real
No backend real
✅ Ejemplo REAL
ts

import { describe, it, expect, jest } from "@jest/globals";

import { httpGet } from "@/infrastructure/http/http-methods";
import { FlightApiRepository } from "./flight-api-repository";

jest.mock("@/infrastructure/http/http-methods", () => ({
httpGet: jest.fn(),
}));

describe("FlightApiRepository", () => {
it("should call correct endpoint to get active flights", async () => {
const repository = new FlightApiRepository();

    (httpGet as jest.Mock).mockResolvedValue([]);

    await repository.getActiveFlights();

    expect(httpGet).toHaveBeenCalledWith(
      "/api/v1/tracking/active-flights-v2"
    );

});
});
🟨 Tests de Controllers (Hooks)
🎯 Objetivo
Validar comportamiento del controller, no Redux.

✅ Reglas estrictas
Mockear adapters
❌ No importar store
❌ No importar container
❌ No disparar ENV
✅ Ejemplo REAL
ts

import { describe, it, expect, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react-native";

import { useFlightsStoreAdapter } from "../adapters/redux/flights-store-adapter";
import { useHomeController } from "./use-home-controller";

jest.mock("../adapters/redux/flights-store-adapter", () => ({
useFlightsStoreAdapter: jest.fn(),
}));

describe("useHomeController", () => {
it("should load flights on mount", () => {
const loadFlightsMock = jest.fn();

    (useFlightsStoreAdapter as jest.Mock).mockReturnValue({
      flights: [],
      loading: false,
      loadFlights: loadFlightsMock,
    });

    renderHook(() => useHomeController());

    expect(loadFlightsMock).toHaveBeenCalledTimes(1);

});
});
📌 Este patrón es obligatorio en controllers.

🧪 Cobertura
✅ Reglas del proyecto
80% mínimo en:
application
infrastructure
controllers
Configurado en:

js

coverageThreshold: {
global: {
branches: 80,
functions: 80,
lines: 80,
statements: 80,
},
},
📌 La cobertura NO aplica a UI completa.

🚫 Antipatterns prohibidos
❌ Testear Redux store real
❌ Testear Axios real
❌ Importar container en tests unitarios
❌ Acceder a process.env
❌ Tests gigantes
❌ Lógica duplicada en tests

✅ Scripts disponibles
json

{
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
}
🧠 Cómo saber si un test está bien hecho
Pregúntate:

¿Estoy testeando solo una capa?
¿Podría cambiar Redux/Axios sin romper el test?
¿El test es rápido (<50ms)?
¿El test documenta comportamiento?
Si la respuesta es ✅ → el test es correcto.

🏁 Conclusión
Este sistema de testing:

✅ Protege Clean Architecture
✅ Facilita refactor
✅ Evita regresiones
✅ Es rápido y mantenible
✅ Escala a tiempo real y Gantt
Un test que falla por ENV
es un test mal aislado.
