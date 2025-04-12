import { Button } from '@/app/components/ui/button';
import { useEffect, useState } from 'react';

// List of exercise categories
const EXERCISE_CATEGORIES = [
  'Arms',
  'Back',
  'Chest',
  'Core',
  'Legs',
  'Shoulders',
  'Cardio',
  'Full Body',
  'Other'
];

interface MovementFormProps {
  initialName?: string;
  initialCategory?: string;
  initialDescription?: string;
  onSave: (data: { name: string; category: string; description: string }) => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  formId?: string;
}

export function MovementForm({
  initialName = '',
  initialCategory = '',
  initialDescription = '',
  onSave,
  onCancel,
  showCancelButton = false,
  formId = 'movement-form'
}: MovementFormProps) {
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState(initialCategory);
  const [description, setDescription] = useState(initialDescription);

  // Update local state when props change (for edit mode)
  useEffect(() => {
    setName(initialName);
    setCategory(initialCategory);
    setDescription(initialDescription);
  }, [initialName, initialCategory, initialDescription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name, category, description });
    }
  };

  const isFormValid = name.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id={formId}>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="exercise-name">
          Exercise Name {!initialName && '*'}
        </label>
        <input
          id="exercise-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent cursor-text"
          placeholder="e.g. Bench Press"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="exercise-category">
          Category
        </label>
        <select
          id="exercise-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent cursor-pointer"
        >
          <option value="">Select a category</option>
          {EXERCISE_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="exercise-description">
          Description {!initialName && '(optional)'}
        </label>
        <textarea
          id="exercise-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent cursor-text"
          rows={4}
          placeholder="Add notes, form tips, or any other helpful information"
        />
      </div>

      {showCancelButton && (
        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isFormValid}>
            Save Changes
          </Button>
        </div>
      )}
    </form>
  );
}