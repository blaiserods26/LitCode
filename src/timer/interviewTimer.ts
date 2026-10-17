export type TimerState = 'idle' | 'running' | 'paused' | 'expired';

export interface InterviewTimerOptions {
  onTick?: (remainingSeconds: number, formatted: string) => void;
  onWarning?: (remainingSeconds: number) => void;
  onExpire?: () => void;
}

export class InterviewTimer {
  private initialSeconds: number;
  private remainingSeconds: number;
  private state: TimerState = 'idle';
  private intervalHandle: any = null;
  private warningTriggered = false;

  constructor(
    initialMinutes: number = 45,
    private options?: InterviewTimerOptions
  ) {
    this.initialSeconds = initialMinutes * 60;
    this.remainingSeconds = this.initialSeconds;
  }

  getState(): TimerState {
    return this.state;
  }

  getRemainingSeconds(): number {
    return this.remainingSeconds;
  }

  getFormattedTime(): string {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  start(minutes?: number): void {
    if (minutes !== undefined) {
      this.initialSeconds = minutes * 60;
      this.remainingSeconds = this.initialSeconds;
    }

    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }

    this.warningTriggered = false;
    this.state = 'running';

    this.intervalHandle = setInterval(() => {
      this.tick();
    }, 1000);

    if (this.options?.onTick) {
      this.options.onTick(this.remainingSeconds, this.getFormattedTime());
    }
  }

  pause(): void {
    if (this.state === 'running') {
      if (this.intervalHandle) {
        clearInterval(this.intervalHandle);
        this.intervalHandle = null;
      }
      this.state = 'paused';
      if (this.options?.onTick) {
        this.options.onTick(this.remainingSeconds, this.getFormattedTime());
      }
    }
  }

  resume(): void {
    if (this.state === 'paused') {
      this.state = 'running';
      this.intervalHandle = setInterval(() => {
        this.tick();
      }, 1000);
      if (this.options?.onTick) {
        this.options.onTick(this.remainingSeconds, this.getFormattedTime());
      }
    }
  }

  reset(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    this.remainingSeconds = this.initialSeconds;
    this.state = 'idle';
    this.warningTriggered = false;
    if (this.options?.onTick) {
      this.options.onTick(this.remainingSeconds, this.getFormattedTime());
    }
  }

  dispose(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  private tick(): void {
    if (this.remainingSeconds <= 0) {
      this.state = 'expired';
      if (this.intervalHandle) {
        clearInterval(this.intervalHandle);
        this.intervalHandle = null;
      }
      return;
    }

    this.remainingSeconds--;

    if (this.options?.onTick) {
      this.options.onTick(this.remainingSeconds, this.getFormattedTime());
    }

    // Expiry check
    if (this.remainingSeconds === 0) {
      this.state = 'expired';
      if (this.intervalHandle) {
        clearInterval(this.intervalHandle);
        this.intervalHandle = null;
      }
      if (this.options?.onExpire) {
        this.options.onExpire();
      }
      return;
    }

    // 5-minute warning (300 seconds)
    if (this.remainingSeconds <= 300 && !this.warningTriggered && this.remainingSeconds > 0) {
      this.warningTriggered = true;
      if (this.options?.onWarning) {
        this.options.onWarning(this.remainingSeconds);
      }
    }
  }
}
