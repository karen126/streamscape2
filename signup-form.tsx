"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle, Clock, CheckCircle, Mail } from "lucide-react"

export function SignupForm() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [selectedPlan, setSelectedPlan] = useState("trial")
  const [priceId, setPriceId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  // Indica si se está reenviando el correo de confirmación
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Check if environment variables are available
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  useEffect(() => {
    const plan = searchParams.get("plan")
    const price_id = searchParams.get("price_id")

    if (plan && ["trial", "basic", "premium", "ultimate"].includes(plan)) {
      setSelectedPlan(plan)
    } else {
      setSelectedPlan("trial")
    }

    if (price_id) {
      setPriceId(price_id)
    }
  }, [searchParams])

  // Cooldown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [cooldownTime])

  const validateForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      general: "",
    }
    let isValid = true

    if (!firstName.trim()) {
      newErrors.firstName = "El nombre es requerido"
      isValid = false
    }

    if (!lastName.trim()) {
      newErrors.lastName = "El apellido es requerido"
      isValid = false
    }

    if (!email) {
      newErrors.email = "El email es requerido"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El email no es válido"
      isValid = false
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida"
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
      isValid = false
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleResendEmail = async () => {
    setIsResendingEmail(true)
    try {
      const { resendConfirmation } = await import("@/lib/auth")
      const response = await resendConfirmation(email)

      if (response.success) {
        toast({
          title: "Email reenviado",
          description: "Revisa tu bandeja de entrada y spam.",
        })
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "No se pudo reenviar el email",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo reenviar el email",
        variant: "destructive",
      })
    } finally {
      setIsResendingEmail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (!isConfigured) {
      setErrors((prev) => ({
        ...prev,
        general: "La configuración de la base de datos no está completa. Por favor contacta al soporte.",
      }))
      return
    }

    if (cooldownTime > 0) {
      setErrors((prev) => ({
        ...prev,
        general: `Por favor espera ${cooldownTime} segundos antes de intentar de nuevo.`,
      }))
      return
    }

    setIsLoading(true)
    setErrors((prev) => ({ ...prev, general: "" }))

    try {
      console.log("🎯 Iniciando proceso de registro...")

      // Import auth functions only when needed
      const { signUp } = await import("@/lib/auth")

      console.log("📧 Registrando usuario:", { email, firstName, lastName })

      // Registrar al usuario
      const response = await signUp(email.trim(), password, firstName.trim(), lastName.trim())

      console.log("📋 Respuesta completa del registro:", response)

      if (response.success && response.data?.user) {
        const userId = response.data.user.id
        console.log("🎉 Usuario registrado exitosamente con ID:", userId)

        // Verificar si necesita confirmación de email
        if (response.data.needsEmailConfirmation) {
          setShowEmailConfirmation(true)
          toast({
            title: "¡Cuenta creada!",
            description: "Por favor revisa tu email para confirmar tu cuenta.",
          })
          return
        }

        // Si tiene sesión, proceder con el plan seleccionado
        if (selectedPlan === "trial") {
          console.log("🆓 Plan de prueba gratuita seleccionado")

          toast({
            title: "¡Cuenta creada exitosamente!",
            description: "¡Bienvenido a StreamScape! Tu prueba gratuita de 3 días ha comenzado.",
          })

          // Redirigir al dashboard después de un momento
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } else {
          // Si es un plan de pago, redirigir a checkout de Stripe
          console.log("💳 Procesando plan de pago:", selectedPlan)

          const planPriceIds = {
            basic: "price_1RVKC6FK5Rts2m4Ofh0TN3Lb",
            premium: "price_1RVKDMFK5Rts2m4OHP224JhH",
            ultimate: "price_1RVKEYFK5Rts2m4O5WYGP00F",
          }

          const selectedPriceId = priceId || planPriceIds[selectedPlan as keyof typeof planPriceIds]

          if (selectedPriceId) {
            console.log("🛒 Creando sesión de checkout para:", selectedPriceId)

            try {
              const checkoutResponse = await fetch("/api/stripe/create-checkout", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  priceId: selectedPriceId,
                  planName: selectedPlan,
                }),
              })

              if (!checkoutResponse.ok) {
                const errorText = await checkoutResponse.text()
                throw new Error(`Error ${checkoutResponse.status}: ${errorText}`)
              }

              const checkoutData = await checkoutResponse.json()

              if (checkoutData.error) {
                throw new Error(checkoutData.error)
              }

              if (checkoutData.url) {
                console.log("✅ Redirigiendo a Stripe Checkout:", checkoutData.url)
                window.location.href = checkoutData.url
              } else {
                throw new Error("No se pudo crear la sesión de pago")
              }
            } catch (checkoutError) {
              console.error("❌ Error en checkout:", checkoutError)
              toast({
                title: "Error en el pago",
                description: "No se pudo procesar el pago. Tu cuenta fue creada, puedes configurar el pago más tarde.",
                variant: "destructive",
              })

              // Redirigir al dashboard de todas formas
              setTimeout(() => {
                router.push("/dashboard")
              }, 2000)
            }
          } else {
            toast({
              title: "¡Cuenta creada!",
              description: "Por favor completa la configuración de tu suscripción.",
            })
            router.push("/pricing")
          }
        }
      } else {
        console.error("❌ Error en el registro:", response.error)

        let errorMessage = response.error?.message || "Error al crear la cuenta. Por favor intenta de nuevo."

        // Manejar el error de rate limiting
        if (errorMessage.includes("30 seconds") || errorMessage.includes("30 segundos")) {
          setCooldownTime(30)
          errorMessage = "Por favor espera 30 segundos antes de intentar registrarte de nuevo."
        }

        setErrors((prev) => ({
          ...prev,
          general: errorMessage,
        }))
      }
    } catch (error) {
      console.error("💥 Error durante el registro:", error)

      let errorMessage = "Ocurrió un error inesperado. Por favor intenta de nuevo."

      if (error instanceof Error) {
        console.error("🔍 Detalles del error:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        })

        if (error.message.includes("supabaseUrl") || error.message.includes("supabase")) {
          errorMessage = "Error de configuración de la base de datos. Por favor contacta al soporte."
        } else if (error.message.includes("fetch")) {
          errorMessage = "Error de conexión. Por favor verifica tu conexión a internet."
        } else if (error.message.includes("30 seconds")) {
          setCooldownTime(30)
          errorMessage = "Por favor espera 30 segundos antes de intentar de nuevo."
        } else {
          errorMessage = error.message
        }
      }

      setErrors((prev) => ({ ...prev, general: errorMessage }))
    } finally {
      setIsLoading(false)
    }
  }

  const planOptions = [
    { value: "trial", name: "Prueba Gratuita", price: "3 días" },
    { value: "basic", name: "Basic", price: "$30.00/mes" },
    { value: "premium", name: "Premium", price: "$40.00/mes" },
    { value: "ultimate", name: "Ultimate", price: "$45.00/mes" },
  ]

  const isFormDisabled = isLoading || !isConfigured || cooldownTime > 0

  // Si necesita confirmación de email, mostrar pantalla especial
  if (showEmailConfirmation) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">¡Cuenta creada exitosamente!</h2>
          <p className="text-muted-foreground">
            Hemos enviado un email de confirmación a <strong>{email}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Por favor revisa tu bandeja de entrada y haz clic en el enlace de confirmación para activar tu cuenta.
          </p>
        </div>
        <div className="space-y-3">
          <Button onClick={handleResendEmail} variant="outline" disabled={isResendingEmail} className="w-full">
            {isResendingEmail ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reenviando...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Reenviar email de confirmación
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            ¿Ya confirmaste tu email?{" "}
            <button onClick={() => router.push("/login")} className="text-blue-500 hover:underline font-medium">
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Environment Variables Warning */}
      {!isConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Configuración Requerida</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Las variables de entorno de Supabase no están configuradas. Por favor agrega lo siguiente a tu archivo{" "}
                  <code className="bg-yellow-100 px-1 rounded">.env.local</code>:
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>
                    <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>
                  </li>
                  <li>
                    <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cooldown Warning */}
      {cooldownTime > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <Clock className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Espera un momento</h3>
              <p className="text-sm text-blue-700 mt-1">
                Por seguridad, debes esperar {cooldownTime} segundos antes de intentar registrarte de nuevo.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* General Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{errors.general}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">Nombre</Label>
            <Input
              id="first-name"
              placeholder="Juan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={errors.firstName ? "border-red-500" : ""}
              disabled={isFormDisabled}
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Apellido</Label>
            <Input
              id="last-name"
              placeholder="Pérez"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={errors.lastName ? "border-red-500" : ""}
              disabled={isFormDisabled}
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="juan@ejemplo.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? "border-red-500" : ""}
            disabled={isFormDisabled}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? "border-red-500" : ""}
            disabled={isFormDisabled}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={errors.confirmPassword ? "border-red-500" : ""}
            disabled={isFormDisabled}
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>

        <div className="space-y-2">
          <Label>Selecciona tu plan</Label>
          <RadioGroup
            value={selectedPlan}
            onValueChange={setSelectedPlan}
            className="grid grid-cols-2 gap-4 pt-2"
            disabled={isFormDisabled}
          >
            {planOptions.map((plan) => (
              <div key={plan.value}>
                <RadioGroupItem value={plan.value} id={plan.value} className="peer sr-only" />
                <Label
                  htmlFor={plan.value}
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="text-sm font-medium">{plan.name}</span>
                  <span className="text-xs">{plan.price}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          La prueba gratuita te da acceso completo a todas las funciones por 3 días. No se requiere tarjeta de crédito.
          Después del período de prueba, necesitarás seleccionar un plan de pago para continuar usando StreamScape.
        </p>

        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600" type="submit" disabled={isFormDisabled}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : cooldownTime > 0 ? (
            <>
              <Clock className="mr-2 h-4 w-4" />
              Espera {cooldownTime}s
            </>
          ) : (
            "Crear cuenta"
          )}
        </Button>
      </form>
    </div>
  )
}
