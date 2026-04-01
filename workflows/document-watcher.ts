import { step, event } from '@motiadev/core'
import { watch } from 'chokidar'
import { db } from '../db/index'
import { documents, ocrStatusEnum } from '../db/schema'
import { eq } from 'drizzle-orm'
import { createHash } from 'crypto'
import { readFileSync } from 'fs'

// Document watcher workflow - monitors file system for new documents
export default step({
  id: 'document-watcher',
  name: 'Document File System Watcher',
  
  // This step runs continuously as a service
  service: async ({ emit }) => {
    const basePaths = process.env.WATCH_PATHS?.split(',') || ['./data/uploads']
    
    console.log(`[Watcher] Monitoring paths: ${basePaths.join(', ')}`)
    
    const watcher = watch(basePaths, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: false, // Process existing files on startup
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    })
    
    watcher.on('add', async (filePath) => {
      console.log(`[Watcher] New file detected: ${filePath}`)
      
      // Calculate MD5 hash to detect duplicates
      const fileBuffer = readFileSync(filePath)
      const md5Hash = createHash('md5').update(fileBuffer).digest('hex')
      
      // Check if file already exists
      const existing = await db.query.documents.findFirst({
        where: eq(documents.md5Hash, md5Hash)
      })
      
      if (existing) {
        console.log(`[Watcher] Duplicate file detected: ${filePath} (hash: ${md5Hash})`)
        // Update file path in case file was moved
        await db.update(documents)
          .set({ filePath, updatedAt: new Date() })
          .where(eq(documents.id, existing.id))
        return
      }
      
      // Emit event for document processing
      await emit('document:detected', {
        filePath,
        md5Hash,
        fileSize: fileBuffer.length,
        detectedAt: new Date().toISOString()
      })
    })
    
    // Keep the service running
    return new Promise(() => {})
  }
})
