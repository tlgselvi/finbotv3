import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker } from './utils/service-worker';
import { initCDNOptimizations } from './utils/cdn';

// Register service worker for production
if (import.meta.env.PROD) {
    registerServiceWorker();
}

// Initialize CDN optimizations
initCDNOptimizations();

createRoot(document.getElementById('root')!).render(<App />);
