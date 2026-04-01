import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';

jest.mock('@/config/environment', () => ({
  ENV: {
    ganttPollingIntervalMs: 5_000,
  },
}));

import { useGanttPolling } from './use-gantt-polling';

describe('useGanttPolling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('polls the selected flight on the configured interval', () => {
    const loadGantt = jest.fn();

    renderHook(() => useGanttPolling('FLIGHT-123', loadGantt));

    act(() => {
      jest.advanceTimersByTime(5_000);
    });

    expect(loadGantt).toHaveBeenCalledTimes(1);
    expect(loadGantt).toHaveBeenCalledWith('FLIGHT-123');
  });

  it('does not poll when there is no selected flight', () => {
    const loadGantt = jest.fn();

    renderHook(() => useGanttPolling(null, loadGantt));

    act(() => {
      jest.advanceTimersByTime(15_000);
    });

    expect(loadGantt).not.toHaveBeenCalled();
  });

  it('avoids overlapping refresh requests while one is still pending', async () => {
    let resolveLoad: (() => void) | null = null;
    const loadGantt = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLoad = resolve;
        }),
    );

    renderHook(() => useGanttPolling('FLIGHT-123', loadGantt));

    act(() => {
      jest.advanceTimersByTime(5_000);
    });

    expect(loadGantt).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(5_000);
    });

    expect(loadGantt).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveLoad?.();
      await Promise.resolve();
    });

    act(() => {
      jest.advanceTimersByTime(5_000);
    });

    expect(loadGantt).toHaveBeenCalledTimes(2);
  });
});
