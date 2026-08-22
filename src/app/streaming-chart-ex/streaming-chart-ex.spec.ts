import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from '../echarts-setup';
import { StreamingChartEx } from './streaming-chart-ex';

describe('StreamingChartEx', () => {
  let component: StreamingChartEx;
  let fixture: ComponentFixture<StreamingChartEx>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingChartEx],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();

    fixture = TestBed.createComponent(StreamingChartEx);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('seriesConfig', []);
    fixture.componentRef.setInput('seriesData', []);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
