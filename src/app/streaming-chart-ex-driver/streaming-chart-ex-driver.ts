import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { StreamingChartEx } from '../streaming-chart-ex/streaming-chart-ex';
import {
  StreamingChartExGraphOptionData,
  StreamingChartExPointData,
  StreamingChartExSeriesData,
} from '../streaming-chart-ex/streaming-chart-ex.interface';

@Component({
  imports: [StreamingChartEx],
  selector: 'app-streaming-chart-ex-driver',
  styleUrl: './streaming-chart-ex-driver.scss',
  templateUrl: './streaming-chart-ex-driver.html',
})
export class StreamingChartExDriver implements OnInit, OnDestroy {
  private now = Date.now();
  private valueA = Math.random() * 100;
  private valueB = Math.random() * 100;
  private intervalId?: ReturnType<typeof setInterval>;

  // 配列順とindexをあえて逆にして、indexが軸オフセットを決めることを示す
  protected seriesConfig: StreamingChartExSeriesData[] = [
    { name: 'Sensor B', color: 'rgba(220,90,60,0.8)', range: { min: -50, max: 50 }, index: 1 },
    { name: 'Sensor A', color: 'rgba(75,120,220,0.8)', range: { min: 0, max: 100 }, index: 0 },
  ];
  protected seriesData = signal<StreamingChartExPointData[][]>([]);
  protected graphOption: StreamingChartExGraphOptionData = { showElapsedTime: true };

  ngOnInit() {
    const initialB: StreamingChartExPointData[] = [];
    const initialA: StreamingChartExPointData[] = [];
    for (let i = 0; i < 200; i++) {
      const timestamp = this.advanceTime();
      initialB.push(this.nextB(timestamp));
      initialA.push(this.nextA(timestamp));
    }
    this.seriesData.set([initialB, initialA]);
    this.intervalId = setInterval(() => {
      const timestamp = this.advanceTime();
      const nextB = this.nextB(timestamp);
      const nextA = this.nextA(timestamp);
      // Append-only: StreamingChartEx relies on each point's array index staying
      // stable forever so its update animation reads as a rigid slide rather than
      // per-point value tweening (dropping the oldest point here would shift every
      // remaining point's index on every tick).
      this.seriesData.update((current) => [
        [...current[0], nextB],
        [...current[1], nextA],
      ]);
    }, 200);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  private advanceTime(): number {
    this.now += 1000;
    return this.now;
  }

  private nextA(timestamp: number): StreamingChartExPointData {
    this.valueA = Math.min(100, Math.max(0, this.valueA + Math.random() * 10 - 5));
    return { timestamp, value: Math.round(this.valueA) };
  }

  private nextB(timestamp: number): StreamingChartExPointData {
    this.valueB = Math.min(50, Math.max(-50, this.valueB + Math.random() * 8 - 4));
    return { timestamp, value: Math.round(this.valueB) };
  }
}
