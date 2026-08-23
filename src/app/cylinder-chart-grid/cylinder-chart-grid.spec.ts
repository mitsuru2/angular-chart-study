import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from '../echarts-setup';
import { CylinderChartGrid } from './cylinder-chart-grid';

describe('CylinderChartGrid', () => {
  let component: CylinderChartGrid;
  let fixture: ComponentFixture<CylinderChartGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CylinderChartGrid],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();

    fixture = TestBed.createComponent(CylinderChartGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
