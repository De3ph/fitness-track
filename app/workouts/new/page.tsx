'use client';

import { AppShell } from '@/app/components/layout/app-shell';
import { Button } from '@/app/components/ui/button';
import { useStore } from '@/app/context/StoreProvider';
import { ChevronLeft, Plus } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const NewWorkoutPage = observer(() => {
  const router = useRouter();
  const { workoutStore, templateStore } = useStore();
  const [workoutName, setWorkoutName] = useState<string>(`Workout ${new Date().toLocaleDateString()}`);
  const templates = templateStore.getAllTemplates();

  const handleStartEmptyWorkout = async () => {
    const workout = await workoutStore.startWorkout(workoutName)
    router.push(`/workouts/${workout.id}`)
  }

  const handleStartFromTemplate = async (templateId: string) => {
    const workout = await workoutStore.startWorkoutFromTemplate(templateId)
    if (workout) {
      await templateStore.markTemplateAsUsed(templateId)
      router.push(`/workouts/${workout.id}`)
    }
  }

  const handleWorkoutNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkoutName(e.target.value)
  }

  return (
    <AppShell
      header={
        <div className='flex items-center justify-between p-4'>
          <div className='flex items-center'>
            <Link href='/workouts' className='mr-2'>
              <ChevronLeft className='h-5 w-5' />
            </Link>
            <h1 className='text-xl font-bold'>New Workout</h1>
          </div>
        </div>
      }
    >
      <div className='space-y-6'>
        <section>
          <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
            <label
              className='block text-sm font-medium mb-1'
              htmlFor='workout-name'
            >
              Workout Name
            </label>
            <input
              id='workout-name'
              type='text'
              value={workoutName}
              onChange={handleWorkoutNameChange}
              className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent mb-4'
            />
            <Button onClick={handleStartEmptyWorkout} className='w-full'>
              <Plus className='h-4 w-4 mr-2' />
              Start Empty Workout
            </Button>
          </div>
        </section>

        {templates.length > 0 && (
          <section>
            <h2 className='text-lg font-semibold mb-3'>Start from Template</h2>
            <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
              {templates.map((template) => (
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
                      onClick={() => handleStartFromTemplate(template.id)}
                    >
                      Use
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
});

export default NewWorkoutPage;