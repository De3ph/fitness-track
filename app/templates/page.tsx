"use client"

import { AppShell } from "@/app/components/layout/app-shell"
import { Button } from "@/app/components/ui/button"
import { useStore } from "@/app/context/StoreProvider"
import { Card, CardContent } from "@/components/ui/card"
import { ListChecks, Plus } from "lucide-react"
import { observer } from "mobx-react-lite"
import Link from "next/link"
import { useRouter } from "next/navigation"
import WorkoutTemplate from "../components/templates/WorkoutTemplate"

const TemplatesPage = observer(() => {
  const router = useRouter()
  const { templateStore, workoutStore } = useStore()
  const templates = templateStore.getAllTemplates()

  const handleStartWorkout = (templateId: string) => {
    const workout = workoutStore.startWorkoutFromTemplate(templateId)
    if (workout) {
      templateStore.markTemplateAsUsed(templateId)
      router.push(`/workouts/${workout.id}`)
    }
  }

  return (
    <AppShell
      header={
        <div className='flex items-center justify-between p-4'>
          <h1 className='text-xl font-bold'>Templates</h1>
          <Link href='/templates/new'>
            <Button size='sm'>
              <Plus className='h-4 w-4 mr-1' />
              New
            </Button>
          </Link>
        </div>
      }
    >
      <div className='space-y-6'>
        {templates.length === 0 ? (
          <Card>
            <CardContent className='p-6 flex flex-col items-center justify-center text-center'>
              <ListChecks className='h-10 w-10 text-gray-400 mb-2' />
              <h3 className='font-medium'>No Templates Yet</h3>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4'>
                Create your first workout template to reuse it later
              </p>
              <Link href='/templates/new'>
                <Button>Create Template</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            {templates.map((template) => (
              <div
                key={template.id}
                className='border-b border-gray-200 dark:border-gray-700 last:border-b-0'
              >
                <WorkoutTemplate
                  template={template}
                  onStartWorkout={handleStartWorkout}
                />
              </div>
            ))}
          </Card>
        )}
      </div>
    </AppShell>
  )
})

export default TemplatesPage
