import { makeAutoObservable } from 'mobx';
import { MovementStore } from './MovementStore';
import { TemplateStore } from './TemplateStore';
import { WorkoutStore } from './WorkoutStore';

export class RootStore {
  workoutStore: WorkoutStore
  templateStore: TemplateStore
  movementStore: MovementStore

  constructor() {
    this.workoutStore = new WorkoutStore(this)
    this.templateStore = new TemplateStore(this)
    this.movementStore = new MovementStore(this)

    makeAutoObservable(this)
  }

  // Initialize all data from PocketBase
  async initializeStores() {
    try {
      // Load movements first since other stores depend on them
      await this.movementStore.loadMovements()

      // Load templates and workouts in parallel
      await Promise.all([
        this.templateStore.loadTemplates(),
        this.workoutStore.loadWorkouts()
      ])

      console.log("All stores initialized with PocketBase data")
    } catch (error) {
      console.error("Failed to initialize stores from PocketBase:", error)
    }
  }
}

// Create a singleton instance
export const rootStore = new RootStore();