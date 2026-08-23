import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from '../echarts-setup';
import { SmoothLineChart } from './smooth-line-chart';

describe('SmoothLineChart', () => {
  let component: SmoothLineChart;
  let fixture: ComponentFixture<SmoothLineChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmoothLineChart],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();

    fixture = TestBed.createComponent(SmoothLineChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
