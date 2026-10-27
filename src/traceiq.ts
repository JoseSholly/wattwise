import { traceiq } from 'traceiq-sdk-js';

const projectId = import.meta.env.VITE_TRACEIQ_PROJECT_ID;
const writeKey = import.meta.env.VITE_TRACEIQ_WRITE_KEY;
const endpoint = import.meta.env.VITE_TRACEIQ_API_URL || 'https://api.traceiq.run';

if (!projectId || !writeKey) {
  if (import.meta.env.DEV) {
    console.warn(
      '[TraceIQ] Initialization skipped: missing project ID or write key.\n' +
      'Restart the development server after changing environment variables.'
    );
  }
} else {
  traceiq.initialize({
    projectId,
    writeKey,
    endpoint,
    autoTrackPageViews: false,
    autoCaptureExceptions: true,
    autoCaptureWebVitals: true,
    autoCaptureRageClicks: true
  });
}

export { traceiq };
