'use client';

import { AppShell } from '@/app/components/layout/app-shell';
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import { Button } from "@/app/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/app/components/ui/card"
import { useStore } from "@/app/context/StoreProvider"
import { Check, ChevronLeft, Clock, Edit, Plus, Trash2, X } from "lucide-react"
import { observer } from "mobx-react-lite"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

const WorkoutDetailPage = observer(() => {
  const router = useRouter()
  const params = useParams()
  const workoutId = String(params.id)
  const { workoutStore, movementStore } = useStore()
  const workout = workoutStore.getWorkout(workoutId)
  const movements = movementStore.getAllMovements()

  const [selectedMovementId, setSelectedMovementId] = useState<string>("")
  const [showAddMovement, setShowAddMovement] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(workout?.notes || "")

  // Redirect if workout not found
  if (!workout) {
    return null
  }

  const handleAddMovement = () => {
    if (selectedMovementId) {
      workoutStore.addExerciseToWorkout(workoutId, selectedMovementId)
      setSelectedMovementId("")
      setShowAddMovement(false)
    }
  }

  const handleSaveNotes = () => {
    if (workout) {
      workout.notes = notes
      setEditingNotes(false)
    }
  }

  const handleCompleteWorkout = () => {
    workoutStore.completeWorkout(workoutId)
    router.push("/workouts")
  }

  const handleRemoveExercise = (exerciseId: string) => {
    const confirmed = confirm("Remove this exercise?")
    if (confirmed) {
      workoutStore.removeExerciseFromWorkout(workoutId, exerciseId)
    }
  }

  const handleCancelEditingNotes = () => {
    setNotes(workout.notes || "")
    setEditingNotes(false)
  }

  const handleAddSet = (exercise: any) => {
    const newSet = {
      id: crypto.randomUUID(),
      movementId: exercise.movementId,
      weight:
        exercise.sets.length > 0
          ? exercise.sets[exercise.sets.length - 1].weight
          : 0,
      reps:
        exercise.sets.length > 0
          ? exercise.sets[exercise.sets.length - 1].reps
          : 8,
      completed: false,
      restTime: 60
    }
    exercise.sets.push(newSet)
  }

  const handleUpdateWeight = (
    exerciseId: string,
    setId: string,
    weight: string
  ) => {
    workoutStore.updateSet(workoutId, exerciseId, setId, {
      weight: parseFloat(weight) || 0
    })
  }

  const handleUpdateReps = (
    exerciseId: string,
    setId: string,
    reps: string
  ) => {
    workoutStore.updateSet(workoutId, exerciseId, setId, {
      reps: parseInt(reps) || 0
    })
  }

  const handleCloseAddMovement = () => {
    setShowAddMovement(false)
  }

  const handleOpenAddMovement = () => {
    setShowAddMovement(true)
  }

  // Format timer display
  const formatTime = (seconds: number): string => {
    return `${Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
  }

  return (
    <AppShell
      header={
        <div className='flex items-center justify-between p-4'>
          <div className='flex items-center'>
            <Link href='/workouts' className='mr-2'>
              <ChevronLeft className='h-5 w-5' />
            </Link>
            <h1 className='text-xl font-bold'>{workout.name}</h1>
          </div>
          {!workout.completed && (
            <Button variant='outline' size='sm' onClick={handleCompleteWorkout}>
              <Check className='h-4 w-4 mr-1' /> Complete
            </Button>
          )}
        </div>
      }
    >
      <div className='space-y-6'>
        {/* Rest Timer */}
        {workoutStore.restTimerActive && (
          <Alert className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'>
            <Clock className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            <AlertDescription className='flex justify-between items-center w-full'>
              <div>
                <p className='font-medium text-blue-700 dark:text-blue-300'>
                  Rest Timer
                </p>
                <p className='text-xl font-bold'>
                  {formatTime(workoutStore.restTimeRemaining)}
                </p>
              </div>
              <Button
                variant='outline'
                onClick={() => workoutStore.stopRestTimer()}
              >
                Skip
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Exercise List */}
        <section>
          <Card>
            {workout.exercises.length === 0 ? (
              <CardContent className='text-center py-6'>
                <p className='text-gray-500 dark:text-gray-400'>
                  No exercises added yet.
                </p>
                <Button
                  variant='outline'
                  className='mt-3'
                  onClick={handleOpenAddMovement}
                >
                  <Plus className='h-4 w-4 mr-1' />
                  Add Exercise
                </Button>
              </CardContent>
            ) : (
              <>
                {workout.exercises.map((exercise) => {
                  const movement = movementStore.getMovement(
                    exercise.movementId
                  )
                  return (
                    <div
                      key={exercise.id}
                      className='border-b border-gray-200 dark:border-gray-700 last:border-b-0'
                    >
                      <div className='p-3 bg-gray-50 dark:bg-gray-900 flex justify-between items-center'>
                        <h3 className='font-medium'>
                          {movement?.name || "Unknown Exercise"}
                        </h3>
                        {!workout.completed && (
                          <div className='flex space-x-1'>
                            <button
                              className='p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                              onClick={() => handleRemoveExercise(exercise.id)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className='px-3'>
                        <div className='flex font-medium text-sm text-gray-500 py-2 border-b border-gray-200 dark:border-gray-700'>
                          <div className='w-10 text-center'>#</div>
                          <div className='w-1/3'>Weight</div>
                          <div className='w-1/3'>Reps</div>
                          <div className='flex-1'></div>
                        </div>
                        {exercise.sets.map((set, index) => (
                          <div
                            key={set.id}
                            className={`flex items-center py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                              set.completed ? "opacity-50" : ""
                            }`}
                          >
                            <div className='w-10 text-center'>{index + 1}</div>
                            <div className='w-1/3'>
                              {workout.completed ? (
                                <span>{set.weight} kg</span>
                              ) : (
                                <input
                                  type='number'
                                  value={set.weight}
                                  onChange={(e) =>
                                    handleUpdateWeight(
                                      exercise.id,
                                      set.id,
                                      e.target.value
                                    )
                                  }
                                  className='w-16 p-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-transparent'
                                  min='0'
                                  step='2.5'
                                  disabled={set.completed}
                                />
                              )}
                            </div>
                            <div className='w-1/3'>
                              {workout.completed ? (
                                <span>{set.reps}</span>
                              ) : (
                                <input
                                  type='number'
                                  value={set.reps}
                                  onChange={(e) =>
                                    handleUpdateReps(
                                      exercise.id,
                                      set.id,
                                      e.target.value
                                    )
                                  }
                                  className='w-16 p-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-transparent'
                                  min='0'
                                  disabled={set.completed}
                                />
                              )}
                            </div>
                            <div className='flex-1 text-right'>
                              {!workout.completed && !set.completed && (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  className='h-8 px-2'
                                  onClick={() =>
                                    workoutStore.completeSet(
                                      workout.id,
                                      exercise.id,
                                      set.id
                                    )
                                  }
                                >
                                  <Check className='h-4 w-4' />
                                </Button>
                              )}
                              {set.completed && (
                                <span className='text-green-600 dark:text-green-400'>
                                  <Check className='h-4 w-4' />
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {!workout.completed && (
                        <div className='p-3 border-t border-gray-200 dark:border-gray-700'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleAddSet(exercise)}
                          >
                            <Plus className='h-4 w-4 mr-1' /> Add Set
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
                {!workout.completed && (
                  <CardFooter className='border-t border-gray-200 dark:border-gray-700 px-4 py-4'>
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={handleOpenAddMovement}
                    >
                      <Plus className='h-4 w-4 mr-1' />
                      Add Another Exercise
                    </Button>
                  </CardFooter>
                )}
              </>
            )}
          </Card>
        </section>

        {/* Add Movement Dialog */}
        {showAddMovement && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <Card className='max-w-sm w-full mx-4'>
              <CardHeader>
                <div className='flex justify-between items-center'>
                  <CardTitle>Add Exercise</CardTitle>
                  <button onClick={handleCloseAddMovement}>
                    <X className='h-5 w-5' />
                  </button>
                </div>
              </CardHeader>

              <CardContent>
                {movements.length === 0 ? (
                  <div className='text-center py-4'>
                    <p className='mb-3'>No exercises available.</p>
                    <Link href='/movements/new'>
                      <Button>Create Exercise</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedMovementId}
                      onChange={(e) => setSelectedMovementId(e.target.value)}
                      className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent mb-4'
                    >
                      <option value=''>Select an exercise</option>
                      {movements.map((movement) => (
                        <option key={movement.id} value={movement.id}>
                          {movement.name}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </CardContent>

              {movements.length > 0 && (
                <CardFooter className='flex justify-end gap-2'>
                  <Button variant='outline' onClick={handleCloseAddMovement}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddMovement}
                    disabled={!selectedMovementId}
                  >
                    Add
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        )}

        {/* Notes Section */}
        <section>
          <div className='flex justify-between items-center mb-3'>
            <h2 className='text-lg font-semibold'>Notes</h2>
            {!workout.completed && !editingNotes && (
              <button
                className='text-sm text-primary flex items-center'
                onClick={() => setEditingNotes(true)}
              >
                <Edit className='h-4 w-4 mr-1' /> Edit
              </button>
            )}
          </div>

          <Card>
            <CardContent className='pt-6'>
              {editingNotes ? (
                <>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent min-h-[100px] mb-3'
                    placeholder='Add notes about this workout...'
                  />
                  <div className='flex justify-end space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleCancelEditingNotes}
                    >
                      Cancel
                    </Button>
                    <Button size='sm' onClick={handleSaveNotes}>
                      Save
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {workout.notes ? (
                    <p className='whitespace-pre-wrap'>{workout.notes}</p>
                  ) : (
                    <p className='text-gray-500 dark:text-gray-400'>
                      No notes for this workout.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Workout Details */}
        <section>
          <h2 className='text-lg font-semibold mb-3'>Details</h2>
          <Card>
            <CardContent className='pt-6'>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-500 dark:text-gray-400'>
                    Start Time:
                  </span>
                  <span>{new Date(workout.startTime).toLocaleString()}</span>
                </div>

                {workout.endTime && (
                  <div className='flex justify-between'>
                    <span className='text-gray-500 dark:text-gray-400'>
                      End Time:
                    </span>
                    <span>{new Date(workout.endTime).toLocaleString()}</span>
                  </div>
                )}

                <div className='flex justify-between'>
                  <span className='text-gray-500 dark:text-gray-400'>
                    Status:
                  </span>
                  <span
                    className={
                      workout.completed
                        ? "text-green-600 dark:text-green-400"
                        : "text-blue-600 dark:text-blue-400"
                    }
                  >
                    {workout.completed ? "Completed" : "In Progress"}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-500 dark:text-gray-400'>
                    Exercises:
                  </span>
                  <span>{workout.exercises.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  )
})

export default WorkoutDetailPage;