"use client"

import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import Peer from "simple-peer"

interface VideoCallInterfaceProps {
  chatId: string
  currentUserId: string
  otherUser: {
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
  }
  isOpen: boolean
  onClose: () => void
}

export function VideoCallInterface({ chatId, currentUserId, otherUser, isOpen, onClose }: VideoCallInterfaceProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isCallConnected, setIsCallConnected] = useState(false)
  const [isCallPending, setIsCallPending] = useState(true)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerRef = useRef<Peer.Instance | null>(null)

  const { toast } = useToast()
  const channelName = `videocall:${chatId}`

  useEffect(() => {
    if (isOpen) {
      startCall()
    }

    return () => {
      stopCall()
    }
  }, [isOpen])

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  const startCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      setLocalStream(stream)

      // Initialize signaling with Supabase Realtime
      initializeSignaling()

      // Notify the other user about the incoming call
      sendSignalMessage({
        type: "call-request",
        from: currentUserId,
        to: otherUser.id,
      })

      // Set a timeout for call acceptance
      setTimeout(() => {
        if (isCallPending) {
          toast({
            title: "No answer",
            description: `${otherUser.first_name} is not available right now.`,
            variant: "destructive",
          })
          onClose()
        }
      }, 30000) // 30 seconds timeout
    } catch (error) {
      console.error("Error getting user media:", error)
      toast({
        title: "Camera access denied",
        description: "Please allow camera and microphone access to make video calls.",
        variant: "destructive",
      })
      onClose()
    }
  }

  const initializeSignaling = () => {
    const channel = supabase.channel(channelName)

    channel
      .on("broadcast", { event: "signal" }, (payload) => {
        handleSignalMessage(payload.payload)
      })
      .subscribe()
  }

  const handleSignalMessage = (message: any) => {
    // Ignore messages sent by the current user
    if (message.from === currentUserId) return

    switch (message.type) {
      case "call-request":
        // Auto-accept the call for demo purposes
        sendSignalMessage({
          type: "call-accepted",
          from: currentUserId,
          to: message.from,
        })

        if (localStream) {
          initiateWebRTCConnection(false) // false because we're answering
        }
        break

      case "call-accepted":
        toast({
          title: "Call connected",
          description: `${otherUser.first_name} joined the call.`,
        })

        setIsCallPending(false)
        setIsCallConnected(true)

        if (localStream) {
          initiateWebRTCConnection(true) // true because we're initiating
        }
        break

      case "ice-candidate":
        if (peerRef.current) {
          peerRef.current.signal(message.candidate)
        }
        break

      case "sdp-offer":
        if (peerRef.current) {
          peerRef.current.signal(message.sdp)
        }
        break

      case "sdp-answer":
        if (peerRef.current) {
          peerRef.current.signal(message.sdp)
        }
        break

      case "call-ended":
        toast({
          title: "Call ended",
          description: `${otherUser.first_name} ended the call.`,
        })
        onClose()
        break

      default:
        console.log("Unknown signal type:", message.type)
    }
  }

  const sendSignalMessage = (message: any) => {
    supabase.channel(channelName).send({
      type: "broadcast",
      event: "signal",
      payload: message,
    })
  }

  const initiateWebRTCConnection = (isInitiator: boolean) => {
    if (!localStream) return

    // Create a new peer connection
    const peer = new Peer({
      initiator: isInitiator,
      trickle: true,
      stream: localStream,
    })

    // Set up peer event listeners
    peer.on("signal", (data) => {
      if (data.type === "offer") {
        sendSignalMessage({
          type: "sdp-offer",
          from: currentUserId,
          to: otherUser.id,
          sdp: data,
        })
      } else if (data.type === "answer") {
        sendSignalMessage({
          type: "sdp-answer",
          from: currentUserId,
          to: otherUser.id,
          sdp: data,
        })
      } else if (data.candidate) {
        sendSignalMessage({
          type: "ice-candidate",
          from: currentUserId,
          to: otherUser.id,
          candidate: data,
        })
      }
    })

    peer.on("stream", (stream) => {
      setRemoteStream(stream)
      setIsCallConnected(true)
      setIsCallPending(false)
    })

    peer.on("error", (err) => {
      console.error("Peer connection error:", err)
      toast({
        title: "Connection error",
        description: "There was a problem connecting to the call.",
        variant: "destructive",
      })

      stopCall()
    })

    peerRef.current = peer
  }

  const stopCall = () => {
    // Stop all tracks in the local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }

    // Close peer connection
    if (peerRef.current) {
      peerRef.current.destroy()
      peerRef.current = null
    }

    // Send call-ended signal
    sendSignalMessage({
      type: "call-ended",
      from: currentUserId,
      to: otherUser.id,
    })

    // Clear state
    setLocalStream(null)
    setRemoteStream(null)
    setIsCallConnected(false)
  }
}
