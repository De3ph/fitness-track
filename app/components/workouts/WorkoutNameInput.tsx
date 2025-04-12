import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormLabel } from '@/components/ui/form';
import { Plus } from 'lucide-react';

interface WorkoutNameInputProps {
  workoutName: string;
  onWorkoutNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStartWorkout: () => void;
}

export function WorkoutNameInput({ 
  workoutName, 
  onWorkoutNameChange, 
  onStartWorkout 
}: WorkoutNameInputProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <FormLabel
          className="block text-sm font-medium mb-1"
          htmlFor="workout-name"
        >
          Workout Name
        </FormLabel>
        <input
          id="workout-name"
          type="text"
          value={workoutName}
          onChange={onWorkoutNameChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent mb-4 cursor-text"
        />
        <Button onClick={onStartWorkout} className="w-full cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Start Empty Workout
        </Button>
      </CardContent>
    </Card>
  );
}