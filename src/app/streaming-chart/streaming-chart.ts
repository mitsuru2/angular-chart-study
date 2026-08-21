import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import type { LineSeriesOption } from 'echarts/charts';
import type {
  GridComponentOption,
  TitleComponentOption,
  TooltipComponentOption,
} from 'echarts/components';
import { StreamingPoint } from './streaming-point';

echarts.use([LineChart, GridComponent, TitleComponent, TooltipComponent, CanvasRenderer]);

type StreamingChartOption = ComposeOption<
  LineSeriesOption | GridComponentOption | TitleComponentOption | TooltipComponentOption
>;

@Component({
  selector: 'app-streaming-chart',
  template: `
    <div class="streaming-chart">
      <div
        #chartHost
        class="streaming-chart__canvas"
        role="img"
        [attr.aria-label]="chartSummary()"
      ></div>
      <p class="streaming-chart__sr-only" aria-live="polite">{{ chartSummary() }}</p>
    </div>
  `,
  styles: `
    .streaming-chart {
      display: block;
      inline-size: 100%;
      block-size: 100%;
    }

    .streaming-chart__canvas {
      inline-size: 100%;
      block-size: 100%;
      min-block-size: 20rem;
    }

    .streaming-chart__sr-only {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      margin: -1px;
    }
  `,
  host: {
    '(window:resize)': 'onResize()',
  },
})
export class StreamingChart {
  readonly chartTitle = input('Streaming Chart');
  readonly seriesName = input('Value');
  readonly unit = input('');
  readonly points = input.required<readonly StreamingPoint[]>();

  private readonly chartHost = viewChild.required<ElementRef<HTMLDivElement>>('chartHost');
  private chartInstance: echarts.ECharts | undefined;

  protected readonly chartSummary = computed(() => {
    const data = this.points();
    if (data.length === 0) {
      return `${this.chartTitle()}: no data yet`;
    }
    const latest = data[data.length - 1];
    return `${this.chartTitle()}: latest ${this.seriesName()} is ${latest.value.toFixed(2)}${this.unit()}, ${data.length} points plotted`;
  });

  constructor() {
    afterNextRender(() => {
      this.chartInstance = echarts.init(this.chartHost().nativeElement);
      this.chartInstance.setOption(this.buildOption(this.points()));
    });

    effect(() => {
      const data = this.points();
      this.chartInstance?.setOption(this.buildSeriesUpdate(data));
    });

    inject(DestroyRef).onDestroy(() => this.chartInstance?.dispose());
  }

  protected onResize(): void {
    this.chartInstance?.resize();
  }

  private buildOption(points: readonly StreamingPoint[]): StreamingChartOption {
    return {
      title: { text: this.chartTitle(), textStyle: { fontSize: 14 } },
      tooltip: {
        trigger: 'axis',
        valueFormatter: (value) => `${Number(value).toFixed(2)}${this.unit()}`,
      },
      grid: { left: 56, right: 24, top: 48, bottom: 32 },
      xAxis: {
        type: 'time',
        axisLabel: { formatter: (value: number) => new Date(value).toLocaleTimeString() },
      },
      yAxis: { type: 'value', name: this.seriesName() },
      series: [this.buildSeries(points)],
    };
  }

  private buildSeriesUpdate(points: readonly StreamingPoint[]): StreamingChartOption {
    return { series: [this.buildSeries(points)] };
  }

  private buildSeries(points: readonly StreamingPoint[]): LineSeriesOption {
    return {
      name: this.seriesName(),
      type: 'line',
      showSymbol: false,
      smooth: true,
      lineStyle: { width: 2 },
      data: points.map((point) => [point.timestamp, point.value]),
    };
  }
}
