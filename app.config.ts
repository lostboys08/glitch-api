import { defineConfig } from '@tanstack/react-start/config'

export default defineConfig({
  server: {
    preset: 'node-server',
    port: process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 3000,
  },
  tsr: {
    routesDirectory: './app/routes',
    generatedRouteTree: './app/routeTree.gen.ts',
  },
})
