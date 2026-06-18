'use client'

import { useState, useEffect } from 'react'
import { Plus, ToggleLeft, ToggleRight, Trash2, Pencil, Zap, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface Task {
  id: string
  title: string
  description: string
  points: number
  is_active?: boolean
  task_type?: string
  x_post_url?: string | null
  x_actions?: string[] | null
}

type XAction = 'like' | 'reply' | 'retweet' | 'quote'

const X_ACTION_POINTS: Record<XAction, number> = { like: 20, reply: 30, retweet: 50, quote: 50 }
const X_ACTIONS: { value: XAction; label: string; pts: number }[] = [
  { value: 'like', label: 'Like', pts: 20 },
  { value: 'reply', label: 'Reply', pts: 30 },
  { value: 'retweet', label: 'Retweet', pts: 50 },
  { value: 'quote', label: 'Quote', pts: 50 },
]

function OEmbedPreview({ url }: { url: string }) {
  const [html, setHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!url) { setHtml(null); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`
        )
        if (res.ok) {
          const data = await res.json() as { html: string }
          setHtml(data.html)
        } else {
          setHtml(null)
        }
      } catch {
        setHtml(null)
      } finally {
        setLoading(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [url])

  if (!url) return null
  if (loading) return <p className="text-xs text-white/30 italic">Loading preview...</p>
  if (!html) return <p className="text-xs text-red-400/70">Could not load preview for this URL.</p>
  return (
    <div
      className="rounded-xl overflow-hidden bg-black/30 border border-white/10 p-3 text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function AdminTasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [taskType, setTaskType] = useState<'x_post' | 'other_event'>('other_event')
  const [form, setForm] = useState({ title: '', description: '', points: '' })
  const [xUrl, setXUrl] = useState('')
  const [xActions, setXActions] = useState<XAction[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [showInactive, setShowInactive] = useState(false)

  function resetForm() {
    setForm({ title: '', description: '', points: '' })
    setXUrl('')
    setXActions([])
    setTaskType('other_event')
    setEditingId(null)
  }

  function startCreate() {
    resetForm()
    setShowForm(true)
  }

  function startEdit(task: Task) {
    setEditingId(task.id)
    const isX = task.task_type === 'x_post'
    setTaskType(isX ? 'x_post' : 'other_event')
    setForm({ title: task.title ?? '', description: task.description ?? '', points: String(task.points ?? '') })
    setXUrl(task.x_post_url ?? '')
    setXActions((task.x_actions as XAction[]) ?? [])
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleAction(action: XAction) {
    setXActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    )
  }

  const totalPoints = xActions.reduce((sum, a) => sum + X_ACTION_POINTS[a], 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body =
        taskType === 'x_post'
          ? { task_type: 'x_post', x_post_url: xUrl, x_actions: xActions }
          : { task_type: 'other_event', ...form }

      if (editingId) {
        const res = await fetch(`/api/tasks/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          const updated = await res.json() as Task
          setTasks((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...updated } : t)))
          resetForm()
          setShowForm(false)
        } else {
          const data = await res.json().catch(() => ({}))
          alert(data.error ?? 'Failed to update task')
        }
      } else {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          const task = await res.json() as Task
          setTasks((prev) => [task, ...prev])
          resetForm()
          setShowForm(false)
        } else {
          const data = await res.json().catch(() => ({}))
          alert(data.error ?? 'Failed to create task')
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(id: string, currentActive: boolean) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentActive }),
    })
    if (res.ok) {
      setTasks((prev) =>
        prev.map((t) => t.id === id ? { ...t, is_active: !currentActive } : t)
      )
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this task? Its submission history will be removed. Users keep all points they already earned. This cannot be undone.')) return
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.error ?? 'Failed to delete task')
    }
  }

  const inputClass =
    'w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:border-[#00D4FF]/40 focus:outline-none transition-all'

  const isEditing = !!editingId

  const activeTasks = tasks.filter((t) => (t.is_active ?? true))
  const inactiveTasks = tasks.filter((t) => !(t.is_active ?? true))

  function renderRow(task: Task) {
    const active = task.is_active ?? true
    const isXPost = task.task_type === 'x_post'
    return (
      <div
        key={task.id}
        className={`bg-white/3 border rounded-xl p-5 flex items-start gap-4 backdrop-blur-sm ${
          active ? 'border-white/8' : 'border-white/5 opacity-60'
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isXPost && <span className="font-bold text-white">𝕏</span>}
            <h3 className="font-medium text-white truncate">
              {isXPost ? (task.x_post_url ?? task.title) : task.title}
            </h3>
            <Badge variant="points">+{task.points}</Badge>
            {isXPost && task.x_actions && task.x_actions.map((a) => (
              <span key={a} className="text-xs text-[#00D4FF] capitalize px-2 py-0.5 rounded bg-[#00D4FF]/10 border border-[#00D4FF]/20">
                {a}
              </span>
            ))}
            {!active && <Badge>Inactive</Badge>}
          </div>
          {!isXPost && task.description && (
            <p className="text-sm text-white/30 mt-1">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => startEdit(task)}
            className="p-1.5 text-white/30 hover:text-[#00D4FF] transition-colors cursor-pointer"
            title="Edit task"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => handleToggle(task.id, active)}
            className="p-1.5 text-white/30 hover:text-[#D4A017] transition-colors cursor-pointer"
            title={active ? 'Deactivate' : 'Activate'}
          >
            {active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          </button>
          <button
            onClick={() => handleDelete(task.id)}
            className="p-1.5 text-white/30 hover:text-red-400 transition-colors cursor-pointer"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-white/30 text-sm">{tasks.length} tasks total</p>
        <Button size="sm" onClick={() => (showForm && !isEditing ? setShowForm(false) : startCreate())}>
          <Plus size={16} /> Add Task
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5 backdrop-blur-sm"
        >
          <h3 className="font-serif text-lg font-semibold text-white">{isEditing ? 'Edit Task' : 'New Task'}</h3>

          {/* Task type toggle — only when creating (type is fixed once created) */}
          {!isEditing && (
            <div>
              <label className="block text-sm text-white/40 mb-2">Task Type</label>
              <div className="flex gap-2">
                {(['other_event', 'x_post'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTaskType(type)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${
                      taskType === type
                        ? type === 'x_post'
                          ? 'bg-[#00D4FF]/10 border-[#00D4FF]/50 text-[#00D4FF]'
                          : 'bg-[#D4A017]/10 border-[#D4A017]/50 text-[#D4A017]'
                        : 'bg-white/3 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                    }`}
                  >
                    {type === 'x_post' ? '𝕏 X Post' : 'Other Event'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {taskType === 'x_post' ? (
            <>
              <div>
                <label htmlFor="xurl" className="block text-sm text-white/40 mb-1.5">Post URL</label>
                <input
                  id="xurl"
                  type="url"
                  value={xUrl}
                  onChange={(e) => setXUrl(e.target.value)}
                  placeholder="https://x.com/user/status/..."
                  required
                  className={inputClass}
                />
              </div>

              {xUrl && (
                <div>
                  <p className="text-xs text-white/30 mb-2">Preview</p>
                  <OEmbedPreview url={xUrl} />
                </div>
              )}

              {/* Multi-action checkboxes */}
              <div>
                <label className="block text-sm text-white/40 mb-2">
                  Required Actions <span className="text-white/20">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {X_ACTIONS.map(({ value, label, pts }) => {
                    const selected = xActions.includes(value)
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleAction(value)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
                          selected
                            ? 'bg-[#00D4FF]/15 border-[#00D4FF]/50 text-[#00D4FF]'
                            : 'bg-white/3 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                        }`}
                      >
                        <span>{label}</span>
                        <span className={`text-xs ${selected ? 'text-[#D4A017]' : 'text-white/20'}`}>+{pts}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {xActions.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#D4A017]/8 border border-[#D4A017]/20">
                  <Zap size={14} className="text-[#D4A017]" />
                  <span className="text-sm text-[#D4A017] font-semibold">
                    Total points: +{totalPoints} ({xActions.join(' + ')})
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label htmlFor="title" className="block text-sm text-white/40 mb-1.5">Title</label>
                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Share our post"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="desc" className="block text-sm text-white/40 mb-1.5">Description</label>
                <textarea
                  id="desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What the user needs to do"
                  rows={3}
                  required
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div>
                <label htmlFor="points" className="block text-sm text-white/40 mb-1.5">Points</label>
                <input
                  id="points"
                  type="number"
                  value={form.points}
                  onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))}
                  placeholder="50"
                  min={1}
                  required
                  className={inputClass}
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); resetForm() }}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || (taskType === 'x_post' && (!xUrl || xActions.length === 0))}
            >
              {submitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Task')}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {activeTasks.map(renderRow)}
        {tasks.length === 0 && (
          <p className="text-center text-white/20 py-8 text-sm">No tasks yet. Create one above.</p>
        )}
        {tasks.length > 0 && activeTasks.length === 0 && (
          <p className="text-center text-white/20 py-8 text-sm">No active tasks. Create one or reactivate below.</p>
        )}
      </div>

      {inactiveTasks.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowInactive((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors"
          >
            {showInactive ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Deactivated ({inactiveTasks.length})
          </button>
          {showInactive && (
            <div className="space-y-3 mt-3">
              {inactiveTasks.map(renderRow)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
