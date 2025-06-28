// Configuración global
const CONFIG = {
  DEMO_DELAY: 1500,
  INSTALL_PROMPT_DELAY: 3000,
  ANIMATION_DURATION: 300,
}

// Estado global de la aplicación
const AppState = {
  deferredPrompt: null,
  isInstalled: false,
  currentMessageIndex: 2,
}

// Inicialización cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

// Función principal de inicialización
function initializeApp() {
  console.log("🚀 Inicializando StreamScape...")

  // Inicializar componentes
  initChatDemo()
  initVideoModal()
  initMobileMenu()
  initInstallPrompt()
  initScrollEffects()
  initFormValidation()

  // Inicializar funcionalidades específicas de página
  initPageSpecificFeatures()

  console.log("✅ StreamScape inicializado correctamente")
}

// === DEMO DE CHAT ===
function initChatDemo() {
  const demoButton = document.getElementById("try-demo")
  const demoMessages = document.getElementById("demo-messages")

  if (!demoButton || !demoMessages) return

  // Mensajes para la demo
  const messages = [
    {
      text: "¡Hola! Vi que tenemos intereses similares en fotografía. ¿Qué tipo de cámara usas?",
      sender: "received",
    },
    {
      text: "¡Hola Jessica! Encantado de conocerte. Uso una Sony Alpha para la mayoría de mi trabajo. ¿También disfrutas de la fotografía de paisajes?",
      sender: "sent",
    },
    {
      text: "¡Sí! Los paisajes son mi favorito. He estado tratando de capturar algunas escenas de montaña últimamente.",
      sender: "received",
    },
    {
      text: "¡Eso suena increíble! Me encantaría ver tu trabajo alguna vez. ¿Tienes algún lugar favorito para fotografiar?",
      sender: "sent",
    },
    {
      text: "Tengo varios, pero mi favorito es el Parque Nacional Torres del Paine. ¿Has estado allí?",
      sender: "received",
    },
    {
      text: "¡No, pero está en mi lista de deseos! Las fotos que he visto son espectaculares.",
      sender: "sent",
    },
  ]

  demoButton.addEventListener("click", () => {
    if (AppState.currentMessageIndex >= messages.length) {
      // Reiniciar demo
      demoMessages.innerHTML = `
                <div class="message received">
                    <p>¡Hola! Vi que tenemos intereses similares en fotografía. ¿Qué tipo de cámara usas?</p>
                </div>
                <div class="message sent">
                    <p>¡Hola Jessica! Encantado de conocerte. Uso una Sony Alpha para la mayoría de mi trabajo. ¿También disfrutas de la fotografía de paisajes?</p>
                </div>
            `
      AppState.currentMessageIndex = 2
      demoButton.textContent = "Continuar Demo"
    }

    // Mostrar mensajes progresivamente
    showNextMessage()
  })

  function showNextMessage() {
    if (AppState.currentMessageIndex < messages.length) {
      const message = messages[AppState.currentMessageIndex]
      const messageElement = document.createElement("div")
      messageElement.className = `message ${message.sender}`
      messageElement.innerHTML = `<p>${message.text}</p>`

      // Añadir animación
      messageElement.style.opacity = "0"
      messageElement.style.transform = "translateY(20px)"

      demoMessages.appendChild(messageElement)

      // Animar entrada
      setTimeout(() => {
        messageElement.style.opacity = "1"
        messageElement.style.transform = "translateY(0)"
      }, 100)

      // Scroll automático
      demoMessages.scrollTop = demoMessages.scrollHeight

      AppState.currentMessageIndex++

      // Programar siguiente mensaje
      if (AppState.currentMessageIndex < messages.length) {
        setTimeout(showNextMessage, CONFIG.DEMO_DELAY)
      } else {
        demoButton.textContent = "Reiniciar Demo"
      }
    }
  }
}

