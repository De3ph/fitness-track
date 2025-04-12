'use client';
import { useRouter } from "next/router";
import { isAuthenticated } from "../auth/auth"; // updated path from services/auth

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()

  if (!isAuthenticated()) {
    router.push("/login")
    return null
  }
  return <>{children}</>
}

export default ProtectedRoute
