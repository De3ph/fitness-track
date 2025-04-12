import { getPocketBase } from "./pocketbase"
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
      // Sample initialization - in production you'd authenticate as admin
      // and check if collections exist before creating them
      console.log("Database initialized with PocketBase")
    } catch (error) {
      console.error("Failed to initialize database:", error)
      throw error
    }
  }

  /**
   * Ensure all collections are created in PocketBase
   * Should be called with admin credentials
   */
  public async setupCollections(
    adminEmail: string,
    adminPassword: string
  ): Promise<void> {
    try {
      const pb = getPocketBase()

      // Authenticate as admin - needed to create collections
      await pb.admins.authWithPassword(adminEmail, adminPassword)
      console.log("Admin authenticated")

      // Set up collections using the collection setup logic from setup-pocketbase
      const { setupCollections } = await import("./setup-pocketbase")
      await setupCollections()

      console.log("All collections set up successfully")
    } catch (error) {
      console.error("Failed to set up collections:", error)
      throw error
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
