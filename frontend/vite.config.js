import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import dotenv from 'dotenv';
// dotenv.config({ path: '../env' });

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-hook-form'],
  },
});

// export const TM_API_KEY = import.meta.env.VITE_TM_KEY;