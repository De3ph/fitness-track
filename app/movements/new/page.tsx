'use client';

import { AppShell } from '@/app/components/layout/app-shell';
import { Button } from '@/app/components/ui/button';
import { useStore } from '@/app/context/StoreProvider';
import { ChevronLeft, Save } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

const NewMovementPage = observer(() => {
  const router = useRouter();
  const { movementStore } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSave = () => {
    if (name) {
      movementStore.createMovement(name, description, category);
      router.push('/movements');
    }
  };

  const isFormValid = name.trim().length > 0;

  return (
    <AppShell
      header={
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Link href="/movements" className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold">New Exercise</h1>
          </div>
          <Button size="sm" onClick={handleSave} disabled={!isFormValid}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <section>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="exercise-name">
                  Exercise Name *
                </label>
                <input
                  id="exercise-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
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
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
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
                  Description (optional)
                </label>
                <textarea
                  id="exercise-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                  rows={4}
                  placeholder="Add notes, form tips, or any other helpful information"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
});

export default NewMovementPage;