import { makeAutoObservable } from 'mobx';
import { MovementStore } from './MovementStore';
import { TemplateStore } from './TemplateStore';
import { WorkoutStore } from './WorkoutStore';

export class RootStore {
  workoutStore: WorkoutStore;
  templateStore: TemplateStore;
  movementStore: MovementStore;

  constructor() {
    this.workoutStore = new WorkoutStore(this);
    this.templateStore = new TemplateStore(this);
    this.movementStore = new MovementStore(this);
    
    makeAutoObservable(this);
  }
}

// Create a singleton instance
export const rootStore = new RootStore();