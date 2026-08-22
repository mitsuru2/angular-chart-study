import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SmoothLineChart } from './smooth-line-chart';

describe('SmoothLineChart', () => {
  let component: SmoothLineChart;
  let fixture: ComponentFixture<SmoothLineChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmoothLineChart],
    }).compileComponents();

    fixture = TestBed.createComponent(SmoothLineChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
