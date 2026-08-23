import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from '../echarts-setup';
import { NormalLineChartDriver } from './normal-line-chart-driver';

describe('NormalLineChartDriver', () => {
  let component: NormalLineChartDriver;
  let fixture: ComponentFixture<NormalLineChartDriver>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NormalLineChartDriver],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();

    fixture = TestBed.createComponent(NormalLineChartDriver);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
