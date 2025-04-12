import PocketBase from "pocketbase"

const pb = new PocketBase(
  process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090"
)

async function createCollections() {
  const existingCollections = await pb.collections.getFullList()

  // Check and create Users Collection
  if (!existingCollections.some((col) => col.name === "users")) {
    await pb.collections.create({
      name: "users",
      schema: [
        { name: "email", type: "text" },
        { name: "username", type: "text" },
        { name: "created", type: "date" },
        { name: "updated", type: "date" }
      ]
    })
  }

  // Check and create Exercises Collection
  if (!existingCollections.some((col) => col.name === "exercises")) {
    await pb.collections.create({
      name: "exercises",
      schema: [
        { name: "name", type: "text" },
        { name: "description", type: "text" },
        { name: "created", type: "date" },
        { name: "updated", type: "date" }
      ]
    })
  }

  // Check and create Workouts Collection
  if (!existingCollections.some((col) => col.name === "workouts")) {
    await pb.collections.create({
      name: "workouts",
      schema: [
        { name: "name", type: "text" },
        {
          name: "exercises",
          type: "array",
          items: { type: "relation", relation: "exercises" }
        },
        { name: "created", type: "date" },
        { name: "updated", type: "date" }
      ]
    })
  }

  // Check and create Progress Collection
  if (!existingCollections.some((col) => col.name === "progress")) {
    await pb.collections.create({
      name: "progress",
      schema: [
        { name: "userId", type: "relation", relation: "users" },
        { name: "workoutId", type: "relation", relation: "workouts" },
        { name: "date", type: "date" },
        { name: "notes", type: "text" },
        { name: "created", type: "date" },
        { name: "updated", type: "date" }
      ]
    })
  }

  console.log("Collections checked and created if necessary!")
}

const initDb = async () => {
  await createCollections()
}

initDb()
