"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useRoom } from "@/contexts/room-context"
import { TicTacToeGame } from "@/components/tic-tac-toe-game"
import { GameHistory } from "@/components/game-history"
import { Leaderboard } from "@/components/leaderboard"
import { RoomManager } from "@/components/room-manager"
import { Play, BarChart3, Trophy, ArrowLeft, Users, Brain } from "lucide-react"

interface GameRecord {
  id: string
  userId: string
  result: "win" | "loss" | "draw"
  timestamp: string
}

export function GameDashboard() {
  const { user, updateUserStats } = useAuth()
  const { gameMode, currentRoom } = useRoom()
  const [activeTab, setActiveTab] = useState<"play" | "stats" | "leaderboard">("play")
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameHistory, setGameHistory] = useState<GameRecord[]>([])
  const [recentStreak, setRecentStreak] = useState({ type: "", count: 0 })

  useEffect(() => {
    if (user) {
      const allHistory = JSON.parse(localStorage.getItem("gameHistory") || "[]")
      const userHistory = allHistory.filter((game: GameRecord) => game.userId === user.id)
      setGameHistory(userHistory)

      if (userHistory.length > 0) {
        const recent = userHistory.slice(-10).reverse()
        let streakCount = 0
        const streakType = recent[0]?.result || ""

        for (const game of recent) {
          if (game.result === streakType) {
            streakCount++
          } else {
            break
          }
        }

        setRecentStreak({ type: streakType, count: streakCount })
      }
    }
  }, [user])

  useEffect(() => {
    if (gameMode === "multiplayer" && currentRoom) {
      setIsPlaying(true)
    } else if (gameMode === "ai" && currentRoom === null) {
      // Reset to menu when switching back to AI mode
      setIsPlaying(false)
    }
  }, [gameMode, currentRoom])

  if (!user) return null

  const totalGames = user.wins + user.losses + user.draws
  const winRate = totalGames > 0 ? ((user.wins / totalGames) * 100).toFixed(1) : "0.0"
  const lossRate = totalGames > 0 ? ((user.losses / totalGames) * 100).toFixed(1) : "0.0"
  const drawRate = totalGames > 0 ? ((user.draws / totalGames) * 100).toFixed(1) : "0.0"
  const recentGames = gameHistory.slice(-5).reverse()

  const handleGameEnd = (result: "win" | "loss" | "draw") => {
    const newWins = result === "win" ? user.wins + 1 : user.wins
    const newLosses = result === "loss" ? user.losses + 1 : user.losses
    const newDraws = result === "draw" ? user.draws + 1 : user.draws

    updateUserStats(newWins, newLosses, newDraws)

    const gameHistory = JSON.parse(localStorage.getItem("gameHistory") || "[]")
    const newGame = {
      id: Date.now().toString(),
      userId: user.id,
      result,
      timestamp: new Date().toISOString(),
    }
    gameHistory.push(newGame)
    localStorage.setItem("gameHistory", JSON.stringify(gameHistory))

    setGameHistory((prev) => [...prev, newGame])
  }

  const getStreakText = () => {
    if (recentStreak.count === 0) return "No recent games"
    const typeText = recentStreak.type === "win" ? "wins" : recentStreak.type === "loss" ? "losses" : "draws"
    return `${recentStreak.count} ${typeText} in a row`
  }

  const getResultVariant = (result: string) => {
    switch (result) {
      case "win":
        return "default"
      case "loss":
        return "destructive"
      case "draw":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced navigation with icons and better styling */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-lg backdrop-blur-sm">
        <Button
          variant={activeTab === "play" ? "default" : "ghost"}
          onClick={() => setActiveTab("play")}
          className="gap-2 transition-all hover:scale-105"
        >
          <Play className="h-4 w-4" />
          Play Game
        </Button>
        <Button
          variant={activeTab === "stats" ? "default" : "ghost"}
          onClick={() => setActiveTab("stats")}
          className="gap-2 transition-all hover:scale-105"
        >
          <BarChart3 className="h-4 w-4" />
          My Stats
        </Button>
        <Button
          variant={activeTab === "leaderboard" ? "default" : "ghost"}
          onClick={() => setActiveTab("leaderboard")}
          className="gap-2 transition-all hover:scale-105"
        >
          <Trophy className="h-4 w-4" />
          Leaderboard
        </Button>
      </div>

      {activeTab === "play" && (
        <div className="space-y-6 animate-fade-in">
          {!isPlaying ? (
            <div className="space-y-6">
              <RoomManager />

              {gameMode === "ai" && (
                <Card className="backdrop-blur-sm bg-white/90 border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Challenge the AI
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-6">
                      <p className="text-muted-foreground">
                        Ready to challenge the AI? Test your skills and climb the leaderboard!
                      </p>
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all hover:scale-105 gap-2"
                        onClick={() => setIsPlaying(true)}
                      >
                        <Play className="h-5 w-5" />
                        Start Game vs AI
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-slide-up">
              {gameMode === "ai" && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setIsPlaying(false)}
                    className="gap-2 transition-all hover:scale-105"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Menu
                  </Button>
                </div>
              )}

              {gameMode === "multiplayer" && currentRoom && (
                <Card className="backdrop-blur-sm bg-white/90 border-white/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-medium">Playing in: {currentRoom.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {currentRoom.guest ? "Both players connected - game ready!" : "Waiting for opponent to join..."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <TicTacToeGame onGameEnd={handleGameEnd} />
            </div>
          )}
        </div>
      )}

      {activeTab === "stats" && (
        <div className="space-y-6 animate-fade-in">
          {/* Enhanced statistics cards with gradients and better visual hierarchy */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="backdrop-blur-sm bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Total Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{totalGames}</div>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-sm bg-gradient-to-br from-green-50 to-green-100 border-green-200/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Wins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">{user.wins}</div>
                <p className="text-xs text-green-600">{winRate}% win rate</p>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-sm bg-gradient-to-br from-red-50 to-red-100 border-red-200/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Losses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-900">{user.losses}</div>
                <p className="text-xs text-red-600">{lossRate}% loss rate</p>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-sm bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-700">Draws</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-900">{user.draws}</div>
                <p className="text-xs text-yellow-600">{drawRate}% draw rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm bg-white/90 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="font-serif">Current Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-4xl font-bold">{recentStreak.count}</div>
                  <Badge variant={getResultVariant(recentStreak.type)} className="text-sm px-4 py-1">
                    {getStreakText()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/90 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="font-serif">Recent Games</CardTitle>
              </CardHeader>
              <CardContent>
                {recentGames.length > 0 ? (
                  <div className="space-y-3">
                    {recentGames.map((game, index) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 border border-muted/50"
                      >
                        <span className="text-sm text-muted-foreground">Game #{gameHistory.length - index}</span>
                        <Badge variant={getResultVariant(game.result)} className="text-xs">
                          {game.result.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No games played yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          <GameHistory games={gameHistory} />
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div className="animate-fade-in">
          <Leaderboard />
        </div>
      )}
    </div>
  )
}
