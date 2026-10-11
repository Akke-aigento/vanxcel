/// <reference types="vite/client" />

interface Window {
  akke?: (event: string, props?: Record<string, unknown>) => void;
}
