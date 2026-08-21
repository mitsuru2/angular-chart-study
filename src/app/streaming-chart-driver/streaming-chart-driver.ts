import { Component } from '@angular/core';
import { StreamingChart } from "../streaming-chart/streaming-chart";

@Component({
  imports: [StreamingChart],
  selector: 'app-streaming-chart-driver',
  styleUrl: './streaming-chart-driver.scss',
  templateUrl: './streaming-chart-driver.html',
})
export class StreamingChartDriver {}
