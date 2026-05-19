'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '@/lib/supabase'

type Step = 'idle' | 'qr' | 'connected' | 'sent'

export default function Home() {
  const [step, setStep] = useState<Step>('idle')
  const [sessionId, setSessionId] = useState<string>('')
  const [tvUrl, setTvUrl] = useState<string>('')

  useEffect(() => {
    if (step !== 'qr' || !sessionId) return

    // Escucha cuando la TV se conecta
    const channel = supabase.channel(`session:${sessionId}`)

    channel
      .on('broadcast', { event: 'tv_ready' }, () => {
        setStep('connected')
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [step, sessionId])

  const handleConnectTV = () => {
    const id = uuidv4()
    setSessionId(id)
    const baseUrl = window.location.origin
    setTvUrl(`${baseUrl}/tv?session=${id}`)
    setStep('qr')
  }

  const handleSendToTV = async () => {
    if (!sessionId) return

    await supabase.channel(`session:${sessionId}`).send({
      type: 'broadcast',
      event: 'show_content',
      payload: { show: true },
    })

    setStep('sent')
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '2rem',
        background: 'var(--bg)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Header */}
      <div
        className="animate-fade-in-up"
        style={{ textAlign: 'center', animationDelay: '0s' }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '8px',
          }}
        >
          Fase 1 · Test
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 8vw, 3rem)',
            fontWeight: 800,
            color: 'var(--text)',
            lineHeight: 1.1,
          }}
        >
          Cuentos TV
        </h1>
      </div>

      {/* Estado IDLE */}
      {step === 'idle' && (
        <div
          className="animate-fade-in-up"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            animationDelay: '0.15s',
            opacity: 0,
          }}
        >
          {/* Preview de la animación */}
          <div
            className="animate-float"
            style={{
              width: 200,
              height: 200,
              borderRadius: 24,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <RivePreview />
          </div>

          <button className="tv-button" onClick={handleConnectTV}>
            📺 &nbsp; Ver en TV
          </button>

          <p
            style={{
              color: 'var(--muted)',
              fontSize: '0.85rem',
              textAlign: 'center',
              maxWidth: 260,
            }}
          >
            Presiona el botón para generar un código QR y conectar tu televisor
          </p>
        </div>
      )}

      {/* Estado QR */}
      {step === 'qr' && (
        <div
          className="animate-fade-in-up"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            opacity: 0,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'var(--text)',
            }}
          >
            Escanea desde tu TV
          </p>

          <div className="qr-container">
            <QRCodeSVG
              value={tvUrl}
              size={220}
              level="H"
              includeMargin={false}
            />
          </div>

          <p
            style={{
              color: 'var(--muted)',
              fontSize: '0.75rem',
              textAlign: 'center',
              maxWidth: 280,
              wordBreak: 'break-all',
            }}
          >
            {tvUrl}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--muted)',
              fontSize: '0.85rem',
            }}
          >
            <div className="tv-spinner" style={{ width: 16, height: 16 }} />
            Esperando conexión de la TV...
          </div>
        </div>
      )}

      {/* Estado CONNECTED */}
      {step === 'connected' && (
        <div
          className="animate-fade-in-up"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            opacity: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(74, 222, 128, 0.1)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              borderRadius: 12,
              padding: '10px 20px',
            }}
          >
            <div className="status-dot" />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: '#4ade80',
                fontSize: '0.9rem',
              }}
            >
              TV conectada
            </span>
          </div>

          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            La TV está lista y esperando contenido
          </p>

          <button className="tv-button" onClick={handleSendToTV}>
            ▶ &nbsp; Enviar animación a la TV
          </button>
        </div>
      )}

      {/* Estado SENT */}
      {step === 'sent' && (
        <div
          className="animate-fade-in-up"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            opacity: 0,
          }}
        >
          <div style={{ fontSize: '3rem' }}>🎉</div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.2rem',
              color: 'var(--text)',
            }}
          >
            ¡Funcionó!
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center' }}>
            La animación Rive está reproduciéndose en tu TV
          </p>
          <button
            style={{
              marginTop: 8,
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              borderRadius: 8,
              padding: '10px 20px',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
            }}
            onClick={() => setStep('idle')}
          >
            Volver al inicio
          </button>
        </div>
      )}
    </main>
  )
}

// Preview mínima de la animación Rive
function RivePreview() {
  const [RiveComponent, setRiveComponent] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    import('@rive-app/react-canvas').then((mod) => {
      const { useRive } = mod

      function Inner() {
        const { RiveComponent: RC } = useRive({
          src: '/animation.riv',
          autoplay: true,
        })
        return <RC style={{ width: '100%', height: '100%' }} />
      }

      setRiveComponent(() => Inner)
    })
  }, [])

  if (!RiveComponent) {
    return (
      <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
        Cargando...
      </div>
    )
  }

  return <RiveComponent />
}
