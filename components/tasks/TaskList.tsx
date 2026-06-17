'use client'

import { useState } from 'react'
import { TaskCard } from './TaskCard'
import { SubmissionModal } from './SubmissionModal'

interface Task {
  _id: { toString(): string }
  title: string
  description: string
  points: number
  submissionStatus: string | null
}

interface TaskListProps {
  tasks: Task[]
  isLoggedIn: boolean
}

export function TaskList({ tasks, isLoggedIn }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set())

  function handleSubmitted(taskId: string) {
    setCompletedTaskIds((prev) => new Set([...prev, taskId]))
    setSelectedTask(null)
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 text-[#A09070]">
        <p className="font-serif text-xl text-[#F5F0E8] mb-2">No tasks yet</p>
        <p className="text-sm">Check back soon</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tasks.map((task) => {
          const taskId = task._id.toString()
          const status = completedTaskIds.has(taskId) ? 'pending' : task.submissionStatus
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

      {selectedTask && (
        <SubmissionModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSubmitted={() => handleSubmitted(selectedTask._id.toString())}
        />
      )}
    </>
  )
}
