import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepLineChart } from './step-line-chart';

describe('StepLineChart', () => {
  let component: StepLineChart;
  let fixture: ComponentFixture<StepLineChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepLineChart],
    }).compileComponents();

    fixture = TestBed.createComponent(StepLineChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
