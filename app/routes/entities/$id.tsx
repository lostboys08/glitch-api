import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createFileRoute('/entities/$id')({
  component: EntityDetailComponent,
})

function EntityDetailComponent() {
  const { id } = Route.useParams()
  
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Entity Details</h1>
      <p>ID: {id}</p>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/entities">← Back to Entities</a>
      </div>
      
      <div style={{ marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Entity Information</h2>
        <p>Loading entity details...</p>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h3>Related Entities</h3>
        <p>Graph connections will appear here...</p>
      </div>
    </div>
  )
}
