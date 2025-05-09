import { makeAutoObservable } from 'mobx';
import {
  templateRepository,
  type TemplateRepository
} from "../services/repositories"
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
  templateRepository: TemplateRepository

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    this.templateRepository = templateRepository
    makeAutoObservable(this)
  }

  loadTemplates = async () => {
    try {
      // First get all templates
      const templateRecords = await this.templateRepository.getAll()

      // Create template objects with proper date conversion
      const templates = templateRecords.map((record) => ({
        id: record.id,
        name: record.name,
        description: record.description,
        created: new Date(record.created),
        lastUsed: record.lastUsed ? new Date(record.lastUsed) : undefined,
        exercises: [] as TemplateExercise[] // Explicitly type as TemplateExercise[]
      }))

      // For each template, load its exercises using repository
      for (const template of templates) {
        const templateDetails =
          await this.templateRepository.getTemplateWithExercises(template.id)

        const typedExercises: TemplateExercise[] =
          templateDetails.exercises.map((exercise) => ({
            id: exercise.id,
            movementId: exercise.movementId,
            sets: exercise.sets,
            repsPerSet: exercise.repsPerSet,
            restTime: exercise.restTime,
            notes: exercise.notes
          }))

        template.exercises = typedExercises
      }

      this.templates = templates
    } catch (error) {
      console.error("Failed to load templates:", error)
    }
  }

  saveTemplate = async (template: WorkoutTemplate) => {
    try {
      const templateData = {
        name: template.name,
        description: template.description,
        created: template.created.toISOString(),
        lastUsed: template.lastUsed
          ? template.lastUsed.toISOString()
          : undefined
      }

      if (template.id) {
        await this.templateRepository.update(template.id, templateData)
      } else {
        const newRecord = await this.templateRepository.create(templateData)
        template.id = newRecord.id
      }
    } catch (error) {
      console.error("Failed to save template:", error)
    }
  }

  deleteTemplate = async (templateId: string) => {
    try {
      await this.templateRepository.delete(templateId)
      this.templates = this.templates.filter((t) => t.id !== templateId)
    } catch (error) {
      console.error("Failed to delete template:", error)
    }
  }

  createTemplate = async (
    name: string,
    description?: string
  ): Promise<WorkoutTemplate> => {
    const newTemplate: WorkoutTemplate = {
      id: "", // PocketBase will generate the ID
      name,
      description,
      exercises: [],
      created: new Date()
    }

    try {
      const templateData = {
        name: newTemplate.name,
        description: newTemplate.description,
        created: newTemplate.created.toISOString()
      }

      const createdRecord = await this.templateRepository.create(templateData)
      const createdTemplate = {
        ...newTemplate,
        id: createdRecord.id
      }

      this.templates.push(createdTemplate)
      return createdTemplate
    } catch (error) {
      console.error("Failed to create template:", error)
      throw error
    }
  }

  addExerciseToTemplate = async (
    templateId: string,
    movementId: string,
    sets: number = 3,
    repsPerSet: number = 8,
    restTime: number = 60
  ): Promise<TemplateExercise | undefined> => {
    const template = this.templates.find((t) => t.id === templateId)
    if (!template) return

    const movement = this.rootStore.movementStore.getMovement(movementId)
    if (!movement) return

    try {
      const createdExercise =
        await this.templateRepository.addExerciseToTemplate(
          templateId,
          movementId,
          sets,
          repsPerSet,
          restTime,
          "" // Empty notes
        )

      const newExercise: TemplateExercise = {
        id: createdExercise.id,
        movementId,
        sets,
        repsPerSet,
        restTime
      }

      template.exercises.push(newExercise)
      return newExercise
    } catch (error) {
      console.error("Failed to add exercise to template:", error)
      return undefined
    }
  }

  removeExerciseFromTemplate = async (
    templateId: string,
    exerciseId: string
  ): Promise<boolean> => {
    const template = this.templates.find((t) => t.id === templateId)
    if (!template) return false

    const exerciseIndex = template.exercises.findIndex(
      (e) => e.id === exerciseId
    )
    if (exerciseIndex === -1) return false

    try {
      await this.templateRepository.removeExerciseFromTemplate(exerciseId)
      template.exercises.splice(exerciseIndex, 1)
      return true
    } catch (error) {
      console.error("Failed to remove exercise from template:", error)
      return false
    }
  }

  updateTemplateExercise = async (
    templateId: string,
    exerciseId: string,
    updates: Partial<TemplateExercise>
  ): Promise<TemplateExercise | undefined> => {
    const template = this.templates.find((t) => t.id === templateId)
    if (!template) return

    const exercise = template.exercises.find((e) => e.id === exerciseId)
    if (!exercise) return

    try {
      Object.assign(exercise, updates)
      await this.templateRepository.updateExercise(exerciseId, updates)
      return exercise
    } catch (error) {
      console.error("Failed to update template exercise:", error)
      return undefined
    }
  }

  markTemplateAsUsed = async (templateId: string): Promise<void> => {
    const template = this.templates.find((t) => t.id === templateId)
    if (!template) return

    try {
      const currentDate = new Date()
      template.lastUsed = currentDate
      await this.templateRepository.markTemplateAsUsed(templateId)
    } catch (error) {
      console.error("Failed to mark template as used:", error)
    }
  }

  getTemplate = (id: string): WorkoutTemplate | undefined => {
    return this.templates.find((t) => t.id === id)
  }

  getAllTemplates = (): WorkoutTemplate[] => {
    return [...this.templates]
  }

  getFrequentTemplates = (limit: number = 5): WorkoutTemplate[] => {
    return [...this.templates]
      .filter((t) => t.lastUsed)
      .sort(
        (a, b) =>
          (b.lastUsed as Date).getTime() - (a.lastUsed as Date).getTime()
      )
      .slice(0, limit)
  }
}