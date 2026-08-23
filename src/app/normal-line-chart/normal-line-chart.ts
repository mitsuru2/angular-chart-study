import { Component, computed, input, signal } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { CircleFill } from '@primeicons/angular/circle-fill';
import { ChartPointData, ChartSeriesData } from '../model/chart-data.interface';

// Y軸を1つ左にスタックするごとに加算するオフセット(px)。
const Y_AXIS_OFFSET_STEP = 60;

// tooltip の formatter に渡ってくる ECharts の params のうち、実際に使う
// フィールドだけを最小限に型付けしたもの。
interface TooltipParam {
  marker: string; // 凡例と同じ色のマーカー(丸印)を表すHTML文字列。
  seriesName: string; // 系列名(`ChartSeriesData.name`)。
  value: [number, number]; // データポイントの座標 [X, Y] 。
}

@Component({
  imports: [NgxEchartsDirective, CircleFill],
  selector: 'app-normal-line-chart',
  styleUrl: './normal-line-chart.scss',
  templateUrl: './normal-line-chart.html',
})
export class NormalLineChart {
  private readonly className = 'NormalLineChart';

  //
  // 入力パラメータ
  //
  seriesConfig = input.required<ChartSeriesData[]>();
  seriesData = input.required<ChartPointData[][]>();

  // 凡例で直近にクリックされた系列名が先頭にくる配列。
  // まだ何もクリックされていなければ空。クリックされると、その系列のY軸が先頭(offset 0)に昇格し、
  // 残りは相対順序を保ったまま繰り上がる ── 詳細は `effectiveAxisOrder` を参照。
  private clickOrder = signal<string[]>([]);

  // 現在の `seriesConfig` に存在する全系列名の「隙間のない」順列を常に返す:
  // クリック履歴にある名前(存在しなくなったものは除外)を先頭に、残りは元々の
  // `yAxisIndex` 順で続ける。一度もクリックされていなければ、これは系列の設定順そのものと一致する。
  private effectiveAxisOrder = computed(() => {
    const configs = this.seriesConfig();
    const names = new Set(configs.map((config) => config.name));
    const baseline = this.baselineAxisOrder(configs);
    const clicked = this.clickOrder().filter((name) => names.has(name));
    return [...clicked, ...baseline.filter((name) => !clicked.includes(name))];
  });

  protected onLegendItemClick(name: string) {
    const location = `${this.className}.onLegendItemClick()`;
    console.debug(`${location} ${name}`);
    this.clickOrder.update((order) => [name, ...order.filter((n) => n !== name)]);
  }

  // 系列を設定上の `yAxisIndex` 昇順に並べた名前の配列を返す。
  private baselineAxisOrder(configs: ChartSeriesData[]): string[] {
    return [...configs].sort((a, b) => a.yAxisIndex - b.yAxisIndex).map((config) => config.name);
  }

  // 現在の `seriesData` に含まれる全系列・全ポイントの中の最小/最大タイムスタンプ。
  // X軸の起点(=経過0秒)と終点は、これらを都度再計算して求める。
  // 系列の追加・削除で変化するため、固定値としてキャプチャせず computed にしている。
  private timestampRange = computed(() => {
    let start: number | undefined;
    let end: number | undefined;
    for (const points of this.seriesData()) {
      for (const point of points) {
        if (start === undefined || point.timestamp < start) {
          start = point.timestamp;
        }
        if (end === undefined || point.timestamp > end) {
          end = point.timestamp;
        }
      }
    }
    return { start, end };
  });

  // 【option/mergeOptionを分割する理由】
  // 各系列のデータは固定で動的に変化しないため、本来は mergeOption を使用する必要はない。
  // Y軸の並び替えを差分マージでアニメーションさせるために、Y軸設定のみ mergeOption に分割している。
  //
  protected option = computed(() => {
    const location = `${this.className}.option`;
    console.debug(`${location} recompute`);

    const configs = this.seriesConfig();
    const data = this.seriesData();
    const baselineOrder = this.baselineAxisOrder(configs);
    const { start, end } = this.timestampRange();

    const yAxis = configs.map((config) => {
      const dictKeys = config.dict ? Object.keys(config.dict).map(Number) : undefined;
      const isDiscrete = dictKeys !== undefined && dictKeys.length > 0;

      return {
        type: 'value' as const,
        position: 'left' as const,
        offset: baselineOrder.indexOf(config.name) * Y_AXIS_OFFSET_STEP,
        ...(isDiscrete
          ? { min: Math.min(...dictKeys!), max: Math.max(...dictKeys!), interval: 1 }
          : config.range
            ? { min: config.range.min, max: config.range.max }
            : { boundaryGap: [0, '100%'] as [number, string] }),
        axisLabel: isDiscrete
          ? { formatter: (value: number) => config.dict?.[value] ?? String(value) }
          : {},
        splitLine: { show: false },
        // デフォルトの onZero に任せると軸線が描画範囲外へずれてしまうため false に設定。
        axisLine: { show: true, onZero: false },
        axisTick: { show: true },
      };
    });

    // データ全体の最短所要時間を最低幅として確保し、単一時点データ等で
    // X軸の幅が0になるのを防ぐ。
    const xMax = start === undefined || end === undefined ? 1 : Math.max((end - start) / 1000, 1);

    const series = configs.map((config, index) => {
      const points = data[index] ?? [];
      return {
        name: config.name,
        type: 'line' as const,
        showSymbol: false,
        yAxisIndex: index,
        lineStyle: { color: config.color },
        itemStyle: { color: config.color },
        data: points.map((point) => ({
          value: [start === undefined ? 0 : (point.timestamp - start) / 1000, point.value] as [
            number,
            number,
          ],
          id: point.timestamp,
        })),
      };
    });

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: TooltipParam[]) => {
          const lines = params.map(
            (param) => `${param.marker}${param.seriesName}: ${param.value[1]}`,
          );
          const header = `${Math.round(params[0].value[0])}s`;
          return [header, ...lines].join('<br/>');
        },
        axisPointer: { animation: false },
      },
      grid: { top: 20, left: 50 + configs.length * Y_AXIS_OFFSET_STEP, right: 20, bottom: 80 },
      xAxis: {
        type: 'value' as const,
        min: 0,
        max: xMax,
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

  // Y軸の並び替えだけを差分として与える。ECharts は配列をインデックスでマージするため、
  // ここでの `.map()` は `axisOrder`(クリックによる並べ替え後の順序)ではなく、あえて
  // `option` 側の `yAxis` 配列と同じ並び順である `seriesConfig()` をそのまま反復している
  // ── StreamingChartReverse の `mergeOption` と同じ理由・同じ構造。
  protected mergeOption = computed(() => {
    const axisOrder = this.effectiveAxisOrder();
    return {
      yAxis: this.seriesConfig().map((config) => ({
        offset: axisOrder.indexOf(config.name) * Y_AXIS_OFFSET_STEP,
      })),
    };
  });
}
