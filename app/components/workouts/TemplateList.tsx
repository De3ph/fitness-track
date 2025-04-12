import { Card } from "@/app/components/ui/card"
import { WorkoutTemplate } from "@/app/stores/TemplateStore"
import { TemplateItem } from "./TemplateItem"

interface TemplateListProps {
  templates: WorkoutTemplate[]
  onUseTemplate: (templateId: string) => void
}

export function TemplateList({ templates, onUseTemplate }: TemplateListProps) {
  if (templates.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className='text-lg font-semibold mb-3'>Start from Template</h2>
      <Card>
        {templates.map((template) => (
          <TemplateItem
            key={template.id}
            template={template}
            onUseTemplate={onUseTemplate}
          />
        ))}
      </Card>
    </section>
  )
}
