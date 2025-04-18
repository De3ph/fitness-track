import pb from "../services/pocketbase"

export const register = async (
  email: string,
  password: string,
  username: string
) => {
  try {
    const userData = {
      email,
      password,
      passwordConfirm: password,
      username
    }
    const record = await pb.collection("users").create(userData)
    return record
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

export const login = async (email: string, password: string) => {
  try {
    // Use the non-deprecated form of authWithPassword
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password)

    console.log("Authentication successful")
    return authData
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export const logout = () => {
  pb.authStore.clear()
}

export const getCurrentUser = () => {
  return pb.authStore.model
}

export const isAuthenticated = () => {
  return pb.authStore.isValid
}

/**
 * Check authentication status and debug info
 */
export const checkAuthStatus = () => {
  const status = {
    isValid: pb.authStore.isValid,
    token: pb.authStore.token ? "Present" : "Missing",
    user: pb.authStore.model
      ? {
          id: pb.authStore.model.id,
          email: pb.authStore.model.email,
          collection:
            pb.authStore.model.collectionName || pb.authStore.model.collectionId
        }
      : null
  }

  console.log("Auth status:", status)
  return status
}