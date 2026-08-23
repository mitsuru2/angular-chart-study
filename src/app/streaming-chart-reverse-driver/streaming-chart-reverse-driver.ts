import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { StreamingChartReverse } from '../streaming-chart-reverse/streaming-chart-reverse';
import { ChartPointData, ChartSeriesData } from '../model/chart-data.interface';

const INTERVAL_MS = 200;

const STATUS_DICT: Record<number, string> = {
  0: 'OFF',
  1: 'IDLE',
  2: 'RUN',
  3: 'ERROR',
};

@Component({
  imports: [StreamingChartReverse],
  selector: 'app-streaming-chart-reverse-driver',
  styleUrl: './streaming-chart-reverse-driver.scss',
  templateUrl: './streaming-chart-reverse-driver.html',
})
export class StreamingChartReverseDriver implements OnInit, OnDestroy {
  private now = Date.now();
  private sensorValue = Math.random() * 100;
  private statusValue = 0;
  private intervalId?: ReturnType<typeof setInterval>;

  protected seriesConfig: ChartSeriesData[] = [
    {
      name: 'Sensor',
      color: 'rgba(75,120,220,0.8)',
      range: { min: 0, max: 100 },
      yAxisIndex: 0,
    },
    {
      name: 'Status',
      color: 'rgba(220,90,60,0.8)',
      dict: STATUS_DICT,
      yAxisIndex: 1,
    },
  ];
  protected seriesData = signal<ChartPointData[][]>([[], []]);

  ngOnInit() {
    this.intervalId = setInterval(() => {
      const timestamp = this.advanceTime();
      const nextSensor = this.nextSensor(timestamp);
      const nextStatus = this.nextStatus(timestamp);
      // Append-only: StreamingChartReverse relies on each point's array index staying
      // stable forever so its update animation reads as a rigid slide rather than
      // per-point value tweening.
      this.seriesData.update((current) => [
        [...current[0], nextSensor],
        [...current[1], nextStatus],
      ]);
    }, INTERVAL_MS);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  private advanceTime(): number {
    this.now += INTERVAL_MS;
    return this.now;
  }

  private nextSensor(timestamp: number): ChartPointData {
    this.sensorValue = Math.min(100, Math.max(0, this.sensorValue + Math.random() * 10 - 5));
    return { timestamp, value: Math.round(this.sensorValue) };
  }

  private nextStatus(timestamp: number): ChartPointData {
    if (Math.random() < 0.05) {
      this.statusValue = Math.floor(Math.random() * 4);
    }
    return { timestamp, value: this.statusValue };
  }
}
