import { Component, computed, input } from '@angular/core';
import { Card } from 'primeng/card';
import { SingleBarChart } from '../single-bar-chart/single-bar-chart';
import { ChartPointData, ChartSeriesData } from '../model/chart-data.interface';

@Component({
  imports: [Card, SingleBarChart],
  selector: 'app-cylinder-chart-box',
  styleUrl: './cylinder-chart-box.scss',
  templateUrl: './cylinder-chart-box.html',
})
export class CylinderChartBox {
  //
  // 入力パラメータ
  //
  seriesConfig = input.required<ChartSeriesData>();
  data = input.required<ChartPointData>();
  // 離散値(dict あり)の場合は無視される。
  unit = input<string>('');
  width = input.required<number>();
  height = input.required<number>();

  protected chartWidth = computed(() => this.width() * 0.4);
  protected chartHeight = computed(() => this.height());

  protected displayValue = computed(() => {
    const config = this.seriesConfig();
    const value = this.data().value;
    const dict = config.dict;
    if (dict && Object.keys(dict).length > 0) {
      return dict[value] ?? String(value);
    }
    const unit = this.unit();
    return unit ? `${value} ${unit}` : String(value);
  });
}
