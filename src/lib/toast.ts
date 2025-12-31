type ToastAction = {
  label: string
  onClick: () => void
}

interface ToastOptions {
  action?: ToastAction
  durationMs?: number
}

const CONTAINER_ID = 'app-toast-container'

function getContainer(): HTMLDivElement {
  const existing = document.getElementById(CONTAINER_ID)
  if (existing && existing instanceof HTMLDivElement) return existing

  const container = document.createElement('div')
  container.id = CONTAINER_ID
  container.style.position = 'fixed'
  container.style.right = '16px'
  container.style.bottom = '16px'
  container.style.display = 'flex'
  container.style.flexDirection = 'column'
  container.style.gap = '8px'
  container.style.zIndex = '9999'
  document.body.appendChild(container)
  return container
}

export function showToast(message: string, options: ToastOptions = {}) {
  if (typeof document === 'undefined') return

  const container = getContainer()
  const toast = document.createElement('div')

  toast.style.display = 'flex'
  toast.style.alignItems = 'center'
  toast.style.gap = '12px'
  toast.style.padding = '10px 12px'
  toast.style.borderRadius = '10px'
  toast.style.background = 'rgba(17, 24, 39, 0.95)'
  toast.style.border = '1px solid rgba(55, 65, 81, 0.8)'
  toast.style.color = 'white'
  toast.style.boxShadow = '0 10px 15px rgba(0,0,0,0.25)'
  toast.style.maxWidth = '360px'

  const text = document.createElement('div')
  text.textContent = message
  text.style.fontSize = '13px'
  text.style.lineHeight = '18px'
  text.style.flex = '1'
  toast.appendChild(text)

  if (options.action) {
    const actionButton = document.createElement('button')
    actionButton.textContent = options.action.label
    actionButton.style.fontSize = '13px'
    actionButton.style.fontWeight = '600'
    actionButton.style.color = '#00D9FF'
    actionButton.style.background = 'transparent'
    actionButton.style.border = 'none'
    actionButton.style.cursor = 'pointer'
    actionButton.onclick = () => {
      options.action?.onClick()
      toast.remove()
    }
    toast.appendChild(actionButton)
  }

  const closeButton = document.createElement('button')
  closeButton.textContent = '×'
  closeButton.setAttribute('aria-label', 'Dismiss')
  closeButton.style.fontSize = '16px'
  closeButton.style.lineHeight = '16px'
  closeButton.style.color = 'rgba(209, 213, 219, 0.8)'
  closeButton.style.background = 'transparent'
  closeButton.style.border = 'none'
  closeButton.style.cursor = 'pointer'
  closeButton.onclick = () => toast.remove()
  toast.appendChild(closeButton)

  container.appendChild(toast)

  const durationMs = options.durationMs ?? 4000
  window.setTimeout(() => {
    toast.remove()
  }, durationMs)
}
