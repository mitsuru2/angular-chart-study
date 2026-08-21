import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LineChart } from './line-chart/line-chart';
import { StepLineChart } from './step-line-chart/step-line-chart';
import { SmoothLineChart } from './smooth-line-chart/smooth-line-chart';

@Component({
  imports: [RouterOutlet, LineChart, StepLineChart, SmoothLineChart],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
