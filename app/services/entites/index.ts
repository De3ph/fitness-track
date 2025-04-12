// Base entity interface all entities inherit from
export interface BaseEntity {
  id: string
  created: string
  updated: string
}

// User entity
export interface User extends BaseEntity {
  email: string
  username: string
}

// Movement entity
export interface Movement extends BaseEntity {
  name: string
  description?: string
  category?: string
}

// WeightRecord entity
export interface WeightRecord extends BaseEntity {
  movementId: string
  weight: number
  date: string
  reps: number
  sets: number
  workoutId?: string
}

// Workout entity
export interface Workout extends BaseEntity {
  name: string
  startTime: string
  endTime?: string
  completed: boolean
  notes?: string
}

// WorkoutExercise entity
export interface WorkoutExercise extends BaseEntity {
  workoutId: string
  movementId: string
  notes?: string
}

// WorkoutSet entity
export interface WorkoutSet extends BaseEntity {
  exerciseId: string
  movementId: string
  weight: number
  reps: number
  completed: boolean
  restTime?: number
}

// Template entity
export interface Template extends BaseEntity {
  name: string
  description?: string
  lastUsed?: string
}

// TemplateExercise entity
export interface TemplateExercise extends BaseEntity {
  templateId: string
  movementId: string
  sets: number
  repsPerSet?: number
  restTime?: number
  notes?: string
}
