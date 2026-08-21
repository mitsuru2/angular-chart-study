import { TestBed } from '@angular/core/testing';
import { StreamingChartDriver } from './streaming-chart-driver';

describe('StreamingChartDriver', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingChartDriver],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(StreamingChartDriver);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should start stopped with no points', () => {
    const fixture = TestBed.createComponent(StreamingChartDriver);
    const driver = fixture.componentInstance as unknown as {
      running: () => boolean;
      points: () => unknown[];
    };
    expect(driver.running()).toBe(false);
    expect(driver.points()).toEqual([]);
  });

  it('should add a point immediately after starting streaming', () => {
    const fixture = TestBed.createComponent(StreamingChartDriver);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const startButton = compiled.querySelector('button') as HTMLButtonElement;

    startButton.click();
    fixture.detectChanges();

    const driver = fixture.componentInstance as unknown as {
      running: () => boolean;
      points: () => unknown[];
    };
    expect(driver.running()).toBe(true);
    expect(driver.points().length).toBe(1);
  });
});
