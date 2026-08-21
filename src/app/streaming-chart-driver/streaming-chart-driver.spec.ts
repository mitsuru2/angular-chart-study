import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StreamingChartDriver } from './streaming-chart-driver';

describe('StreamingChartDriver', () => {
  let component: StreamingChartDriver;
  let fixture: ComponentFixture<StreamingChartDriver>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingChartDriver],
    }).compileComponents();

    fixture = TestBed.createComponent(StreamingChartDriver);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
