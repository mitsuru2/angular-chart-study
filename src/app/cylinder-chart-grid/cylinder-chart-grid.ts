import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CylinderChartBox } from '../cylinder-chart-box/cylinder-chart-box';
import { ChartPointData, ChartSeriesData } from '../model/chart-data.interface';

const STATUS_DICT: Record<number, string> = {
  0: 'OFF',
  1: 'IDLE',
  2: 'RUN',
  3: 'ERROR',
};

@Component({
  imports: [CylinderChartBox],
  selector: 'app-cylinder-chart-grid',
  styleUrl: './cylinder-chart-grid.scss',
  templateUrl: './cylinder-chart-grid.html',
})
export class CylinderChartGrid implements OnInit, OnDestroy {
  // SingleBarChart は単一系列専用のため yAxisIndex は使用しない。
  protected physicalSeriesConfig: ChartSeriesData = {
    name: 'Level',
    color: 'rgba(75,120,220,0.8)',
    range: { min: 0, max: 100 },
    yAxisIndex: 0,
  };
  protected discreteSeriesConfig: ChartSeriesData = {
    name: 'Status',
    color: 'rgba(220,90,60,0.8)',
    dict: STATUS_DICT,
    yAxisIndex: 0,
  };

  protected physicalData = signal<ChartPointData>({ value: 50, timestamp: Date.now() });
  protected discreteData = signal<ChartPointData>({ value: 0, timestamp: Date.now() });

  private intervalId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      const now = Date.now();
      this.physicalData.update(({ value }) => ({
        value: Math.min(100, Math.max(0, value + (Math.random() * 2 - 1) * 15)),
        timestamp: now,
      }));
      this.discreteData.set({
        value: Math.floor(Math.random() * 4),
        timestamp: now,
      });
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
