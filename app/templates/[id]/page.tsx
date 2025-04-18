'use client';

import { AppShell } from '@/app/components/layout/app-shell';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Form, FormLabel } from '@/app/components/ui/form';
import { useStore } from '@/app/context/StoreProvider';
import type { TemplateExercise, WorkoutTemplate } from '@/app/stores/TemplateStore';
import { ChevronLeft, Plus, Save, Trash2, X } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const EditTemplatePage = observer(() => {
  const params = useParams();
  const idParam = params.id;
  const templateId = Array.isArray(idParam) ? idParam[0] : idParam!;
  const router = useRouter();
  const { templateStore, movementStore } = useStore();
  const [template, setTemplate] = useState<WorkoutTemplate>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);
  const form = useForm();

  // Add exercise dialog state
  const [showAddMovement, setShowAddMovement] = useState(false);
  const [selectedMovementId, setSelectedMovementId] = useState('');
  const [numSets, setNumSets] = useState(3);
  const [repsPerSet, setRepsPerSet] = useState(8);
  const [restTime, setRestTime] = useState(60);

  useEffect(() => {
    async function load() {
      if (templateStore.getAllTemplates().length === 0) {
        await templateStore.loadTemplates();
      }
      const tmpl = templateStore.getTemplate(templateId);
      if (tmpl) {
        setTemplate(tmpl);
        setName(tmpl.name);
        setDescription(tmpl.description || '');
        setExercises([...tmpl.exercises]);
      }
    }
    load();
  }, [templateId, templateStore]);

  const handleSave = async () => {
    if (!template) return;
    template.name = name;
    template.description = description;
    await templateStore.saveTemplate(template);
    router.push('/templates');
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    if (!template) return;
    await templateStore.removeExerciseFromTemplate(template.id, exerciseId);
    setExercises(template.exercises.slice());
  };

  const handleAddExercise = async () => {
    if (!template || !selectedMovementId) return;
    const newEx = await templateStore.addExerciseToTemplate(
      template.id,
      selectedMovementId,
      numSets,
      repsPerSet,
      restTime
    );
    if (newEx) {
      setExercises(template.exercises.slice());
      setSelectedMovementId('');
      setShowAddMovement(false);
    }
  };

  if (!template) {
    return <div>Loading...</div>;
  }

  const movements = movementStore.getAllMovements();

  return (
    <AppShell
      header={
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Link href='/templates' className='mr-2'>
              <ChevronLeft className='h-5 w-5' />
            </Link>
            <h1 className="text-xl font-bold">Edit Template</h1>
          </div>
          <Button size='sm' onClick={handleSave} disabled={!name || exercises.length === 0}>
            <Save className='h-4 w-4 mr-1' />
            Save
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <div className='space-y-6'>
          {/* Template Details */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Name */}
                <div>
                  <FormLabel htmlFor='template-name' className='block text-sm font-medium mb-1'>
                    Template Name
                  </FormLabel>
                  <input
                    id='template-name'
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent'
                  />
                </div>
                {/* Description */}
                <div>
                  <FormLabel htmlFor='template-description' className='block text-sm font-medium mb-1'>
                    Description (optional)
                  </FormLabel>
                  <textarea
                    id='template-description'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent'
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Exercises List */}
          <section>
            <h2 className='text-lg font-semibold mb-3'>Exercises</h2>
            <Card>
              {exercises.length === 0 ? (
                <CardContent className='p-6 text-center'>
                  <p className='text-gray-500 dark:text-gray-400'>No exercises added yet.</p>
                  <Button variant='outline' className='mt-3' onClick={() => setShowAddMovement(true)}>
                    <Plus className='h-4 w-4 mr-1' /> Add Exercise
                  </Button>
                </CardContent>
              ) : (
                <>
                  {exercises.map((exercise) => {
                    const movement = movementStore.getMovement(exercise.movementId);
                    return (
                      <div key={exercise.id} className='p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0'>
                        <div className='flex justify-between items-start'>
                          <div>
                            <h3 className='font-medium'>{movement?.name || 'Unknown Exercise'}</h3>
                            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                              {exercise.sets} sets • {exercise.repsPerSet} reps • {exercise.restTime}s rest
                            </p>
                          </div>
                          <button className='p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300' onClick={() => handleRemoveExercise(exercise.id)}>
                            <Trash2 className='h-4 w-4' />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <CardFooter className='p-4 border-t border-gray-200 dark:border-gray-700'>
                    <Button variant='outline' className='w-full' onClick={() => setShowAddMovement(true)}>
                      <Plus className='h-4 w-4 mr-1' /> Add Exercise
                    </Button>
                  </CardFooter>
                </>
              )}
            </Card>
          </section>

          {/* Add Exercise Dialog */}
          {showAddMovement && (
            <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
              <Card className='max-w-sm w-full mx-4'>
                <CardHeader>
                  <div className='flex justify-between items-center'>
                    <CardTitle>Add Exercise</CardTitle>
                    <button onClick={() => setShowAddMovement(false)}>
                      <X className='h-5 w-5' />
                    </button>
                  </div>
                </CardHeader>

                {movements.length === 0 ? (
                  <CardContent className='text-center py-4'>
                    <p>No exercises available.</p>
                    <Link href='/movements/new'><Button>Create Exercise</Button></Link>
                  </CardContent>
                ) : (
                  <>
                    <CardContent className='space-y-4'>
                      <div>
                        <FormLabel className='block text-sm font-medium mb-1'>
                          Exercise
                        </FormLabel>
                        <select
                          value={selectedMovementId}
                          onChange={(e) => setSelectedMovementId(e.target.value)}
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
                          <FormLabel className='block text-sm font-medium mb-1'>Sets</FormLabel>
                          <input
                            type='number'
                            value={numSets}
                            onChange={(e) => setNumSets(parseInt(e.target.value) || 1)}
                            className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent'
                            min='1'
                          />
                        </div>
                        <div>
                          <FormLabel className='block text-sm font-medium mb-1'>Reps per set</FormLabel>
                          <input
                            type='number'
                            value={repsPerSet}
                            onChange={(e) => setRepsPerSet(parseInt(e.target.value) || 1)}
                            className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent'
                            min='1'
                          />
                        </div>
                      </div>

                      <div>
                        <FormLabel className='block text-sm font-medium mb-1'>Rest Time (seconds)</FormLabel>
                        <input
                          type='number'
                          value={restTime}
                          onChange={(e) => setRestTime(parseInt(e.target.value) || 30)}
                          className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent'
                          min='10'
                          step='5'
                        />
                      </div>
                    </CardContent>

                    <CardFooter className='flex justify-end space-x-2'>
                      <Button variant='outline' onClick={() => setShowAddMovement(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddExercise} disabled={!selectedMovementId}>
                        Add
                      </Button>
                    </CardFooter>
                  </>
                )}
              </Card>
            </div>
          )}
        </div>
      </Form>
    </AppShell>
  );
});

export default EditTemplatePage;
