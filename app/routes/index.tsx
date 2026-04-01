import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Glitch API</h1>
      <p>Your local-first external brain system.</p>
      
      <nav style={{ marginTop: '20px' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><a href="/entities">View Entities</a></li>
          <li><a href="/documents">Manage Documents</a></li>
        </ul>
      </nav>
      
      <div style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Quick Stats</h2>
        <p>System status: <span style={{ color: 'green' }}>Operational</span></p>
        <p>Database: <span id="db-status">Checking...</span></p>
      </div>
    </div>
  )
}
