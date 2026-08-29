import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from '../echarts-setup';
import { BarChartDriver } from './bar-chart-driver';

describe('BarChartDriver', () => {
  let component: BarChartDriver;
  let fixture: ComponentFixture<BarChartDriver>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarChartDriver],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();

    fixture = TestBed.createComponent(BarChartDriver);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
