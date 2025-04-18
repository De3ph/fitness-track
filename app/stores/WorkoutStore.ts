import dayjs from "dayjs"
import { makeAutoObservable } from "mobx"
import {
  workoutRepository,
  type WorkoutRepository
} from "../services/repositories"
import { WeightRecord } from "./MovementStore"
import { RootStore } from "./RootStore"

export type WorkoutSet = {
  id: string
  movementId: string
  weight: number
  reps: number
  completed: boolean
  restTime?: number // Rest time in seconds
}

export type WorkoutExercise = {
  id: string
  movementId: string
  sets: WorkoutSet[]
  notes?: string
}

export type Workout = {
  id: string
  name: string
  exercises: WorkoutExercise[]
  startTime: Date
  endTime?: Date
  completed: boolean
  notes?: string
}

export class WorkoutStore {
  workouts: Workout[] = []
  activeWorkout: Workout | null = null
  restTimerActive = false
  restTimeRemaining = 0
  restTimerInterval: NodeJS.Timeout | null = null
  rootStore: RootStore
  workoutRepository: WorkoutRepository

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    this.workoutRepository = workoutRepository
    makeAutoObservable(this)
  }

  loadWorkouts = async () => {
    try {
      // First get all workouts
      const workoutRecords = await this.workoutRepository.getAll()

      // Create workout objects with proper date conversion
      const workouts = workoutRecords.map((record) => ({
        id: record.id,
        name: record.name,
        completed: record.completed,
        notes: record.notes,
        startTime: dayjs(record.startTime).toDate(),
        endTime: record.endTime ? dayjs(record.endTime).toDate() : undefined,
        exercises: [] as WorkoutExercise[] // Explicitly type as WorkoutExercise[]
      }))

      // For each workout, load its exercises and sets using the repository pattern
      for (const workout of workouts) {
        const workoutDetails =
          await this.workoutRepository.getWorkoutWithDetails(workout.id)

        workout.exercises = workoutDetails.exercises.map((exercise) => ({
          id: exercise.id,
          movementId: exercise.movementId,
          notes: exercise.notes,
          sets: exercise.sets.map((set) => ({
            id: set.id,
            movementId: set.movementId,
            weight: set.weight,
            reps: set.reps,
            completed: set.completed,
            restTime: set.restTime
          }))
        }))
      }

      this.workouts = workouts

      // Set active workout if there's an incomplete one
      const incompleteWorkout = this.workouts.find((w) => !w.completed)
      if (incompleteWorkout) {
        this.activeWorkout = incompleteWorkout
      }
    } catch (error) {
      console.error("Failed to load workouts:", error)
    }
  }

  saveWorkout = async (workout: Workout) => {
    try {
      const workoutData = {
        name: workout.name,
        completed: workout.completed,
        notes: workout.notes,
        startTime: workout.startTime.toISOString(),
        endTime: workout.endTime ? workout.endTime.toISOString() : undefined
      }

      if (workout.id) {
        await this.workoutRepository.update(workout.id, workoutData)
      } else {
        const newRecord = await this.workoutRepository.create(workoutData)
        workout.id = newRecord.id
      }
    } catch (error) {
      console.error("Failed to save workout:", error)
    }
  }

  deleteWorkout = async (workoutId: string) => {
    try {
      await this.workoutRepository.delete(workoutId)
      this.workouts = this.workouts.filter((w) => w.id !== workoutId)
    } catch (error) {
      console.error("Failed to delete workout:", error)
    }
  }

  // Start a new workout session
  startWorkout = async (
    name: string = `Workout ${new Date().toLocaleDateString()}`
  ): Promise<Workout> => {
    // Complete any active workout first
    if (this.activeWorkout && !this.activeWorkout.completed) {
      await this.completeWorkout(this.activeWorkout.id)
    }

    const newWorkout: Workout = {
      id: "", // PocketBase will generate the ID
      name,
      exercises: [],
      startTime: new Date(),
      completed: false
    }

    try {
      const workoutData = {
        name: newWorkout.name,
        completed: newWorkout.completed,
        startTime: newWorkout.startTime.toISOString()
      }

      const createdRecord = await this.workoutRepository.create(workoutData)

      const createdWorkout = {
        ...newWorkout,
        id: createdRecord.id
      }

      this.workouts.push(createdWorkout)
      this.activeWorkout = createdWorkout
      return createdWorkout
    } catch (error) {
      console.error("Failed to start workout:", error)
      throw error
    }
  }

  // Start workout from template
  startWorkoutFromTemplate = async (
    templateId: string
  ): Promise<Workout | null> => {
    const template = this.rootStore.templateStore.getTemplate(templateId)
    if (!template) return null

    try {
      const newWorkout = await this.startWorkout(template.name)

      // Clone exercises from template
      const exercisePromises = template.exercises.map(async (exercise) => {
        const movement = this.rootStore.movementStore.getMovement(
          exercise.movementId
        )
        if (movement) {
          return this.addExerciseToWorkout(
            newWorkout.id,
            exercise.movementId,
            exercise.sets
          )
        }
        return null
      })

      await Promise.all(exercisePromises)

      // Mark the template as used
      await this.rootStore.templateStore.markTemplateAsUsed(templateId)

      return newWorkout
    } catch (error) {
      console.error("Failed to start workout from template:", error)
      return null
    }
  }

  completeWorkout = async (workoutId: string): Promise<Workout | undefined> => {
    const workout = this.workouts.find((w) => w.id === workoutId)
    if (!workout) return

    workout.completed = true
    workout.endTime = new Date()

    // If this was the active workout, set active to null
    if (this.activeWorkout?.id === workoutId) {
      this.activeWorkout = null
    }

    try {
      // Update workout in database using repository
      await this.workoutRepository.completeWorkout(workoutId)

      // Record all completed sets' weights in the movement store
      const recordPromises: Promise<WeightRecord | undefined>[] = []

      workout.exercises.forEach((exercise) => {
        const completedSets = exercise.sets.filter((set) => set.completed)
        if (completedSets.length > 0) {
          // For each completed movement, add a weight record
          completedSets.forEach((set) => {
            recordPromises.push(
              this.rootStore.movementStore.addWeightRecord(
                exercise.movementId,
                set.weight,
                set.reps,
                1, // One set
                workout.id
              )
            )
          })
        }
      })

      await Promise.all(recordPromises)
      return workout
    } catch (error) {
      console.error("Failed to complete workout:", error)
      return undefined
    }
  }

  // Add an exercise to a workout
  addExerciseToWorkout = async (
    workoutId: string,
    movementId: string,
    defaultSets: number = 3
  ): Promise<WorkoutExercise | undefined> => {
    const workout = this.workouts.find((w) => w.id === workoutId)
    if (!workout) return

    const movement = this.rootStore.movementStore.getMovement(movementId)
    if (!movement) return

    try {
      // Create exercise in database using repository
      const createdExercise = await this.workoutRepository.addExerciseToWorkout(
        workoutId,
        movementId,
        "" // Empty notes
      )

      const newExercise: WorkoutExercise = {
        id: createdExercise.id,
        movementId,
        sets: []
      }

      // Then create all the sets using repository
      const setsPromises = Array(defaultSets)
        .fill(null)
        .map(async () => {
          const createdSet = await this.workoutRepository.addSetToExercise(
            newExercise.id,
            movementId,
            0, // Default weight
            8, // Default reps
            60 // Default rest time
          )

          return {
            id: createdSet.id,
            movementId,
            weight: createdSet.weight,
            reps: createdSet.reps,
            completed: createdSet.completed,
            restTime: createdSet.restTime
          }
        })

      const sets = await Promise.all(setsPromises)
      newExercise.sets = sets

      workout.exercises.push(newExercise)
      return newExercise
    } catch (error) {
      console.error("Failed to add exercise to workout:", error)
      return undefined
    }
  }

  // Remove an exercise from a workout
  removeExerciseFromWorkout = async (
    workoutId: string,
    exerciseId: string
  ): Promise<boolean> => {
    const workout = this.workouts.find((w) => w.id === workoutId)
    if (!workout) return false

    const exerciseIndex = workout.exercises.findIndex(
      (e) => e.id === exerciseId
    )
    if (exerciseIndex === -1) return false

    try {
      // Delete exercise and its sets using repository
      await this.workoutRepository.deleteExercise(exerciseId)

      // Update local state
      workout.exercises.splice(exerciseIndex, 1)
      return true
    } catch (error) {
      console.error("Failed to remove exercise from workout:", error)
      return false
    }
  }

  // Complete a set in a workout exercise
  completeSet = async (
    workoutId: string,
    exerciseId: string,
    setId: string
  ): Promise<void> => {
    const workout = this.workouts.find((w) => w.id === workoutId)
    if (!workout) return

    const exercise = workout.exercises.find((e) => e.id === exerciseId)
    if (!exercise) return

    const set = exercise.sets.find((s) => s.id === setId)
    if (!set) return

    set.completed = true

    try {
      // Mark set as completed using repository
      await this.workoutRepository.completeSet(setId)

      this.startRestTimer(set.restTime || 60)
    } catch (error) {
      console.error("Failed to complete set:", error)
    }
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
  updateSet = async (
    workoutId: string,
    exerciseId: string,
    setId: string,
    updates: Partial<WorkoutSet>
  ): Promise<WorkoutSet | undefined> => {
    const workout = this.workouts.find((w) => w.id === workoutId)
    if (!workout) return

    const exercise = workout.exercises.find((e) => e.id === exerciseId)
    if (!exercise) return

    const set = exercise.sets.find((s) => s.id === setId)
    if (!set) return

    // Apply updates to the set
    Object.assign(set, updates)

    try {
      // Update the set using repository
      await this.workoutRepository.updateSet(setId, updates)
      return set
    } catch (error) {
      console.error("Failed to update set:", error)
      return undefined
    }
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