// === MODAL DE VIDEOLLAMADA ===
function initVideoModal() {
  const videoCallBtn = document.getElementById("video-call-btn")
  const videoModal = document.getElementById("video-modal")
  const closeModalBtn = document.querySelector(".close-modal")
  const endCallBtn = document.getElementById("end-call")

  if (!videoCallBtn || !videoModal) return

  videoCallBtn.addEventListener("click", () => {
    showModal(videoModal)
    simulateVideoCall()
  })

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      hideModal(videoModal)
    })
  }

  if (endCallBtn) {
    endCallBtn.addEventListener("click", () => {
      hideModal(videoModal)
    })
  }

  // Cerrar modal al hacer clic fuera del contenido
  videoModal.addEventListener("click", (event) => {
    if (event.target === videoModal) {
      hideModal(videoModal)
    }
  })

  function simulateVideoCall() {
    const modalHeader = videoModal.querySelector(".modal-header p")
    const states = ["Conectando...", "Estableciendo conexión...", "Conectado con Jessica Smith"]

    let stateIndex = 0
    const interval = setInterval(() => {
      if (stateIndex < states.length - 1) {
        modalHeader.textContent = states[stateIndex]
        stateIndex++
      } else {
        modalHeader.textContent = states[stateIndex]
        clearInterval(interval)
      }
    }, 1000)
  }
}

// === MENÚ MÓVIL ===
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle")
  const nav = document.querySelector("nav")

  if (!mobileMenuToggle || !nav) return

  mobileMenuToggle.addEventListener("click", () => {
    nav.style.display = nav.style.display === "block" ? "none" : "block"
    mobileMenuToggle.classList.toggle("active")
  })

  // Cerrar menú al hacer clic en un enlace
  const navLinks = nav.querySelectorAll("a")
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.style.display = "none"
      mobileMenuToggle.classList.remove("active")
    })
  })
}

// === PROMPT DE INSTALACIÓN PWA ===
function initInstallPrompt() {
  const installPrompt = document.getElementById("install-prompt")
  const installButton = document.getElementById("install-button")
  const dismissButton = document.getElementById("dismiss-install")

  // Escuchar evento beforeinstallprompt
  window.addEventListener("beforeinstallprompt", (e) => {
    console.log("💾 PWA instalable detectada")
    e.preventDefault()
    AppState.deferredPrompt = e

    // Mostrar prompt después de un delay
    setTimeout(() => {
      if (installPrompt && !AppState.isInstalled) {
        showInstallPrompt()
      }
    }, CONFIG.INSTALL_PROMPT_DELAY)
  })

  // Detectar si ya está instalada
  window.addEventListener("appinstalled", () => {
    console.log("✅ PWA instalada exitosamente")
    AppState.isInstalled = true
    hideInstallPrompt()
  })

  if (installButton) {
    installButton.addEventListener("click", async () => {
      if (AppState.deferredPrompt) {
        AppState.deferredPrompt.prompt()
        const { outcome } = await AppState.deferredPrompt.userChoice

        if (outcome === "accepted") {
          console.log("✅ Usuario aceptó instalar la PWA")
        } else {
          console.log("❌ Usuario rechazó instalar la PWA")
        }

        AppState.deferredPrompt = null
        hideInstallPrompt()
      }
    })
  }

  if (dismissButton) {
    dismissButton.addEventListener("click", () => {
      hideInstallPrompt()
      // No mostrar de nuevo en esta sesión
      sessionStorage.setItem("installPromptDismissed", "true")
    })
  }

  function showInstallPrompt() {
    if (sessionStorage.getItem("installPromptDismissed")) return
    if (installPrompt) {
      installPrompt.classList.remove("hidden")
    }
  }

  function hideInstallPrompt() {
    if (installPrompt) {
      installPrompt.classList.add("hidden")
    }
  }
}

// === EFECTOS DE SCROLL ===
function initScrollEffects() {
  // Intersection Observer para animaciones al hacer scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observar elementos que deben animarse
  const animatedElements = document.querySelectorAll(".feature-card, .pricing-card, .stat")
  animatedElements.forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(30px)"
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(el)
  })

  // Efecto parallax para el hero
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset
    const hero = document.querySelector(".hero")
    if (hero) {
      hero.style.transform = `translateY(${scrolled * 0.5}px)`
    }
  })
}

