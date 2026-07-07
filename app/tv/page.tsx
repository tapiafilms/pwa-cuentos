'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Rive, { useRive } from '@rive-app/react-canvas'
import { QRCodeSVG } from 'qrcode.react'

export default function TVPage() {
  return (
    <Suspense fallback={<div className="tv-page"><div className="tv-spinner" /></div>}>
      <TVPageInner />
    </Suspense>
  )
}

type TVState = 'input' | 'connecting' | 'waiting' | 'playing'

type CuentoInfo = {
  cuentoId: number
  title: string
  emoji: string
  glow: string
  accent: string
  bgImage?: string
}

type RemoteState = {
  started: boolean
  currentPara: number
  text: string
  showBifurcation: boolean
  bifurcationQuestion: string
  optionALabel: string
  optionBLabel: string
  bifurcationSelected: 'A' | 'B' | null
  ending: boolean
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function TVPageInner() {
  const searchParams = useSearchParams()
  const sessionParam = searchParams.get('session')

  const [tvCode] = useState(() => generateCode())

  const [state, setState] = useState<TVState>('input')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  
  const [activeCuento, setActiveCuento] = useState<CuentoInfo | null>(null)
  const [remoteState, setRemoteState] = useState<RemoteState | null>(null)
  const [lastAction, setLastAction] = useState<string | null>(null)
  
  // Estado para la respuesta de la Inteligencia Artificial
  const [aiResponse, setAiResponse] = useState<{ question: string; answer: string } | null>(null)

  // Escuchar la sesión autogenerada de la TV para conectarse rápido vía QR
  useEffect(() => {
    if (state === 'input') {
      const channel = supabase.channel(`session:${tvCode}`)
      channel
        .on('broadcast', { event: 'tv_ready' }, () => {
          setState('waiting')
        })
        .on('broadcast', { event: 'show_content' }, ({ payload }) => {
          setActiveCuento(payload)
          setState('playing')
          setAiResponse(null)
        })
        .on('broadcast', { event: 'sync_state' }, ({ payload }) => {
          setRemoteState(payload)
          setAiResponse(null)
        })
        .on('broadcast', { event: 'interaction' }, ({ payload }) => {
          setLastAction(payload.action)
          setTimeout(() => setLastAction(null), 1500)
        })
        .on('broadcast', { event: 'character_response' }, ({ payload }) => {
          if (payload.clear) {
            setAiResponse(null)
          } else {
            setAiResponse(payload)
          }
        })
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }, [tvCode, state])

  // Autoconexión si el parámetro de sesión existe en la URL
  useEffect(() => {
    if (sessionParam && sessionParam.trim().length === 4 && state === 'input') {
      const codeVal = sessionParam.trim().toUpperCase()
      setCode(codeVal)
      connectSession(codeVal)
    }
  }, [sessionParam, state])

  const connectSession = (sessionCode: string) => {
    const trimmed = sessionCode.trim().toUpperCase()
    if (trimmed.length !== 4) {
      setError('El código debe tener 4 caracteres')
      return
    }
    setError('')
    setState('connecting')

    const channel = supabase.channel(`session:${trimmed}`)
    channel
      .on('broadcast', { event: 'show_content' }, ({ payload }) => {
        setActiveCuento(payload)
        setState('playing')
        setAiResponse(null) // resetear chat
      })
      .on('broadcast', { event: 'sync_state' }, ({ payload }) => {
        setRemoteState(payload)
        // Ocultar globo de IA al avanzar de párrafo o bifurcar
        setAiResponse(null)
      })
      .on('broadcast', { event: 'interaction' }, ({ payload }) => {
        setLastAction(payload.action)
        // Limpiar la acción después de un corto tiempo para permitir volver a dispararla
        setTimeout(() => setLastAction(null), 1500)
      })
      .on('broadcast', { event: 'character_response' }, ({ payload }) => {
        if (payload.clear) {
          setAiResponse(null)
        } else {
          setAiResponse(payload)
        }
      })
      .subscribe((status, err) => {
        console.log('Realtime subscription status:', status, err)
        if (status === 'SUBSCRIBED') {
          // Avisarle al celular que la TV está lista
          channel.send({ type: 'broadcast', event: 'tv_ready', payload: {} })
          setState('waiting')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setState('input')
          setError(`Error al conectar con los servidores Realtime (${status})`)
          if (err) {
            console.error('Realtime connection error:', err)
          }
        }
      })

    // Intentar pasar a pantalla completa automáticamente si es posible
    if (typeof document !== 'undefined' && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }

  const handleConnect = () => {
    connectSession(code)
  }

  return (
    <div className="tv-page">
      <style>{`
        :root {
          --font-display: 'Cinzel', serif;
          --font-body: 'Nunito', sans-serif;
        }
        
        .tv-page {
          background: #050508;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .tv-card-glow {
          box-shadow: 0 0 50px rgba(124, 106, 247, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(15, 15, 25, 0.6);
          backdrop-filter: blur(20px);
          border-radius: 24px;
        }

        @keyframes floatCharacter {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .char-float {
          animation: floatCharacter 6s ease-in-out infinite;
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.15); }
        }

        .tv-title-glow {
          font-family: 'Cinzel', serif;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%);
          WebkitBackgroundClip: 'text';
          WebkitTextFillColor: 'transparent';
        }

        @keyframes bubbleAppear {
          0% { opacity: 0; transform: translate(-50%, 20px) scale(0.9); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
      `}</style>

      {state === 'input' && (
        <TVInput code={code} setCode={setCode} onConnect={handleConnect} error={error} tvCode={tvCode} />
      )}
      {state === 'connecting' && (
        <TVSpinner label="Conectando sesión Supabase..." />
      )}
      {state === 'waiting' && (
        <TVWaiting code={code} />
      )}
      {state === 'playing' && (
        <TVPlaying cuento={activeCuento} remoteState={remoteState} lastAction={lastAction} aiResponse={aiResponse} />
      )}
    </div>
  )
}

function TVInput({ code, setCode, onConnect, error, tvCode }: {
  code: string; setCode: (v: string) => void; onConnect: () => void; error: string; tvCode: string
}) {
  const phoneUrl = typeof window !== 'undefined' ? `${window.location.origin}/?session=${tvCode}` : ''

  return (
    <div className="tv-card-glow" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem', padding: '3.5rem', maxWidth: 880, width: '95%' }}>
      {/* Cabecera */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Nunito', fontSize: '0.9rem',
          letterSpacing: '0.3em', textTransform: 'uppercase',
          color: '#7c6af7', marginBottom: 12, fontWeight: 800
        }}>CuentaJoy Portal TV</p>
        <h1 style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '2.2rem',
          fontWeight: 800, color: 'white', lineHeight: 1.1,
          letterSpacing: '0.02em'
        }}>PANTALLA DE PROYECCIÓN (TV)</h1>
        <p style={{ color: '#7a7a9a', marginTop: 10, fontSize: '1rem' }}>
          Conecta tu celular como Control Remoto para elegir e interactuar con los cuentos
        </p>
      </div>

      {/* Contenido dividido en 2 columnas */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '3rem', width: '100%', alignItems: 'stretch', justifyContent: 'center', flexWrap: 'wrap' }}>
        
        {/* COLUMNA IZQUIERDA: Código QR (Flujo sugerido) */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: '2rem' }}>
          <h3 style={{ fontFamily: 'Nunito', fontSize: '0.95rem', fontWeight: 800, color: '#4ade80', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Opción A: Conectar Celular (Fácil) 📱
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#7a7a9a', textAlign: 'center', lineHeight: 1.5 }}>
            Abre la cámara de tu celular y <strong>escanea este código QR</strong>. Tu teléfono se conectará y servirá como el Control Remoto.
          </p>
          <div style={{
            background: 'white',
            padding: '12px',
            borderRadius: '16px',
            boxShadow: '0 0 35px rgba(124, 106, 247, 0.25)',
            border: '2px solid #7c6af7'
          }}>
            <QRCodeSVG value={phoneUrl} size={150} />
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 12px', fontSize: '0.72rem', color: '#7a7a9a', fontFamily: 'monospace' }}>
            {phoneUrl}
          </div>
        </div>

        {/* COLUMNA DERECHA: Conexión Manual */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', justifyContent: 'center' }}>
          <h3 style={{ fontFamily: 'Nunito', fontSize: '0.95rem', fontWeight: 800, color: '#7c6af7', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Opción B: Código Manual ⌨️
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#7a7a9a', textAlign: 'center', lineHeight: 1.5 }}>
            Si abriste la PWA en tu celular primero y generaste un código de TV, <strong>ingrésalo aquí abajo</strong> para conectar esta pantalla.
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
            onKeyDown={(e) => e.key === 'Enter' && onConnect()}
            placeholder="CÓDIGO"
            maxLength={4}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: `2px solid ${error ? '#f87171' : '#7c6af7'}`,
              borderRadius: 16, color: 'white',
              fontFamily: 'Cinzel, serif',
              fontSize: '2.4rem',
              fontWeight: 800, letterSpacing: '0.25em',
              textAlign: 'center',
              width: '220px',
              padding: '10px 14px', outline: 'none',
              boxShadow: '0 0 30px rgba(124, 106, 247, 0.1)',
              textTransform: 'uppercase',
            }}
          />
          {error && (
            <p style={{ color: '#f87171', fontSize: '0.85rem', fontFamily: 'Nunito', fontWeight: 600 }}>{error}</p>
          )}
          <button
            className="tv-button"
            onClick={onConnect}
            style={{ fontSize: '0.95rem', padding: '12px 36px', fontFamily: 'Nunito', letterSpacing: '0.05em', borderRadius: 10 }}
          >
            CONECTAR
          </button>
        </div>

      </div>
    </div>
  )
}

function TVSpinner({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div className="tv-spinner" style={{ width: 64, height: 64, borderWidth: 3 }} />
      <p style={{ fontFamily: 'Nunito', fontSize: '1.4rem', fontWeight: 700, color: '#7a7a9a', letterSpacing: '0.05em' }}>
        {label}
      </p>
    </div>
  )
}

function TVWaiting({ code }: { code: string }) {
  return (
    <div className="tv-card-glow" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem', padding: '4rem', maxWidth: 640, width: '90%', textAlign: 'center' }}>
      <div className="tv-spinner" style={{ width: 80, height: 80, borderWidth: 4 }} />
      <div>
        <h2 style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '2.4rem',
          fontWeight: 700, color: 'white', letterSpacing: '0.05em',
          marginBottom: 8
        }}>Portal de Proyección Listo</h2>
        <p style={{ fontSize: '1.15rem', color: '#7a7a9a', lineHeight: 1.6 }}>
          Conectado con éxito al canal de sesión <strong style={{ color: '#7c6af7', fontSize: '1.25rem' }}>{code}</strong>.<br />
          Elige un cuento en el celular y presiona "Enviar cuento".
        </p>
      </div>
    </div>
  )
}

