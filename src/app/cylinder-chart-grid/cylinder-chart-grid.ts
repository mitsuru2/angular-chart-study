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
    name: 'ENGINE SPEED',
    color: 'rgba(75,120,220,0.8)',
    range: { min: 0, max: 20000 },
    yAxisIndex: 0,
  };
  protected discreteSeriesConfig: ChartSeriesData = {
    name: 'Status',
    color: 'rgba(220,90,60,0.8)',
    dict: STATUS_DICT,
    yAxisIndex: 0,
  };
  protected longNameParamConfig: ChartSeriesData = {
    name: 'CHARGE RATIO (vs REMAINING CAPACITY)',
    color: 'lime',
    range: { min: 0, max: 100 },
    yAxisIndex: 0,
  };

  protected physicalData = signal<ChartPointData>({ value: 10000, timestamp: Date.now() });
  protected discreteData = signal<ChartPointData>({ value: 0, timestamp: Date.now() });
  protected longNameData = signal<ChartPointData>({ value: 50, timestamp: Date.now() });

  private intervalId?: ReturnType<typeof setInterval>;

  private counter = 0;

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.counter++;
      const now = Date.now();
      this.physicalData.update(({ value }) => ({
        value: Math.round(Math.min(20000, Math.max(0, value + (Math.random() * 2 - 1) * 1000))),
        timestamp: now,
      }));
      if (this.counter % 2 === 0) {
        this.longNameData.update(({ value }) => ({
          value: Math.round(Math.min(100, Math.max(0, value + (Math.random() * 2 - 1) * 5))),
          timestamp: now,
        }));
      }
      if (this.counter % 5 === 0) {
        this.discreteData.set({
          value: Math.floor(Math.random() * 4),
          timestamp: now,
        });
      }
    }, 200);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
