'use client';
import { useRouter } from "next/router";
import { useState } from "react";
import { login } from "../auth/auth"; // updated path from services/auth

const LoginForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      router.push("/") // Redirect to the main page after successful login
    } catch (error) {
      console.error("Login error:", error) // Handle login error
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
      <button type='submit'>Login</button>
    </form>
  )
}

export default LoginForm
