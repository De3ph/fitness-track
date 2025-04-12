/**
 * PocketBase Collection Setup Script
 * 
 * This script creates all the necessary collections for the fitness tracking app.
 * Run it once to initialize your PocketBase database structure.
 */

import PocketBase from 'pocketbase';

// Initialize PocketBase
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

// Admin login is required for creating collections
async function setupCollections() {
  try {
    // You need to provide your admin email/password to create collections
    // Remember to update these values with your actual admin credentials
    await pb.admins.authWithPassword('your-admin-email@example.com', 'your-admin-password');
    
    console.log('Admin authenticated. Setting up collections...');
    
    // 1. Create movements collection
    await createMovementsCollection();
    
    // 2. Create weight records collection
    await createWeightRecordsCollection();
    
    // 3. Create workouts collection
    await createWorkoutsCollection();
    
    // 4. Create workout_exercises collection
    await createWorkoutExercisesCollection();
    
    // 5. Create workout_sets collection
    await createWorkoutSetsCollection();
    
    // 6. Create templates collection
    await createTemplatesCollection();
    
    // 7. Create template_exercises collection
    await createTemplateExercisesCollection();
    
    console.log('All collections have been successfully created!');
    
  } catch (error) {
    console.error('Failed to set up collections:', error);
  }
}

// Create movements collection
async function createMovementsCollection() {
  try {
    await pb.collections.create({
      name: 'movements',
      type: 'base',
      schema: [
        {
          name: 'name',
          type: 'text',
          required: true
        },
        {
          name: 'description',
          type: 'text',
          required: false
        },
        {
          name: 'category',
          type: 'text',
          required: false
        },
        {
          name: 'created',
          type: 'date',
          required: true
        }
      ]
    });
    console.log('Created movements collection');
  } catch (error) {
    console.error('Error creating movements collection:', error);
  }
}

// Create weightrecords collection
async function createWeightRecordsCollection() {
  try {
    await pb.collections.create({
      name: 'weightrecords',
      type: 'base',
      schema: [
        {
          name: 'movementId',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'movements',
            cascadeDelete: true
          }
        },
        {
          name: 'weight',
          type: 'number',
          required: true
        },
        {
          name: 'date',
          type: 'date',
          required: true
        },
        {
          name: 'reps',
          type: 'number',
          required: true
        },
        {
          name: 'sets',
          type: 'number',
          required: true
        },
        {
          name: 'workoutId',
          type: 'text',
          required: false
        }
      ]
    });
    console.log('Created weightrecords collection');
  } catch (error) {
    console.error('Error creating weightrecords collection:', error);
  }
}

// Create workouts collection
async function createWorkoutsCollection() {
  try {
    await pb.collections.create({
      name: 'workouts',
      type: 'base',
      schema: [
        {
          name: 'name',
          type: 'text',
          required: true
        },
        {
          name: 'startTime',
          type: 'date',
          required: true
        },
        {
          name: 'endTime',
          type: 'date',
          required: false
        },
        {
          name: 'completed',
          type: 'bool',
          required: true
        },
        {
          name: 'notes',
          type: 'text',
          required: false
        }
      ]
    });
    console.log('Created workouts collection');
  } catch (error) {
    console.error('Error creating workouts collection:', error);
  }
}

// Create workout_exercises collection
async function createWorkoutExercisesCollection() {
  try {
    await pb.collections.create({
      name: 'workout_exercises',
      type: 'base',
      schema: [
        {
          name: 'workoutId',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'workouts',
            cascadeDelete: true
          }
        },
        {
          name: 'movementId',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'movements',
            cascadeDelete: false
          }
        },
        {
          name: 'notes',
          type: 'text',
          required: false
        }
      ]
    });
    console.log('Created workout_exercises collection');
  } catch (error) {
    console.error('Error creating workout_exercises collection:', error);
  }
}

// Create workout_sets collection
async function createWorkoutSetsCollection() {
  try {
    await pb.collections.create({
      name: 'workout_sets',
      type: 'base',
      schema: [
        {
          name: 'exerciseId',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'workout_exercises',
            cascadeDelete: true
          }
        },
        {
          name: 'movementId',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'movements',
            cascadeDelete: false
          }
        },
        {
          name: 'weight',
          type: 'number',
          required: true
        },
        {
          name: 'reps',
          type: 'number',
          required: true
        },
        {
          name: 'completed',
          type: 'bool',
          required: true
        },
        {
          name: 'restTime',
          type: 'number',
          required: false
        }
      ]
    });
    console.log('Created workout_sets collection');
  } catch (error) {
    console.error('Error creating workout_sets collection:', error);
  }
}

// Create templates collection
async function createTemplatesCollection() {
  try {
    await pb.collections.create({
      name: 'templates',
      type: 'base',
      schema: [
        {
          name: 'name',
          type: 'text',
          required: true
        },
        {
          name: 'description',
          type: 'text',
          required: false
        },
        {
          name: 'created',
          type: 'date',
          required: true
        },
        {
          name: 'lastUsed',
          type: 'date',
          required: false
        }
      ]
    });
    console.log('Created templates collection');
  } catch (error) {
    console.error('Error creating templates collection:', error);
  }
}

// Create template_exercises collection
async function createTemplateExercisesCollection() {
  try {
    await pb.collections.create({
      name: 'template_exercises',
      type: 'base',
      schema: [
        {
          name: 'templateId',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'templates',
            cascadeDelete: true
          }
        },
        {
          name: 'movementId',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'movements',
            cascadeDelete: false
          }
        },
        {
          name: 'sets',
          type: 'number',
          required: true
        },
        {
          name: 'repsPerSet',
          type: 'number',
          required: false
        },
        {
          name: 'restTime',
          type: 'number',
          required: false
        },
        {
          name: 'notes',
          type: 'text',
          required: false
        }
      ]
    });
    console.log('Created template_exercises collection');
  } catch (error) {
    console.error('Error creating template_exercises collection:', error);
  }
}

// Execute the setup
if (require.main === module) {
  setupCollections()
    .then(() => console.log('Setup complete'))
    .catch((error) => console.error('Setup failed:', error));
}

export { setupCollections };