// === VALIDACIÓN DE FORMULARIOS ===
function initFormValidation() {
  const forms = document.querySelectorAll("form")

  forms.forEach((form) => {
    const inputs = form.querySelectorAll("input[required], select[required], textarea[required]")

    inputs.forEach((input) => {
      input.addEventListener("blur", () => validateField(input))
      input.addEventListener("input", () => clearError(input))
    })

    form.addEventListener("submit", (e) => {
      let isValid = true

      inputs.forEach((input) => {
        if (!validateField(input)) {
          isValid = false
        }
      })

      if (!isValid) {
        e.preventDefault()
      }
    })
  })
}

function validateField(field) {
  const value = field.value.trim()
  const type = field.type
  let isValid = true
  let errorMessage = ""

  // Validación básica de campo requerido
  if (field.hasAttribute("required") && !value) {
    isValid = false
    errorMessage = "Este campo es obligatorio"
  }

  // Validaciones específicas por tipo
  if (value && type === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      isValid = false
      errorMessage = "Ingresa un email válido"
    }
  }

  if (value && type === "password") {
    if (value.length < 6) {
      isValid = false
      errorMessage = "La contraseña debe tener al menos 6 caracteres"
    }
  }

  // Mostrar/ocultar error
  showFieldError(field, isValid ? "" : errorMessage)

  return isValid
}

function showFieldError(field, message) {
  const errorElement = field.parentNode.querySelector(".error-message")
  if (errorElement) {
    errorElement.textContent = message
    field.style.borderColor = message ? "var(--danger)" : ""
  }
}

function clearError(field) {
  showFieldError(field, "")
}

// === FUNCIONALIDADES ESPECÍFICAS DE PÁGINA ===
function initPageSpecificFeatures() {
  const currentPage = getCurrentPage()

  switch (currentPage) {
    case "signup":
      initSignupPage()
      break
    case "login":
      initLoginPage()
      break
    case "payment":
      initPaymentPage()
      break
    case "subscription":
      initSubscriptionPage()
      break
  }
}

function getCurrentPage() {
  const path = window.location.pathname
  if (path.includes("signup")) return "signup"
  if (path.includes("login")) return "login"
  if (path.includes("payment")) return "payment"
  if (path.includes("subscription")) return "subscription"
  return "home"
}

// === PÁGINA DE REGISTRO ===
function initSignupPage() {
  console.log("📝 Inicializando página de registro")

  const form = document.getElementById("signup-form")
  if (!form) return

  // Obtener plan de la URL
  const urlParams = new URLSearchParams(window.location.search)
  const selectedPlan = urlParams.get("plan") || "trial"

  // Seleccionar el plan correcto
  const planRadio = document.getElementById(`plan-${selectedPlan}`)
  if (planRadio) {
    planRadio.checked = true
  }

  // Manejar cambios de plan
  const planOptions = document.querySelectorAll('input[name="plan"]')
  planOptions.forEach((option) => {
    option.addEventListener("change", (e) => {
      updatePlanSelection(e.target.value)
    })
  })

  function updatePlanSelection(plan) {
    console.log(`📋 Plan seleccionado: ${plan}`)
    // Actualizar URL sin recargar la página
    const newUrl = new URL(window.location)
    newUrl.searchParams.set("plan", plan)
    window.history.replaceState({}, "", newUrl)
  }
}

