import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./streaming-chart-driver/streaming-chart-driver').then((m) => m.StreamingChartDriver),
  },
  {
    path: 'line-chart',
    loadComponent: () => import('./line-chart/line-chart').then((m) => m.LineChart),
  },
  {
    path: 'step-line-chart',
    loadComponent: () => import('./step-line-chart/step-line-chart').then((m) => m.StepLineChart),
  },
  {
    path: 'smooth-line-chart',
    loadComponent: () =>
      import('./smooth-line-chart/smooth-line-chart').then((m) => m.SmoothLineChart),
  },
];
