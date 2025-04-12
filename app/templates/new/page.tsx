'use client';

import { AppShell } from '@/app/components/layout/app-shell';
import { Button } from '@/app/components/ui/button';
import { useStore } from '@/app/context/StoreProvider';
import { ChevronLeft, Plus, Save, Trash2, X } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const NewTemplatePage = observer(() => {
  const router = useRouter();
  const { templateStore, movementStore } = useStore();
  const [name, setName] = useState('New Template');
  const [description, setDescription] = useState('');
  const movements = movementStore.getAllMovements();

  // Temporary template exercises during creation
  const [exercises, setExercises] = useState<Array<{
    id: string;
    movementId: string;
    sets: number;
    repsPerSet: number;
    restTime: number;
  }>>([]);

  const [showAddMovement, setShowAddMovement] = useState(false);
  const [selectedMovementId, setSelectedMovementId] = useState('');
  const [numSets, setNumSets] = useState(3);
  const [repsPerSet, setRepsPerSet] = useState(8);
  const [restTime, setRestTime] = useState(60);

  const handleAddExercise = () => {
    if (selectedMovementId) {
      const newExercise = {
        id: crypto.randomUUID(),
        movementId: selectedMovementId,
        sets: numSets,
        repsPerSet,
        restTime
      };
      setExercises([...exercises, newExercise]);
      setSelectedMovementId('');
      setShowAddMovement(false);
    }
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };

  const handleSaveTemplate = () => {
    // Create the template
    const template = templateStore.createTemplate(name, description);

    // Add exercises to the template
    exercises.forEach(exercise => {
      templateStore.addExerciseToTemplate(
        template.id,
        exercise.movementId,
        exercise.sets,
        exercise.repsPerSet,
        exercise.restTime
      );
    });

    router.push('/templates');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value)
  }

  const handleShowAddMovement = () => {
    setShowAddMovement(true)
  }

  const handleHideAddMovement = () => {
    setShowAddMovement(false)
  }

  const handleSelectedMovementChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedMovementId(e.target.value)
  }

  const handleNumSetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumSets(parseInt(e.target.value) || 1)
  }

  const handleRepsPerSetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepsPerSet(parseInt(e.target.value) || 1)
  }

  const handleRestTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestTime(parseInt(e.target.value) || 30)
  }

  return (
    <AppShell
      header={
        <div className='flex items-center justify-between p-4'>
          <div className='flex items-center'>
            <Link href='/templates' className='mr-2'>
              <ChevronLeft className='h-5 w-5' />
            </Link>
            <h1 className='text-xl font-bold'>New Template</h1>
          </div>
          <Button
            size='sm'
            onClick={handleSaveTemplate}
            disabled={!name || exercises.length === 0}
          >
            <Save className='h-4 w-4 mr-1' />
            Save
          </Button>
        </div>
      }
    >
      <div className='space-y-6'>
        {/* Template Details */}
        <section>
          <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
            <div className='space-y-4'>
              <div>
                <label
                  className='block text-sm font-medium mb-1'
                  htmlFor='template-name'
                >
                  Template Name
                </label>
                <input
                  id='template-name'
                  type='text'
                  value={name}
                  onChange={handleNameChange}
                  className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent'
                />
              </div>
              <div>
                <label
                  className='block text-sm font-medium mb-1'
                  htmlFor='template-description'
                >
                  Description (optional)
                </label>
                <textarea
                  id='template-description'
                  value={description}
                  onChange={handleDescriptionChange}
                  className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent'
                  rows={3}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Exercises List */}
        <section>
          <h2 className='text-lg font-semibold mb-3'>Exercises</h2>
          <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
            {exercises.length === 0 ? (
              <div className='p-6 text-center'>
                <p className='text-gray-500 dark:text-gray-400'>
                  No exercises added yet.
                </p>
                <Button
                  variant='outline'
                  className='mt-3'
                  onClick={handleShowAddMovement}
                >
                  <Plus className='h-4 w-4 mr-1' />
                  Add Exercise
                </Button>
              </div>
            ) : (
              <>
                {exercises.map((exercise) => {
                  const movement = movementStore.getMovement(
                    exercise.movementId
                  )
                  return (
                    <div
                      key={exercise.id}
                      className='p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0'
                    >
                      <div className='flex justify-between items-start'>
                        <div>
                          <h3 className='font-medium'>
                            {movement?.name || "Unknown Exercise"}
                          </h3>
                          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                            {exercise.sets} sets • {exercise.repsPerSet} reps •{" "}
                            {exercise.restTime}s rest
                          </p>
                        </div>
                        <button
                          className='p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                          onClick={() => handleRemoveExercise(exercise.id)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                  )
                })}
                <div className='p-4 border-t border-gray-200 dark:border-gray-700'>
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={handleShowAddMovement}
                  >
                    <Plus className='h-4 w-4 mr-1' />
                    Add Exercise
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Add Exercise Dialog */}
        {showAddMovement && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className='bg-white dark:bg-gray-800 p-4 rounded-lg max-w-sm w-full mx-4'>
              <div className='flex justify-between mb-4'>
                <h2 className='text-xl font-bold'>Add Exercise</h2>
                <button onClick={handleHideAddMovement}>
                  <X className='h-5 w-5' />
                </button>
              </div>

              {movements.length === 0 ? (
                <div className='text-center py-4'>
                  <p className='mb-3'>No exercises available.</p>
                  <Link href='/movements/new'>
                    <Button>Create Exercise</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium mb-1'>
                        Exercise
                      </label>
                      <select
                        value={selectedMovementId}
                        onChange={handleSelectedMovementChange}
                        className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent'
                      >
                        <option value=''>Select an exercise</option>
                        {movements.map((movement) => (
                          <option key={movement.id} value={movement.id}>
                            {movement.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium mb-1'>
                          Sets
                        </label>
                        <input
                          type='number'
                          value={numSets}
                          onChange={handleNumSetsChange}
                          className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent'
                          min='1'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium mb-1'>
                          Reps per set
                        </label>
                        <input
                          type='number'
                          value={repsPerSet}
                          onChange={handleRepsPerSetChange}
                          className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent'
                          min='1'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium mb-1'>
                        Rest Time (seconds)
                      </label>
                      <input
                        type='number'
                        value={restTime}
                        onChange={handleRestTimeChange}
                        className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent'
                        min='10'
                        step='5'
                      />
                    </div>
                  </div>

                  <div className='flex space-x-2 mt-4'>
                    <Button
                      variant='outline'
                      className='flex-1'
                      onClick={handleHideAddMovement}
                    >
                      Cancel
                    </Button>
                    <Button
                      className='flex-1'
                      onClick={handleAddExercise}
                      disabled={!selectedMovementId}
                    >
                      Add
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
});

export default NewTemplatePage;