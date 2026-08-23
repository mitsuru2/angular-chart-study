import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from '../echarts-setup';
import { StreamingChart } from './streaming-chart';

describe('StreamingChart', () => {
  let component: StreamingChart;
  let fixture: ComponentFixture<StreamingChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingChart],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();

    fixture = TestBed.createComponent(StreamingChart);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('seriesConfig', []);
    fixture.componentRef.setInput('seriesData', []);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
