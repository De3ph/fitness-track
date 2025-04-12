import { Template, TemplateExercise } from '../entites';
import { getPocketBase } from '../pocketbase';
import { BaseRepository } from './BaseRepository';

/**
 * Repository for Template entities
 */
export class TemplateRepository extends BaseRepository<Template> {
  constructor() {
    super('templates');
  }
  
  /**
   * Get a template with all its exercises
   */
  async getTemplateWithExercises(templateId: string): Promise<Template & { exercises: TemplateExercise[] }> {
    try {
      // Get the template
      const template = await this.getById(templateId);
      
      // Get all exercises for this template
      const exercises = await getPocketBase()
        .collection('template_exercises')
        .getFullList({ filter: `templateId="${templateId}"` }) as unknown as TemplateExercise[];
      
      return {
        ...template,
        exercises
      };
    } catch (error) {
      console.error(`Error fetching template with exercises for ID ${templateId}:`, error);
      throw error;
    }
  }
  
  /**
   * Add an exercise to a template
   */
  async addExerciseToTemplate(
    templateId: string,
    movementId: string,
    sets: number = 3,
    repsPerSet: number = 8,
    restTime: number = 60,
    notes: string = ""
  ): Promise<TemplateExercise> {
    try {
      const exerciseData = {
        templateId,
        movementId,
        sets,
        repsPerSet,
        restTime,
        notes
      };
      
      const exercise = await getPocketBase()
        .collection('template_exercises')
        .create(exerciseData);
      
      return exercise as unknown as TemplateExercise;
    } catch (error) {
      console.error(`Error adding exercise to template ${templateId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update a template exercise
   */
  async updateExercise(
    exerciseId: string, 
    data: Partial<Omit<TemplateExercise, 'id' | 'created' | 'updated'>>
  ): Promise<TemplateExercise> {
    try {
      const exercise = await getPocketBase()
        .collection('template_exercises')
        .update(exerciseId, data);
      
      return exercise as unknown as TemplateExercise;
    } catch (error) {
      console.error(`Error updating template exercise ${exerciseId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a template exercise
   */
  async removeExerciseFromTemplate(exerciseId: string): Promise<boolean> {
    try {
      await getPocketBase().collection('template_exercises').delete(exerciseId);
      return true;
    } catch (error) {
      console.error(`Error deleting template exercise ${exerciseId}:`, error);
      throw error;
    }
  }
  
  /**
   * Mark a template as used
   */
  async markTemplateAsUsed(templateId: string): Promise<Template> {
    return this.update(templateId, {
      lastUsed: new Date().toISOString()
    });
  }
  
  /**
   * Get frequently used templates
   */
  async getFrequentlyUsedTemplates(limit: number = 5): Promise<Template[]> {
    try {
      const templates = await getPocketBase()
        .collection('templates')
        .getFullList({ 
          filter: 'lastUsed != null',
          sort: '-lastUsed',
          limit
        });
      
      return templates as unknown as Template[];
    } catch (error) {
      console.error('Error fetching frequently used templates:', error);
      throw error;
    }
  }
  
  /**
   * Get recently created templates
   */
  async getRecentlyCreatedTemplates(limit: number = 5): Promise<Template[]> {
    try {
      const templates = await getPocketBase()
        .collection('templates')
        .getFullList({ 
          sort: '-created',
          limit
        });
      
      return templates as unknown as Template[];
    } catch (error) {
      console.error('Error fetching recently created templates:', error);
      throw error;
    }
  }
}