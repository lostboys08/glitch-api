import { step, event } from '@motiadev/core'
import { db } from '../db/index'
import { embeddings, entities, documents, ocrStatusEnum } from '../db/schema'
import { eq } from 'drizzle-orm'

// Embedding Generation workflow step
export default step({
  id: 'embedding-generator',
  name: 'Text Embedding Generator',
  
  // Subscribe to OCR completion events
  subscribe: [event('ocr:completed')],
  
  handler: async ({ event, emit }) => {
    const { documentId, entityId, extractedText } = event.payload
    
    console.log(`[Embedding] Generating embeddings for entity ${entityId}`)
    
    try {
      // Chunk the text
      const chunks = chunkText(extractedText, 512, 50)
      
      console.log(`[Embedding] Created ${chunks.length} chunks`)
      
      // Generate embeddings for each chunk
      // Note: This is a placeholder - actual embedding generation would use a local model
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        
        // TODO: Replace with actual embedding generation using local model
        // const embedding = await generateEmbedding(chunk)
        const placeholderEmbedding = new Array(384).fill(0).map(() => Math.random() - 0.5)
        
        await db.insert(embeddings).values({
          entityId,
          chunkIndex: i,
          chunkText: chunk,
          embedding: placeholderEmbedding,
          metadata: {
            chunkSize: chunk.length,
            totalChunks: chunks.length,
            model: process.env.EMBEDDING_MODEL || 'all-MiniLM-L6-v2'
          }
        })
      }
      
      // Update document status
      await db.update(documents)
        .set({ ocrStatus: 'COMPLETED' })
        .where(eq(documents.id, documentId))
      
      // Update entity content
      await db.update(entities)
        .set({ 
          content: extractedText.substring(0, 10000), // Store first 10k chars
          status: 'TODO'
        })
        .where(eq(entities.id, entityId))
      
      console.log(`[Embedding] Completed for entity ${entityId}`)
      
      // Emit completion event
      await emit('embedding:completed', {
        entityId,
        documentId,
        chunkCount: chunks.length
      })
      
      return { success: true, entityId, chunkCount: chunks.length }
      
    } catch (error) {
      console.error(`[Embedding] Failed for entity ${entityId}:`, error)
      
      // Mark document as failed
      await db.update(documents)
        .set({ ocrStatus: 'FAILED' })
        .where(eq(documents.id, documentId))
      
      throw error
    }
  }
})

// Simple text chunking with overlap
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = []
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  
  let currentChunk = ''
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim())
        // Keep overlap
        const words = currentChunk.split(' ')
        const overlapWords = words.slice(-Math.floor(overlap / 5)) // Approximate words
        currentChunk = overlapWords.join(' ') + ' '
      }
    }
    currentChunk += sentence + ' '
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}
