import { Component } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';

@Component({
  imports: [NgxEchartsDirective],
  selector: 'app-echarts-color-sample',
  styleUrl: './echarts-color-sample.scss',
  templateUrl: './echarts-color-sample.html',
})
export class EChartsColorSample {
  // ECharts の既定カラーパレット(itemStyle.color 未指定時に系列ごとへ自動で割り当てられる色)を
  // 目視確認するための静的コンポーネント。既定パレットの色数(10色)に合わせ10系列を描画する。
  private static readonly seriesNames = Array.from(
    { length: 10 },
    (_, index) => `Series ${index + 1}`,
  );

  protected ariaLabel = `Bar chart sampling the default ECharts color palette across ${EChartsColorSample.seriesNames.length} data series`;

  protected option = {
    grid: { left: 60, top: 20, right: 20, bottom: 40 },
    xAxis: {
      type: 'category' as const,
      data: ['Default Palette'],
    },
    yAxis: {
      type: 'value' as const,
      splitLine: { show: false },
    },
    tooltip: {
      trigger: 'item' as const,
    },
    // 色は指定せず ECharts の既定パレットに任せる。値は全系列で揃え、色の比較に集中できるようにする。
    series: EChartsColorSample.seriesNames.map((name) => ({
      name,
      type: 'bar' as const,
      cursor: 'default' as const,
      data: [1],
    })),
  };
}
