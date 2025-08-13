"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRoom } from "@/contexts/room-context"
import { useAuth } from "@/contexts/auth-context"
import { Plus, Users, Clock, Crown, UserPlus, RefreshCw, Hash, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function RoomManager() {
  const { user } = useAuth()
  const { currentRoom, availableRooms, gameMode, setGameMode, createRoom, joinRoom, leaveRoom, refreshRooms } =
    useRoom()
  const { toast } = useToast()
  const [roomName, setRoomName] = useState("")
  const [joinRoomId, setJoinRoomId] = useState("")
  const [activeTab, setActiveTab] = useState<"create" | "join">("create")
  const [copied, setCopied] = useState(false)

  const handleCreateRoom = () => {
    if (!roomName.trim()) {
      toast({
        title: "Room name required",
        description: "Please enter a name for your room",
        variant: "destructive",
      })
      return
    }

    const roomId = createRoom(roomName.trim())
    if (roomId) {
      toast({
        title: "Room created!",
        description: `Room "${roomName}" has been created successfully`,
      })
      setRoomName("")
    }
  }

  const handleJoinRoom = (roomId?: string) => {
    const targetRoomId = roomId || joinRoomId.trim()
    if (!targetRoomId) {
      toast({
        title: "Room ID required",
        description: "Please enter a room ID to join",
        variant: "destructive",
      })
      return
    }

    const success = joinRoom(targetRoomId)
    if (success) {
      toast({
        title: "Joined room!",
        description: "You have successfully joined the room",
      })
      setJoinRoomId("")
    } else {
      toast({
        title: "Failed to join",
        description: "Room is full, doesn't exist, or no longer available",
        variant: "destructive",
      })
    }
  }

  const handleLeaveRoom = () => {
    leaveRoom()
    toast({
      title: "Left room",
      description: "You have left the multiplayer room",
    })
  }

  const copyRoomId = async () => {
    if (currentRoom) {
      await navigator.clipboard.writeText(currentRoom.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "Room ID copied to clipboard",
      })
    }
  }

  if (currentRoom) {
    return (
      <Card className="backdrop-blur-sm bg-white/95 border-white/20 shadow-xl animate-slide-up">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-lg font-bold">{currentRoom.name}</span>
                <p className="text-sm text-muted-foreground font-normal">Multiplayer Room</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeaveRoom}
              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200 bg-transparent"
            >
              Leave Room
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Crown className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-primary">Host</span>
                  <p className="text-sm font-medium">{currentRoom.host}</p>
                </div>
              </div>
              {currentRoom.host === user?.username && (
                <Badge variant="default" className="animate-pulse-slow">
                  You
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary/30 to-secondary/50 rounded-xl border border-secondary/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/50 rounded-lg">
                  <UserPlus className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div>
                  <span className="font-semibold">Guest</span>
                  {currentRoom.guest ? (
                    <p className="text-sm font-medium">{currentRoom.guest}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground animate-pulse">Waiting for player...</p>
                  )}
                </div>
              </div>
              {currentRoom.guest === user?.username && (
                <Badge variant="secondary" className="animate-pulse-slow">
                  You
                </Badge>
              )}
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-xl border border-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Room ID:</span>
                <code className="bg-background/80 px-3 py-1 rounded-md text-sm font-mono border">{currentRoom.id}</code>
              </div>
              <Button variant="ghost" size="sm" onClick={copyRoomId} className="h-8 w-8 p-0 hover:bg-primary/10">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Share this ID with your friend to let them join</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-white/95 border-white/20 shadow-lg animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span>Game Mode</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 p-1 bg-muted/50 rounded-xl">
            <Button
              variant={gameMode === "ai" ? "default" : "ghost"}
              onClick={() => setGameMode("ai")}
              className={`transition-all duration-300 ${
                gameMode === "ai" ? "shadow-lg scale-105" : "hover:bg-background/80 hover:scale-102"
              }`}
            >
              🤖 vs AI
            </Button>
            <Button
              variant={gameMode === "multiplayer" ? "default" : "ghost"}
              onClick={() => setGameMode("multiplayer")}
              className={`transition-all duration-300 ${
                gameMode === "multiplayer" ? "shadow-lg scale-105" : "hover:bg-background/80 hover:scale-102"
              }`}
            >
              👥 Multiplayer
            </Button>
          </div>
        </CardContent>
      </Card>

      {gameMode === "multiplayer" && (
        <>
          <Card className="backdrop-blur-sm bg-white/95 border-white/20 shadow-xl animate-slide-up">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Room Management</CardTitle>
              </div>
              <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
                <Button
                  variant={activeTab === "create" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("create")}
                  className={`flex-1 transition-all duration-200 ${activeTab === "create" ? "shadow-md" : ""}`}
                >
                  Create Room
                </Button>
                <Button
                  variant={activeTab === "join" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("join")}
                  className={`flex-1 transition-all duration-200 ${activeTab === "join" ? "shadow-md" : ""}`}
                >
                  Join Room
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTab === "create" ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Room Name</label>
                    <Input
                      placeholder="Enter a fun room name..."
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                  <Button
                    onClick={handleCreateRoom}
                    className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    disabled={!roomName.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Room
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Room ID</label>
                    <Input
                      placeholder="Enter room ID to join..."
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                  <Button
                    onClick={() => handleJoinRoom()}
                    className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    disabled={!joinRoomId.trim()}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Room
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/95 border-white/20 shadow-lg animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span>Available Rooms</span>
                    <p className="text-sm text-muted-foreground font-normal">
                      {availableRooms.length} room{availableRooms.length !== 1 ? "s" : ""} available
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshRooms}
                  className="hover:scale-105 transition-all duration-200 bg-transparent"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableRooms.length === 0 ? (
                <div className="text-center py-12 animate-fade-in">
                  <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto mb-4">
                    <Users className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No rooms available</h3>
                  <p className="text-muted-foreground">Create a room to start playing with friends!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableRooms.map((room, index) => (
                    <div
                      key={room.id}
                      className="group p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-md animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{room.name}</span>
                            {room.host === user?.username && (
                              <Badge variant="secondary" className="animate-pulse-slow">
                                Your Room
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4 text-primary" />
                              <span className="font-medium">{room.host}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span className={room.guest ? "text-green-600" : "text-orange-600"}>
                                {room.guest ? "2/2" : "1/2"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{Math.floor((Date.now() - room.createdAt) / 60000)}m ago</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleJoinRoom(room.id)}
                          disabled={!!room.guest || room.host === user?.username}
                          className="ml-4 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          {room.guest ? "Full" : room.host === user?.username ? "Your Room" : "Join"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
