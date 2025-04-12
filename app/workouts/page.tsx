'use client';

import { AppShell } from '@/app/components/layout/app-shell';
import { Button } from '@/app/components/ui/button';
import { useStore } from '@/app/context/StoreProvider';
import { ChevronRight, Dumbbell, Plus } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';

const WorkoutsPage = observer(() => {
  const { workoutStore } = useStore();
  const workoutHistory = workoutStore.getWorkoutHistory();
  const activeWorkout = workoutStore.activeWorkout;

  return (
    <AppShell
      header={
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Workouts</h1>
          <Link href="/workouts/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {activeWorkout && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Active Workout</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{activeWorkout.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activeWorkout.exercises.length} exercises
                    </p>
                  </div>
                  <Link href={`/workouts/${activeWorkout.id}`}>
                    <Button>Continue</Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-3">History</h2>

          {workoutHistory.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center text-center">
              <Dumbbell className="h-10 w-10 text-gray-400 mb-2" />
              <h3 className="font-medium">No Workout History</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
                Complete your first workout to see it here
              </p>
              <Link href="/workouts/new">
                <Button>Start First Workout</Button>
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {workoutHistory.map(workout => (
                <Link 
                  key={workout.id} 
                  href={`/workouts/${workout.id}`}
                  className="block p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{workout.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(workout.startTime).toLocaleDateString()} • {workout.exercises.length} exercises
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
});

export default WorkoutsPage;