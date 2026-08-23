import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from '../echarts-setup';
import { StreamingChartReverse } from './streaming-chart-reverse';

describe('StreamingChartReverse', () => {
  let component: StreamingChartReverse;
  let fixture: ComponentFixture<StreamingChartReverse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingChartReverse],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();

    fixture = TestBed.createComponent(StreamingChartReverse);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('seriesConfig', []);
    fixture.componentRef.setInput('seriesData', []);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
