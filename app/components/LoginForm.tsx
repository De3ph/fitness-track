'use client';
import { Button } from "@/app/components/ui/button"
import { useRouter } from "next/router"
import { useState } from "react"
import { login } from "../auth/auth" // updated path from services/auth

const LoginForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      router.push("/") // Redirect to the main page after successful login
    } catch (error) {
      console.error("Login error:", error) // Handle login error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='Email'
      />
      <input
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder='Password'
      />
      <Button type='submit' isLoading={isLoading}>
        Login
      </Button>
    </form>
  )
}

export default LoginForm