// === PÁGINA DE LOGIN ===
function initLoginPage() {
  console.log("🔐 Inicializando página de login")

  const form = document.getElementById("login-form")
  if (!form) return

  form.addEventListener("submit", (e) => {
    e.preventDefault()
    simulateLogin()
  })

  function simulateLogin() {
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    console.log(`🔑 Intentando login para: ${email}`)

    // Simular proceso de login
    const submitButton = form.querySelector('button[type="submit"]')
    const originalText = submitButton.textContent

    submitButton.disabled = true
    submitButton.innerHTML = '<span class="loading">Iniciando sesión...</span>'

    setTimeout(() => {
      // Simular éxito o error
      if (email && password) {
        console.log("✅ Login exitoso")
        window.location.href = "dashboard.html"
      } else {
        console.log("❌ Error en login")
        showLoginError("Credenciales incorrectas")
        submitButton.disabled = false
        submitButton.textContent = originalText
      }
    }, 2000)
  }

  function showLoginError(message) {
    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.textContent = message
    errorDiv.style.textAlign = "center"
    errorDiv.style.marginTop = "1rem"

    // Remover error anterior si existe
    const existingError = form.querySelector(".error-message")
    if (existingError) {
      existingError.remove()
    }

    form.appendChild(errorDiv)
  }
}

// === PÁGINA DE PAGO ===
function initPaymentPage() {
  console.log("💳 Inicializando página de pago")

  const form = document.getElementById("payment-form")
  if (!form) return

  // Configurar información del plan
  const urlParams = new URLSearchParams(window.location.search)
  const planType = urlParams.get("plan") || "premium"
  setupPlanInfo(planType)

  form.addEventListener("submit", (e) => {
    e.preventDefault()
    processPayment(planType)
  })

  function setupPlanInfo(planType) {
    const planInfo = {
      trial: {
        name: "Prueba Gratuita",
        price: "0.00",
        features: ["Acceso completo por 3 días", "Todas las funciones", "Sin tarjeta de crédito"],
      },
      basic: {
        name: "Basic",
        price: "30.00",
        features: [
          "Mensajes de texto ilimitados",
          "5 horas de videollamadas al mes",
          "Personalización básica de perfil",
        ],
      },
      premium: {
        name: "Premium",
        price: "40.00",
        features: [
          "Mensajes de texto ilimitados",
          "20 horas de videollamadas al mes",
          "Personalización avanzada de perfil",
          "Emparejamiento prioritario",
        ],
      },
      ultimate: {
        name: "Ultimate",
        price: "45.00",
        features: [
          "Mensajes de texto ilimitados",
          "Videollamadas ilimitadas",
          "Personalización premium de perfil",
          "Emparejamiento prioritario",
          "Acceso a eventos exclusivos",
        ],
      },
    }

    const plan = planInfo[planType] || planInfo.premium

    const planNameEl = document.getElementById("planName")
    const planPriceEl = document.getElementById("planPrice")
    const planFeaturesEl = document.getElementById("planFeatures")

    if (planNameEl) planNameEl.textContent = plan.name
    if (planPriceEl) planPriceEl.textContent = plan.price

    if (planFeaturesEl) {
      planFeaturesEl.innerHTML = ""
      plan.features.forEach((feature) => {
        const li = document.createElement("li")
        li.textContent = feature
        planFeaturesEl.appendChild(li)
      })
    }

    // Actualizar texto del botón para prueba gratuita
    const buttonText = document.getElementById("button-text")
    if (planType === "trial" && buttonText) {
      buttonText.textContent = "Iniciar Prueba Gratuita"
    }
  }

  function processPayment(planType) {
    console.log(`💰 Procesando pago para plan: ${planType}`)

    const submitButton = document.getElementById("submit-button")
    const buttonText = document.getElementById("button-text")
    const spinner = document.getElementById("spinner")

    // Mostrar loading
    setLoading(true)

    // Simular procesamiento
    setTimeout(() => {
      console.log("✅ Pago procesado exitosamente")

      // Ocultar formulario y mostrar éxito
      form.classList.add("hidden")
      const successMessage = document.getElementById("success-message")
      if (successMessage) {
        successMessage.classList.remove("hidden")
      }

      // Configurar botón de dashboard
      const dashboardBtn = document.getElementById("go-to-dashboard")
      if (dashboardBtn) {
        dashboardBtn.addEventListener("click", () => {
          window.location.href = "dashboard.html"
        })
      }
    }, 3000)
  }

  function setLoading(isLoading) {
    const submitButton = document.getElementById("submit-button")
    const buttonText = document.getElementById("button-text")
    const spinner = document.getElementById("spinner")

    if (submitButton && buttonText && spinner) {
      if (isLoading) {
        submitButton.disabled = true
        buttonText.classList.add("hidden")
        spinner.classList.remove("hidden")
      } else {
        submitButton.disabled = false
        buttonText.classList.remove("hidden")
        spinner.classList.add("hidden")
      }
    }
  }
}

