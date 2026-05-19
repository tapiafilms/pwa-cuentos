'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Step = 'idle' | 'code' | 'connected' | 'sent'

// Genera código de 4 letras mayúsculas: ej. "K7MX"
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function Home() {
  const [step, setStep] = useState<Step>('idle')
  const [code, setCode] = useState<string>('')
  const [tvUrl, setTvUrl] = useState<string>('')

  useEffect(() => {
    if (step !== 'code' || !code) return

    const channel = supabase.channel(`session:${code}`)

    channel
      .on('broadcast', { event: 'tv_ready' }, () => {
        setStep('connected')
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [step, code])

  const handleConnectTV = () => {
    const newCode = generateCode()
    setCode(newCode)
    setTvUrl(`${window.location.origin}/tv`)
    setStep('code')
  }

  const handleSendToTV = async () => {
    if (!code) return
    await supabase.channel(`session:${code}`).send({
      type: 'broadcast',
      event: 'show_content',
      payload: { show: true },
    })
    setStep('sent')
  }

  return (
    <main style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      gap: '2rem',
      background: 'var(--bg)',
      fontFamily: 'var(--font-body)',
    }}>

      {/* Header */}
      <div className="animate-fade-in-up" style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.75rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: '8px',
        }}>
          Fase 1 · Test
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 8vw, 3rem)',
          fontWeight: 800,
          color: 'var(--text)',
          lineHeight: 1.1,
        }}>
          Cuentos TV
        </h1>
      </div>

      {/* IDLE */}
      {step === 'idle' && (
        <div className="animate-fade-in-up" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '2rem', opacity: 0, animationDelay: '0.15s',
        }}>
          <div className="animate-float" style={{
            width: 200, height: 200, borderRadius: 24,
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <RivePreview />
          </div>

          <button className="tv-button" onClick={handleConnectTV}>
            📺 &nbsp; Ver en TV
          </button>

          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', maxWidth: 260 }}>
            Presiona para obtener un código y conectar tu televisor
          </p>
        </div>
      )}

      {/* CODE */}
      {step === 'code' && (
        <div className="animate-fade-in-up" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '1.5rem', opacity: 0,
        }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '1rem', color: 'var(--muted)', letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            En tu TV, abre el navegador y ve a:
          </p>

          {/* URL de la TV */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '14px 24px',
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '0.05em',
            }}>
              {tvUrl}
            </p>
          </div>

          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '0.9rem', color: 'var(--muted)', letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Luego ingresa este código:
          </p>

          {/* Código grande */}
          <div style={{
            display: 'flex',
            gap: '12px',
          }}>
            {code.split('').map((char, i) => (
              <div key={i} style={{
                width: 64,
                height: 80,
                background: 'var(--surface)',
                border: '2px solid var(--accent)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px var(--accent-glow)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--text)',
                  letterSpacing: 0,
                }}>
                  {char}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--muted)', fontSize: '0.85rem',
          }}>
            <div className="tv-spinner" style={{ width: 16, height: 16 }} />
            Esperando que la TV ingrese el código...
          </div>

          <button
            onClick={handleConnectTV}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              borderRadius: 8,
              padding: '8px 18px',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
            }}
          >
            ↻ Generar nuevo código
          </button>
        </div>
      )}

      {/* CONNECTED */}
      {step === 'connected' && (
        <div className="animate-fade-in-up" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '1.5rem', opacity: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            borderRadius: 12, padding: '10px 20px',
          }}>
            <div className="status-dot" />
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              color: '#4ade80', fontSize: '0.9rem',
            }}>
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

      {/* SENT */}
      {step === 'sent' && (
        <div className="animate-fade-in-up" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '1rem', opacity: 0,
        }}>
          <div style={{ fontSize: '3rem' }}>🎉</div>
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '1.2rem', color: 'var(--text)',
          }}>
            ¡Funcionó!
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center' }}>
            La animación Rive está reproduciéndose en tu TV
          </p>
          <button
            style={{
              marginTop: 8, background: 'transparent',
              border: '1px solid var(--border)', color: 'var(--muted)',
              borderRadius: 8, padding: '10px 20px', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.85rem',
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

function RivePreview() {
  const [RiveComponent, setRiveComponent] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    import('@rive-app/react-canvas').then((mod) => {
      const { useRive } = mod
      function Inner() {
        const { RiveComponent: RC } = useRive({ src: '/animation.riv', autoplay: true })
        return <RC style={{ width: '100%', height: '100%' }} />
      }
      setRiveComponent(() => Inner)
    })
  }, [])

  if (!RiveComponent) return <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Cargando...</div>
  return <RiveComponent />
}
