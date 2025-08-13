"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"

export type GameMode = "ai" | "multiplayer"

export interface Room {
  id: string
  name: string
  host: string
  guest?: string
  gameState: {
    board: (string | null)[]
    currentPlayer: "X" | "O"
    winner: string | null
    isDraw: boolean
    gameOver: boolean
  }
  createdAt: number
  isActive: boolean
}

interface RoomContextType {
  currentRoom: Room | null
  availableRooms: Room[]
  gameMode: GameMode
  setGameMode: (mode: GameMode) => void
  createRoom: (roomName: string) => string
  joinRoom: (roomId: string) => boolean
  leaveRoom: () => void
  updateGameState: (gameState: Room["gameState"]) => void
  refreshRooms: () => void
}

const RoomContext = createContext<RoomContextType | undefined>(undefined)

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [gameMode, setGameMode] = useState<GameMode>("ai")

  const refreshRooms = () => {
    const rooms = JSON.parse(localStorage.getItem("ttt_rooms") || "[]") as Room[]
    // Filter out old inactive rooms (older than 1 hour)
    const activeRooms = rooms.filter((room) => room.isActive && Date.now() - room.createdAt < 3600000)
    setAvailableRooms(activeRooms)
    localStorage.setItem("ttt_rooms", JSON.stringify(activeRooms))
  }

  const createRoom = (roomName: string): string => {
    if (!user) return ""

    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newRoom: Room = {
      id: roomId,
      name: roomName,
      host: user.username,
      gameState: {
        board: Array(9).fill(null),
        currentPlayer: "X",
        winner: null,
        isDraw: false,
        gameOver: false,
      },
      createdAt: Date.now(),
      isActive: true,
    }

    const rooms = JSON.parse(localStorage.getItem("ttt_rooms") || "[]") as Room[]
    rooms.push(newRoom)
    localStorage.setItem("ttt_rooms", JSON.stringify(rooms))

    setCurrentRoom(newRoom)
    setGameMode("multiplayer")
    refreshRooms()

    return roomId
  }

  const joinRoom = (roomId: string): boolean => {
    if (!user) return false

    const rooms = JSON.parse(localStorage.getItem("ttt_rooms") || "[]") as Room[]
    const roomIndex = rooms.findIndex((room) => room.id === roomId)

    if (roomIndex === -1 || rooms[roomIndex].guest) return false

    rooms[roomIndex].guest = user.username
    localStorage.setItem("ttt_rooms", JSON.stringify(rooms))

    setCurrentRoom(rooms[roomIndex])
    setGameMode("multiplayer")
    refreshRooms()

    return true
  }

  const leaveRoom = () => {
    if (!currentRoom || !user) return

    const rooms = JSON.parse(localStorage.getItem("ttt_rooms") || "[]") as Room[]
    const roomIndex = rooms.findIndex((room) => room.id === currentRoom.id)

    if (roomIndex !== -1) {
      if (rooms[roomIndex].host === user.username) {
        // Host leaving - deactivate room
        rooms[roomIndex].isActive = false
      } else {
        // Guest leaving - remove guest
        rooms[roomIndex].guest = undefined
      }
      localStorage.setItem("ttt_rooms", JSON.stringify(rooms))
    }

    setCurrentRoom(null)
    setGameMode("ai")
    refreshRooms()
  }

  const updateGameState = (gameState: Room["gameState"]) => {
    if (!currentRoom) return

    const rooms = JSON.parse(localStorage.getItem("ttt_rooms") || "[]") as Room[]
    const roomIndex = rooms.findIndex((room) => room.id === currentRoom.id)

    if (roomIndex !== -1) {
      rooms[roomIndex].gameState = gameState
      localStorage.setItem("ttt_rooms", JSON.stringify(rooms))
      setCurrentRoom(rooms[roomIndex])
    }
  }

  useEffect(() => {
    refreshRooms()
    // Refresh rooms every 5 seconds to get updates from other players
    const interval = setInterval(refreshRooms, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Update current room state from localStorage
    if (currentRoom) {
      const rooms = JSON.parse(localStorage.getItem("ttt_rooms") || "[]") as Room[]
      const updatedRoom = rooms.find((room) => room.id === currentRoom.id)
      if (updatedRoom && updatedRoom.isActive) {
        setCurrentRoom(updatedRoom)
      } else {
        setCurrentRoom(null)
        setGameMode("ai")
      }
    }
  }, [availableRooms])

  return (
    <RoomContext.Provider
      value={{
        currentRoom,
        availableRooms,
        gameMode,
        setGameMode,
        createRoom,
        joinRoom,
        leaveRoom,
        updateGameState,
        refreshRooms,
      }}
    >
      {children}
    </RoomContext.Provider>
  )
}

export function useRoom() {
  const context = useContext(RoomContext)
  if (context === undefined) {
    throw new Error("useRoom must be used within a RoomProvider")
  }
  return context
}
