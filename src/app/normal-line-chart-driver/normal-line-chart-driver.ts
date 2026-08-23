import { Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { NormalLineChart } from '../normal-line-chart/normal-line-chart';
import { ChartPointData, ChartSeriesData } from '../model/chart-data.interface';

const STATUS_DICT: Record<number, string> = {
  0: 'OFF',
  1: 'IDLE',
  2: 'RUN',
  3: 'ERROR',
};

// 記録済みの時系列データを、開始オフセット(秒)・継続時間(秒)・サンプリング間隔(ms)を
// 指定してランダムウォークで一括生成する。ストリーミング版と違い、setInterval では
// なくこの場でループを回して全ポイントを作り切る。
function generateSeries(
  options: {
    startOffsetSec: number;
    durationSec: number;
    stepMs: number;
    min: number;
    max: number;
    initialValue: number;
    stepSize: number;
    discrete?: boolean;
  },
  baseTimestamp: number,
): ChartPointData[] {
  const { startOffsetSec, durationSec, stepMs, min, max, initialValue, stepSize, discrete } =
    options;
  const points: ChartPointData[] = [];
  let value = initialValue;
  const startMs = baseTimestamp + startOffsetSec * 1000;
  const durationMs = durationSec * 1000;
  for (let elapsed = 0; elapsed <= durationMs; elapsed += stepMs) {
    if (discrete) {
      if (Math.random() < 0.05) {
        value = Math.floor(Math.random() * (max - min + 1)) + min;
      }
    } else {
      value = Math.min(max, Math.max(min, value + (Math.random() * 2 - 1) * stepSize));
    }
    points.push({ timestamp: startMs + elapsed, value: Math.round(value) });
  }
  return points;
}

@Component({
  imports: [NormalLineChart, ToggleSwitch, ReactiveFormsModule],
  selector: 'app-normal-line-chart-driver',
  styleUrl: './normal-line-chart-driver.scss',
  templateUrl: './normal-line-chart-driver.html',
})
export class NormalLineChartDriver {
  protected seriesConfig: ChartSeriesData[] = [
    { name: 'Sensor', color: 'rgba(75,120,220,0.8)', range: { min: 0, max: 100 }, yAxisIndex: 0 },
    { name: 'Status', color: 'rgba(220,90,60,0.8)', dict: STATUS_DICT, yAxisIndex: 1 },
    { name: 'Extra', color: 'rgba(60,180,90,0.8)', range: { min: 0, max: 30 }, yAxisIndex: 2 },
  ];

  // 記録済みデータは一度きり生成し、以後書き換えない。系列ごとに開始オフセットと
  // 継続時間をわざと変えて、X軸が全系列の最小/最大タイムスタンプに合わせて
  // 正しく算出されること、短い系列の線が途中で止まることを確認できるようにしている。
  protected seriesData: ChartPointData[][] = (() => {
    const baseTimestamp = Date.now();
    return [
      generateSeries(
        {
          startOffsetSec: 0,
          durationSec: 600,
          stepMs: 1000,
          min: 0,
          max: 100,
          initialValue: 50,
          stepSize: 5,
        },
        baseTimestamp,
      ),
      generateSeries(
        {
          startOffsetSec: 60,
          durationSec: 480,
          stepMs: 1000,
          min: 0,
          max: 3,
          initialValue: 0,
          stepSize: 1,
          discrete: true,
        },
        baseTimestamp,
      ),
      generateSeries(
        {
          startOffsetSec: 200,
          durationSec: 120,
          stepMs: 1000,
          min: 0,
          max: 30,
          initialValue: 15,
          stepSize: 3,
        },
        baseTimestamp,
      ),
    ];
  })();

  protected showExtraSeriesControl = new FormControl(true, { nonNullable: true });
  private showExtraSeries = toSignal(this.showExtraSeriesControl.valueChanges, {
    initialValue: this.showExtraSeriesControl.value,
  });

  protected visibleSeriesConfig = computed(() =>
    this.showExtraSeries() ? this.seriesConfig : this.seriesConfig.slice(0, 2),
  );
  protected visibleSeriesData = computed(() =>
    this.showExtraSeries() ? this.seriesData : this.seriesData.slice(0, 2),
  );
}
