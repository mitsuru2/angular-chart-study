import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { BarChart } from '../bar-chart/bar-chart';
import { BarChartParam, ChartPointData, RangeData } from '../model/chart-data.interface';

@Component({
  imports: [BarChart],
  selector: 'app-bar-chart-driver',
  styleUrl: './bar-chart-driver.scss',
  templateUrl: './bar-chart-driver.html',
})
export class BarChartDriver implements OnInit, OnDestroy {
  protected params: BarChartParam[] = [
    { name: 'Sensor A', color: 'rgba(75,120,220,0.8)' },
    { name: 'Sensor B', color: 'rgba(220,90,60,0.8)' },
    { name: 'Sensor C', color: 'rgba(60,180,90,0.8)' },
    { name: 'Sensor D', color: 'rgba(220,170,60,0.8)' },
  ];

  // 固定Y軸レンジ(静的チャート用)。
  protected fixedRange: RangeData = { min: 0, max: 100 };

  // 静的チャート: 一度生成した値を書き換えない。
  protected staticData: ChartPointData[] = [
    { value: 42, timestamp: Date.now() },
    { value: 68, timestamp: Date.now() },
    { value: 15, timestamp: Date.now() },
    { value: 90, timestamp: Date.now() },
  ];

  // 動的チャート: Y軸レンジ未指定(自動調整)。setInterval で値をランダムウォークさせる。
  protected dynamicData = signal<ChartPointData[]>(
    this.params.map(() => ({ value: 50, timestamp: Date.now() })),
  );

  private intervalId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      const now = Date.now();
      this.dynamicData.update((points) =>
        points.map(({ value }) => ({
          value: Math.round(Math.min(100, Math.max(0, value + (Math.random() * 2 - 1) * 20))),
          timestamp: now,
        })),
      );
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
