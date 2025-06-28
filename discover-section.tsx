"use client"

import { useState, useEffect } from "react"
import { Heart, MessageSquare, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getDiscoverUsers, createMatch, checkForMutualMatch } from "@/lib/db"
import type { Profile } from "@/types/chat"

interface DiscoverSectionProps {
  currentUserId: string
}

export function DiscoverSection({ currentUserId }: DiscoverSectionProps) {
  const [users, setUsers] = useState<Profile[]>([])
  const [likedUsers, setLikedUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [currentUserId])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const discoverUsers = await getDiscoverUsers(currentUserId, 10)
      setUsers(discoverUsers)
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (userId: string) => {
    if (likedUsers.includes(userId)) {
      // Unlike
      setLikedUsers(likedUsers.filter((id) => id !== userId))
      toast({
        title: "Removed like",
        description: "You've removed your like.",
      })
      return
    }

    try {
      // Create match
      const { success } = await createMatch(currentUserId, userId)

      if (success) {
        setLikedUsers([...likedUsers, userId])

        // Check for mutual match
        const { success: checkSuccess, isMatch, chatId } = await checkForMutualMatch(currentUserId, userId)

        if (checkSuccess && isMatch) {
          toast({
            title: "It's a match! 🎉",
            description: "You can now start chatting!",
          })

          // Remove the user from discover list since they're now a match
          setUsers(users.filter((user) => user.id !== userId))
        } else {
          toast({
            title: "Like sent!",
            description: "Your like has been sent.",
          })
        }
      }
    } catch (error) {
      console.error("Error creating match:", error)
      toast({
        title: "Error",
        description: "Failed to send like. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-200" />
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded mb-4" />
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded flex-1" />
                <div className="h-8 bg-gray-200 rounded flex-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No more users to discover</h3>
        <p className="text-muted-foreground mb-4">
          You've seen all available users in your area. Check back later for new profiles!
        </p>
        <Button onClick={loadUsers}>Refresh</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <Card key={user.id} className="overflow-hidden transition-all duration-200 hover:shadow-lg">
          <div className="aspect-video relative bg-gradient-to-r from-blue-100 to-purple-100">
            <Avatar className="w-full h-full rounded-none">
              <AvatarImage
                src={user.avatar_url || "/placeholder.svg?height=200&width=400"}
                alt={`${user.first_name} ${user.last_name}`}
                className="object-cover"
              />
              <AvatarFallback className="w-full h-full rounded-none text-4xl">
                {getUserInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              className={`absolute bottom-2 right-2 rounded-full ${
                likedUsers.includes(user.id) ? "bg-red-500 text-white hover:bg-red-600" : "bg-white/80 hover:bg-white"
              }`}
              onClick={() => handleLike(user.id)}
            >
              <Heart className={`h-4 w-4 ${likedUsers.includes(user.id) ? "fill-current" : ""}`} />
            </Button>
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">{`${user.first_name} ${user.last_name}`}</h3>
              <Badge variant="outline">
                {calculateAge(user.birth_date) ? `${calculateAge(user.birth_date)}` : "Age N/A"}
                {user.location && ` • ${user.location}`}
              </Badge>
            </div>
            {user.bio && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{user.bio}</p>}
            {user.interests && user.interests.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {user.interests.slice(0, 3).map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {user.interests.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{user.interests.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button size="sm" className="flex-1">
                <Video className="h-4 w-4 mr-2" />
                Video Call
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
