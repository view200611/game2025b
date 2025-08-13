"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface LeaderboardUser {
  id: string
  username: string
  wins: number
  losses: number
  draws: number
  totalGames: number
  winRate: number
  score: number
}

type SortBy = "score" | "wins" | "winRate" | "totalGames"

export function Leaderboard() {
  const { user } = useAuth()
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([])
  const [sortBy, setSortBy] = useState<SortBy>("score")
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    // Load all users and calculate leaderboard
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    const leaderboardUsers: LeaderboardUser[] = users
      .map((u: any) => {
        const totalGames = u.wins + u.losses + u.draws
        const winRate = totalGames > 0 ? (u.wins / totalGames) * 100 : 0

        const score = u.wins * 3 + u.draws * 1

        return {
          id: u.id,
          username: u.username,
          wins: u.wins || 0,
          losses: u.losses || 0,
          draws: u.draws || 0,
          totalGames,
          winRate,
          score: Math.max(0, score),
        }
      })
      .filter((u: LeaderboardUser) => u.totalGames > 0) // Only show users who have played games

    setLeaderboardData(leaderboardUsers)
  }, [])

  // Sort leaderboard based on selected criteria
  const sortedLeaderboard = [...leaderboardData].sort((a, b) => {
    switch (sortBy) {
      case "score":
        if (b.score !== a.score) return b.score - a.score
        return b.winRate - a.winRate // Tiebreaker: win rate
      case "wins":
        if (b.wins !== a.wins) return b.wins - a.wins
        return b.winRate - a.winRate
      case "winRate":
        if (b.winRate !== a.winRate) return b.winRate - a.winRate
        return b.totalGames - a.totalGames // Tiebreaker: more games played
      case "totalGames":
        if (b.totalGames !== a.totalGames) return b.totalGames - a.totalGames
        return b.winRate - a.winRate
      default:
        return 0
    }
  })

  // Find current user's rank
  useEffect(() => {
    if (user && sortedLeaderboard.length > 0) {
      const rank = sortedLeaderboard.findIndex((u) => u.id === user.id)
      setUserRank(rank >= 0 ? rank + 1 : null)
    }
  }, [user, sortedLeaderboard])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default"
      case 2:
        return "secondary"
      case 3:
        return "outline"
      default:
        return "outline"
    }
  }

  const getSortButtonVariant = (sortType: SortBy) => {
    return sortBy === sortType ? "default" : "outline"
  }

  if (leaderboardData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🏆 Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <p className="text-lg font-medium">No players yet!</p>
              <p className="text-sm text-muted-foreground">Be the first to play some games and claim the top spot.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* User's current rank */}
      {user && userRank && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.username} (You)</p>
                  <p className="text-sm text-muted-foreground">Your current rank</p>
                </div>
              </div>
              <Badge variant={getRankBadgeVariant(userRank)} className="text-lg px-3 py-1">
                #{userRank}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sorting controls */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 Leaderboard</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={getSortButtonVariant("score")} onClick={() => setSortBy("score")}>
              By Score
            </Button>
            <Button size="sm" variant={getSortButtonVariant("wins")} onClick={() => setSortBy("wins")}>
              By Wins
            </Button>
            <Button size="sm" variant={getSortButtonVariant("winRate")} onClick={() => setSortBy("winRate")}>
              By Win Rate
            </Button>
            <Button size="sm" variant={getSortButtonVariant("totalGames")} onClick={() => setSortBy("totalGames")}>
              By Games Played
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedLeaderboard.map((player, index) => {
              const rank = index + 1
              const isCurrentUser = user?.id === player.id

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:scale-102 ${
                    isCurrentUser ? "border-blue-200 bg-blue-50" : "bg-card hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8">{getRankIcon(rank)}</div>
                    <Avatar>
                      <AvatarFallback>{player.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {player.username}
                        {isCurrentUser && <span className="text-sm text-muted-foreground ml-2">(You)</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">{player.totalGames} games played</p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Score: {player.score}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-green-600 font-medium">{player.wins}W</span>
                      <span className="text-red-600 font-medium">{player.losses}L</span>
                      <span className="text-yellow-600 font-medium">{player.draws}D</span>
                      <span className="text-muted-foreground">({player.winRate.toFixed(1)}%)</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Scoring:</strong> Win = 3 points • Draw = 1 point • Loss = 0 points
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
