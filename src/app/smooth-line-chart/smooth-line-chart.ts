import { Component } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';

@Component({
  imports: [NgxEchartsDirective],
  selector: 'app-smooth-line-chart',
  styleUrl: './smooth-line-chart.scss',
  templateUrl: './smooth-line-chart.html',
})
export class SmoothLineChart {
  option = {
    xAxis: {
      data: ['A', 'B', 'C', 'D', 'E'],
    },
    yAxis: {},
    series: [
      {
        data: [10, 22, 28, 23, 19],
        type: 'line',
        smooth: true,
      },
    ],
  };
}
