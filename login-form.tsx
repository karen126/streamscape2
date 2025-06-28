"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { MailIcon, LockIcon, Loader2 } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [errors, setErrors] = useState({ email: "", password: "" })
  const router = useRouter()
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors = { email: "", password: "" }
    let isValid = true

    if (!email) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
      isValid = false
    }

    if (!password) {
      newErrors.password = "Password is required"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { success, error } = await signIn(email, password)

      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back to StreamScape!",
        })
        router.push("/dashboard")
        router.refresh()
      } else {
        if (error?.message?.toLowerCase().includes("email not confirmed")) {
          toast({
            title: "Confirma tu correo",
            description:
              "Hemos enviado un correo de verificación. Confírmalo y vuelve a intentarlo. ¿No lo recibiste? Haz clic en “Reenviar”.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Login failed",
            description: error?.message || "Please check your credentials and try again.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Email requerido",
        description: "Ingresa tu email para reenviar la verificación.",
        variant: "destructive",
      })
      return
    }

    setIsResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      if (error) {
        toast({
          title: "No se pudo reenviar",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Correo enviado",
          description: "Revisa tu bandeja de entrada para confirmar tu email.",
        })
      }
    } catch (err) {
      toast({
        title: "Error inesperado",
        description: "Intenta de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <MailIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            placeholder="m@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
            disabled={isLoading}
          />
        </div>
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link className="text-sm underline" href="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
            disabled={isLoading}
          />
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600" type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          "Log in"
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleResendVerification}
        disabled={isResending || isLoading}
      >
        {isResending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando…
          </>
        ) : (
          "Reenviar correo de verificación"
        )}
      </Button>
    </form>
  )
}
