"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface GameRecord {
  id: string
  userId: string
  result: "win" | "loss" | "draw"
  timestamp: string
}

interface GameHistoryProps {
  games: GameRecord[]
}

export function GameHistory({ games }: GameHistoryProps) {
  const [showAll, setShowAll] = useState(false)

  const displayGames = showAll ? games : games.slice(-10)
  const reversedGames = [...displayGames].reverse() // Show most recent first

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

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (games.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No games played yet. Start your first game!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Game History</CardTitle>
        {games.length > 10 && (
          <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show Recent" : `Show All (${games.length})`}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reversedGames.map((game, index) => (
            <div key={game.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium">
                  Game #{games.length - (showAll ? index : Math.max(0, games.length - 10) + index)}
                </div>
                <Badge variant={getResultVariant(game.result)} className="text-xs">
                  {game.result.toUpperCase()}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">{formatDate(game.timestamp)}</div>
            </div>
          ))}
        </div>

        {games.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Total Wins</div>
                <div className="text-lg font-semibold text-green-600">
                  {games.filter((g) => g.result === "win").length}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Losses</div>
                <div className="text-lg font-semibold text-red-600">
                  {games.filter((g) => g.result === "loss").length}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Draws</div>
                <div className="text-lg font-semibold text-yellow-600">
                  {games.filter((g) => g.result === "draw").length}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
