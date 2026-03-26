import type {
  CreateFlightCommentInput,
  FlightComment,
} from '@/domain/entities/flight-comment';

export interface FlightCommentRepositoryPort {
  getCommentsByTaskInstanceId(taskInstanceId: string): Promise<FlightComment[]>;
  createComment(input: CreateFlightCommentInput): Promise<FlightComment>;
}
