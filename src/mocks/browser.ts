import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// The mock service worker. Started from main.tsx only when VITE_USE_MOCK is on,
// so production / real-backend builds never register it.
export const worker = setupWorker(...handlers);
