import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';

export type Movement = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  records: WeightRecord[];
  created: Date;
};

export type WeightRecord = {
  id: string;
  weight: number; // in kg/lbs based on user preference
  date: Date;
  reps: number;
  sets: number;
  workoutId?: string; // reference to the workout where this weight was recorded
};

export class MovementStore {
  movements: Movement[] = [];
  rootStore: RootStore;
  
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  createMovement(name: string, description?: string, category?: string): Movement {
    const newMovement: Movement = {
      id: crypto.randomUUID(),
      name,
      description,
      category,
      records: [],
      created: new Date()
    };

    this.movements.push(newMovement);
    return newMovement;
  }

  addWeightRecord(movementId: string, weight: number, reps: number, sets: number, workoutId?: string) {
    const movement = this.movements.find(m => m.id === movementId);
    if (!movement) return;

    const record: WeightRecord = {
      id: crypto.randomUUID(),
      weight,
      date: new Date(),
      reps,
      sets,
      workoutId
    };

    movement.records.push(record);
    return record;
  }

  getMovementHistory(movementId: string): WeightRecord[] {
    const movement = this.movements.find(m => m.id === movementId);
    if (!movement) return [];
    
    return [...movement.records].sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  getMovement(id: string): Movement | undefined {
    return this.movements.find(m => m.id === id);
  }

  getAllMovements(): Movement[] {
    return this.movements;
  }
}