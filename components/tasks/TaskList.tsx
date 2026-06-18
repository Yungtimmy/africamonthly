'use client'

import { useState } from 'react'
import { TaskCard } from './TaskCard'
import { SubmissionModal } from './SubmissionModal'

interface Task {
  id: string
  title: string
  description: string
  points: number
  task_type?: string
  x_post_url?: string | null
  x_actions?: string[] | null
  submissionStatus: string | null
}

interface TaskListProps {
  tasks: Task[]
  isLoggedIn: boolean
}

export function TaskList({ tasks, isLoggedIn }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'available' | 'pending' | 'x_post' | 'other'>('all')

  function handleSubmitted(taskId: string) {
    setCompletedTaskIds((prev) => new Set([...prev, taskId]))
    setSelectedTask(null)
  }

  function statusOf(task: Task): string | null {
    return completedTaskIds.has(task.id) ? 'pending' : task.submissionStatus
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 text-[#A09070]">
        <p className="font-serif text-xl text-[#F5F0E8] mb-2">No tasks yet</p>
        <p className="text-sm">Check back soon</p>
      </div>
    )
  }

  const counts = {
    all: tasks.length,
    available: tasks.filter((t) => !statusOf(t)).length,
    pending: tasks.filter((t) => statusOf(t) === 'pending').length,
    x_post: tasks.filter((t) => t.task_type === 'x_post').length,
    other: tasks.filter((t) => t.task_type !== 'x_post').length,
  }

  const filterTabs: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Available' },
    { key: 'pending', label: 'Pending' },
    { key: 'x_post', label: '𝕏 Posts' },
    { key: 'other', label: 'Other' },
  ]

  const visibleTasks = tasks.filter((task) => {
    const status = statusOf(task)
    switch (filter) {
      case 'available': return !status
      case 'pending': return status === 'pending'
      case 'x_post': return task.task_type === 'x_post'
      case 'other': return task.task_type !== 'x_post'
      default: return true
    }
  })

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {filterTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === key
                ? 'bg-[#00D4FF]/10 border-[#00D4FF]/40 text-[#00D4FF]'
                : 'bg-white/3 border-white/8 text-white/40 hover:text-white/70 hover:border-white/20'
            }`}
          >
            {label}
            <span className={`ml-1.5 ${filter === key ? 'text-[#00D4FF]/60' : 'text-white/25'}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {visibleTasks.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">No tasks match this filter.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleTasks.map((task) => {
            const taskId = task.id
            const status = statusOf(task)
            return (
              <TaskCard
                key={taskId}
                task={task}
                submissionStatus={status}
                isLoggedIn={isLoggedIn}
                onSubmit={() => setSelectedTask(task)}
              />
            )
          })}
        </div>
      )}

      {selectedTask && (
        <SubmissionModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSubmitted={() => handleSubmitted(selectedTask.id)}
        />
      )}
    </>
  )
}
