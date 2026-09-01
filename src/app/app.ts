import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

interface PageLink {
  label: string;
  id: string;
}

@Component({
  imports: [RouterOutlet, RouterLink, ButtonModule, DividerModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly pageLinks: PageLink[] = [
    { label: 'Line Chart', id: 'line-chart' },
    { label: 'Step Line Chart', id: 'step-line-chart' },
    { label: 'Smooth Line Chart', id: 'smooth-line-chart' },
    { label: 'Streaming Chart', id: 'streaming-chart' },
    { label: 'Streaming Chart Ex', id: 'streaming-chart-ex' },
    { label: 'Streaming Chart Reverse', id: 'streaming-chart-reverse' },
    { label: 'Normal Line Chart', id: 'normal-line-chart' },
    { label: 'Cylinder Chart Grid', id: 'cylinder-chart-grid' },
    { label: 'Bar Chart', id: 'bar-chart' },
    { label: 'ECharts Color Sample', id: 'echarts-color-sample' },
  ];
}
