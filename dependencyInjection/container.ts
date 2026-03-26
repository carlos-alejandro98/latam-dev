import { LoginWithAzureUseCase } from '@/application/useCases/login-with-azure-use-case';
import { LogoutUseCase } from '@/application/useCases/logout-use-case';
import { RefreshTokenUseCase } from '@/application/useCases/refresh-token-use-case';
import { RestoreAuthSessionUseCase } from '@/application/useCases/restore-auth-session-use-case';
import { CreateFlightCommentUseCase } from '@/application/useCases/create-flight-comment-use-case';
import { GetActiveFlightsUseCase } from '@/application/useCases/get-active-flights-use-case';
import { GetFlightCommentsUseCase } from '@/application/useCases/get-flight-comments-use-case';
import { GetFlightGanttUseCase } from '@/application/useCases/get-flight-gantt-use-case';
import { RefreshTurnaroundMetricsUseCase } from '@/application/useCases/refresh-turnaround-metrics-use-case';
import { ProcessFlightUpdatesUseCase } from '@/application/useCases/process-flight-updates-use-case';
import { StartFlightRealtimeUpdatesUseCase } from '@/application/useCases/start-flight-realtime-updates-use-case';
import { AzureAuthAdapter } from '@/infrastructure/auth/azure-auth-adapter';
import { FlightApiRepository } from '@/infrastructure/api/flight-api-repository';
import { FlightCommentApiRepository } from '@/infrastructure/api/flight-comment-api-repository';
import { FlightSocketAdapter } from '@/infrastructure/socket/flight-socket-adapter';
import { SecureStoreAdapter } from '@/infrastructure/storage/secure-store-adapter';
import { ENV } from '@/config/environment';

// 1. Infraestructura
const authProvider = new AzureAuthAdapter();
const tokenStorage = new SecureStoreAdapter();
const flightRepository = new FlightApiRepository();
const flightCommentRepository = new FlightCommentApiRepository();
const flightUpdatesPort = new FlightSocketAdapter(ENV.flightsWsUrl);

// 2. Casos de uso
const loginWithAzureUseCase = new LoginWithAzureUseCase(authProvider, tokenStorage);
const refreshTokenUseCase = new RefreshTokenUseCase(authProvider, tokenStorage);
const restoreAuthSessionUseCase = new RestoreAuthSessionUseCase(
  tokenStorage,
  refreshTokenUseCase,
);
const logoutUseCase = new LogoutUseCase(authProvider, tokenStorage);
const getActiveFlightsUseCase = new GetActiveFlightsUseCase(
  flightRepository
);
const getFlightGanttUseCase = new GetFlightGanttUseCase(flightRepository);
const refreshTurnaroundMetricsUseCase = new RefreshTurnaroundMetricsUseCase(
  flightRepository,
);
const getFlightCommentsUseCase = new GetFlightCommentsUseCase(
  flightCommentRepository,
);
const createFlightCommentUseCase = new CreateFlightCommentUseCase(
  flightCommentRepository,
);

/** Crea ProcessFlightUpdatesUseCase y StartFlightRealtimeUpdatesUseCase con el store adapter (dispatch). */
function createRealtimeUseCases(updateFlightsPatch: (flights: import('@/domain/entities/flight').Flight[]) => void) {
  const processFlightUpdatesUseCase = new ProcessFlightUpdatesUseCase({
    updateFlightsPatch,
  });
  const startFlightRealtimeUpdatesUseCase = new StartFlightRealtimeUpdatesUseCase(
    flightUpdatesPort,
    processFlightUpdatesUseCase,
  );
  return { processFlightUpdatesUseCase, startFlightRealtimeUpdatesUseCase };
}

// 3. Container público
export const container = {
  // Infrastructure (needed for OAuth callback handling)
  authProvider,
  tokenStorage,
  // Use Cases
  loginWithAzureUseCase,
  refreshTokenUseCase,
  restoreAuthSessionUseCase,
  logoutUseCase,
  getActiveFlightsUseCase,
  getFlightGanttUseCase,
  refreshTurnaroundMetricsUseCase,
  getFlightCommentsUseCase,
  createFlightCommentUseCase,
  flightUpdatesPort,
  createRealtimeUseCases,
};
