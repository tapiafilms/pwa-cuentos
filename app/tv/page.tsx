'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type TVState = 'waiting' | 'playing'

export default function TVPage() {
  return (
    <Suspense fallback={<div className="tv-page"><div className="tv-spinner" /></div>}>
      <TVPageInner />
    </Suspense>
  )
}

function TVPageInner() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session')
  const [state, setState] = useState<TVState>('waiting')
  const [error, setError] = useState<string>('')
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('Sin sessionId. Escanea el QR desde el celular.')
      return
    }

    // Entra al canal de la sesión
    const channel = supabase.channel(`session:${sessionId}`)
    channelRef.current = channel

    channel
      .on('broadcast', { event: 'show_content' }, () => {
        setState('playing')
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Avisar al celular que la TV está lista
          channel.send({
            type: 'broadcast',
            event: 'tv_ready',
            payload: {},
          })
        }
      })

    // Pantalla fullscreen automática (funciona en muchos browsers de TV)
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {})
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  if (error) {
    return (
      <div className="tv-page">
        <div className="tv-waiting">
          <p style={{ color: '#f87171', fontFamily: 'var(--font-display)' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tv-page">
      {state === 'waiting' && <TVWaiting />}
      {state === 'playing' && <TVPlaying />}
    </div>
  )
}

function TVWaiting() {
  return (
    <div className="tv-waiting">
      <div className="tv-spinner" />
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--muted)',
          letterSpacing: '0.05em',
        }}
      >
        Listo para recibir
      </p>
      <p style={{ fontSize: '0.9rem', color: 'var(--muted)', opacity: 0.5 }}>
        Presiona "Enviar animación" en tu celular
      </p>
    </div>
  )
}

function TVPlaying() {
  const [RiveComponent, setRiveComponent] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    import('@rive-app/react-canvas').then((mod) => {
      const { useRive } = mod

      function RiveInner() {
        const { RiveComponent: RC } = useRive({
          src: '/animation.riv',
          autoplay: true,
        })
        return (
          <RC
            style={{
              width: '100vw',
              height: '100vh',
              display: 'block',
            }}
          />
        )
      }

      setRiveComponent(() => RiveInner)
    })
  }, [])

  if (!RiveComponent) {
    return (
      <div className="tv-waiting">
        <div className="tv-spinner" />
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--muted)' }}>
          Cargando animación...
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#050508',
        animation: 'fade-in-up 0.8s ease forwards',
      }}
    >
      <RiveComponent />
    </div>
  )
}
