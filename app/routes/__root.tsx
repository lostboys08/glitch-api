import { createRootRoute } from '@tanstack/react-router'
import { Outlet, ScrollRestoration } from '@tanstack/react-router'
import { Body, Head, Html, Meta, Scripts } from '@tanstack/react-start'
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
    <Html>
      <Head>
        <Meta />
      </Head>
      <Body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </Body>
    </Html>
  )
}
