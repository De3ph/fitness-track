'use client';

import { AppShell } from '@/app/components/layout/app-shell';
import { Button } from '@/app/components/ui/button';
import { useStore } from '@/app/context/StoreProvider';
import { ChevronRight, Dumbbell, Plus } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';

const MovementsPage = observer(() => {
  const { movementStore } = useStore();
  const movements = movementStore.getAllMovements();

  return (
    <AppShell
      header={
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Exercises</h1>
          <Link href="/movements/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {movements.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center text-center">
            <Dumbbell className="h-10 w-10 text-gray-400 mb-2" />
            <h3 className="font-medium">No Exercises Yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
              Add your first exercise to track your progress
            </p>
            <Link href="/movements/new">
              <Button>Create Exercise</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {movements.map(movement => (
              <Link 
                key={movement.id}
                href={`/movements/${movement.id}`}
                className="block p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{movement.name}</h3>
                    {movement.category && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {movement.category}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
});

export default MovementsPage;