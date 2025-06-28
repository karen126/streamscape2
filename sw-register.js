if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("✅ Service Worker registrado:", registration.scope)

        // Verificar actualizaciones
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // Nueva versión disponible
              if (confirm("Nueva versión disponible. ¿Actualizar?")) {
                window.location.reload()
              }
            }
          })
        })
      })
      .catch((err) => {
        console.log("❌ Error registrando Service Worker:", err)
      })
  })

  // Escuchar mensajes del Service Worker
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
      window.location.reload()
    }
  })
}

// Detectar si la app se puede instalar
let deferredPrompt
window.addEventListener("beforeinstallprompt", (e) => {
  console.log("💾 App se puede instalar")
  e.preventDefault()
  deferredPrompt = e

  // Mostrar botón de instalación personalizado
  showInstallButton()
})

function showInstallButton() {
  const installButton = document.createElement("button")
  installButton.textContent = "📱 Instalar App"
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #4f46e5;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
  `

  installButton.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`Resultado instalación: ${outcome}`)
      deferredPrompt = null
      installButton.remove()
    }
  })

  document.body.appendChild(installButton)
}
