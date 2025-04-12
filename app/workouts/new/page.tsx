'use client';

import { AppShell } from '@/app/components/layout/app-shell';
import { TemplateList } from "@/app/components/workouts/TemplateList"
import { WorkoutNameInput } from "@/app/components/workouts/WorkoutNameInput"
import { useStore } from "@/app/context/StoreProvider"
import { ChevronLeft } from "lucide-react"
import { observer } from "mobx-react-lite"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

const NewWorkoutPage = observer(() => {
  const router = useRouter()
  const { workoutStore, templateStore } = useStore()
  const [workoutName, setWorkoutName] = useState<string>(
    `Workout ${new Date().toLocaleDateString()}`
  )
  const templates = templateStore.getAllTemplates()

  const handleStartEmptyWorkout = () => {
    const workout = workoutStore.startWorkout(workoutName)
    router.push(`/workouts/${workout.id}`)
  }

  const handleStartFromTemplate = (templateId: string) => {
    const workout = workoutStore.startWorkoutFromTemplate(templateId)
    if (workout) {
      templateStore.markTemplateAsUsed(templateId)
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
          <WorkoutNameInput
            workoutName={workoutName}
            onWorkoutNameChange={handleWorkoutNameChange}
            onStartWorkout={handleStartEmptyWorkout}
          />
        </section>

        <TemplateList
          templates={templates}
          onUseTemplate={handleStartFromTemplate}
        />
      </div>
    </AppShell>
  )
})

export default NewWorkoutPage;