"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRoom } from "@/contexts/room-context"
import { useAuth } from "@/contexts/auth-context"
import { Brain, User, RotateCcw, Users, Crown, UserPlus } from "lucide-react"

type Player = "X" | "O" | null
type Board = Player[]
type GameStatus = "playing" | "won" | "draw" | "lost"

interface GameState {
  board: Board
  currentPlayer: Player
  status: GameStatus
  winner: Player
}

export function TicTacToeGame({ onGameEnd }: { onGameEnd: (result: "win" | "loss" | "draw") => void }) {
  const { user } = useAuth()
  const { gameMode, currentRoom, updateGameState } = useRoom()
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: "X",
    status: "playing",
    winner: null,
  })
  const [isThinking, setIsThinking] = useState(false)
  const [gameAnimation, setGameAnimation] = useState<"win" | "lose" | "draw" | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (gameMode === "multiplayer" && currentRoom) {
      setGameState({
        board: currentRoom.gameState.board as Board,
        currentPlayer: currentRoom.gameState.currentPlayer,
        status: currentRoom.gameState.gameOver
          ? currentRoom.gameState.winner
            ? getPlayerSymbol() === currentRoom.gameState.winner
              ? "won"
              : "lost"
            : "draw"
          : "playing",
        winner: currentRoom.gameState.winner as Player,
      })
    }
  }, [currentRoom, gameMode])

  const getPlayerSymbol = (): Player => {
    if (gameMode === "ai") return "X"
    if (!currentRoom || !user) return "X"
    return currentRoom.host === user.username ? "X" : "O"
  }

  const isMyTurn = (): boolean => {
    if (gameMode === "ai") return gameState.currentPlayer === "X"
    if (!currentRoom || !user) return false
    const mySymbol = getPlayerSymbol()
    return gameState.currentPlayer === mySymbol
  }

  // Check for winner
  const checkWinner = (board: Board): Player => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    return null
  }

  // Check if board is full
  const isBoardFull = (board: Board): boolean => {
    return board.every((cell) => cell !== null)
  }

  // AI move using minimax algorithm
  const getBestMove = (board: Board): number => {
    const availableMoves = board
      .map((cell, index) => (cell === null ? index : null))
      .filter((val) => val !== null) as number[]

    const testBoard = [...board]

    for (const move of availableMoves) {
      testBoard[move] = "O"
      if (checkWinner(testBoard) === "O") {
        return move
      }
      testBoard[move] = null
    }

    for (const move of availableMoves) {
      testBoard[move] = "X"
      if (checkWinner(testBoard) === "X") {
        testBoard[move] = null
        return move
      }
      testBoard[move] = null
    }

    if (availableMoves.includes(4)) {
      return 4
    }

    const corners = [0, 2, 6, 8]
    const availableCorners = corners.filter((corner) => availableMoves.includes(corner))
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)]
    }

    return availableMoves[Math.floor(Math.random() * availableMoves.length)]
  }

  const triggerGameAnimation = (result: "win" | "loss" | "draw") => {
    setGameAnimation(result)
    setTimeout(() => setGameAnimation(null), 1000)
  }

  // Handle player move
  const handleCellClick = (index: number) => {
    if (gameState.board[index] || gameState.status !== "playing" || isThinking) {
      return
    }

    if (gameMode === "multiplayer") {
      if (!isMyTurn()) {
        toast({
          title: "Not your turn",
          description: "Wait for the other player to make their move",
          variant: "destructive",
        })
        return
      }
      if (!currentRoom?.guest) {
        toast({
          title: "Waiting for opponent",
          description: "Need another player to join the room",
          variant: "destructive",
        })
        return
      }
    } else if (gameState.currentPlayer !== "X") {
      return
    }

    const currentPlayerSymbol = gameMode === "multiplayer" ? getPlayerSymbol() : "X"
    const newBoard = [...gameState.board]
    newBoard[index] = currentPlayerSymbol

    const winner = checkWinner(newBoard)
    const isDraw = !winner && isBoardFull(newBoard)
    const nextPlayer = currentPlayerSymbol === "X" ? "O" : "X"

    const newGameState = {
      board: newBoard,
      currentPlayer: winner || isDraw ? null : nextPlayer,
      status: winner ? (winner === getPlayerSymbol() ? "won" : "lost") : isDraw ? "draw" : "playing",
      winner,
    }

    setGameState(newGameState as GameState)

    if (gameMode === "multiplayer" && currentRoom) {
      updateGameState({
        board: newBoard,
        currentPlayer: nextPlayer,
        winner: winner,
        isDraw: isDraw,
        gameOver: !!(winner || isDraw),
      })
    }

    // Handle game end
    if (winner || isDraw) {
      const result = winner ? (winner === getPlayerSymbol() ? "win" : "loss") : "draw"
      triggerGameAnimation(result)
      onGameEnd(result)

      toast({
        title: winner ? (winner === getPlayerSymbol() ? "🎉 Congratulations!" : "💔 Game Over") : "🤝 It's a draw!",
        description: winner
          ? winner === getPlayerSymbol()
            ? "You won this round!"
            : `${winner === "X" ? "X" : "O"} wins this round!`
          : "Good game! Try again?",
        variant: winner && winner !== getPlayerSymbol() ? "destructive" : "default",
      })
    }
  }

  // AI move effect (only for AI mode)
  useEffect(() => {
    if (gameMode === "ai" && gameState.currentPlayer === "O" && gameState.status === "playing") {
      setIsThinking(true)
      const timer = setTimeout(() => {
        const aiMove = getBestMove(gameState.board)
        const newBoard = [...gameState.board]
        newBoard[aiMove] = "O"

        const winner = checkWinner(newBoard)
        if (winner) {
          setGameState({
            board: newBoard,
            currentPlayer: null,
            status: "lost",
            winner,
          })
          triggerGameAnimation("loss")
          onGameEnd("loss")
          toast({
            title: "💔 Game Over",
            description: "AI wins this round!",
            variant: "destructive",
          })
          setIsThinking(false)
          return
        }

        if (isBoardFull(newBoard)) {
          setGameState({
            board: newBoard,
            currentPlayer: null,
            status: "draw",
            winner: null,
          })
          triggerGameAnimation("draw")
          onGameEnd("draw")
          toast({
            title: "🤝 It's a draw!",
            description: "Good game! Try again?",
          })
          setIsThinking(false)
          return
        }

        setGameState({
          board: newBoard,
          currentPlayer: "X",
          status: "playing",
          winner: null,
        })
        setIsThinking(false)
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [gameState.currentPlayer, gameState.status, gameState.board, onGameEnd, toast, gameMode])

  // Reset game
  const resetGame = () => {
    const newGameState = {
      board: Array(9).fill(null),
      currentPlayer: "X",
      status: "playing",
      winner: null,
    }

    setGameState(newGameState as GameState)
    setIsThinking(false)
    setGameAnimation(null)

    if (gameMode === "multiplayer" && currentRoom) {
      updateGameState({
        board: Array(9).fill(null),
        currentPlayer: "X",
        winner: null,
        isDraw: false,
        gameOver: false,
      })
    }
  }

  const getStatusMessage = () => {
    if (gameMode === "multiplayer") {
      if (!currentRoom?.guest) {
        return "Waiting for opponent to join..."
      }
      if (gameState.status === "playing") {
        return isMyTurn() ? "Your turn" : "Opponent's turn"
      }
      if (gameState.status === "won") return "🎉 You won!"
      if (gameState.status === "lost") return "💔 Opponent wins this round"
      if (gameState.status === "draw") return "🤝 It's a draw!"
    } else {
      switch (gameState.status) {
        case "playing":
          return gameState.currentPlayer === "X" ? "Your turn" : "AI is thinking..."
        case "won":
          return "🎉 You won!"
        case "lost":
          return "💔 AI wins this round"
        case "draw":
          return "🤝 It's a draw!"
      }
    }
    return ""
  }

  const getStatusIcon = () => {
    if (gameMode === "multiplayer") {
      if (!currentRoom?.guest) {
        return <UserPlus className="h-4 w-4" />
      }
      if (gameState.status === "playing") {
        return isMyTurn() ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />
      }
    } else {
      if (gameState.status === "playing") {
        return gameState.currentPlayer === "X" ? (
          <User className="h-4 w-4" />
        ) : (
          <Brain className={`h-4 w-4 ${isThinking ? "animate-pulse" : ""}`} />
        )
      }
    }
    return null
  }

  const getGameTitle = () => {
    return gameMode === "multiplayer" ? "Multiplayer Tic Tac Toe" : "Tic Tac Toe vs AI"
  }

  const getPlayerInfo = () => {
    if (gameMode === "multiplayer" && currentRoom) {
      return (
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              <span>{currentRoom.host}: X</span>
              {currentRoom.host === user?.username && (
                <Badge variant="secondary" className="text-xs">
                  You
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>{currentRoom.guest || "Waiting..."}: O</span>
              {currentRoom.guest === user?.username && (
                <Badge variant="secondary" className="text-xs">
                  You
                </Badge>
              )}
            </div>
          </div>
          {currentRoom.guest && <p>Click on any empty cell to make your move</p>}
        </div>
      )
    } else {
      return (
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>You: X</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>AI: O</span>
            </div>
          </div>
          <p>Click on any empty cell to make your move</p>
        </div>
      )
    }
  }

  return (
    <Card
      className={`w-full max-w-md mx-auto animate-slide-up bg-white/95 border-gray-200 shadow-lg ${
        gameAnimation === "win"
          ? "animate-win"
          : gameAnimation === "lose"
            ? "animate-lose"
            : gameAnimation === "draw"
              ? "animate-draw"
              : ""
      }`}
    >
      <CardHeader>
        <CardTitle className="text-center font-serif text-gray-800">{getGameTitle()}</CardTitle>
        <div className="text-center">
          <Badge variant={gameState.status === "playing" ? "default" : "secondary"} className="gap-2">
            {getStatusIcon()}
            {getStatusMessage()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto p-4 rounded-lg border-4 border-gray-800 shadow-lg bg-slate-950">
          {gameState.board.map((cell, index) => (
            <Button
              key={index}
              variant="outline"
              className={`aspect-square text-3xl font-bold h-20 w-20 transition-all duration-200 hover:scale-105 bg-[#1a1a1a] border-4 border-gray-900 hover:bg-gray-600 shadow-md ${
                cell ? "animate-bounce-in" : ""
              } ${cell === "X" ? "text-blue-400 bg-[#1a1a1a] border-blue-400" : cell === "O" ? "text-purple-400 bg-[#1a1a1a] border-purple-400" : ""}`}
              onClick={() => handleCellClick(index)}
              disabled={
                cell !== null ||
                gameState.status !== "playing" ||
                (gameMode === "multiplayer" && (!isMyTurn() || !currentRoom?.guest)) ||
                (gameMode === "ai" && (gameState.currentPlayer !== "X" || isThinking))
              }
            >
              {cell}
            </Button>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={resetGame}
            variant="secondary"
            className="gap-2 transition-all hover:scale-105 bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
            New Game
          </Button>
        </div>

        {getPlayerInfo()}
      </CardContent>
    </Card>
  )
}
