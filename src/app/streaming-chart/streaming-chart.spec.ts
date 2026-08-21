import { TestBed } from '@angular/core/testing';
import { StreamingChart } from './streaming-chart';

describe('StreamingChart', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingChart],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(StreamingChart);
    fixture.componentRef.setInput('points', []);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should expose an accessible summary with no data', () => {
    const fixture = TestBed.createComponent(StreamingChart);
    fixture.componentRef.setInput('points', []);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="img"]')?.getAttribute('aria-label')).toContain(
      'no data yet',
    );
  });

  it('should summarize the latest point once data arrives', () => {
    const fixture = TestBed.createComponent(StreamingChart);
    fixture.componentRef.setInput('points', [{ timestamp: 1, value: 42 }]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="img"]')?.getAttribute('aria-label')).toContain('42');
  });
});
