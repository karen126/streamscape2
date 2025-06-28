"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface TrialCheckProps {
  trialStartDate: Date
  children: React.ReactNode
}

export function TrialCheck({ trialStartDate, children }: TrialCheckProps) {
  const router = useRouter()
  const [isTrialExpired, setIsTrialExpired] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if trial is expired
    const checkTrial = () => {
      const now = new Date()
      const trialEndDate = new Date(trialStartDate)
      trialEndDate.setDate(trialEndDate.getDate() + 3) // 3-day trial

      if (now > trialEndDate) {
        setIsTrialExpired(true)
        // Redirect to trial expired page after a short delay
        setTimeout(() => {
          router.push("/trial-expired")
        }, 500)
      }

      setIsChecking(false)
    }

    checkTrial()
  }, [trialStartDate, router])

  // Show nothing while checking to prevent flash of content
  if (isChecking) {
    return null
  }

  // If trial is valid, show children
  return <>{children}</>
}
