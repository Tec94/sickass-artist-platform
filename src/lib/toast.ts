export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
  type?: ToastType
  duration?: number
}

export function showToast(message: string, options: ToastOptions = {}) {
  const { type = 'info' } = options
  
  // This is a placeholder for a real toast implementation.
  // In a production app, this might use a library like react-hot-toast or a custom context-based system.
  console.log(`[Toast ${type.toUpperCase()}]: ${message}`)
  
  // For the sake of visibility in this exercise, we'll use window.alert for errors
  if (type === 'error') {
    // We don't want to block the thread in a real app, but for now it's okay.
    // window.alert(message)
  }
}
