import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createFileRoute('/entities/')({
  component: EntitiesComponent,
})

function EntitiesComponent() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Entities</h1>
      <p>Manage your tasks, journal entries, logs, and knowledge base.</p>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/">← Back to Home</a>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Entity Types</h2>
        <ul>
          <li>TASK - Actionable items with status tracking</li>
          <li>JOURNAL - Daily entries and reflections</li>
          <li>LOG - Automated system and habit logs</li>
          <li>REMINDER - Time-based notifications</li>
          <li>KB_ARTICLE - Knowledge base entries</li>
          <li>GOAL - Long-term objectives</li>
          <li>FINANCIAL_DOC - Financial documents</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '30px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h3>Entity List</h3>
        <p>Loading entities...</p>
      </div>
    </div>
  )
}
