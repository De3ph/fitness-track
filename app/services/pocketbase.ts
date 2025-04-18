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

    // Log auth store changes for debugging
    this.client.authStore.onChange(() => {
      console.log(
        "Auth state changed:",
        PocketBaseClient.isAuthenticated(this.client)
      )
    })
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
   * Initialize admin authentication
   */
  public static async initAdminAuth(client: PocketBase): Promise<boolean> {
    if (!client) {
      throw new Error("PocketBase client is not initialized")
    }

    if (
      !process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
      !process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    ) {
      console.error(
        "Missing admin credentials: NEXT_PUBLIC_ADMIN_EMAIL and NEXT_PUBLIC_ADMIN_PASSWORD must be set"
      )
      return false
    }

    try {
      if (
        this.isAuthenticated(client) &&
        client.authStore.record?.collectionName === "_superusers"
      )
        return true

      await client
        .collection("_superusers")
        .authWithPassword(
          process.env.NEXT_PUBLIC_ADMIN_EMAIL,
          process.env.NEXT_PUBLIC_ADMIN_PASSWORD
        )

      console.log("Admin authenticated successfully")
      return true
    } catch (error) {
      console.error("Admin authentication failed:", error)
      return false
    }
  }

  /**
   * Check if user is authenticated
   */
  public static isAuthenticated(client: PocketBase): boolean {
    return client.authStore.isValid
  }

  /**
   * Get the PocketBase client
   */
  public getClient(): PocketBase {
    return this.client
  }

  /**
   * Get current authenticated user (if any)
   */
  public getUser() {
    return this.client.authStore.record
  }
}

// Export the singleton instance getter
export const getPocketBase = () => PocketBaseClient.getInstance().getClient()

// Export the class for type purposes
export { PocketBaseClient }

// Export the default client for backward compatibility
export default PocketBaseClient.getInstance().getClient()

/**
 * Use a more relaxed type that allows primitive values
 */
export type RecordData = Record<string, unknown>
