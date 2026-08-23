import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from '../echarts-setup';
import { NormalLineChart } from './normal-line-chart';

describe('NormalLineChart', () => {
  let component: NormalLineChart;
  let fixture: ComponentFixture<NormalLineChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NormalLineChart],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();

    fixture = TestBed.createComponent(NormalLineChart);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('seriesConfig', []);
    fixture.componentRef.setInput('seriesData', []);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
