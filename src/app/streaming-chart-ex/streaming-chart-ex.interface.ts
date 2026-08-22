export interface StreamingChartExPointData {
  value: number;
  timestamp: number;
}

export interface RangeData {
  min?: number;
  max?: number;
}

export interface StreamingChartExSeriesData {
  name: string;
  color: string; // e.g. 'rgba(120,140,180,0.3)'
  range?: RangeData;
  index: number; // yAxisIndex: all axes are on the left; 0 sits rightmost (closest to the plot), touching the X-axis; higher values stack further left
}

export interface StreamingChartExGraphOptionData {
  showElapsedTime?: boolean; // Switch X-axis label b/w timestamp and elapsed time.
  // false (default): Make X-axis label from timestamp (e.g. 12:00:00)
  // true: Make X-axis label from elapsed time from the first data point (e.g. 0s, 1s, 2s, ...)
}
