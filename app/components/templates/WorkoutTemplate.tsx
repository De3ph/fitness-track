import { Button } from "@/app/components/ui/button"
import { CardContent } from "@/app/components/ui/card"
import type { WorkoutTemplate } from "@/app/stores/TemplateStore"
import { Calendar, Link } from "lucide-react"

interface WorkoutTemplateProps {
  template: WorkoutTemplate
  onStartWorkout: (templateId: string) => void
}

const WorkoutTemplate: React.FC<WorkoutTemplateProps> = ({
  template,
  onStartWorkout
}) => {
  return (
    <CardContent className='p-4'>
      <div className='flex justify-between items-start'>
        <div>
          <h3 className='font-medium'>{template.name}</h3>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
            {template.exercises.length} exercises
          </p>
          {template.lastUsed && (
            <div className='flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1'>
              <Calendar className='h-3 w-3 mr-1' />
              Last used: {new Date(template.lastUsed).toLocaleDateString()}
            </div>
          )}
        </div>
        <div className='flex space-x-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => onStartWorkout(template.id)}
          >
            Start
          </Button>
          <Link href={`/templates/${template.id}`}>
            <Button size='sm'>Edit</Button>
          </Link>
        </div>
      </div>

      {template.description && (
        <p className='text-sm mt-2 text-gray-600 dark:text-gray-300'>
          {template.description}
        </p>
      )}
    </CardContent>
  )
}

export default WorkoutTemplate
