import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  flightsHttpGet,
  flightsHttpPost,
} from '@/infrastructure/http/flights-http-methods';

import { FlightCommentApiRepository } from './flight-comment-api-repository';

jest.mock('@/infrastructure/http/flights-http-methods', () => ({
  flightsHttpGet: jest.fn(),
  flightsHttpPost: jest.fn(),
}));

const mockedFlightsHttpGet = flightsHttpGet as unknown as jest.Mock;
const mockedFlightsHttpPost = flightsHttpPost as unknown as jest.Mock;

describe('FlightCommentApiRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps the current Swagger list response for task comments', async () => {
    const repository = new FlightCommentApiRepository();

    mockedFlightsHttpGet.mockResolvedValue({
      taskInstanceId: 'task-123',
      comments: [
        {
          commentId: 'comment-1',
          taskInstanceId: 'task-123',
          content: 'Comentario de prueba',
          createdBy: 'Juan Perez',
          createdAt: '2026-03-24T21:21:45.437995+00:00',
        },
      ],
      total: 1,
      limit: 50,
      offset: 0,
    } as never);

    const result = await repository.getCommentsByTaskInstanceId('task-123');

    expect(flightsHttpGet).toHaveBeenCalledWith('/api/v1/tasks/task-123/comments');
    expect(result).toEqual([
      {
        id: 'comment-1',
        taskInstanceId: 'task-123',
        authorCode: 'JP',
        authorName: 'Juan Perez',
        message: 'Comentario de prueba',
        createdAt: '2026-03-24T21:21:45.437995+00:00',
      },
    ]);
  });

  it('keeps compatibility with the legacy comment payload shape', async () => {
    const repository = new FlightCommentApiRepository();

    mockedFlightsHttpGet.mockResolvedValue([
      {
        id: 'legacy-comment-1',
        task_instance_id: 'task-legacy',
        author_code: 'OPS',
        author_name: 'Operaciones',
        text: 'Comentario legado',
        created_at: '2026-03-24T21:10:00.000Z',
      },
    ] as never);

    const result = await repository.getCommentsByTaskInstanceId('task-legacy');

    expect(result).toEqual([
      {
        id: 'legacy-comment-1',
        taskInstanceId: 'task-legacy',
        authorCode: 'OPS',
        authorName: 'Operaciones',
        message: 'Comentario legado',
        createdAt: '2026-03-24T21:10:00.000Z',
      },
    ]);
  });

  it('sends the current Swagger body when creating comments', async () => {
    const repository = new FlightCommentApiRepository();

    mockedFlightsHttpPost.mockResolvedValue({
      commentId: 'comment-2',
      taskInstanceId: 'task-123',
      content: 'Nuevo comentario',
      createdBy: 'Controller',
      createdAt: '2026-03-24T21:30:00.000Z',
    } as never);

    const result = await repository.createComment({
      taskInstanceId: 'task-123',
      message: 'Nuevo comentario',
      authorCode: 'Controller',
      authorName: 'Controller',
    });

    expect(flightsHttpPost).toHaveBeenCalledWith(
      '/api/v1/tasks/task-123/comments',
      {
        content: 'Nuevo comentario',
        createdBy: 'Controller',
      },
    );
    expect(result).toEqual({
      id: 'comment-2',
      taskInstanceId: 'task-123',
      authorCode: 'Controller',
      authorName: 'Controller',
      message: 'Nuevo comentario',
      createdAt: '2026-03-24T21:30:00.000Z',
    });
  });
});
