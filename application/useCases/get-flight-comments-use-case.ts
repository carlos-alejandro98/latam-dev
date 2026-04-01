import type { FlightCommentRepositoryPort } from '@/application/ports/flight-comment-repository-port';
import type { FlightComment } from '@/domain/entities/flight-comment';

export class GetFlightCommentsUseCase {
  constructor(
    private readonly flightCommentsRepository: FlightCommentRepositoryPort,
  ) {}

  async execute(taskInstanceId: string): Promise<FlightComment[]> {
    return this.flightCommentsRepository.getCommentsByTaskInstanceId(taskInstanceId);
  }
}
