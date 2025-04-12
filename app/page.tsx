"use client"

import { AppShell } from "@/app/components/layout/app-shell"
import { Button } from "@/app/components/ui/button"
import { useStore } from "@/app/context/StoreProvider"
import { Dumbbell, LineChart, ListChecks, Plus, Timer } from "lucide-react"
import { observer } from "mobx-react-lite"
import Link from "next/link"

const HomePage = observer(() => {
  const { workoutStore, templateStore } = useStore()
  const activeWorkout = workoutStore.activeWorkout
  const recentTemplates = templateStore.getFrequentTemplates(3)

  const handleStartWorkoutFromTemplate = (templateId: string) => {
    workoutStore.startWorkoutFromTemplate(templateId)
    templateStore.markTemplateAsUsed(templateId)
  }

  const handleStopRestTimer = () => {
    workoutStore.stopRestTimer()
  }

  return (
    <AppShell>
      <div className='space-y-6'>
        <section>
          <h1 className='text-2xl font-bold tracking-tight mb-4'>
            Fitness Track
          </h1>

          {/* Active workout section */}
          {activeWorkout ? (
            <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='font-semibold'>{activeWorkout.name}</h2>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    Started {formatTimeAgo(activeWorkout.startTime)}
                  </p>
                </div>
                <Link href={`/workouts/${activeWorkout.id}`}>
                  <Button size='sm'>Continue</Button>
                </Link>
              </div>

              {/* Show rest timer if active */}
              {workoutStore.restTimerActive && (
                <div className='mt-4 bg-blue-50 dark:bg-blue-900/20 rounded p-3 flex items-center'>
                  <Timer className='h-5 w-5 text-blue-600 dark:text-blue-400 mr-2' />
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-blue-700 dark:text-blue-300'>
                      Rest Timer: {workoutStore.restTimeRemaining}s
                    </p>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleStopRestTimer}
                  >
                    Skip
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6 flex flex-col items-center justify-center text-center'>
              <Dumbbell className='h-10 w-10 text-gray-400 mb-2' />
              <h3 className='font-medium'>No Active Workout</h3>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4'>
                Start a new workout to track your progress
              </p>

              <div className='flex gap-3'>
                <Link href='/workouts/new'>
                  <Button>Start Workout</Button>
                </Link>
                <Link href='/templates'>
                  <Button variant='outline'>Use Template</Button>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <h2 className='text-lg font-semibold mb-3'>Quick Actions</h2>
          <div className='grid grid-cols-2 gap-3'>
            <Link href='/workouts' className='w-full'>
              <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center text-center hover:border-primary'>
                <Dumbbell className='h-8 w-8 text-primary mb-2' />
                <span className='font-medium'>Workouts</span>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  View history
                </span>
              </div>
            </Link>
            <Link href='/templates' className='w-full'>
              <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center text-center hover:border-primary'>
                <ListChecks className='h-8 w-8 text-primary mb-2' />
                <span className='font-medium'>Templates</span>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  Create & manage
                </span>
              </div>
            </Link>
            <Link href='/movements' className='w-full'>
              <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center text-center hover:border-primary'>
                <Plus className='h-8 w-8 text-primary mb-2' />
                <span className='font-medium'>Movements</span>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  Add exercises
                </span>
              </div>
            </Link>
            <Link href='/progress' className='w-full'>
              <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center text-center hover:border-primary'>
                <LineChart className='h-8 w-8 text-primary mb-2' />
                <span className='font-medium'>Progress</span>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  Track results
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Recent templates */}
        {recentTemplates.length > 0 && (
          <section>
            <h2 className='text-lg font-semibold mb-3'>Recent Templates</h2>
            <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
              {recentTemplates.map((template) => (
                <div
                  key={template.id}
                  className='p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0'
                >
                  <div className='flex justify-between items-center'>
                    <div>
                      <h3 className='font-medium'>{template.name}</h3>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        {template.exercises.length} exercises
                      </p>
                    </div>
                    <Button
                      size='sm'
                      onClick={() =>
                        handleStartWorkoutFromTemplate(template.id)
                      }
                    >
                      Start
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  )
})

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  )

  if (diffInMinutes < 1) return "just now"
  if (diffInMinutes === 1) return "1 minute ago"
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours === 1) return "1 hour ago"
  if (diffInHours < 24) return `${diffInHours} hours ago`

  return date.toLocaleDateString()
}

export default HomePage
