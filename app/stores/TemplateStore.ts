import { makeAutoObservable } from 'mobx';
import {
  createRecord,
  deleteRecord,
  getRecords,
  updateRecord
} from "../services/pocketbase"
import { RootStore } from "./RootStore"

export type TemplateExercise = {
  id: string
  movementId: string
  sets: number
  repsPerSet?: number
  restTime?: number // Rest time in seconds
  notes?: string
}

export type WorkoutTemplate = {
  id: string
  name: string
  description?: string
  exercises: TemplateExercise[]
  created: Date
  lastUsed?: Date
}

export class TemplateStore {
  templates: WorkoutTemplate[] = []
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  async loadTemplates() {
    try {
      const records = await getRecords("templates")
      this.templates = records.map((record) => ({
        ...record,
        created: new Date(record.created),
        lastUsed: record.lastUsed ? new Date(record.lastUsed) : undefined
      }))
    } catch (error) {
      console.error("Failed to load templates:", error)
    }
  }

  async saveTemplate(template: WorkoutTemplate) {
    try {
      if (template.id) {
        await updateRecord("templates", template.id, template)
      } else {
        const newRecord = await createRecord("templates", template)
        template.id = newRecord.id
      }
    } catch (error) {
      console.error("Failed to save template:", error)
    }
  }

  async deleteTemplate(templateId: string) {
    try {
      await deleteRecord("templates", templateId)
      this.templates = this.templates.filter((t) => t.id !== templateId)
    } catch (error) {
      console.error("Failed to delete template:", error)
    }
  }

  // Create a new workout template
  createTemplate(name: string, description?: string): WorkoutTemplate {
    const newTemplate: WorkoutTemplate = {
      id: crypto.randomUUID(),
      name,
      description,
      exercises: [],
      created: new Date()
    }

    this.templates.push(newTemplate)
    this.saveTemplate(newTemplate)
    return newTemplate
  }

  // Add an exercise to a template
  addExerciseToTemplate(
    templateId: string,
    movementId: string,
    sets: number = 3,
    repsPerSet: number = 8,
    restTime: number = 60
  ): TemplateExercise | undefined {
    const template = this.templates.find((t) => t.id === templateId)
    if (!template) return

    const movement = this.rootStore.movementStore.getMovement(movementId)
    if (!movement) return

    const newExercise: TemplateExercise = {
      id: crypto.randomUUID(),
      movementId,
      sets,
      repsPerSet,
      restTime
    }

    template.exercises.push(newExercise)
    this.saveTemplate(template)
    return newExercise
  }

  // Remove an exercise from a template
  removeExerciseFromTemplate(templateId: string, exerciseId: string): boolean {
    const template = this.templates.find((t) => t.id === templateId)
    if (!template) return false

    const exerciseIndex = template.exercises.findIndex(
      (e) => e.id === exerciseId
    )
    if (exerciseIndex === -1) return false

    template.exercises.splice(exerciseIndex, 1)
    this.saveTemplate(template)
    return true
  }

  // Update a template exercise
  updateTemplateExercise(
    templateId: string,
    exerciseId: string,
    updates: Partial<TemplateExercise>
  ): TemplateExercise | undefined {
    const template = this.templates.find((t) => t.id === templateId)
    if (!template) return

    const exercise = template.exercises.find((e) => e.id === exerciseId)
    if (!exercise) return

    // Apply updates to the exercise
    Object.assign(exercise, updates)
    this.saveTemplate(template)
    return exercise
  }

  // Mark a template as used
  markTemplateAsUsed(templateId: string): void {
    const template = this.templates.find((t) => t.id === templateId)
    if (template) {
      template.lastUsed = new Date()
      this.saveTemplate(template)
    }
  }

  // Get a specific template
  getTemplate(id: string): WorkoutTemplate | undefined {
    return this.templates.find((t) => t.id === id)
  }

  // Get all templates
  getAllTemplates(): WorkoutTemplate[] {
    return [...this.templates]
  }

  // Get frequently used templates
  getFrequentTemplates(limit: number = 5): WorkoutTemplate[] {
    return [...this.templates]
      .filter((t) => t.lastUsed)
      .sort(
        (a, b) =>
          (b.lastUsed as Date).getTime() - (a.lastUsed as Date).getTime()
      )
      .slice(0, limit)
  }
}