import { Component, DestroyRef, inject, signal } from '@angular/core';
import { StreamingChart } from './streaming-chart';
import { StreamingPoint } from './streaming-point';

const MAX_POINTS = 40;
const UPDATE_INTERVAL_MS = 1000;
const INITIAL_VALUE = 50;

@Component({
  selector: 'app-streaming-chart-driver',
  imports: [StreamingChart],
  template: `
    <section class="driver">
      <div class="driver__controls">
        <button type="button" (click)="toggle()">
          {{ running() ? 'Stop' : 'Start' }} streaming
        </button>
        <button type="button" (click)="reset()" [disabled]="points().length === 0">
          Reset
        </button>
        <span class="driver__status" aria-live="polite">
          {{ running() ? 'Streaming' : 'Stopped' }} ({{ points().length }} points)
        </span>
      </div>
      <app-streaming-chart
        class="driver__chart"
        chartTitle="CPU Usage"
        seriesName="CPU"
        unit="%"
        [points]="points()"
      />
    </section>
  `,
  styles: `
    .driver {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      inline-size: 100%;
      block-size: 100%;
      box-sizing: border-box;
      padding: 1rem;
    }

    .driver__controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    button {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      border: 1px solid #64748b;
      background: #ffffff;
      color: #0f172a;
      cursor: pointer;
      font: inherit;
    }

    button:hover:not(:disabled) {
      background: #f1f5f9;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    button:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 2px;
    }

    .driver__status {
      color: #334155;
    }

    .driver__chart {
      flex: 1 1 auto;
      min-block-size: 24rem;
    }
  `,
})
export class StreamingChartDriver {
  protected readonly points = signal<StreamingPoint[]>([]);
  protected readonly running = signal(false);

  private lastValue = INITIAL_VALUE;
  private intervalId: ReturnType<typeof setInterval> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimer());
  }

  protected toggle(): void {
    if (this.running()) {
      this.stop();
    } else {
      this.start();
    }
  }

  protected reset(): void {
    this.stop();
    this.points.set([]);
    this.lastValue = INITIAL_VALUE;
  }

  private start(): void {
    this.running.set(true);
    this.pushPoint();
    this.intervalId = setInterval(() => this.pushPoint(), UPDATE_INTERVAL_MS);
  }

  private stop(): void {
    this.running.set(false);
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private pushPoint(): void {
    const drift = (Math.random() - 0.5) * 10;
    this.lastValue = Math.min(100, Math.max(0, this.lastValue + drift));
    const next: StreamingPoint = { timestamp: Date.now(), value: this.lastValue };

    this.points.update((current) => {
      const updated = [...current, next];
      return updated.length > MAX_POINTS ? updated.slice(updated.length - MAX_POINTS) : updated;
    });
  }
}
