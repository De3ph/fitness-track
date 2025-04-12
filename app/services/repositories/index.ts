import { BaseRepository } from './BaseRepository';
import { MovementRepository } from './MovementRepository';
import { TemplateRepository } from './TemplateRepository';
import { WorkoutRepository } from './WorkoutRepository';

// Export all repositories
export {
    BaseRepository,
    MovementRepository, TemplateRepository, WorkoutRepository
};

// Export singleton instances for easy import
export const movementRepository = new MovementRepository();
export const workoutRepository = new WorkoutRepository();
export const templateRepository = new TemplateRepository();

// Create a factory function to get any repository by entity type
export function getRepository<T>(entityName: string): BaseRepository<T> {
  switch (entityName.toLowerCase()) {
    case 'movement':
    case 'movements':
      return movementRepository as unknown as BaseRepository<T>;
      
    case 'workout':
    case 'workouts':
      return workoutRepository as unknown as BaseRepository<T>;
      
    case 'template':
    case 'templates':
      return templateRepository as unknown as BaseRepository<T>;
      
    default:
      throw new Error(`Unknown entity type: ${entityName}`);
  }
}