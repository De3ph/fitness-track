import PocketBase from 'pocketbase';

// Create a single PocketBase instance for the entire app
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

export default pb;