import { Component, computed, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { ChartPointData, ChartSeriesData } from '../model/chart-data.interface';

// The X-axis always spans exactly this many seconds, anchored at [-WINDOW_SECONDS, 0]
// (0 = now, the right edge) — it never grows or shrinks, even before this much data
// has accumulated. `seriesData` itself is expected to only ever grow (points appended,
// never dropped from the front) — see the class doc comment on `mergeOption` for why.
const WINDOW_SECONDS = 60;

@Component({
  imports: [NgxEchartsDirective],
  selector: 'app-streaming-chart-reverse',
  styleUrl: './streaming-chart-reverse.scss',
  templateUrl: './streaming-chart-reverse.html',
})
export class StreamingChartReverse {
  seriesConfig = input.required<ChartSeriesData[]>();
  seriesData = input.required<ChartPointData[][]>();

  protected option = computed(() => {
    const configs = this.seriesConfig();

    const yAxis = configs.map((config) => {
      const dictKeys = config.dict ? Object.keys(config.dict).map(Number) : undefined;
      const isDiscrete = dictKeys !== undefined && dictKeys.length > 0;

      return {
        type: 'value' as const,
        position: 'left' as const,
        offset: config.yAxisIndex * 60,
        ...(isDiscrete
          ? { min: Math.min(...dictKeys!), max: Math.max(...dictKeys!), interval: 1 }
          : config.range
            ? { min: config.range.min, max: config.range.max }
            : { boundaryGap: [0, '100%'] as [number, string] }),
        axisLabel: isDiscrete
          ? { formatter: (value: number) => config.dict?.[value] ?? String(value) }
          : {},
        splitLine: { show: false },
        // Mirrors streaming-chart-ex's fix: the X-axis has no meaningful "value 0"
        // position for these series to anchor to, so anchor the axis line to its own
        // boundary instead of relying on the default onZero behavior.
        axisLine: { show: true, onZero: false },
        axisTick: { show: true },
      };
    });

    const series = configs.map((config, index) => ({
      name: config.name,
      type: 'line' as const,
      showSymbol: false,
      yAxisIndex: index,
      lineStyle: { color: config.color },
      itemStyle: { color: config.color },
      data: [] as [number, number][],
    }));

    const maxYAxisIndex = configs.reduce((max, config) => Math.max(max, config.yAxisIndex), 0);

    return {
      legend: { top: 10, data: configs.map((config) => config.name) },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          const lines = params.map(
            (param) => `${param.marker}${param.seriesName}: ${param.value[1]}`,
          );
          const header = `${Math.round(params[0].value[0])}s`;
          return [header, ...lines].join('<br/>');
        },
        axisPointer: { animation: false },
      },
      grid: { top: 50, left: 50 + (maxYAxisIndex + 1) * 60, right: 20, bottom: 40 },
      xAxis: {
        type: 'value' as const,
        min: -WINDOW_SECONDS,
        max: 0,
        splitLine: { show: false },
        axisLabel: { formatter: (value: number) => `${value}s` },
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
  // point is never mistaken for "moved to a different value" by the update animation.
  // Since the X-axis window here is fixed at [-WINDOW_SECONDS, 0], the slide-left
  // motion instead comes purely from remapping every point's X value to its age
  // relative to "now" each tick: as "now" advances, every existing point's relative
  // position shifts left by the same amount, which reads as the whole line panning
  // left together. Points older than the window simply fall outside axis bounds and
  // stop being drawn — they are never removed from the array, so this trades memory
  // for animation smoothness, same as streaming-chart-ex.
  protected mergeOption = computed(() => {
    const data = this.seriesData();

    let nowTimestamp: number | undefined;
    for (const points of data) {
      const last = points[points.length - 1];
      if (last && (nowTimestamp === undefined || last.timestamp > nowTimestamp)) {
        nowTimestamp = last.timestamp;
      }
    }

    return {
      series: data.map((points) => ({
        data: points.map((point): [number, number] => [
          nowTimestamp === undefined ? 0 : (point.timestamp - nowTimestamp) / 1000,
          point.value,
        ]),
      })),
    };
  });
}
