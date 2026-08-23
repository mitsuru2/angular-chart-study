import 'vitest-canvas-mock';

// jsdom does not implement ResizeObserver, which ngx-echarts relies on to
// auto-resize the chart. A no-op stub is sufficient for component tests.
class ResizeObserverMock {
  observe() {
    // no-op
  }
  unobserve() {
    // no-op
  }
  disconnect() {
    // no-op
  }
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}
