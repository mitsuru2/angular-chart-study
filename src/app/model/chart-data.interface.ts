export interface RangeData {
  min?: number;
  max?: number;
}

export interface ChartPointData {
  value: number;
  timestamp: number;
}

export interface ChartSeriesData {
  name: string;
  color: string; // e.g. 'rgba(120,140,180,0.3)'
  range?: RangeData;
  yAxisIndex: number; // all axes are on the left; 0 sits rightmost (closest to the plot), touching the X-axis; higher values stack further left.
  dict?: Record<number, string>; // optional mapping of value to label for this series
}

// 複数パラメータの現在値を1本ずつのバーとして表示する BarChart 用。
// 全パラメータでY軸を1本共有するため、ChartSeriesData と異なり yAxisIndex は持たない。
export interface BarChartParam {
  name: string;
  color: string; // e.g. 'rgba(120,140,180,0.3)'
}
