"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ArrowRight, MessageSquare, Video, Globe, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [showDemo, setShowDemo] = useState(false)
  const [demoStep, setDemoStep] = useState(0)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const { toast } = useToast()

  // Demo chat messages
  const demoMessages = [
    {
      text: "Hi there! I saw we have similar interests in photography. What kind of camera do you use?",
      sender: "them",
    },
    {
      text: "Hey Jessica! Nice to meet you. I use a Sony Alpha for most of my work. Do you enjoy landscape photography too?",
      sender: "you",
    },
    {
      text: "Yes! Landscapes are my favorite. I've been trying to capture some mountain scenes lately.",
      sender: "them",
    },
    { text: "That sounds amazing! I'd love to see your work sometime.", sender: "you" },
  ]

  useEffect(() => {
    if (showDemo && demoStep < demoMessages.length - 1) {
      const timer = setTimeout(() => {
        setDemoStep((prev) => prev + 1)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [showDemo, demoStep, demoMessages.length])

  const handleStartDemo = () => {
    setShowDemo(true)
    setDemoStep(0)
    toast({
      title: "Demo started",
      description: "Watch how StreamScape conversations work!",
    })
  }

  const handleVideoCall = () => {
    setIsVideoModalOpen(true)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <Link className="flex items-center justify-center" href="#">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            StreamScape
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#about">
            About
          </Link>
        </nav>
        <div className="ml-4 flex items-center gap-2">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign Up</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Connect with people around the world
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    StreamScape brings people together through meaningful conversations and video calls. Find your
                    perfect connection today.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup?plan=trial">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 transition-transform hover:scale-105"
                    >
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" onClick={handleStartDemo}>
                    Try Demo
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Enjoy a 3-day free trial with full access to all features. No credit card required.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-md overflow-hidden rounded-xl border bg-gradient-to-b from-blue-50 to-purple-50 p-2 shadow-2xl transition-all duration-300 hover:shadow-blue-200/50">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          JS
                        </div>
                        <div>
                          <h3 className="font-medium">Jessica Smith</h3>
                          <p className="text-sm text-gray-500">Online now</p>
                        </div>
                        <div className="ml-auto flex gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleVideoCall}>
                            <Video className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {showDemo && (
                          <>
                            {demoMessages.slice(0, demoStep + 1).map((message, index) => (
                              <div
                                key={index}
                                className={`rounded-lg ${message.sender === "them" ? "bg-gray-100" : "bg-blue-100 ml-auto max-w-[80%]"} p-3 text-sm animate-fadeIn`}
                              >
                                {message.text}
                              </div>
                            ))}
                          </>
                        )}
                        {!showDemo && (
                          <>
                            <div className="rounded-lg bg-gray-100 p-3 text-sm">
                              Hi there! I saw we have similar interests in photography. What kind of camera do you use?
                            </div>
                            <div className="rounded-lg bg-blue-100 p-3 text-sm ml-auto max-w-[80%]">
                              Hey Jessica! Nice to meet you. I use a Sony Alpha for most of my work. Do you enjoy
                              landscape photography too?
                            </div>
                          </>
                        )}
                      </div>
                      {showDemo && demoStep >= demoMessages.length - 1 && (
                        <div className="flex justify-center">
                          <Button size="sm" variant="outline" onClick={() => setShowDemo(false)}>
                            Restart Demo
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features You'll Love</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  StreamScape offers everything you need to build meaningful connections
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center group">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 transition-transform group-hover:scale-110">
                  <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Instant Messaging</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Connect through text with our intuitive messaging platform
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center group">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 transition-transform group-hover:scale-110">
                  <Video className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">HD Video Calls</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Experience crystal clear video calls with anyone around the world
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center group">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 transition-transform group-hover:scale-110">
                  <Globe className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Global Connections</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Meet people from different cultures and backgrounds worldwide
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Choose Your Plan</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Select the perfect subscription that fits your needs
                </p>
              </div>
            </div>
            <div className="grid gap-6 pt-12 lg:grid-cols-3 lg:gap-8">
              <div className="flex flex-col justify-between rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:translate-y-[-4px]">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Basic</h3>
                  <div className="text-4xl font-bold">
                    $30.00<span className="text-sm font-normal text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-green-500" />
                      Unlimited text messaging
                    </li>
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-green-500" />5 hours of video calls per month
                    </li>
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-green-500" />
                      Basic profile customization
                    </li>
                  </ul>
                </div>
                <div className="pt-6">
                  <Link href="/signup?plan=basic&price_id=price_1RVKC6FK5Rts2m4Ofh0TN3Lb">
                    <Button className="w-full transition-transform hover:scale-105">Start with Basic</Button>
                  </Link>
                  <p className="text-xs text-center mt-2">
                    or{" "}
                    <Link href="/signup?plan=trial" className="text-blue-500 hover:underline">
                      try free for 3 days
                    </Link>
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-lg border bg-gradient-to-b from-blue-50 to-purple-50 p-6 shadow-lg transition-all duration-200 hover:shadow-xl hover:translate-y-[-4px]">
                <div className="space-y-4">
                  <div className="inline-block rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-xs font-medium text-white">
                    POPULAR
                  </div>
                  <h3 className="text-2xl font-bold">Premium</h3>
                  <div className="text-4xl font-bold">
                    $40.00<span className="text-sm font-normal text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-green-500" />
                      Unlimited text messaging
                    </li>
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-green-500" />
                      20 hours of video calls per month
                    </li>
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-green-500" />
                      Advanced profile customization
                    </li>
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-green-500" />
                      Priority matching
                    </li>
                  </ul>
                </div>
                <div className="pt-6">
                  <Link href="/signup?plan=premium&price_id=price_1RVKDMFK5Rts2m4OHP224JhH">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 transition-transform hover:scale-105">
                      Start with Premium
                    </Button>
                  </Link>
                  <p className="text-xs text-center mt-2">
                    or{" "}
                    <Link href="/signup?plan=trial" className="text-blue-500 hover:underline">
                      try free for 3 days
                    </Link>
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:translate-y-[-4px]">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Ultimate</h3>
                  <div className="text-4xl font-bold">
                    $45.00<span className="text-sm font-normal text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-green-500" />
                      Unlimited text messaging
                    </li>
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-green-500" />
                      Unlimited video calls
                    </li>
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-green-500" />
                      Premium profile customization
                    </li>
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-green-500" />
                      Priority matching
                    </li>
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-green-500" />
                      Exclusive events access
                    </li>
                  </ul>
                </div>
                <div className="pt-6">
                  <Link href="/signup?plan=ultimate&price_id=price_1RVKEYFK5Rts2m4O5WYGP00F">
                    <Button className="w-full transition-transform hover:scale-105">Start with Ultimate</Button>
                  </Link>
                  <p className="text-xs text-center mt-2">
                    or{" "}
                    <Link href="/signup?plan=trial" className="text-blue-500 hover:underline">
                      try free for 3 days
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">About StreamScape</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  StreamScape was created with a simple mission: to connect people from all corners of the world through
                  meaningful conversations and authentic connections.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Our platform uses advanced matching algorithms to help you find people who share your interests,
                  values, and goals. Whether you're looking for friendship, romance, or just interesting conversations,
                  StreamScape makes it easy to connect.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Why Choose StreamScape?</h3>
                <ul className="grid gap-2">
                  <li className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span>Safe and secure platform with verified profiles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span>Advanced matching based on compatibility</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span>High-quality video and audio for clear communication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span>Global community with users from over 150 countries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span>24/7 customer support for any issues</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 StreamScape. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>

      {/* Video Call Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Video Call</DialogTitle>
            <DialogDescription>Connecting to Jessica Smith...</DialogDescription>
          </DialogHeader>
          <div className="relative aspect-video bg-black rounded-md overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                JS
              </div>
            </div>
            <div className="absolute bottom-4 right-4 h-24 w-32 bg-gray-800 rounded-md overflow-hidden border-2 border-white">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white">You</span>
              </div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              <Button size="sm" variant="destructive" onClick={() => setIsVideoModalOpen(false)}>
                End Call
              </Button>
              <Button size="sm" variant="secondary">
                Mute
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