function RiveCharacter({ action }: { action: string | null }) {
  const { rive, RiveComponent } = useRive({
    src: '/animation.riv',
    autoplay: true,
  })

  useEffect(() => {
    if (rive && action) {
      if (rive.animationNames.includes(action)) {
        rive.play(action)
      } else {
        rive.play()
      }
    }
  }, [rive, action])

  return <RiveComponent style={{ width: '100%', height: '100%', minHeight: 400 }} />
}

function TVPlaying({ cuento, remoteState, lastAction, aiResponse }: {
  cuento: CuentoInfo | null
  remoteState: RemoteState | null
  lastAction: string | null
  aiResponse: { question: string; answer: string } | null
}) {
  if (!cuento) return null

  // Si no ha empezado la lectura en el control remoto
  const hasStarted = remoteState?.started ?? false

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#040407',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'row',
    }}>
      {/* Resplandor de fondo radial del cuento */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at 30% 50%, ${cuento.glow}15 0%, transparent 65%)`,
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* Partículas de ambiente del cuento */}
      <BackgroundAmbientEffects cuentoId={cuento.cuentoId} glow={cuento.glow} />

      {/* COLUMNA IZQUIERDA: Personaje Rive y Globo de Diálogo de la IA */}
      <div style={{
        flex: '0 0 45%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 5,
        borderRight: '1px solid rgba(255,255,255,0.03)'
      }}>
        {/* Halo de luz del portal */}
        <div style={{
          position: 'absolute',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${cuento.glow}1f 0%, ${cuento.glow}04 60%, transparent 70%)`,
          boxShadow: `0 0 100px ${cuento.glow}08`,
          animation: 'pulseGlow 8s ease-in-out infinite',
          zIndex: 1
        }} />

        {/* Globo de diálogo flotante (IA) */}
        {aiResponse && aiResponse.answer && (
          <div style={{
            position: 'absolute',
            top: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '85%',
            maxWidth: '380px',
            background: 'rgba(15, 15, 23, 0.95)',
            border: `1.5px solid ${cuento.glow}`,
            borderRadius: '24px',
            padding: '1.25rem 1.5rem',
            boxShadow: `0 15px 40px rgba(0,0,0,0.6), 0 0 25px ${cuento.glow}44`,
            zIndex: 20,
            animation: 'bubbleAppear 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            {/* Colita del globo */}
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '18px',
              height: '18px',
              background: 'rgba(15, 15, 23, 0.95)',
              borderBottom: `1.5px solid ${cuento.glow}`,
              borderRight: `1.5px solid ${cuento.glow}`,
              zIndex: -1
            }} />
            
            {/* Pregunta del niño */}
            <p style={{
              fontFamily: 'Nunito',
              fontSize: '0.85rem',
              fontStyle: 'italic',
              color: cuento.accent,
              opacity: 0.85,
              textAlign: 'center',
              lineHeight: 1.3
            }}>
              Pregunta: "{aiResponse.question}"
            </p>
            
            {/* Respuesta del Personaje */}
            <p style={{
              fontFamily: 'Nunito',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.45
            }}>
              {aiResponse.answer}
            </p>
          </div>
        )}

        <div className="char-float" style={{ width: '100%', height: '80%', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Suspense fallback={<div className="tv-spinner" />}>
            <RiveCharacter action={lastAction} />
          </Suspense>
        </div>
      </div>

      {/* COLUMNA DERECHA: Texto del cuento */}
      <div style={{
        flex: '1',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '5rem 6rem 5rem 4rem',
        position: 'relative',
        zIndex: 5,
        background: 'linear-gradient(to right, rgba(4,4,7,0) 0%, rgba(4,4,7,0.7) 100%)'
      }}>
        
        {!hasStarted ? (
          <div style={{
            animation: 'fade-in-up 1s ease forwards',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>
            <span style={{
              fontFamily: 'Nunito', fontSize: '1.1rem',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: cuento.accent, fontWeight: 700
            }}>
              {cuento.emoji} Listo para Proyección
            </span>
            <h1 className="tv-title-glow" style={{
              fontSize: '4.8rem',
              lineHeight: 1.1,
              fontWeight: 800,
              margin: '10px 0'
            }}>
              {cuento.title}
            </h1>
            <p style={{
              fontFamily: 'Nunito', fontSize: '1.4rem',
              color: '#7a7a9a', maxWidth: '640px', lineHeight: 1.6
            }}>
              El narrador tiene el control remoto en su teléfono. Prepárate para entrar en la historia viva.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100%',
            gap: '2rem'
          }}>
            
            {/* Cabecera del Cuento Activo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '2.5rem' }}>{cuento.emoji}</span>
              <div>
                <h3 className="tv-title-glow" style={{ fontSize: '1.8rem', fontWeight: 700 }}>
                  {cuento.title}
                </h3>
              </div>
            </div>

            {/* Separador elegante */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${cuento.glow}44, transparent)` }} />
              <span style={{ color: cuento.accent, fontSize: '1.2rem' }}>✦</span>
              <div style={{ flex: 2, height: 1, background: `linear-gradient(to left, ${cuento.glow}44, transparent)` }} />
            </div>

            {/* Caja del Párrafo Proyectado con animación al cambiar de texto */}
            <div 
              key={remoteState?.text}
              style={{
                animation: 'fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                minHeight: 280,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              
              {/* Texto Bifurcación (Pregunta al público) */}
              {remoteState?.showBifurcation && !remoteState.bifurcationSelected && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  <p style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '2.5rem',
                    lineHeight: 1.4,
                    color: '#ffd54f',
                    fontWeight: 600,
                    textShadow: '0 0 20px rgba(255,213,79,0.3)'
                  }}>
                    {remoteState.bifurcationQuestion}
                  </p>
                  
                  {/* Opciones en TV */}
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{
                      flex: 1, background: 'rgba(255,255,255,0.03)',
                      border: '1px dashed rgba(255,255,255,0.15)',
                      borderRadius: 16, padding: '20px 24px',
                      fontFamily: 'Nunito', fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)',
                      display: 'flex', alignItems: 'center', gap: 12
                    }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: cuento.glow }} />
                      <span>{remoteState.optionALabel}</span>
                    </div>
                    <div style={{
                      flex: 1, background: 'rgba(255,255,255,0.03)',
                      border: '1px dashed rgba(255,255,255,0.15)',
                      borderRadius: 16, padding: '20px 24px',
                      fontFamily: 'Nunito', fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)',
                      display: 'flex', alignItems: 'center', gap: 12
                    }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: cuento.accent }} />
                      <span>{remoteState.optionBLabel}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Párrafo de Lectura estándar o Bifurcación Seleccionada */}
              {(!remoteState?.showBifurcation || remoteState.bifurcationSelected) && (
                <p style={{
                  fontFamily: 'Nunito',
                  fontSize: '2.1rem',
                  lineHeight: 1.7,
                  color: 'white',
                  fontWeight: 500,
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                }}>
                  {remoteState?.text}
                </p>
              )}

              {/* Decoración Final de Cuento */}
              {remoteState?.ending && (
                <div style={{
                  marginTop: '2rem', display: 'flex',
                  alignItems: 'center', gap: 8, color: '#ffd54f',
                  fontFamily: 'Cinzel', fontSize: '1.2rem', fontWeight: 600,
                  animation: 'fade-in-up 1s ease 0.5s both'
                }}>
                  <span>Fin de la historia</span>
                  <span>✦</span>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  )
}

function BackgroundAmbientEffects({ cuentoId, glow }: { cuentoId: number; glow: string }) {
  // Generar efectos basados en el cuento seleccionado
  const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number; size: number; delay: number; duration: number }>>([])

  useEffect(() => {
    const list = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 5,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 10
    }))
    setParticles(list)
  }, [cuentoId])

  let animName = 'pulse'
  let color = glow

  if (cuentoId === 1) { // Bosque
    animName = 'floatUp'
    color = '#52b788'
  } else if (cuentoId === 2) { // Ballena
    animName = 'floatUpSlow'
    color = '#90caf9'
  } else if (cuentoId === 3) { // Reloj
    animName = 'floatSway'
    color = '#ffb74d'
  } else if (cuentoId === 4) { // Niebla
    animName = 'fogDrift'
    color = '#ce93d8'
  } else if (cuentoId === 5) { // Estrellas
    animName = 'shootingStar'
    color = '#ffffff'
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 2 }}>
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(105vh) scale(1); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-10vh) scale(1.5); opacity: 0; }
        }
        @keyframes floatUpSlow {
          0% { transform: translateY(105vh) translateX(0); opacity: 0; }
          15% { opacity: 0.5; }
          85% { opacity: 0.5; }
          100% { transform: translateY(-10vh) translateX(30px); opacity: 0; }
        }
        @keyframes floatSway {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(30px, -40px) scale(1.3); opacity: 0.7; }
        }
        @keyframes fogDrift {
          0%, 100% { transform: translate(0, 0); opacity: 0.2; }
          50% { transform: translate(-40px, 20px); opacity: 0.4; }
        }
      `}</style>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
            opacity: 0.6,
            animation: `${animName} ${p.duration}s ease-in-out ${p.delay}s infinite`
          }}
        />
      ))}
    </div>
  )
}