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
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password)
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