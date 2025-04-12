import { makeAutoObservable } from 'mobx';
import {
  createRecord,
  deleteRecord,
  getRecords,
  updateRecord
} from "../services/pocketbase"
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

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  async loadMovements() {
    try {
      const records = await getRecords("movements")
      this.movements = records.map((record) => ({
        ...record,
        created: new Date(record.created),
        records: record.records.map((r: any) => ({
          ...r,
          date: new Date(r.date)
        }))
      }))
    } catch (error) {
      console.error("Failed to load movements:", error)
    }
  }

  async saveMovement(movement: Movement) {
    try {
      if (movement.id) {
        await updateRecord("movements", movement.id, movement)
      } else {
        const newRecord = await createRecord("movements", movement)
        movement.id = newRecord.id
      }
    } catch (error) {
      console.error("Failed to save movement:", error)
    }
  }

  async deleteMovement(movementId: string) {
    try {
      await deleteRecord("movements", movementId)
      this.movements = this.movements.filter((m) => m.id !== movementId)
    } catch (error) {
      console.error("Failed to delete movement:", error)
    }
  }

  createMovement(
    name: string,
    description?: string,
    category?: string
  ): Movement {
    const newMovement: Movement = {
      id: crypto.randomUUID(),
      name,
      description,
      category,
      records: [],
      created: new Date()
    }

    this.movements.push(newMovement)
    this.saveMovement(newMovement)
    return newMovement
  }

  addWeightRecord(
    movementId: string,
    weight: number,
    reps: number,
    sets: number,
    workoutId?: string
  ) {
    const movement = this.movements.find((m) => m.id === movementId)
    if (!movement) return

    const record: WeightRecord = {
      id: crypto.randomUUID(),
      weight,
      date: new Date(),
      reps,
      sets,
      workoutId
    }

    movement.records.push(record)
    this.saveMovement(movement)
    return record
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