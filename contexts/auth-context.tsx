"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  username: string
  wins: number
  losses: number
  draws: number
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, password: string) => Promise<boolean>
  logout: () => void
  updateUserStats: (wins: number, losses: number, draws: number) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = () => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const savedUser = localStorage.getItem("currentUser")
          console.log("Loading saved user:", savedUser) // Added debugging
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser)
            setUser(parsedUser)
            console.log("User loaded:", parsedUser) // Added debugging
          }
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error)
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.removeItem("currentUser")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadUser() // Removed timeout to load immediately
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        throw new Error("localStorage not available")
      }

      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const foundUser = users.find((u: any) => u.username === username && u.password === password)

      if (foundUser) {
        const userWithoutPassword = { ...foundUser }
        delete userWithoutPassword.password

        console.log("Login successful, setting user:", userWithoutPassword) // Added debugging
        setUser(userWithoutPassword)
        localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))

        await new Promise((resolve) => setTimeout(resolve, 100))
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        throw new Error("localStorage not available")
      }

      const users = JSON.parse(localStorage.getItem("users") || "[]")

      // Check if username already exists
      if (users.find((u: any) => u.username === username)) {
        return false
      }

      const newUser = {
        id: Date.now().toString(),
        username,
        password,
        wins: 0,
        losses: 0,
        draws: 0,
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      const userWithoutPassword = { ...newUser }
      delete userWithoutPassword.password

      console.log("Registration successful, setting user:", userWithoutPassword) // Added debugging
      setUser(userWithoutPassword)
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))

      await new Promise((resolve) => setTimeout(resolve, 100))
      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = () => {
    try {
      console.log("Logging out user") // Added debugging
      setUser(null)
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem("currentUser")
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const updateUserStats = (wins: number, losses: number, draws: number) => {
    if (!user) return

    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return
      }

      const updatedUser = { ...user, wins, losses, draws }
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))

      // Update in users array
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === user.id)
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], wins, losses, draws }
        localStorage.setItem("users", JSON.stringify(users))
      }
    } catch (error) {
      console.error("Update stats error:", error)
    }
  }

  console.log("AuthProvider render - user:", user, "isLoading:", isLoading)

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUserStats, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
