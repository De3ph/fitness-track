import PocketBase from "pocketbase"

/**
 * PocketBaseClient - Singleton implementation of PocketBase client
 */
class PocketBaseClient {
  private static instance: PocketBaseClient
  private client: PocketBase

  private constructor() {
    this.client = new PocketBase(
      process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090"
    )
  }

  /**
   * Get the PocketBase singleton instance
   */
  public static getInstance(): PocketBaseClient {
    if (!PocketBaseClient.instance) {
      PocketBaseClient.instance = new PocketBaseClient()
    }

    return PocketBaseClient.instance
  }

  /**
   * Get the PocketBase client
   */
  public getClient(): PocketBase {
    return this.client
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.client.authStore.isValid
  }

  /**
   * Get current authenticated user (if any)
   */
  public getUser() {
    return this.client.authStore.model
  }
}

// Export the singleton instance getter
export const getPocketBase = () => PocketBaseClient.getInstance().getClient()

// Export the singleton instance directly
export const pocketbase = PocketBaseClient.getInstance()

// Export the class for type purposes
export { PocketBaseClient }

// Export the default client for backward compatibility
export default PocketBaseClient.getInstance().getClient()

/**
 * Use a more relaxed type that allows primitive values
 */
export type RecordData = Record<string, unknown>
