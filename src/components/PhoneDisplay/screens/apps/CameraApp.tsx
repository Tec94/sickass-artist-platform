import { useEffect, useRef, useState } from 'react'
import AppScaffold from './AppScaffold'
import { usePhoneOverlay } from '../../PhoneOverlayProvider'

export default function CameraApp() {
  const { locale, setModal } = usePhoneOverlay()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<'idle' | 'ready' | 'denied' | 'unsupported'>('idle')
  const [flashVisible, setFlashVisible] = useState(false)

  useEffect(() => {
    let mounted = true

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (mounted) setStatus('unsupported')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => undefined)
        }
        setStatus('ready')
      } catch {
        if (mounted) setStatus('denied')
      }
    }

    start()

    return () => {
      mounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  const takePhoto = () => {
    if (status !== 'ready') {
      setModal({
        id: 'camera-fallback',
        title: locale === 'es' ? 'Camara no disponible' : 'Camera unavailable',
        body:
          status === 'denied'
            ? locale === 'es'
              ? 'Permiso denegado. Usa la vista fallback por ahora.'
              : 'Permission denied. Use fallback preview for now.'
            : locale === 'es'
              ? 'Preview fallback activo.'
              : 'Fallback preview active.',
      })
      return
    }
    setFlashVisible(true)
    window.setTimeout(() => setFlashVisible(false), 110)
    setModal({
      id: 'camera-capture',
      title: locale === 'es' ? 'Captura guardada (sesion)' : 'Capture saved (session)',
      body: locale === 'es' ? 'Integracion con Galeria Recents se puede ampliar despues.' : 'Recents gallery integration can be expanded later.',
    })
  }

  return (
    <AppScaffold title={locale === 'es' ? 'Camara' : 'Camera'} subtitle={locale === 'es' ? 'Selfie preview' : 'Selfie preview'}>
      <div className="relative h-full">
        <div className="relative h-[360px] overflow-hidden rounded-2xl border border-white/10 bg-black">
          {status === 'ready' ? (
            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
          ) : (
            <>
              <img src="/images/roa profile.jpg" alt="Fallback camera preview" className="h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full border border-white/10 bg-black/50 px-3 py-2 text-xs text-white/90">
                  {status === 'denied'
                    ? locale === 'es'
                      ? 'Permiso denegado'
                      : 'Permission denied'
                    : status === 'unsupported'
                      ? locale === 'es'
                        ? 'Camara no soportada'
                        : 'Camera unsupported'
                      : locale === 'es'
                        ? 'Cargando preview...'
                        : 'Loading preview...'}
                </div>
              </div>
            </>
          )}

          {flashVisible ? <div className="absolute inset-0 bg-white" /> : null}

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/40 px-2 py-1 text-[10px] text-white/90">
              {status === 'ready' ? 'LIVE' : 'FALLBACK'}
            </div>
            <div className="absolute inset-6 rounded-[24px] border border-white/10" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button type="button" className="rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-white">
            <iconify-icon icon="solar:camera-rotate-bold-duotone" width="16" height="16" class="mr-1 align-middle" />
            {locale === 'es' ? 'Flip' : 'Flip'}
          </button>
          <button type="button" className="rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-white">
            <iconify-icon icon="solar:camera-add-bold-duotone" width="16" height="16" class="mr-1 align-middle" />
            1x
          </button>
          <button type="button" className="rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-white" onClick={takePhoto}>
            <iconify-icon icon="solar:gallery-send-bold-duotone" width="16" height="16" class="mr-1 align-middle" />
            {locale === 'es' ? 'Capturar' : 'Capture'}
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <button type="button" className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/70 bg-white/20" onClick={takePhoto} aria-label={locale === 'es' ? 'Tomar foto' : 'Take photo'}>
            <span className="h-11 w-11 rounded-full bg-white" />
          </button>
        </div>
      </div>
    </AppScaffold>
  )
}

