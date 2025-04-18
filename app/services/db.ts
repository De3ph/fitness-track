import { getPocketBase, PocketBaseClient } from "./pocketbase"
import {
  movementRepository,
  templateRepository,
  workoutRepository
} from "./repositories"

/**
 * Database service for fitness-track application
 * Centralizes database operations and initialization
 */
export class Database {
  private static instance: Database

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the Database singleton instance
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }

    return Database.instance
  }

  /**
   * Initialize PocketBase collections and data
   */
  public async initialize(): Promise<void> {
    try {
      // First check if PocketBase is accessible
      const isHealthy = await this.healthCheck()
      if (!isHealthy) {
        console.error("PocketBase server is not accessible")
        throw new Error("PocketBase server is not accessible")
      }

      // Setup collections (will only create if they don't exist)
      await this.setupCollections()

      // Seed initial data if needed
      await this.seedData()

      console.log("Database initialized successfully")
    } catch (error) {
      console.error("Failed to initialize database:", error)
      throw error
    }
  }

  /**
   * Ensure all collections are created in PocketBase
   * Should be called with admin credentials
   */
  public async setupCollections(): Promise<void> {
    try {
      const { setupCollections } = await import("./setup-pocketbase")
      const pb = getPocketBase()

      // Authenticate as admin - needed to create collections
      const isAuthenticated = await PocketBaseClient.initAdminAuth(pb)

      if (!isAuthenticated) {
        console.error("Admin authentication failed, cannot set up collections")
        return
      }

      // Set up collections using the collection setup logic from setup-pocketbase
      await setupCollections()
    } catch (error) {
      console.error("Failed to set up collections:", error)
    }
  }

  /**
   * Load initial seed data into PocketBase
   */
  public async seedData(): Promise<void> {
    try {
      // Check if data already exists
      const movements = await movementRepository.getAll()

      // If no movements, add some sample data
      if (movements.length === 0) {
        console.log("Seeding initial movement data...")

        await movementRepository.create({
          name: "Bench Press",
          category: "Chest",
          description: "Classic chest press exercise"
        })

        await movementRepository.create({
          name: "Squat",
          category: "Legs",
          description: "Fundamental lower body exercise"
        })

        await movementRepository.create({
          name: "Deadlift",
          category: "Back",
          description: "Compound exercise for posterior chain"
        })

        console.log("Initial movements seeded")
      }
    } catch (error) {
      console.error("Failed to seed initial data:", error)
    }
  }

  /**
   * Check if PocketBase is accessible
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const pb = getPocketBase()
      const healthInfo = await pb.health.check()
      return healthInfo.code === 200
    } catch (error) {
      console.error("PocketBase health check failed:", error)
      return false
    }
  }
}

// Export a singleton instance
export const db = Database.getInstance()

// Export repositories for direct access
export { movementRepository, templateRepository, workoutRepository }

// Export getRepository function
export { getRepository } from "./repositories"
