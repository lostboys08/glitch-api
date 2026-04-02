import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => (
    <div>
      <h1>Page Not Found</h1>
    </div>
  ),
})

function RootComponent() {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
