import '@testing-library/jest-dom'

// jsdom has no matchMedia; framer-motion's useReducedMotion needs it.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

// jsdom has no IntersectionObserver; framer-motion's whileInView needs it.
if (!('IntersectionObserver' in window)) {
  class MockIntersectionObserver {
    observe = () => {}
    unobserve = () => {}
    disconnect = () => {}
    takeRecords = () => []
  }
  // @ts-expect-error -- jsdom's lib.dom types expect a fuller implementation
  // than this test stub provides; framer-motion only calls observe/disconnect.
  window.IntersectionObserver = MockIntersectionObserver
}
