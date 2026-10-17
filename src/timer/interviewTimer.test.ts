import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InterviewTimer } from './interviewTimer';

describe('InterviewTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with default duration and formatted string', () => {
    const timer = new InterviewTimer(45);
    expect(timer.getState()).toBe('idle');
    expect(timer.getFormattedTime()).toBe('45:00');
  });

  it('counts down every second when running', () => {
    const timer = new InterviewTimer(45);
    timer.start();
    expect(timer.getState()).toBe('running');

    vi.advanceTimersByTime(1000);
    expect(timer.getFormattedTime()).toBe('44:59');

    vi.advanceTimersByTime(59000);
    expect(timer.getFormattedTime()).toBe('44:00');

    timer.pause();
    expect(timer.getState()).toBe('paused');

    vi.advanceTimersByTime(10000);
    expect(timer.getFormattedTime()).toBe('44:00'); // should not advance while paused

    timer.resume();
    expect(timer.getState()).toBe('running');
    vi.advanceTimersByTime(1000);
    expect(timer.getFormattedTime()).toBe('43:59');

    timer.reset();
    expect(timer.getState()).toBe('idle');
    expect(timer.getFormattedTime()).toBe('45:00');
  });

  it('triggers onWarning callback at 5 minutes and onExpire at 0 minutes', () => {
    const onWarning = vi.fn();
    const onExpire = vi.fn();

    const timer = new InterviewTimer(6, { onWarning, onExpire });
    timer.start();

    // Advance 1 minute -> 5:00 remaining
    vi.advanceTimersByTime(60 * 1000);
    expect(onWarning).toHaveBeenCalledTimes(1);

    // Advance 5 more minutes -> expired
    vi.advanceTimersByTime(5 * 60 * 1000);
    expect(timer.getState()).toBe('expired');
    expect(timer.getFormattedTime()).toBe('00:00');
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
