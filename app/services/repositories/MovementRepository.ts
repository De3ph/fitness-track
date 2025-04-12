import { Movement, WeightRecord } from '../entites';
import { getPocketBase } from '../pocketbase';
import { BaseRepository } from './BaseRepository';

/**
 * Repository for Movement entities
 */
export class MovementRepository extends BaseRepository<Movement> {
  constructor() {
    super('movements');
  }
  
  /**
   * Get all weight records for a specific movement
   */
  async getWeightRecords(movementId: string): Promise<WeightRecord[]> {
    try {
      const records = await getPocketBase()
        .collection('weightrecords')
        .getFullList({ filter: `movementId="${movementId}"` });
      
      return records as unknown as WeightRecord[];
    } catch (error) {
      console.error(`Error fetching weight records for movement ${movementId}:`, error);
      throw error;
    }
  }
  
  /**
   * Add a weight record to a movement
   */
  async addWeightRecord(
    movementId: string, 
    weight: number,
    reps: number,
    sets: number,
    date = new Date(),
    workoutId?: string
  ): Promise<WeightRecord> {
    try {
      const recordData = {
        movementId,
        weight,
        date: date.toISOString(),
        reps,
        sets,
        workoutId
      };
      
      const record = await getPocketBase()
        .collection('weightrecords')
        .create(recordData);
      
      return record as unknown as WeightRecord;
    } catch (error) {
      console.error(`Error adding weight record to movement ${movementId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete all weight records for a movement
   * Useful when deleting a movement
   */
  async deleteAllWeightRecords(movementId: string): Promise<boolean> {
    try {
      const records = await this.getWeightRecords(movementId);
      
      // Delete each record
      await Promise.all(
        records.map(record => 
          getPocketBase().collection('weightrecords').delete(record.id)
        )
      );
      
      return true;
    } catch (error) {
      console.error(`Error deleting weight records for movement ${movementId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get movements filtered by category
   */
  async getByCategory(category: string): Promise<Movement[]> {
    return this.getAll(`category="${category}"`);
  }
  
  /**
   * Search for movements by name
   */
  async searchByName(query: string): Promise<Movement[]> {
    return this.getAll(`name~"${query}"`);
  }
}