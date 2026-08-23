import { Component, computed, input, signal } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { CircleFill } from '@primeicons/angular/circle-fill';
import { ChartPointData, ChartSeriesData } from '../model/chart-data.interface';

// X軸は常にこの秒数ぶんの幅で、[-WINDOW_SECONDS, 0](0 = 現在、右端)に固定される。
// データがこの秒数ぶん溜まっていなくても伸び縮みしない。
const WINDOW_SECONDS = 60;

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
  selector: 'app-streaming-chart-reverse',
  styleUrl: './streaming-chart-reverse.scss',
  templateUrl: './streaming-chart-reverse.html',
})
export class StreamingChartReverse {
  private readonly className = 'StreamingChartReverse';

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

  // 系列を設定上の `yAxisIndex` 昇順に並べた名前の配列を返す。`option` と
  // `effectiveAxisOrder` の両方から呼ばれる純粋関数(signalではない)。
  // `computed()` にすると `option` が間接的に `clickOrder` に
  // 依存する経路が生まれてしまうため(下記 `option` のコメントを参照)。
  private baselineAxisOrder(configs: ChartSeriesData[]): string[] {
    return [...configs].sort((a, b) => a.yAxisIndex - b.yAxisIndex).map((config) => config.name);
  }

  // グラフオプションの初期値を返す。
  // `seriesConfig` にだけ依存し、`clickOrder`, `effectiveAxisOrder` には一切依存しない。
  // 【重要】
  // ngx-echarts は `[options]` バインディングが変わるたびに `setOption(_, notMerge: true)`(フル置換)を呼ぶため、
  // もしここがクリック状態に依存していたら、`mergeOption` がストリーミングしてきたデータがクリックのたびに空へ巻き戻ってしまう。
  // 凡例クリックによる並べ替えは代わりに `mergeOption` を経由させることで、チャートが一瞬空白になるのを防いでいる。
  //
  protected option = computed(() => {
    const location = `${this.className}.option`;
    console.debug(`${location} recompute`);

    const configs = this.seriesConfig();
    const baselineOrder = this.baselineAxisOrder(configs);

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

  // 【差分アニメーション】
  // 各データ点には `id: point.timestamp` を付けて ECharts に渡している。
  // これがない場合、ECharts は更新時に配列のインデックスで新旧の点を対応付けるため、
  // driver側で古い点を間引くと残りの点が「別の値に動いた」と誤認されて波打つようなアニメーションになってしまっていた。
  // タイムスタンプを一意のIDとして使用することで安定したアニメーションを実現している。
  //
  // X軸の表示範囲はここでは [-WINDOW_SECONDS, 0] に固定されているため、
  // データ更新のたびに全データの X座標を「現在時刻からの経過時間」で再計算している。
  // これにより、既存の全ての点の相対位置が同じ量だけ左へずれていき、
  // それが「線全体が左へ一様にパンする」アニメーションとなる。
  //
  // 【Y軸の並び替え】
  // `yAxis[]` の各要素に新しい `offset` だけを差分として与えている。ECharts は
  // 配列をインデックスでマージするため、ここでの `.map()` は `axisOrder`
  // (クリックによる並べ替え後の順序)ではなく、あえて `option` 側の `yAxis`
  // 配列と同じ並び順である `seriesConfig()` をそのまま反復している ── つまり
  // 「どの `yAxis` オブジェクトに適用するか」は元の設定順(配列インデックス)、
  // 「そのoffsetの値」はクリックによる並べ替え結果(`axisOrder` の中でその
  // 系列が何番目に来るか = `axisOrder.indexOf(config.name)`)という、2つの
  // 異なる順序を組み合わせている。ここを誤って `axisOrder` を反復してしまうと
  // `option` 側の `yAxis[i]` とインデックスがずれ、別の軸に `offset` が
  // 適用されてしまうので注意。
  //
  protected mergeOption = computed(() => {
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
      yAxis: this.seriesConfig().map((config) => ({
        offset: axisOrder.indexOf(config.name) * Y_AXIS_OFFSET_STEP,
      })),
      series: data.map((points) => ({
        data: points.map((point) => ({
          value: [
            nowTimestamp === undefined ? 0 : (point.timestamp - nowTimestamp) / 1000,
            point.value,
          ] as [number, number],
          id: point.timestamp,
        })),
      })),
    };
  });
}
