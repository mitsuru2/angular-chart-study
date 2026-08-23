import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from '../echarts-setup';
import { StreamingChartReverseDriver } from './streaming-chart-reverse-driver';

describe('StreamingChartReverseDriver', () => {
  let component: StreamingChartReverseDriver;
  let fixture: ComponentFixture<StreamingChartReverseDriver>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingChartReverseDriver],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();

    fixture = TestBed.createComponent(StreamingChartReverseDriver);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
