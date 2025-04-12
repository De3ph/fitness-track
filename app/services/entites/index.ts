export interface User {
  id: string
  email: string
  username: string
  created: string
  updated: string
}

export interface Exercise {
  id: string
  name: string
  description: string
  created: string
  updated: string
}

export interface Workout {
  id: string
  name: string
  exercises: string[] // Array of Exercise IDs
  created: string
  updated: string
}

export interface Progress {
  id: string
  userId: string // User ID
  workoutId: string // Workout ID
  date: string
  notes: string
  created: string
  updated: string
}
