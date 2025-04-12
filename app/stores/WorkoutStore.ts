import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';

export type WorkoutSet = {
  id: string;
  movementId: string;
  weight: number;
  reps: number;
  completed: boolean;
  restTime?: number; // Rest time in seconds
};

export type WorkoutExercise = {
  id: string;
  movementId: string;
  sets: WorkoutSet[];
  notes?: string;
};

export type Workout = {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  notes?: string;
};

export class WorkoutStore {
  workouts: Workout[] = []
  activeWorkout: Workout | null = null
  restTimerActive = false
  restTimeRemaining = 0
  restTimerInterval: NodeJS.Timeout | null = null
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  // Start a new workout session
  startWorkout = (
    name: string = `Workout ${new Date().toLocaleDateString()}`
  ): Workout => {
    // Complete any active workout first
    if (this.activeWorkout && !this.activeWorkout.completed) {
      this.completeWorkout(this.activeWorkout.id)
    }

    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      name,
      exercises: [],
      startTime: new Date(),
      completed: false
    }

    this.workouts.push(newWorkout)
    this.activeWorkout = newWorkout
    return newWorkout
  }

  // Start workout from template
  startWorkoutFromTemplate = (templateId: string): Workout | null => {
    const template = this.rootStore.templateStore.getTemplate(templateId)
    if (!template) return null

    const newWorkout = this.startWorkout(template.name)

    // Clone exercises from template
    template.exercises.forEach((exercise) => {
      const movement = this.rootStore.movementStore.getMovement(
        exercise.movementId
      )
      if (movement) {
        this.addExerciseToWorkout(
          newWorkout.id,
          exercise.movementId,
          exercise.sets
        )
      }
    })

    return newWorkout
  }

  // Complete a workout session
  completeWorkout = (workoutId: string): Workout | undefined => {
    const workout = this.workouts.find((w) => w.id === workoutId)
    if (!workout) return

    workout.completed = true
    workout.endTime = new Date()

    // If this was the active workout, set active to null
    if (this.activeWorkout?.id === workoutId) {
      this.activeWorkout = null
    }

    // Record all completed sets' weights in the movement store
    workout.exercises.forEach((exercise) => {
      const completedSets = exercise.sets.filter((set) => set.completed)
      if (completedSets.length > 0) {
        // For each completed movement, add a weight record
        completedSets.forEach((set) => {
          this.rootStore.movementStore.addWeightRecord(
            exercise.movementId,
            set.weight,
            set.reps,
            1, // One set
            workout.id
          )
        })
      }
    })

    return workout
  }

  // Add an exercise to a workout
  addExerciseToWorkout = (
    workoutId: string,
    movementId: string,
    defaultSets: number = 3
  ): WorkoutExercise | undefined => {
    const workout = this.workouts.find((w) => w.id === workoutId)
    if (!workout) return

    const movement = this.rootStore.movementStore.getMovement(movementId)
    if (!movement) return

    // Create sets with default values
    const sets: WorkoutSet[] = Array(defaultSets)
      .fill(null)
      .map(() => ({
        id: crypto.randomUUID(),
        movementId,
        weight: 0,
        reps: 8,
        completed: false,
        restTime: 60 // Default 60 seconds rest
      }))

    const newExercise: WorkoutExercise = {
      id: crypto.randomUUID(),
      movementId,
      sets
    }

    workout.exercises.push(newExercise)
    return newExercise
  }

  // Remove an exercise from a workout
  removeExerciseFromWorkout = (
    workoutId: string,
    exerciseId: string
  ): boolean => {
    const workout = this.workouts.find((w) => w.id === workoutId)
    if (!workout) return false

    const exerciseIndex = workout.exercises.findIndex(
      (e) => e.id === exerciseId
    )
    if (exerciseIndex === -1) return false

    workout.exercises.splice(exerciseIndex, 1)
    return true
  }

  // Complete a set in a workout exercise
  completeSet = (
    workoutId: string,
    exerciseId: string,
    setId: string
  ): void => {
    const workout = this.workouts.find((w) => w.id === workoutId)
    if (!workout) return

    const exercise = workout.exercises.find((e) => e.id === exerciseId)
    if (!exercise) return

    const set = exercise.sets.find((s) => s.id === setId)
    if (!set) return

    set.completed = true
    this.startRestTimer(set.restTime || 60)
  }

  // Start the rest timer
  startRestTimer = (seconds: number): void => {
    this.stopRestTimer() // Clear any existing timer
    this.restTimerActive = true
    this.restTimeRemaining = seconds

    this.restTimerInterval = setInterval(() => {
      this.restTimeRemaining -= 1

      if (this.restTimeRemaining <= 0) {
        this.stopRestTimer()
      }
    }, 1000)
  }

  // Stop the rest timer
  stopRestTimer = (): void => {
    if (this.restTimerInterval) {
      clearInterval(this.restTimerInterval)
      this.restTimerInterval = null
    }
    this.restTimerActive = false
    this.restTimeRemaining = 0
  }

  // Update set details
  updateSet = (
    workoutId: string,
    exerciseId: string,
    setId: string,
    updates: Partial<WorkoutSet>
  ): WorkoutSet | undefined => {
    const workout = this.workouts.find((w) => w.id === workoutId)
    if (!workout) return

    const exercise = workout.exercises.find((e) => e.id === exerciseId)
    if (!exercise) return

    const set = exercise.sets.find((s) => s.id === setId)
    if (!set) return

    // Apply updates to the set
    Object.assign(set, updates)
    return set
  }

  // Get workout history
  getWorkoutHistory = (): Workout[] => {
    return [...this.workouts]
      .filter((w) => w.completed)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
  }

  // Get a specific workout
  getWorkout = (id: string): Workout | undefined => {
    return this.workouts.find((w) => w.id === id)
  }
}