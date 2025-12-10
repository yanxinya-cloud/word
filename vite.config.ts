import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Fix: Cast process to any to avoid "Property 'cwd' does not exist on type 'Process'" error
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Prevents "process is not defined" error in browser.
      // We use || '' to ensure it's always a string, even if the env var is missing.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    },
  };
});