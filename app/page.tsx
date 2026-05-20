'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Step = 'idle' | 'code' | 'connected' | 'controlling'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const ACTIONS = [
  { id: 'play',    label: '▶ Play',    color: '#7c6af7' },
  { id: 'pause',   label: '⏸ Pause',   color: '#4a4a6a' },
  { id: 'restart', label: '↺ Restart', color: '#2a2a4a' },
  { id: 'reload',  label: '⟳ Recargar TV', color: '#b45309' },
]

export default function Home() {
  const [step, setStep] = useState<Step>('idle')
  const [code, setCode] = useState('')
  const [tvUrl, setTvUrl] = useState('')
  const [lastAction, setLastAction] = useState('')

  useEffect(() => {
    if (step !== 'code' || !code) return
    const channel = supabase.channel(`session:${code}`)
    channel
      .on('broadcast', { event: 'tv_ready' }, () => setStep('connected'))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [step, code])

  const handleConnectTV = () => {
    const newCode = generateCode()
    setCode(newCode)
    setTvUrl(`${window.location.origin}/tv`)
    setStep('code')
  }

  const handleSendToTV = async () => {
    await supabase.channel(`session:${code}`).send({
      type: 'broadcast', event: 'show_content', payload: { show: true },
    })
    setStep('controlling')
  }

  const handleAction = async (action: string) => {
    setLastAction(action)
    await supabase.channel(`session:${code}`).send({
      type: 'broadcast', event: 'interaction', payload: { action },
    })
  }

  return (
    <main style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem', gap: '2rem',
      background: 'var(--bg)', fontFamily: 'var(--font-body)',
    }}>

      <div className="animate-fade-in-up" style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: '0.75rem',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--accent)', marginBottom: '8px',
        }}>Fase 1 · Test</p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 8vw, 3rem)',
          fontWeight: 800, color: 'var(--text)', lineHeight: 1.1,
        }}>Cuentos TV</h1>
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
            fontSize: '1rem', color: 'var(--muted)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>En tu TV, abre el navegador y ve a:</p>

          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 24px', textAlign: 'center',
          }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: '1.1rem',
              fontWeight: 700, color: 'var(--text)', letterSpacing: '0.05em',
            }}>{tvUrl}</p>
          </div>

          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '0.9rem', color: 'var(--muted)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>Luego ingresa este código:</p>

          <div style={{ display: 'flex', gap: '12px' }}>
            {code.split('').map((char, i) => (
              <div key={i} style={{
                width: 64, height: 80,
                background: 'var(--surface)', border: '2px solid var(--accent)',
                borderRadius: 12, display: 'flex', alignItems: 'center',
                justifyContent: 'center', boxShadow: '0 0 20px var(--accent-glow)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '2rem',
                  fontWeight: 800, color: 'var(--text)',
                }}>{char}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: '0.85rem' }}>
            <div className="tv-spinner" style={{ width: 16, height: 16 }} />
            Esperando que la TV ingrese el código...
          </div>

          <button onClick={handleConnectTV} style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--muted)', borderRadius: 8, padding: '8px 18px',
            cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8rem',
          }}>↻ Generar nuevo código</button>
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
            }}>TV conectada</span>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            La TV está lista y esperando contenido
          </p>
          <button className="tv-button" onClick={handleSendToTV}>
            ▶ &nbsp; Enviar animación a la TV
          </button>
        </div>
      )}

      {/* CONTROLLING */}
      {step === 'controlling' && (
        <div className="animate-fade-in-up" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '1.5rem', opacity: 0, width: '100%', maxWidth: 320,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="status-dot" />
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              color: '#4ade80', fontSize: '0.9rem',
            }}>Controlando la TV</span>
          </div>

          <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
            Toca un botón para controlar la animación
          </p>

          {/* Botones de control */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            {ACTIONS.map(({ id, label, color }) => (
              <button
                key={id}
                onClick={() => handleAction(id)}
                style={{
                  background: lastAction === id ? color : 'var(--surface)',
                  border: `2px solid ${lastAction === id ? color : 'var(--border)'}`,
                  color: lastAction === id ? 'white' : 'var(--text)',
                  borderRadius: 14,
                  padding: '18px 24px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  letterSpacing: '0.05em',
                  transition: 'all 0.15s ease',
                  boxShadow: lastAction === id ? `0 0 24px ${color}88` : 'none',
                  width: '100%',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Scrubber de posición */}
          <div style={{ width: '100%', marginTop: 8 }}>
            <p style={{
              color: 'var(--muted)', fontSize: '0.75rem',
              marginBottom: 8, fontFamily: 'var(--font-display)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>Posición en la animación</p>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="0"
              style={{ width: '100%', accentColor: 'var(--accent)' }}
              onMouseUp={(e) => handleAction(`seek:${(e.target as HTMLInputElement).value}`)}
              onTouchEnd={(e) => handleAction(`seek:${(e.target as HTMLInputElement).value}`)}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              color: 'var(--muted)', fontSize: '0.7rem', marginTop: 4,
            }}>
              <span>inicio</span><span>fin</span>
            </div>
          </div>

          <button
            onClick={() => setStep('idle')}
            style={{
              marginTop: 8, background: 'transparent',
              border: '1px solid var(--border)', color: 'var(--muted)',
              borderRadius: 8, padding: '8px 18px',
              cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8rem',
            }}
          >
            Nueva sesión
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
