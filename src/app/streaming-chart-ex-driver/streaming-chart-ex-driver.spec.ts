import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from '../echarts-setup';
import { StreamingChartExDriver } from './streaming-chart-ex-driver';

describe('StreamingChartExDriver', () => {
  let component: StreamingChartExDriver;
  let fixture: ComponentFixture<StreamingChartExDriver>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingChartExDriver],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();

    fixture = TestBed.createComponent(StreamingChartExDriver);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
