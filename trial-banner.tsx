"use client"

import { useState, useEffect } from "react"
import { AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

interface TrialBannerProps {
  trialStartDate: Date
  onClose?: () => void
}

export function TrialBanner({ trialStartDate, onClose }: TrialBannerProps) {
  const [daysLeft, setDaysLeft] = useState(3)
  const [hoursLeft, setHoursLeft] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Calculate time remaining in trial
    const calculateTimeRemaining = () => {
      const now = new Date()
      const trialEndDate = new Date(trialStartDate)
      trialEndDate.setDate(trialEndDate.getDate() + 3) // 3-day trial

      const diffTime = trialEndDate.getTime() - now.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

      setDaysLeft(diffDays)
      setHoursLeft(diffHours)
    }

    calculateTimeRemaining()
    const timer = setInterval(calculateTimeRemaining, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [trialStartDate])

  if (dismissed || (daysLeft <= 0 && hoursLeft <= 0)) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    if (onClose) onClose()
  }

  const getAlertVariant = () => {
    if (daysLeft <= 0) return "destructive"
    if (daysLeft <= 1) return "destructive"
    return "default"
  }

  const getMessage = () => {
    if (daysLeft <= 0 && hoursLeft <= 0) {
      return "Your free trial has expired. Please upgrade to continue using StreamScape."
    }

    if (daysLeft <= 0) {
      return `Your free trial expires in ${hoursLeft} ${hoursLeft === 1 ? "hour" : "hours"}. Upgrade now to avoid interruption.`
    }

    if (daysLeft === 1) {
      return `Your free trial expires in ${daysLeft} day and ${hoursLeft} ${hoursLeft === 1 ? "hour" : "hours"}. Upgrade now to continue enjoying StreamScape.`
    }

    return `You have ${daysLeft} days left in your free trial. Enjoy all premium features!`
  }

  return (
    <Alert variant={getAlertVariant() as "default" | "destructive"} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle>Trial Status</AlertTitle>
        <AlertDescription>{getMessage()}</AlertDescription>
      </div>
      <div className="flex items-center gap-2">
        {(daysLeft <= 1 || (daysLeft <= 0 && hoursLeft <= 0)) && (
          <Link href="/pricing">
            <Button size="sm" variant="outline">
              Upgrade
            </Button>
          </Link>
        )}
        <Button size="sm" variant="ghost" onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  )
}
