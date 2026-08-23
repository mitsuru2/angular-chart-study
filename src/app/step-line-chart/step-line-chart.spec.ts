import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from '../echarts-setup';
import { StepLineChart } from './step-line-chart';

describe('StepLineChart', () => {
  let component: StepLineChart;
  let fixture: ComponentFixture<StepLineChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepLineChart],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();

    fixture = TestBed.createComponent(StepLineChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
