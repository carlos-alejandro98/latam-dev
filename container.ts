import { CreateFlightCommentUseCase } from '@/application/useCases/create-flight-comment-use-case';
import { GetActiveFlightsUseCase } from '@/application/useCases/get-active-flights-use-case';
import { GetFlightCommentsUseCase } from '@/application/useCases/get-flight-comments-use-case';
import { GetFlightGanttUseCase } from '@/application/useCases/get-flight-gantt-use-case';
import { FlightApiRepository } from '@/infrastructure/api/flight-api-repository';
import { FlightCommentApiRepository } from '@/infrastructure/api/flight-comment-api-repository';

// 1. Infraestructura
const flightRepository = new FlightApiRepository();
const flightCommentRepository = new FlightCommentApiRepository();

// 2. Casos de uso
const getActiveFlightsUseCase = new GetActiveFlightsUseCase(
  flightRepository
);
const getFlightGanttUseCase = new GetFlightGanttUseCase(flightRepository);
const getFlightCommentsUseCase = new GetFlightCommentsUseCase(
  flightCommentRepository,
);
const createFlightCommentUseCase = new CreateFlightCommentUseCase(
  flightCommentRepository,
);

// 3. Container público
export const container = {
  getActiveFlightsUseCase,
  getFlightGanttUseCase,
  getFlightCommentsUseCase,
  createFlightCommentUseCase,
};
