import { BaseEntity } from "../entites";
import type { RecordData } from "../pocketbase";
import { getPocketBase } from "../pocketbase";

/**
 * Base repository class that provides common CRUD operations for all entities
 */
export class BaseRepository<T extends BaseEntity> {
  protected collectionName: string;
  
  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }
  
  /**
   * Get all records with optional filtering
   */
  async getAll(filter: string = ""): Promise<T[]> {
    try {
      const records = await getPocketBase()
        .collection(this.collectionName)
        .getFullList({ filter });
      
      return records as unknown as T[];
    } catch (error) {
      console.error(`Error fetching ${this.collectionName}:`, error);
      throw error;
    }
  }
  
  /**
   * Get a single record by ID
   */
  async getById(id: string): Promise<T> {
    try {
      const record = await getPocketBase()
        .collection(this.collectionName)
        .getOne(id);
      
      return record as unknown as T;
    } catch (error) {
      console.error(`Error fetching ${this.collectionName} with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new record
   */
  async create(data: Omit<T, 'id' | 'created' | 'updated'>): Promise<T> {
    try {
      const record = await getPocketBase()
        .collection(this.collectionName)
        .create(data as RecordData);
      
      return record as unknown as T;
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }
  
  /**
   * Update an existing record
   */
  async update(id: string, data: Partial<Omit<T, 'id' | 'created' | 'updated'>>): Promise<T> {
    try {
      const record = await getPocketBase()
        .collection(this.collectionName)
        .update(id, data as RecordData);
      
      return record as unknown as T;
    } catch (error) {
      console.error(`Error updating ${this.collectionName} with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      await getPocketBase()
        .collection(this.collectionName)
        .delete(id);
      
      return true;
    } catch (error) {
      console.error(`Error deleting ${this.collectionName} with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get records with pagination support
   */
  async getList(page: number = 1, limit: number = 20, filter: string = ""): Promise<{items: T[], totalItems: number, totalPages: number}> {
    try {
      const response = await getPocketBase()
        .collection(this.collectionName)
        .getList(page, limit, { filter });
      
      return {
        items: response.items as unknown as T[],
        totalItems: response.totalItems,
        totalPages: response.totalPages
      };
    } catch (error) {
      console.error(`Error fetching paginated ${this.collectionName}:`, error);
      throw error;
    }
  }
}