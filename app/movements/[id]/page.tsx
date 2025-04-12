'use client';

import { AppShell } from '@/app/components/layout/app-shell';
import { Button } from '@/app/components/ui/button';
import { useStore } from '@/app/context/StoreProvider';
import { ChevronLeft, Edit, LineChart, Save } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

const MovementDetailPage = observer(() => {
  const params = useParams();
  const movementId = String(params.id);
  const { movementStore } = useStore();
  
  const movement = movementStore.getMovement(movementId);
  const weightHistory = movement ? movementStore.getMovementHistory(movementId) : [];
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(movement?.name || '');
  const [category, setCategory] = useState(movement?.category || '');
  const [description, setDescription] = useState(movement?.description || '');
  
  const handleSave = () => {
    if (movement) {
      movement.name = name;
      movement.category = category;
      movement.description = description;
      setIsEditing(false);
    }
  };
  
  // Process data for chart
  const chartData = weightHistory.slice(0, 10).reverse().map((record) => ({
    date: new Date(record.date).toLocaleDateString(),
    weight: record.weight,
  }));
  
  if (!movement) {
    return <div>Movement not found</div>;
  }
  
  return (
    <AppShell
      header={
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Link href="/movements" className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold">{movement.name}</h1>
          </div>
          {!isEditing ? (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          ) : (
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {isEditing ? (
          <section>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="movement-name">
                    Exercise Name
                  </label>
                  <input
                    id="movement-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="movement-category">
                    Category
                  </label>
                  <input
                    id="movement-category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="movement-description">
                    Description
                  </label>
                  <textarea
                    id="movement-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => {
                    setName(movement.name);
                    setCategory(movement.category || '');
                    setDescription(movement.description || '');
                    setIsEditing(false);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              {movement.category && (
                <div className="mb-2">
                  <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                    {movement.category}
                  </span>
                </div>
              )}
              
              {movement.description && (
                <div className="mt-4 text-gray-600 dark:text-gray-300">
                  <p className="whitespace-pre-wrap">{movement.description}</p>
                </div>
              )}
            </div>
          </section>
        )}
        
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <LineChart className="h-5 w-5 mr-2" />
            Weight Progress
          </h2>
          
          {weightHistory.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No weight records yet. Complete a workout with this exercise to track your progress.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="h-64 relative">
                {/* Simple Chart Implementation */}
                <div className="absolute inset-0 flex items-end">
                  {chartData.map((item, index) => {
                    const maxWeight = Math.max(...chartData.map(d => d.weight));
                    const heightPercent = (item.weight / maxWeight) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-4/5 bg-blue-500 dark:bg-blue-600 rounded-t" 
                          style={{ height: `${heightPercent}%` }}
                        />
                        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 w-full text-center truncate">
                          {item.date}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Y-axis labels */}
                <div className="absolute top-0 left-0 h-full flex flex-col justify-between">
                  {[...Array(5)].map((_, i) => {
                    const maxWeight = Math.max(...chartData.map(d => d.weight));
                    const weight = Math.round(maxWeight - (i * (maxWeight / 4)));
                    return (
                      <div key={i} className="text-xs text-gray-500 dark:text-gray-400">
                        {weight} kg
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
        
        <section>
          <h2 className="text-lg font-semibold mb-3">Recent Records</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {weightHistory.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400">No records yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {weightHistory.slice(0, 10).map((record) => {
                  const date = new Date(record.date);
                  return (
                    <div key={record.id} className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{record.weight} kg</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {record.sets} {record.sets === 1 ? 'set' : 'sets'} × {record.reps} reps
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                          {date.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
});

export default MovementDetailPage;