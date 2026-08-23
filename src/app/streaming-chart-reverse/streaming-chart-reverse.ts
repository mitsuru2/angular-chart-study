import { Component, computed, input, signal } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { ChartPointData, ChartSeriesData } from '../model/chart-data.interface';

// The X-axis always spans exactly this many seconds, anchored at [-WINDOW_SECONDS, 0]
// (0 = now, the right edge) — it never grows or shrinks, even before this much data
// has accumulated. `seriesData` itself is expected to only ever grow (points appended,
// never dropped from the front) — see the class doc comment on `mergeOption` for why.
const WINDOW_SECONDS = 60;

// Shape of the params ngx-echarts forwards unmodified from ECharts' native
// 'legendselectchanged' event.
interface LegendSelectChangedEvent {
  name: string;
  selected: Record<string, boolean>;
}

@Component({
  imports: [NgxEchartsDirective],
  selector: 'app-streaming-chart-reverse',
  styleUrl: './streaming-chart-reverse.scss',
  templateUrl: './streaming-chart-reverse.html',
})
export class StreamingChartReverse {
  seriesConfig = input.required<ChartSeriesData[]>();
  seriesData = input.required<ChartPointData[][]>();

  // Series names most-recently-clicked-in-legend first. Empty until the user clicks a
  // legend entry, at which point that series' Y axis is promoted to the front (offset
  // 0) and the rest keep their relative order — see `effectiveAxisOrder`.
  private clickOrder = signal<string[]>([]);

  // Always a dense permutation of every series name currently in `seriesConfig`: the
  // clicked-order names first (filtered to ones that still exist), then the remaining
  // series in their original `yAxisIndex` order. With no clicks yet, this exactly
  // matches the series' original configured order.
  private effectiveAxisOrder = computed(() => {
    const configs = this.seriesConfig();
    const names = new Set(configs.map((config) => config.name));
    const baseline = [...configs]
      .sort((a, b) => a.yAxisIndex - b.yAxisIndex)
      .map((config) => config.name);
    const clicked = this.clickOrder().filter((name) => names.has(name));
    return [...clicked, ...baseline.filter((name) => !clicked.includes(name))];
  });

  protected onLegendSelectChanged(event: LegendSelectChangedEvent) {
    this.clickOrder.update((order) => [event.name, ...order.filter((name) => name !== event.name)]);
  }

  // Depends only on `seriesConfig`, never on `clickOrder`/`effectiveAxisOrder`. This
  // matters: ngx-echarts applies the `[options]` binding via `setOption(_, notMerge:
  // true)` (a full replace) whenever it changes, which would reset every series'
  // placeholder `data: []` back to empty — wiping out whatever `mergeOption` had
  // streamed in. A legend click must instead flow through `mergeOption` (applied via
  // a non-destructive merge), so the axis reorder doesn't blank the chart for a tick.
  // yAxis offsets here just use the baseline (configured) order as their initial
  // value — `mergeOption` supplies the authoritative, click-aware offset from the
  // first render onward, the same way it supplies the first real `series[].data`.
  protected option = computed(() => {
    const configs = this.seriesConfig();
    const baselineOrder = [...configs]
      .sort((a, b) => a.yAxisIndex - b.yAxisIndex)
      .map((config) => config.name);

    const yAxis = configs.map((config) => {
      const dictKeys = config.dict ? Object.keys(config.dict).map(Number) : undefined;
      const isDiscrete = dictKeys !== undefined && dictKeys.length > 0;

      return {
        type: 'value' as const,
        position: 'left' as const,
        offset: baselineOrder.indexOf(config.name) * 60,
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

    return {
      legend: {
        top: 10,
        data: configs.map((config) => config.name),
        // Initial value only — the legend is repurposed as an axis-reorder control
        // rather than a show/hide toggle (see `onLegendSelectChanged`), and
        // `mergeOption` is what actually reasserts "all selected" on every click to
        // undo ECharts' default click-to-hide behavior (it's the binding that can
        // react to a click without blanking the chart's streamed data; see the
        // comment above this computed).
        selected: Object.fromEntries(configs.map((config) => [config.name, true])),
      },
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
      grid: { top: 50, left: 50 + configs.length * 60, right: 20, bottom: 80 },
      xAxis: {
        type: 'value' as const,
        min: -WINDOW_SECONDS,
        max: 0,
        splitLine: { show: false },
        axisLabel: { formatter: (value: number) => `${value}s` },
      },
      yAxis,
      series,
      dataZoom: [{ type: 'slider' as const, xAxisIndex: 0, bottom: 10, height: 24 }],
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
  //
  // This also carries the click-driven axis reorder (`yAxis[].offset`) and the
  // `legend.selected` reassertion (undoing ECharts' default click-to-hide behavior —
  // see `onLegendSelectChanged`), rather than `option`, precisely because this is
  // applied via a non-destructive merge: reordering here can't blank the chart's
  // streamed data the way changing `option` would (see the comment on `option`).
  protected mergeOption = computed(() => {
    const configs = this.seriesConfig();
    const axisOrder = this.effectiveAxisOrder();
    const data = this.seriesData();

    let nowTimestamp: number | undefined;
    for (const points of data) {
      const last = points[points.length - 1];
      if (last && (nowTimestamp === undefined || last.timestamp > nowTimestamp)) {
        nowTimestamp = last.timestamp;
      }
    }

    return {
      legend: {
        selected: Object.fromEntries(configs.map((config) => [config.name, true])),
      },
      yAxis: configs.map((config) => ({ offset: axisOrder.indexOf(config.name) * 60 })),
      series: data.map((points) => ({
        data: points.map((point): [number, number] => [
          nowTimestamp === undefined ? 0 : (point.timestamp - nowTimestamp) / 1000,
          point.value,
        ]),
      })),
    };
  });
}
