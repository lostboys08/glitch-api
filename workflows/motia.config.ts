import { defineConfig } from '@motiadev/core'

export default defineConfig({
  port: parseInt(process.env.MOTIA_PORT || '3001'),
  logLevel: (process.env.MOTIA_LOG_LEVEL || 'info') as any,
  workflowsDir: './workflows',
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
})
