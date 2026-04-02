import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultErrorComponent: ({ error }) => (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error</h1>
        <pre>{error.message}</pre>
      </div>
    ),
    defaultNotFoundComponent: () => (
      <div style={{ padding: '20px' }}>
        <h1>404 - Not Found</h1>
      </div>
    ),
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
