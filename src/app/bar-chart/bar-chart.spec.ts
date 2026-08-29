import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from '../echarts-setup';
import { BarChart } from './bar-chart';

describe('BarChart', () => {
  let component: BarChart;
  let fixture: ComponentFixture<BarChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarChart],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();

    fixture = TestBed.createComponent(BarChart);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('params', [
      { name: 'Sensor A', color: 'rgba(75,120,220,0.8)' },
      { name: 'Sensor B', color: 'rgba(220,90,60,0.8)' },
    ]);
    fixture.componentRef.setInput('data', [
      { value: 42, timestamp: Date.now() },
      { value: 68, timestamp: Date.now() },
    ]);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
