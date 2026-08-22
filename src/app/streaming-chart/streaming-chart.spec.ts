import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StreamingChart } from './streaming-chart';

describe('StreamingChart', () => {
  let component: StreamingChart;
  let fixture: ComponentFixture<StreamingChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingChart],
    }).compileComponents();

    fixture = TestBed.createComponent(StreamingChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
