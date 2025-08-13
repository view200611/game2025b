"use client"

import { useState } from "react"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { RoomProvider } from "@/contexts/room-context"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { GameDashboard } from "@/components/game-dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gamepad2, Trophy, Users, TrendingUp } from "lucide-react"

function AuthenticatedApp() {
  const { user, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForms />
  }

  return (
    <RoomProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Gamepad2 className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold font-serif bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Tic Tac Toe Arena
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Welcome, {user.username}!</span>
                </div>
                <Button variant="outline" onClick={logout} className="transition-all hover:scale-105 bg-transparent">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fade-in">
            <GameDashboard />
          </div>
        </main>
      </div>
    </RoomProvider>
  )
}

function AuthForms() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <Card className="backdrop-blur-sm bg-white/90 border-white/20 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full animate-bounce-in">
                  <Gamepad2 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold font-serif bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                Tic Tac Toe Arena
              </h1>
              <p className="text-muted-foreground">Challenge the AI and climb the leaderboard!</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="p-3 rounded-lg bg-primary/5">
                <Trophy className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Leaderboard</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/5">
                <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Track Stats</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/5">
                <Gamepad2 className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Smart AI</p>
              </div>
            </div>

            <div className="animate-fade-in">{isLogin ? <LoginForm /> : <RegisterForm />}</div>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm transition-all hover:scale-105"
              >
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  )
}
