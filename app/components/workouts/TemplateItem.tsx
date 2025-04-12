import { Button } from '@/app/components/ui/button';
import { WorkoutTemplate } from '@/app/stores/TemplateStore';

interface TemplateItemProps {
  template: WorkoutTemplate;
  onUseTemplate: (templateId: string) => void;
}

export function TemplateItem({ template, onUseTemplate }: TemplateItemProps) {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{template.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {template.exercises.length} exercises
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => onUseTemplate(template.id)}
          className="cursor-pointer"
        >
          Use
        </Button>
      </div>
    </div>
  );
}