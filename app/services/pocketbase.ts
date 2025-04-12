import PocketBase from 'pocketbase';

// Create a single PocketBase instance for the entire app
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

export async function createRecord(
  collection: string,
  data: Record<string, any>
) {
  try {
    return await pb.collection(collection).create(data)
  } catch (error) {
    console.error(`Error creating record in ${collection}:`, error)
    throw error
  }
}

export async function getRecords(collection: string, filter: string = "") {
  try {
    return await pb.collection(collection).getFullList({ filter })
  } catch (error) {
    console.error(`Error fetching records from ${collection}:`, error)
    throw error
  }
}

export async function updateRecord(
  collection: string,
  id: string,
  data: Record<string, any>
) {
  try {
    return await pb.collection(collection).update(id, data)
  } catch (error) {
    console.error(`Error updating record in ${collection}:`, error)
    throw error
  }
}

export async function deleteRecord(collection: string, id: string) {
  try {
    return await pb.collection(collection).delete(id)
  } catch (error) {
    console.error(`Error deleting record from ${collection}:`, error)
    throw error
  }
}

export default pb;