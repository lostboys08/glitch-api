import { step, event } from '@motiadev/core'
import { db } from '../db/index'
import { documents, entities, ocrStatusEnum } from '../db/schema'
import { eq } from 'drizzle-orm'
import { basename } from 'path'

// OCR Processing workflow step
export default step({
  id: 'ocr-processor',
  name: 'OCR Document Processor',
  
  // Subscribe to document:detected events
  subscribe: [event('document:detected')],
  
  handler: async ({ event, emit }) => {
    const { filePath, md5Hash, fileSize } = event.payload
    
    console.log(`[OCR] Processing: ${filePath}`)
    
    try {
      // Create document record
      const fileName = basename(filePath)
      const mimeType = getMimeType(fileName)
      
      // Create entity first
      const [entity] = await db.insert(entities).values({
        type: 'KB_ARTICLE',
        title: fileName,
        content: '', // Will be filled after OCR
        status: 'DRAFT',
        priority: 5,
        metadata: {
          source: 'file_upload',
          originalPath: filePath,
          mimeType,
          fileSize
        }
      }).returning()
      
      // Create document record linked to entity
      const [doc] = await db.insert(documents).values({
        entityId: entity.id,
        filePath,
        fileName,
        mimeType,
        md5Hash,
        ocrStatus: 'PENDING',
        fileSize
      }).returning()
      
      console.log(`[OCR] Created entity ${entity.id} and document ${doc.id}`)
      
      // Emit event for OCR engine to process
      await emit('ocr:process', {
        documentId: doc.id,
        entityId: entity.id,
        filePath,
        mimeType,
        priority: 'normal'
      })
      
      return { success: true, documentId: doc.id, entityId: entity.id }
      
    } catch (error) {
      console.error(`[OCR] Failed to process ${filePath}:`, error)
      throw error
    }
  }
})

function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'tiff': 'image/tiff',
    'tif': 'image/tiff',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp'
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}
