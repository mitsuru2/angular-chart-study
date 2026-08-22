import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { StreamingChart } from '../streaming-chart/streaming-chart';
import { DataItemData, SeriesConfig } from '../streaming-chart/streaming-chart.interface';

const STATE_LABELS = ['OFF', 'IDLE', 'ACTIVE', 'ERROR'];
const STATE_CHANGE_EVERY = 10;

@Component({
  imports: [StreamingChart],
  selector: 'app-streaming-chart-driver',
  styleUrl: './streaming-chart-driver.scss',
  templateUrl: './streaming-chart-driver.html',
})
export class StreamingChartDriver implements OnInit, OnDestroy {
  private now = new Date(1997, 9, 3);
  private oneDay = 24 * 3600 * 1000;
  private value = Math.random() * 1000;
  private state = Math.floor(Math.random() * STATE_LABELS.length);
  private tickCount = 0;
  private intervalId?: ReturnType<typeof setInterval>;

  protected seriesConfig: SeriesConfig[] = [
    { name: 'Fake Data' },
    { name: 'State', labels: STATE_LABELS },
  ];

  protected seriesData = signal<DataItemData[][]>([]);

  ngOnInit() {
    const initialValueData: DataItemData[] = [];
    const initialStateData: DataItemData[] = [];
    for (let i = 0; i < 200; i++) {
      const date = this.advanceTime();
      initialValueData.push(this.nextValuePoint(date));
      initialStateData.push(this.nextStatePoint(date));
    }
    this.seriesData.set([initialValueData, initialStateData]);

    this.intervalId = setInterval(() => {
      const date = this.advanceTime();
      const nextValue = this.nextValuePoint(date);
      const nextState = this.nextStatePoint(date);
      this.seriesData.update((current) => [
        [...current[0].slice(1), nextValue],
        [...current[1].slice(1), nextState],
      ]);
    }, 200);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  private advanceTime(): Date {
    this.now = new Date(+this.now + this.oneDay);
    return this.now;
  }

  private nextValuePoint(date: Date): DataItemData {
    this.value = this.value + Math.random() * 21 - 10;
    return {
      name: date.toString(),
      value: [this.dateKey(date), Math.round(this.value)],
    };
  }

  private nextStatePoint(date: Date): DataItemData {
    if (this.tickCount % STATE_CHANGE_EVERY === 0) {
      this.state = Math.floor(Math.random() * STATE_LABELS.length);
    }
    this.tickCount++;
    return {
      name: date.toString(),
      value: [this.dateKey(date), this.state],
    };
  }

  private dateKey(date: Date): string {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('/');
  }
}
