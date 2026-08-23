import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from '../echarts-setup';
import { SingleBarChart } from './single-bar-chart';

describe('SingleBarChart', () => {
  let component: SingleBarChart;
  let fixture: ComponentFixture<SingleBarChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleBarChart],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleBarChart);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('seriesConfig', {
      name: 'Level',
      color: 'rgba(75,120,220,0.8)',
      range: { min: 0, max: 100 },
      yAxisIndex: 0,
    });
    fixture.componentRef.setInput('data', { value: 50, timestamp: Date.now() });
    fixture.componentRef.setInput('width', 120);
    fixture.componentRef.setInput('height', 300);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
