import type { FlightCommentRepositoryPort } from '@/application/ports/flight-comment-repository-port';
import type {
  CreateFlightCommentInput,
  FlightComment,
} from '@/domain/entities/flight-comment';

export class CreateFlightCommentUseCase {
  constructor(
    private readonly flightCommentsRepository: FlightCommentRepositoryPort,
  ) {}

  async execute(input: CreateFlightCommentInput): Promise<FlightComment> {
    return this.flightCommentsRepository.createComment(input);
  }
}
