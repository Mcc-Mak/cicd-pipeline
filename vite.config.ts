import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/cicd-pipeline/',
  plugins: [react()],
  test: {
    coverage: {
      reporter: ['lcov'],
      reportsDirectory: './coverage',
    },
  },
})
