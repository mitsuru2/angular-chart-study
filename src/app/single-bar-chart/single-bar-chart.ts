import { Component, computed, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { ChartPointData, ChartSeriesData } from '../model/chart-data.interface';

@Component({
  imports: [NgxEchartsDirective],
  selector: 'app-single-bar-chart',
  styleUrl: './single-bar-chart.scss',
  templateUrl: './single-bar-chart.html',
})
export class SingleBarChart {
  //
  // 入力パラメータ
  //
  // 単一系列バーチャートのため yAxisIndex は使用しない。
  seriesConfig = input.required<ChartSeriesData>();
  data = input.required<ChartPointData>();
  width = input.required<number>();
  height = input.required<number>();

  private isDiscrete = computed(() => {
    const dict = this.seriesConfig().dict;
    return dict !== undefined && Object.keys(dict).length > 0;
  });

  protected ariaLabel = computed(() => {
    const config = this.seriesConfig();
    const value = this.data().value;
    const label = this.isDiscrete() ? (config.dict?.[value] ?? String(value)) : String(value);
    return `${config.name}: ${label}`;
  });

  // 【option/mergeOptionを分割する理由】
  // ngx-echarts は [options] バインディングが変わるたびに setOption(_, notMerge: true)(フル置換)を
  // 呼ぶため、最新値は option ではなく mergeOption 経由で渡し、バーのアニメーションを保つ。
  protected option = computed(() => {
    const config = this.seriesConfig();
    const dict = config.dict;
    const dictKeys = dict ? Object.keys(dict).map(Number) : undefined;
    const isDiscrete = dictKeys !== undefined && dictKeys.length > 0;

    return {
      grid: { left: '50%', top: '5%', right: '10%', bottom: '5%' },
      xAxis: {
        type: 'category' as const,
        data: [config.name],
        show: false,
      },
      yAxis: {
        type: 'value' as const,
        position: 'left' as const,
        ...(isDiscrete
          ? { min: Math.min(...dictKeys!), max: Math.max(...dictKeys!), interval: 1 }
          : {
              min: config.range?.min,
              max: config.range?.max,
              interval:
                config.range?.min !== undefined && config.range?.max !== undefined
                  ? (config.range.max - config.range.min) / 2
                  : undefined,
            }),
        axisLabel: isDiscrete
          ? { formatter: (value: number) => dict?.[value] ?? String(value) }
          : {},
        splitLine: { show: false },
        axisLine: { show: true, onZero: false },
        axisTick: { show: true },
      },
      series: [
        {
          type: 'bar' as const,
          barWidth: '60%',
          itemStyle: { color: config.color },
          data: [{ value: 0 }],
        },
      ],
      animationDurationUpdate: 200,
      animationEasingUpdate: 'linear' as const,
    };
  });

  protected mergeOption = computed(() => ({
    series: [{ data: [{ value: this.data().value }] }],
  }));
}