// === PÁGINA DE SUSCRIPCIÓN ===
function initSubscriptionPage() {
  console.log("📊 Inicializando página de suscripción")

  const subscriptionInfo = document.getElementById("subscription-info")
  if (!subscriptionInfo) return

  // Simular carga de datos de suscripción
  loadSubscriptionData()

  function loadSubscriptionData() {
    // Simular datos de suscripción
    const mockSubscription = {
      id: "sub_1234567890",
      planType: "premium",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }

    renderSubscriptionInfo(mockSubscription)
  }

  function renderSubscriptionInfo(subscription) {
    const endDate = new Date(subscription.currentPeriodEnd)
    const formattedEndDate = endDate.toLocaleDateString("es-ES")

    subscriptionInfo.innerHTML = `
            <div class="subscription-card">
                <div class="subscription-header">
                    <h3>Plan ${getPlanName(subscription.planType)}</h3>
                    <span class="badge badge-success">Activa</span>
                </div>
                
                <div class="subscription-details">
                    <div class="detail-row">
                        <span class="detail-label">Estado:</span>
                        <span class="detail-value">Activa</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Próximo pago:</span>
                        <span class="detail-value">${formattedEndDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Precio:</span>
                        <span class="detail-value">$${getPlanPrice(subscription.planType)}/mes</span>
                    </div>
                </div>
                
                <div class="subscription-actions">
                    <button class="btn btn-outline">Cancelar Suscripción</button>
                    <button class="btn btn-secondary">Actualizar Método de Pago</button>
                </div>
            </div>
        `
  }

  function getPlanName(planType) {
    const names = {
      basic: "Basic",
      premium: "Premium",
      ultimate: "Ultimate",
      trial: "Prueba Gratuita",
    }
    return names[planType] || planType
  }

  function getPlanPrice(planType) {
    const prices = {
      basic: "30.00",
      premium: "40.00",
      ultimate: "45.00",
      trial: "0.00",
    }
    return prices[planType] || "0.00"
  }
}

// === UTILIDADES ===
function showModal(modal) {
  if (modal) {
    modal.classList.remove("hidden")
    document.body.style.overflow = "hidden"
  }
}

function hideModal(modal) {
  if (modal) {
    modal.classList.add("hidden")
    document.body.style.overflow = ""
  }
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// === MANEJO DE ERRORES GLOBAL ===
window.addEventListener("error", (e) => {
  console.error("❌ Error global:", e.error)
})

window.addEventListener("unhandledrejection", (e) => {
  console.error("❌ Promise rechazada:", e.reason)
})

// === ANALYTICS SIMULADO ===
function trackEvent(eventName, properties = {}) {
  console.log(`📈 Evento: ${eventName}`, properties)
  // Aquí integrarías con Google Analytics, Mixpanel, etc.
}

// Trackear eventos importantes
document.addEventListener("click", (e) => {
  if (e.target.matches(".btn")) {
    trackEvent("button_click", {
      button_text: e.target.textContent.trim(),
      page: getCurrentPage(),
    })
  }
})

// === NOTIFICACIONES ===
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.textContent = message

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: var(--radius);
        color: white;
        z-index: 1001;
        animation: slideIn 0.3s ease-out;
    `

  switch (type) {
    case "success":
      notification.style.backgroundColor = "var(--success)"
      break
    case "error":
      notification.style.backgroundColor = "var(--danger)"
      break
    case "warning":
      notification.style.backgroundColor = "var(--warning)"
      break
    default:
      notification.style.backgroundColor = "var(--info)"
  }

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 5000)
}

console.log("🎉 StreamScape cargado completamente")
