export interface FlightComment {
  id: string;
  taskInstanceId: string;
  authorCode: string;
  authorName: string;
  message: string;
  createdAt: string;
}

export interface CreateFlightCommentInput {
  taskInstanceId: string;
  authorCode: string;
  authorName: string;
  message: string;
}
