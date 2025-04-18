import { makeAutoObservable } from 'mobx';
import { MovementStore } from './MovementStore';
import { TemplateStore } from './TemplateStore';
import { WorkoutStore } from './WorkoutStore';

export class RootStore {
  workoutStore: WorkoutStore
  templateStore: TemplateStore
  movementStore: MovementStore
  initialized: boolean = false

  constructor() {
    this.workoutStore = new WorkoutStore(this)
    this.templateStore = new TemplateStore(this)
    this.movementStore = new MovementStore(this)
    this.initializeStores() // Initialize stores immediately

    makeAutoObservable(this)
  }

  // Initialize all data from PocketBase
  private initializeStores = async () => {
    try {
      // Initialize the database first (ensures collections exist)
      const { db } = await import("../services/db")
      await db.initialize()

      // Load movements first since other stores depend on them
      await this.movementStore.loadMovements()

      // Load templates and workouts in parallel
      await Promise.all([
        this.templateStore.loadTemplates(),
        this.workoutStore.loadWorkouts()
      ])

      this.initialized = true
      return true
      console.log("All stores initialized with PocketBase data")
    } catch (error) {
      console.error("Failed to initialize stores from PocketBase:", error)
      return false
    }
  }
}

// Create a singleton instance
export const rootStore = new RootStore();