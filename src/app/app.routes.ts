import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./streaming-chart-driver/streaming-chart-driver').then((m) => m.StreamingChartDriver),
  },
];
