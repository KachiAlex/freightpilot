export const getFCP = () => {
  if (!window.performance) return undefined;
  const entries = performance.getEntriesByName('first-contentful-paint');
  return entries.length > 0 ? entries[0].startTime : undefined;
};

export const getLCP = async () => {
  if (!('PerformanceObserver' in window)) return undefined;
  return new Promise((resolve) => {
    const observer = new PerformanceObserver((list) => {
      resolve(list.getEntries()[list.getEntries().length - 1].startTime);
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    setTimeout(() => { observer.disconnect(); resolve(undefined); }, 3000);
  });
};

export const logMetrics = async () => {
  const fcp = getFCP();
  const lcp = await getLCP();
  console.log('FCP:', fcp, 'LCP:', lcp);
};
