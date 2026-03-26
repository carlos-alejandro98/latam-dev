import type { FlightCommentRepositoryPort } from '@/application/ports/flight-comment-repository-port';
import type {
  CreateFlightCommentInput,
  FlightComment,
} from '@/domain/entities/flight-comment';
import {
  normalizeFlightCommentAuthorLabel,
  toFlightCommentAuthorCode,
} from '@/domain/services/flight-comment-author';
import {
  flightsHttpGet,
  flightsHttpPost,
} from '@/infrastructure/http/flights-http-methods';

/** Shape returned by GET /api/v1/tasks/{task_instance_id}/comments */
interface ApiComment {
  commentId?: string;
  id?: string;
  taskInstanceId?: string;
  task_instance_id?: string;
  createdBy?: string;
  author_code?: string;
  author_name?: string;
  content?: string;
  message?: string;
  text?: string;
  created_at?: string;
  createdAt?: string;
}

/**
 * The endpoint may return a bare array OR a wrapper object like
 * { data: [...] } / { comments: [...] } / { results: [...] }.
 * This helper normalises all cases to a plain array.
 */
const toArray = (raw: unknown): ApiComment[] => {
  if (Array.isArray(raw)) return raw as ApiComment[];
  if (raw && typeof raw === 'object') {
    for (const key of ['data', 'comments', 'results', 'items']) {
      const candidate = (raw as Record<string, unknown>)[key];
      if (Array.isArray(candidate)) return candidate as ApiComment[];
    }
  }
  return [];
};

/** Shape returned by POST /api/v1/tasks/{task_instance_id}/comments */
interface CreateApiCommentResponse {
  commentId?: string;
  id?: string;
  taskInstanceId?: string;
  task_instance_id?: string;
  createdBy?: string;
  author_code?: string;
  author_name?: string;
  content?: string;
  message?: string;
  text?: string;
  created_at?: string;
  createdAt?: string;
}

const mapApiComment = (raw: ApiComment, taskInstanceId: string): FlightComment => {
  const rawAuthor = raw.author_name ?? raw.createdBy ?? raw.author_code ?? '';
  const normalizedAuthorLabel = normalizeFlightCommentAuthorLabel(rawAuthor);

  return {
    id: raw.commentId
      ?? raw.id
      ?? `${taskInstanceId}:${raw.createdAt ?? raw.created_at ?? raw.content ?? raw.message ?? raw.text ?? 'comment'}`,
    taskInstanceId: raw.taskInstanceId ?? raw.task_instance_id ?? taskInstanceId,
    authorCode: toFlightCommentAuthorCode(raw.author_code ?? rawAuthor),
    authorName: normalizedAuthorLabel ?? rawAuthor,
    message: raw.content ?? raw.message ?? raw.text ?? '',
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
  };
};

export class FlightCommentApiRepository implements FlightCommentRepositoryPort {
  async getCommentsByTaskInstanceId(taskInstanceId: string): Promise<FlightComment[]> {
    const raw = await flightsHttpGet<unknown>(
      `/api/v1/tasks/${taskInstanceId}/comments`,
    );
    return toArray(raw).map((item) => mapApiComment(item, taskInstanceId));
  }

  async createComment(input: CreateFlightCommentInput): Promise<FlightComment> {
    const body = {
      content: input.message,
      createdBy: input.authorName || input.authorCode,
    };
    const raw = await flightsHttpPost<CreateApiCommentResponse, typeof body>(
      `/api/v1/tasks/${input.taskInstanceId}/comments`,
      body,
    );
    return mapApiComment(raw, input.taskInstanceId);
  }
}
