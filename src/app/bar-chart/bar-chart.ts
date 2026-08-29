import { Component, computed, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { BarChartParam, ChartPointData, RangeData } from '../model/chart-data.interface';

@Component({
  imports: [NgxEchartsDirective],
  selector: 'app-bar-chart',
  styleUrl: './bar-chart.scss',
  templateUrl: './bar-chart.html',
})
export class BarChart {
  //
  // 入力パラメータ
  //
  // 全パラメータでY軸を1本だけ共有するため、系列ごとの yAxisIndex は持たない。
  params = input.required<BarChartParam[]>();
  // params と同じ並び順・同じ長さの現在値。
  data = input.required<ChartPointData[]>();
  // 指定時は固定レンジ、未指定時はデータ値からの自動調整レンジになる。
  // このモードの実行中の動的切り替えは非サポート。
  yAxisRange = input<RangeData>();

  protected ariaLabel = computed(() => {
    const params = this.params();
    const data = this.data();
    const lines = params.map((param, index) => `${param.name}: ${data[index]?.value ?? ''}`);
    return `Bar chart: ${lines.join(', ')}`;
  });

  // 【option/mergeOptionを分割する理由】
  // ngx-echarts は [options] バインディングが変わるたびに setOption(_, notMerge: true)(フル置換)を
  // 呼ぶため、最新値は option ではなく mergeOption 経由で渡し、バーのアニメーションを保つ。
  protected option = computed(() => {
    const params = this.params();
    const range = this.yAxisRange();

    return {
      grid: { left: 60, top: 20, right: 20, bottom: 40 },
      xAxis: {
        type: 'category' as const,
        data: params.map((param) => param.name),
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value' as const,
        position: 'left' as const,
        min: range?.min,
        max: range?.max,
        splitLine: { show: false },
        axisLine: { show: true },
        axisTick: { show: true },
      },
      series: [
        {
          type: 'bar' as const,
          barWidth: '60%',
          data: params.map(() => ({ value: 0 })),
        },
      ],
      animationDurationUpdate: 200,
      animationEasingUpdate: 'linear' as const,
    };
  });

  protected mergeOption = computed(() => {
    const params = this.params();
    const data = this.data();
    return {
      series: [
        {
          data: params.map((param, index) => ({
            value: data[index]?.value ?? 0,
            itemStyle: { color: param.color },
          })),
        },
      ],
    };
  });
}
