import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createFileRoute('/documents/')({
  component: DocumentsComponent,
})

function DocumentsComponent() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Documents</h1>
      <p>Manage your file ingestion and OCR pipeline.</p>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/">← Back to Home</a>
      </div>
      
      <div style={{ marginTop: '30px', padding: '20px', background: '#f0f8ff', borderRadius: '8px' }}>
        <h2>Upload Document</h2>
        <p>Drop files here or click to browse...</p>
        <input type="file" multiple style={{ marginTop: '10px' }} />
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Document Queue</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>File Name</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>OCR Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                No documents in queue
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
