import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { StreamingChartReverse } from '../streaming-chart-reverse/streaming-chart-reverse';
import { ChartPointData, ChartSeriesData } from '../model/chart-data.interface';

const INTERVAL_MS = 200;
// StreamingChartReverse の表示ウィンドウ(60秒)より少し長め。id ベースの差分
// アニメーション(streaming-chart-reverse.ts の mergeOption 参照)のおかげで、
// 表示範囲外になった古い点を間引いても残りの点が波打つことはない。ぴったり
// 60秒ではなく余裕を持たせているのは、境界上の点がタイミング差でちらつくのを
// 避けるため。
const RETENTION_MS = 65_000;

const STATUS_DICT: Record<number, string> = {
  0: 'OFF',
  1: 'IDLE',
  2: 'RUN',
  3: 'ERROR',
};

@Component({
  imports: [StreamingChartReverse, ToggleSwitch, ReactiveFormsModule],
  selector: 'app-streaming-chart-reverse-driver',
  styleUrl: './streaming-chart-reverse-driver.scss',
  templateUrl: './streaming-chart-reverse-driver.html',
})
export class StreamingChartReverseDriver implements OnInit, OnDestroy {
  private now = Date.now();
  private sensorValue = Math.random() * 100;
  private statusValue = 0;
  private extraValue = Math.random() * 30;
  private intervalId?: ReturnType<typeof setInterval>;

  // Always defined for all 3 series; `seriesData` below is always kept in sync with
  // this (data for "Extra" keeps being generated regardless of `showExtraSeries`).
  // `visibleSeriesConfig`/`visibleSeriesData` are what actually gets passed to the
  // chart, filtering "Extra" in or out by the toggle without touching this array's
  // index alignment for Sensor/Status.
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
    {
      name: 'Extra',
      color: 'rgba(60,180,90,0.8)',
      range: { min: 0, max: 30 },
      yAxisIndex: 2,
    },
  ];
  protected seriesData = signal<ChartPointData[][]>([[], [], []]);

  protected showExtraSeriesControl = new FormControl(false, { nonNullable: true });
  private showExtraSeries = toSignal(this.showExtraSeriesControl.valueChanges, {
    initialValue: this.showExtraSeriesControl.value,
  });

  protected visibleSeriesConfig = computed(() =>
    this.showExtraSeries() ? this.seriesConfig : this.seriesConfig.slice(0, 2),
  );
  protected visibleSeriesData = computed(() =>
    this.showExtraSeries() ? this.seriesData() : this.seriesData().slice(0, 2),
  );

  ngOnInit() {
    this.intervalId = setInterval(() => {
      const timestamp = this.advanceTime();
      const nextSensor = this.nextSensor(timestamp);
      const nextStatus = this.nextStatus(timestamp);
      const nextExtra = this.nextExtra(timestamp);
      const cutoff = timestamp - RETENTION_MS;
      this.seriesData.update((current) => [
        [...current[0], nextSensor].filter((point) => point.timestamp >= cutoff),
        [...current[1], nextStatus].filter((point) => point.timestamp >= cutoff),
        [...current[2], nextExtra].filter((point) => point.timestamp >= cutoff),
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

  private nextExtra(timestamp: number): ChartPointData {
    this.extraValue = Math.min(30, Math.max(0, this.extraValue + Math.random() * 6 - 3));
    return { timestamp, value: Math.round(this.extraValue) };
  }
}
