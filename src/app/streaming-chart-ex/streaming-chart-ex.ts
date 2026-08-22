import { Component, computed, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import {
  StreamingChartExGraphOptionData,
  StreamingChartExPointData,
  StreamingChartExSeriesData,
} from './streaming-chart-ex.interface';

// Number of most-recent points kept visible through the X-axis window. `seriesData`
// itself is expected to only ever grow (points appended, never dropped from the
// front) — see the class doc comment on `mergeOption` for why.
const VISIBLE_POINT_COUNT = 200;

@Component({
  imports: [NgxEchartsDirective],
  selector: 'app-streaming-chart-ex',
  styleUrl: './streaming-chart-ex.scss',
  templateUrl: './streaming-chart-ex.html',
})
export class StreamingChartEx {
  seriesConfig = input.required<StreamingChartExSeriesData[]>();
  seriesData = input.required<StreamingChartExPointData[][]>();
  graphOption = input<StreamingChartExGraphOptionData>({});

  protected option = computed(() => {
    const configs = this.seriesConfig();
    const showElapsedTime = this.graphOption().showElapsedTime ?? false;
    const startTimestamp = this.startTimestamp();

    const yAxis = configs.map((config) => ({
      type: 'value' as const,
      position: 'left' as const,
      offset: config.index * 60,
      ...(config.range
        ? { min: config.range.min, max: config.range.max }
        : { boundaryGap: [0, '100%'] as [number, string] }),
      splitLine: { show: false },
      // The X-axis is time-based, so there's no meaningful "value 0" position to
      // anchor a Y-axis line to — the default `onZero: true` tries anyway and ends
      // up placing the line off the visible plot. Anchor it to the axis's own
      // boundary instead so the line and its ticks actually render.
      axisLine: { show: true, onZero: false },
      axisTick: { show: true },
    }));

    const series = configs.map((config, index) => ({
      name: config.name,
      type: 'line' as const,
      showSymbol: false,
      yAxisIndex: index,
      lineStyle: { color: config.color },
      itemStyle: { color: config.color },
      data: [] as [number, number][],
    }));

    const maxIndex = configs.reduce((max, config) => Math.max(max, config.index), 0);

    return {
      legend: { top: 10, data: configs.map((config) => config.name) },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          const lines = params.map(
            (param) => `${param.marker}${param.seriesName}: ${param.value[1]}`,
          );
          const header = this.formatXAxisLabel(params[0].value[0], showElapsedTime, startTimestamp);
          return [header, ...lines].join('<br/>');
        },
        axisPointer: { animation: false },
      },
      grid: { top: 50, left: 50 + (maxIndex + 1) * 60, right: 20, bottom: 40 },
      xAxis: {
        type: 'time' as const,
        splitLine: { show: false },
        axisLabel: {
          formatter: (value: number) =>
            this.formatXAxisLabel(value, showElapsedTime, startTimestamp),
        },
      },
      yAxis,
      series,
      animationDurationUpdate: 200,
      animationEasingUpdate: 'linear' as const,
    };
  });

  // `seriesData` is expected to only grow (append-only) rather than drop its oldest
  // point every tick. That keeps every existing point's array index — and therefore
  // its identity to ECharts' diff/animation logic — stable forever, so an unchanged
  // point is never mistaken for "moved to a different value" by the update
  // animation. Instead, only the X-axis window here advances each tick (derived
  // from the data's own timestamps), which is what actually produces the
  // slide-left motion: the whole line pans left together, and only the newest
  // point is genuinely new.
  protected mergeOption = computed(() => {
    const data = this.seriesData();
    let windowMin: number | undefined;
    let windowMax: number | undefined;
    for (const points of data) {
      const windowStart = points[Math.max(0, points.length - VISIBLE_POINT_COUNT)];
      const last = points[points.length - 1];
      if (windowStart && (windowMin === undefined || windowStart.timestamp < windowMin)) {
        windowMin = windowStart.timestamp;
      }
      if (last && (windowMax === undefined || last.timestamp > windowMax)) {
        windowMax = last.timestamp;
      }
    }
    return {
      xAxis: { min: windowMin, max: windowMax },
      series: data.map((points) => ({
        data: points.map((point): [number, number] => [point.timestamp, point.value]),
      })),
    };
  });

  // With append-only data, the earliest point is always at index 0 forever, so this
  // needs no latching — it naturally stays stable once any data exists.
  private startTimestamp = computed(() => {
    const data = this.seriesData();
    let min: number | undefined;
    for (const points of data) {
      const first = points[0]?.timestamp;
      if (first !== undefined && (min === undefined || first < min)) min = first;
    }
    return min;
  });

  private formatXAxisLabel(
    value: number,
    showElapsedTime: boolean,
    startTimestamp: number | undefined,
  ): string {
    if (!showElapsedTime || startTimestamp === undefined) {
      return new Date(value).toLocaleTimeString();
    }
    const elapsedSeconds = Math.max(0, Math.round((value - startTimestamp) / 1000));
    return `${elapsedSeconds}s`;
  }
}
