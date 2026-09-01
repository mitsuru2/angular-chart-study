import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from '../echarts-setup';
import { EChartsColorSample } from './echarts-color-sample';

describe('EChartsColorSample', () => {
  let component: EChartsColorSample;
  let fixture: ComponentFixture<EChartsColorSample>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EChartsColorSample],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();

    fixture = TestBed.createComponent(EChartsColorSample);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
