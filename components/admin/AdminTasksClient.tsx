'use client'

import { useState } from 'react'
import { Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface Task {
  _id: { toString(): string }
  title: string
  description: string
  points: number
  isActive: boolean
}

export function AdminTasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', points: '' })
  const [submitting, setSubmitting] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const task = await res.json()
        setTasks((prev) => [task, ...prev])
        setForm({ title: '', description: '', points: '' })
        setShowForm(false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    if (res.ok) {
      setTasks((prev) =>
        prev.map((t) => (t._id.toString() === id ? { ...t, isActive: !isActive } : t))
      )
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this task?')) return
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (res.ok) setTasks((prev) => prev.filter((t) => t._id.toString() !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-[#A09070] text-sm">{tasks.length} tasks total</p>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} /> Add Task
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-[#111111] border border-[#D4A017]/30 rounded-2xl p-6 space-y-4"
        >
          <h3 className="font-serif text-lg font-semibold text-[#F5F0E8]">New Task</h3>
          {[
            { id: 'title', label: 'Title', placeholder: 'e.g. Follow us on X', key: 'title' as const },
            { id: 'desc', label: 'Description', placeholder: 'What the user needs to do', key: 'description' as const },
            { id: 'points', label: 'Points', placeholder: '50', key: 'points' as const },
          ].map(({ id, label, placeholder, key }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm text-[#A09070] mb-1.5">{label}</label>
              {key === 'description' ? (
                <textarea
                  id={id}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  rows={3}
                  required
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-[#F5F0E8] text-sm placeholder:text-[#5A5040] focus:border-[#D4A017]/60 focus:outline-none resize-none"
                />
              ) : (
                <input
                  id={id}
                  type={key === 'points' ? 'number' : 'text'}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  min={key === 'points' ? 1 : undefined}
                  required
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-[#F5F0E8] text-sm placeholder:text-[#5A5040] focus:border-[#D4A017]/60 focus:outline-none"
                />
              )}
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {tasks.map((task) => {
          const id = task._id.toString()
          return (
            <div
              key={id}
              className={`bg-[#111111] border rounded-xl p-5 flex items-start gap-4 ${
                task.isActive ? 'border-[#2A2A2A]' : 'border-[#2A2A2A] opacity-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-[#F5F0E8]">{task.title}</h3>
                  <Badge variant="points">+{task.points}</Badge>
                  {!task.isActive && <Badge>Inactive</Badge>}
                </div>
                <p className="text-sm text-[#A09070] mt-1">{task.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(id, task.isActive)}
                  aria-label={task.isActive ? 'Deactivate' : 'Activate'}
                  className="p-1.5 text-[#A09070] hover:text-[#D4A017] transition-colors cursor-pointer"
                >
                  {task.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
                <button
                  onClick={() => handleDelete(id)}
                  aria-label="Delete task"
                  className="p-1.5 text-[#A09070] hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}
        {tasks.length === 0 && (
          <p className="text-center text-[#5A5040] py-8 text-sm">No tasks yet. Create one above.</p>
        )}
      </div>
    </div>
  )
}
