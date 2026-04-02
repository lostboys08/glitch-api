import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import * as React from 'react'
import { db } from '@/db'
import { entities } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

// ── Server functions ──────────────────────────────────────────────────────────

const getTodos = createServerFn({ method: 'GET' }).handler(async () => {
  return db
    .select()
    .from(entities)
    .where(eq(entities.type, 'TASK'))
    .orderBy(entities.createdAt)
})

const addTodo = createServerFn({ method: 'POST' })
  .validator(z.object({ title: z.string().min(1) }))
  .handler(async ({ data }) => {
    const [todo] = await db
      .insert(entities)
      .values({ type: 'TASK', title: data.title, status: 'TODO' })
      .returning()
    return todo
  })

const updateTodoStatus = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.string().uuid(),
      status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
    }),
  )
  .handler(async ({ data }) => {
    const [todo] = await db
      .update(entities)
      .set({ status: data.status })
      .where(and(eq(entities.id, data.id), eq(entities.type, 'TASK')))
      .returning()
    return todo
  })

const deleteTodo = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await db
      .delete(entities)
      .where(and(eq(entities.id, data.id), eq(entities.type, 'TASK')))
    return { id: data.id }
  })

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/dashboard/')({
  loader: () => getTodos(),
  component: DashboardComponent,
})

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = 'TODO' | 'IN_PROGRESS' | 'DONE'
type Todo = Awaited<ReturnType<typeof getTodos>>[number]

const NEXT_STATUS: Record<Status, Status> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'TODO',
}

const STATUS_LABEL: Record<Status, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

const STATUS_COLOR: Record<Status, string> = {
  TODO: '#6b7280',
  IN_PROGRESS: '#2563eb',
  DONE: '#16a34a',
}

// ── Component ─────────────────────────────────────────────────────────────────

function DashboardComponent() {
  const initialTodos = Route.useLoaderData()
  const [todos, setTodos] = React.useState<Todo[]>(initialTodos)
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const title = input.trim()
    if (!title) return
    setLoading('add')
    try {
      const todo = await addTodo({ data: { title } })
      setTodos((prev) => [...prev, todo])
      setInput('')
    } finally {
      setLoading(null)
    }
  }

  async function handleToggle(todo: Todo) {
    const next = NEXT_STATUS[todo.status as Status] ?? 'TODO'
    setLoading(todo.id)
    try {
      const updated = await updateTodoStatus({ data: { id: todo.id, status: next } })
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete(id: string) {
    setLoading(id + '-delete')
    try {
      await deleteTodo({ data: { id } })
      setTodos((prev) => prev.filter((t) => t.id !== id))
    } finally {
      setLoading(null)
    }
  }

  const byStatus = (status: Status) => todos.filter((t) => t.status === status)

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui, sans-serif', maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <a href="/" style={{ fontSize: '14px', color: '#6b7280' }}>← Home</a>
      </div>

      {/* Add todo */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task…"
          disabled={loading === 'add'}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
        <button
          type="submit"
          disabled={loading === 'add' || !input.trim()}
          style={{
            padding: '8px 16px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            opacity: loading === 'add' || !input.trim() ? 0.6 : 1,
          }}
        >
          {loading === 'add' ? 'Adding…' : 'Add'}
        </button>
      </form>

      {/* Todo columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {(['TODO', 'IN_PROGRESS', 'DONE'] as Status[]).map((status) => (
          <div key={status}>
            <h2
              style={{
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: STATUS_COLOR[status],
                margin: '0 0 12px 0',
              }}
            >
              {STATUS_LABEL[status]} ({byStatus(status).length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {byStatus(status).map((todo) => (
                <div
                  key={todo.id}
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '10px 12px',
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '14px',
                      textDecoration: status === 'DONE' ? 'line-through' : 'none',
                      color: status === 'DONE' ? '#9ca3af' : '#111827',
                      wordBreak: 'break-word',
                    }}
                  >
                    {todo.title}
                  </p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleToggle(todo)}
                      disabled={loading === todo.id}
                      title={`Move to ${STATUS_LABEL[NEXT_STATUS[todo.status as Status] ?? 'TODO']}`}
                      style={{
                        flex: 1,
                        padding: '4px 8px',
                        fontSize: '12px',
                        background: STATUS_COLOR[NEXT_STATUS[todo.status as Status] ?? 'TODO'],
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        opacity: loading === todo.id ? 0.6 : 1,
                      }}
                    >
                      {loading === todo.id
                        ? '…'
                        : `→ ${STATUS_LABEL[NEXT_STATUS[todo.status as Status] ?? 'TODO']}`}
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      disabled={loading === todo.id + '-delete'}
                      title="Delete"
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        opacity: loading === todo.id + '-delete' ? 0.6 : 1,
                      }}
                    >
                      {loading === todo.id + '-delete' ? '…' : '✕'}
                    </button>
                  </div>
                </div>
              ))}
              {byStatus(status).length === 0 && (
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
