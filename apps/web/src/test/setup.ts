import '@testing-library/jest-dom';

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/',
    origin: 'http://localhost:3000',
    search: '',
  },
  writable: true,
});

Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8001',
    MODE: 'test',
    NODE_ENV: 'test',
  },
  writable: true,
});
