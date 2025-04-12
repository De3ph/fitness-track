import { makeAutoObservable } from 'mobx';
import {
  movementRepository,
  type MovementRepository
} from "../services/repositories"
import { RootStore } from "./RootStore"

export type Movement = {
  id: string
  name: string
  description?: string
  category?: string
  records: WeightRecord[]
  created: Date
}

export type WeightRecord = {
  id: string
  weight: number // in kg/lbs based on user preference
  date: Date
  reps: number
  sets: number
  workoutId?: string // reference to the workout where this weight was recorded
}

export class MovementStore {
  movements: Movement[] = []
  rootStore: RootStore
  movementRepository: MovementRepository

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    this.movementRepository = movementRepository
    makeAutoObservable(this)
  }

  async loadMovements() {
    try {
      // First get all movements
      const movementRecords = await this.movementRepository.getAll()

      // Create movement objects with proper date conversion
      const movements = movementRecords.map((record) => ({
        id: record.id,
        name: record.name,
        description: record.description,
        category: record.category,
        created: new Date(record.created),
        records: [] as WeightRecord[] // Explicitly type as WeightRecord[]
      }))

      // For each movement, load its weight records
      for (const movement of movements) {
        const weightRecords = await this.movementRepository.getWeightRecords(
          movement.id
        )

        const typedRecords: WeightRecord[] = weightRecords.map((record) => ({
          id: record.id,
          weight: record.weight,
          date: new Date(record.date),
          reps: record.reps,
          sets: record.sets,
          workoutId: record.workoutId
        }))

        movement.records = typedRecords
      }

      this.movements = movements
    } catch (error) {
      console.error("Failed to load movements:", error)
    }
  }

  async saveMovement(movement: Movement) {
    try {
      const data = {
        name: movement.name,
        description: movement.description,
        category: movement.category,
        created: movement.created.toISOString()
      }

      if (movement.id) {
        await this.movementRepository.update(movement.id, data)
      } else {
        const newRecord = await this.movementRepository.create(data)
        movement.id = newRecord.id
      }
    } catch (error) {
      console.error("Failed to save movement:", error)
    }
  }

  async deleteMovement(movementId: string) {
    try {
      await this.movementRepository.delete(movementId)
      this.movements = this.movements.filter((m) => m.id !== movementId)
    } catch (error) {
      console.error("Failed to delete movement:", error)
    }
  }

  async createMovement(
    name: string,
    description?: string,
    category?: string
  ): Promise<Movement> {
    const newMovement: Movement = {
      id: "", // PocketBase will generate the ID
      name,
      description,
      category,
      records: [],
      created: new Date()
    }

    try {
      const data = {
        name: newMovement.name,
        description: newMovement.description,
        category: newMovement.category,
        created: newMovement.created.toISOString()
      }

      const createdRecord = await this.movementRepository.create(data)
      const createdMovement = {
        ...newMovement,
        id: createdRecord.id
      }
      this.movements.push(createdMovement)
      return createdMovement
    } catch (error) {
      console.error("Failed to create movement:", error)
      throw error
    }
  }

  async addWeightRecord(
    movementId: string,
    weight: number,
    reps: number,
    sets: number,
    workoutId?: string
  ) {
    const movement = this.movements.find((m) => m.id === movementId)
    if (!movement) return

    const record: WeightRecord = {
      id: "", // PocketBase will generate the ID
      weight,
      date: new Date(),
      reps,
      sets,
      workoutId
    }

    try {
      const createdRecord = await this.movementRepository.addWeightRecord(
        movement.id,
        record.weight,
        record.reps,
        record.sets,
        record.date,
        record.workoutId
      )

      // Add to local state with the generated ID
      const newRecord = {
        ...record,
        id: createdRecord.id
      }

      movement.records.push(newRecord)
      return newRecord
    } catch (error) {
      console.error("Failed to add weight record:", error)
      throw error
    }
  }

  getMovementHistory(movementId: string): WeightRecord[] {
    const movement = this.movements.find((m) => m.id === movementId)
    if (!movement) return []

    return [...movement.records].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    )
  }

  getMovement(id: string): Movement | undefined {
    return this.movements.find((m) => m.id === id)
  }

  getAllMovements(): Movement[] {
    return this.movements
  }
}