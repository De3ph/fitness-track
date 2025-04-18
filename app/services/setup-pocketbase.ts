/**
 * PocketBase Collection Setup Script
 *
 * This script creates all the necessary collections for the fitness tracking app.
 * Run it once to initialize your PocketBase database structure.
 */

import { getPocketBase, PocketBaseClient } from "./pocketbase"

const pb = getPocketBase()

// Check if a collection exists
async function collectionExists(name: string): Promise<boolean> {
  try {
    await pb.collections.getOne(name)
    return true
  } catch (error) {
    console.log("🚀 ~ collectionExists ~ error:", error)
    return false
  }
}

// Admin login is required for creating collections
async function setupCollections() {
  try {
    // You need to provide your admin email/password to create collections
    // Remember to update these values with your actual admin credentials
    PocketBaseClient.initAdminAuth(pb)

    // Check if we already have collections
    const hasTemplateExercisesCollection = await collectionExists("template_exercises")

    // If movements collection exists, we assume all other collections exist too
    if (hasTemplateExercisesCollection) {
      console.log("Collections already exist, skipping creation.")
      return
    }

    console.log("Collections do not exist. Setting up collections...")

    // 1. Create movements collection
    const movementCollection = await createMovementsCollection()
    if (!movementCollection) {
      throw new Error("Failed to create movements collection")
    }

    const templatesCollection = await createTemplatesCollection()
    if (!templatesCollection) {
      throw new Error("Failed to create templates collection")
    }

    const workoutsCollection = await createWorkoutsCollection()
    if (!workoutsCollection) {
      throw new Error("Failed to create workouts collection")
    }

    const weightRecordsCollection = await createWeightRecordsCollection(movementCollection.id)
    if (!weightRecordsCollection) {
      throw new Error("Failed to create weightrecords collection")
    }

    const workoutExerciseCollection = await createWorkoutExercisesCollection(
      workoutsCollection.id,
      movementCollection.id
    )
    if (!workoutExerciseCollection) {
      throw new Error("Failed to create workout_exercises collection")
    }

    await createWorkoutSetsCollection(
      workoutExerciseCollection.id,
      movementCollection.id
    )

    await createTemplateExercisesCollection(
      templatesCollection.id,
      movementCollection.id
    )

    console.log("All collections have been successfully created!")
  } catch (error) {
    console.error("Failed to set up collections:", error)
  }
}

// Create movements collection
async function createMovementsCollection() {
  try {
    return await pb.collections.create({
      name: "movements",
      type: "base",
      fields: [
        {
          name: "name",
          type: "text",
          required: true
        },
        {
          name: "description",
          type: "text",
          required: false
        },
        {
          name: "category",
          type: "text",
          required: false
        },
        {
          name: "created",
          type: "date",
          required: true
        }
      ]
    })
  } catch (error) {
    console.error("Error creating movements collection:", error)
  }
}

// Create weightrecords collection
async function createWeightRecordsCollection(movementCollectionId: string) {
  try {
    return await pb.collections.create({
      name: "weightrecords",
      type: "base",
      fields: [
        {
          name: "movementId",
          type: "relation",
          required: true,
          collectionId: movementCollectionId,
          cascadeDelete: true
        },
        {
          name: "weight",
          type: "number",
          required: true
        },
        {
          name: "date",
          type: "date",
          required: true
        },
        {
          name: "reps",
          type: "number",
          required: true
        },
        {
          name: "sets",
          type: "number",
          required: true
        },
        {
          name: "workoutId",
          type: "text",
          required: false
        }
      ]
    })
  } catch (error) {
    console.error("Error creating weightrecords collection:", error)
  }
}

// Create workouts collection
async function createWorkoutsCollection() {
  try {
    return await pb.collections.create({
      name: "workouts",
      type: "base",
      fields: [
        {
          name: "name",
          type: "text",
          required: true
        },
        {
          name: "startTime",
          type: "date",
          required: true
        },
        {
          name: "endTime",
          type: "date",
          required: false
        },
        {
          name: "completed",
          type: "bool",
          required: false
        },
        {
          name: "notes",
          type: "text",
          required: false
        }
      ]
    })
  } catch (error) {
    console.error("Error creating workouts collection:", error)
  }
}

// Create workout_exercises collection
async function createWorkoutExercisesCollection(
  workoutCollectionId: string,
  movementCollectionId: string
) {
  try {
    return await pb.collections.create({
      name: "workout_exercises",
      type: "base",
      fields: [
        {
          name: "workoutId",
          type: "relation",
          required: true,
          collectionId: workoutCollectionId,
          cascadeDelete: true
        },
        {
          name: "movementId",
          type: "relation",
          required: true,
          collectionId: movementCollectionId,
          cascadeDelete: true
        },
        {
          name: "notes",
          type: "text",
          required: false
        }
      ]
    })
  } catch (error) {
    console.error("Error creating workout_exercises collection:", error)
  }
}

// Create workout_sets collection
async function createWorkoutSetsCollection(
  workoutExercisesCollectionId: string,
  movementCollectionId: string
) {
  try {
    await pb.collections.create({
      name: "workout_sets",
      type: "base",
      fields: [
        {
          name: "exerciseId",
          type: "relation",
          required: true,
          collectionId: workoutExercisesCollectionId,
          cascadeDelete: true
        },
        {
          name: "movementId",
          type: "relation",
          required: true,
          collectionId: movementCollectionId,
          cascadeDelete: false
        },
        {
          name: "weight",
          type: "number",
          required: true
        },
        {
          name: "reps",
          type: "number",
          required: true
        },
        {
          name: "completed",
          type: "bool",
          required: true
        },
        {
          name: "restTime",
          type: "number",
          required: false
        }
      ]
    })
    console.log("Created workout_sets collection")
  } catch (error) {
    console.error("Error creating workout_sets collection:", error)
  }
}

// Create templates collection
async function createTemplatesCollection() {
  try {
    return await pb.collections.create({
      name: "templates",
      type: "base",
      fields: [
        {
          name: "name",
          type: "text",
          required: true
        },
        {
          name: "description",
          type: "text",
          required: false
        },
        {
          name: "created",
          type: "date",
          required: true
        },
        {
          name: "lastUsed",
          type: "date",
          required: false
        }
      ]
    })
  } catch (error) {
    console.error("Error creating templates collection:", error)
  }
}

// Create template_exercises collection
async function createTemplateExercisesCollection(
  templatesCollectionId: string,
  movementsCollectionId: string
) {
  try {
    await pb.collections.create({
      name: "template_exercises",
      type: "base",
      fields: [
        {
          name: "templateId",
          type: "relation",
          required: true,
          collectionId: templatesCollectionId,
          cascadeDelete: true
        },
        {
          name: "movementId",
          type: "relation",
          required: true,
          collectionId: movementsCollectionId,
          cascadeDelete: false
        },
        {
          name: "sets",
          type: "number",
          required: true
        },
        {
          name: "repsPerSet",
          type: "number",
          required: false
        },
        {
          name: "restTime",
          type: "number",
          required: false
        },
        {
          name: "notes",
          type: "text",
          required: false
        }
      ]
    })
    console.log("Created template_exercises collection")
  } catch (error) {
    console.error("Error creating template_exercises collection:", error)
  }
}

// Execute the setup
// if (require.main === module) {
//   setupCollections()
//     .then(() => console.log("Setup complete"))
//     .catch((error) => console.error("Setup failed:", error))
// }

export { setupCollections }

