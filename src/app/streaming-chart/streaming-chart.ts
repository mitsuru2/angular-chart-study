import { Component, computed, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { DataItemData, SeriesConfig } from './streaming-chart.interface';

@Component({
  imports: [NgxEchartsDirective],
  selector: 'app-streaming-chart',
  styleUrl: './streaming-chart.scss',
  templateUrl: './streaming-chart.html',
})
export class StreamingChart {
  seriesConfig = input.required<SeriesConfig[]>();
  seriesData = input.required<DataItemData[][]>();

  protected option = computed(() => {
    const configs = this.seriesConfig();

    const yAxis = configs.map((config, index) =>
      config.labels
        ? {
            type: 'value',
            position: 'left' as const,
            offset: index * 60,
            min: 0,
            max: config.labels.length - 1,
            interval: 1,
            splitLine: { show: false },
            axisLabel: {
              formatter: (value: number) => config.labels?.[value] ?? '',
            },
          }
        : {
            type: 'value',
            position: 'left' as const,
            offset: index * 60,
            boundaryGap: [0, '100%'],
            splitLine: { show: false },
          },
    );

    const series = configs.map((config, index) => ({
      name: config.name,
      type: 'line',
      step: config.labels ? ('end' as const) : undefined,
      showSymbol: false,
      yAxisIndex: index,
      data: [] as DataItemData[],
    }));

    return {
      legend: {
        top: 10,
        data: configs.map((config) => config.name),
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          const date = new Date(params[0].name);
          const lines = params.map((param) => {
            const config = configs[param.seriesIndex];
            const value = param.value[1];
            const label = config.labels ? (config.labels[value] ?? value) : value;
            return `${param.marker}${param.seriesName}: ${label}`;
          });
          return [
            `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
            ...lines,
          ].join('<br/>');
        },
        axisPointer: {
          animation: false,
        },
      },
      grid: {
        top: 50,
        left: 50 + configs.length * 60,
        right: 20,
        bottom: 40,
      },
      xAxis: {
        type: 'time',
        splitLine: {
          show: false,
        },
      },
      yAxis,
      series,
      animationDurationUpdate: 200,
      animationEasingUpdate: 'linear' as const,
    };
  });

  protected mergeOption = computed(() => ({
    series: this.seriesData().map((data) => ({ data })),
  }));
}
