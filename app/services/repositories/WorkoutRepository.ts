import { Workout, WorkoutExercise, WorkoutSet } from '../entites';
import { getPocketBase } from '../pocketbase';
import { BaseRepository } from './BaseRepository';

/**
 * Repository for Workout entities
 */
export class WorkoutRepository extends BaseRepository<Workout> {
  constructor() {
    super('workouts');
  }
  
  /**
   * Get a workout with all its exercises and sets
   */
  async getWorkoutWithDetails(workoutId: string): Promise<Workout & { exercises: (WorkoutExercise & { sets: WorkoutSet[] })[] }> {
    try {
      // Get the workout
      const workout = await this.getById(workoutId);
      
      // Get all exercises for this workout
      const exercises = await getPocketBase()
        .collection('workout_exercises')
        .getFullList({ filter: `workoutId="${workoutId}"` }) as unknown as WorkoutExercise[];
      
      // Get all sets for each exercise
      const exercisesWithSets = await Promise.all(
        exercises.map(async (exercise) => {
          const sets = await getPocketBase()
            .collection('workout_sets')
            .getFullList({ filter: `exerciseId="${exercise.id}"` }) as unknown as WorkoutSet[];
          
          return {
            ...exercise,
            sets
          };
        })
      );
      
      return {
        ...workout,
        exercises: exercisesWithSets
      };
    } catch (error) {
      console.error(`Error fetching workout with details for ID ${workoutId}:`, error);
      throw error;
    }
  }
  
  /**
   * Add an exercise to a workout
   */
  async addExerciseToWorkout(
    workoutId: string, 
    movementId: string, 
    notes: string = ""
  ): Promise<WorkoutExercise> {
    try {
      const exerciseData = {
        workoutId,
        movementId,
        notes
      };
      
      const exercise = await getPocketBase()
        .collection('workout_exercises')
        .create(exerciseData);
      
      return exercise as unknown as WorkoutExercise;
    } catch (error) {
      console.error(`Error adding exercise to workout ${workoutId}:`, error);
      throw error;
    }
  }
  
  /**
   * Add a set to a workout exercise
   */
  async addSetToExercise(
    exerciseId: string,
    movementId: string,
    weight: number = 0,
    reps: number = 0,
    restTime: number = 60
  ): Promise<WorkoutSet> {
    try {
      const setData = {
        exerciseId,
        movementId,
        weight,
        reps,
        completed: false,
        restTime
      };
      
      const set = await getPocketBase()
        .collection('workout_sets')
        .create(setData);
      
      return set as unknown as WorkoutSet;
    } catch (error) {
      console.error(`Error adding set to exercise ${exerciseId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update a workout set
   */
  async updateSet(setId: string, data: Partial<Omit<WorkoutSet, 'id' | 'created' | 'updated'>>): Promise<WorkoutSet> {
    try {
      const set = await getPocketBase()
        .collection('workout_sets')
        .update(setId, data);
      
      return set as unknown as WorkoutSet;
    } catch (error) {
      console.error(`Error updating set ${setId}:`, error);
      throw error;
    }
  }
  
  /**
   * Mark a set as completed
   */
  async completeSet(setId: string): Promise<WorkoutSet> {
    return this.updateSet(setId, { completed: true });
  }
  
  /**
   * Complete a workout
   */
  async completeWorkout(workoutId: string): Promise<Workout> {
    return this.update(workoutId, {
      completed: true,
      endTime: new Date().toISOString()
    });
  }
  
  /**
   * Delete an exercise and all its sets
   */
  async deleteExercise(exerciseId: string): Promise<boolean> {
    try {
      // Get all sets for this exercise
      const sets = await getPocketBase()
        .collection('workout_sets')
        .getFullList({ filter: `exerciseId="${exerciseId}"` });
      
      // Delete all sets
      await Promise.all(sets.map(set => 
        getPocketBase().collection('workout_sets').delete(set.id)
      ));
      
      // Delete the exercise
      await getPocketBase().collection('workout_exercises').delete(exerciseId);
      
      return true;
    } catch (error) {
      console.error(`Error deleting exercise ${exerciseId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all workouts with pagination, sorted by start time (most recent first)
   */
  async getWorkouts(page: number = 1, limit: number = 10): Promise<{items: Workout[], totalItems: number, totalPages: number}> {
    return this.getList(page, limit, 'sort=-startTime');
  }
  
  /**
   * Get completed workouts
   */
  async getCompletedWorkouts(): Promise<Workout[]> {
    return this.getAll('completed=true');
  }
  
  /**
   * Get active workout (incomplete)
   */
  async getActiveWorkout(): Promise<Workout | null> {
    const activeWorkouts = await this.getAll('completed=false');
    return activeWorkouts.length > 0 ? activeWorkouts[0] : null;
  }
}