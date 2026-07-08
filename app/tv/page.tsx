'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Rive, { useRive } from '@rive-app/react-canvas'

export default function TVPage() {
  return (
    <Suspense fallback={<div className="tv-page"><div className="tv-spinner" /></div>}>
      <TVPageInner />
    </Suspense>
  )
}

type TVState = 'connecting' | 'waiting_remote' | 'waiting_cuento' | 'playing'

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

// Generador de códigos aleatorios de 4 caracteres
const generateRandomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Evitar caracteres ambiguos como O, I, 1, 0
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function TVPageInner() {
  const searchParams = useSearchParams()
  const sessionParam = searchParams.get('session')

  const [state, setState] = useState<TVState>('connecting')
  
  // Generar o recuperar el código de sesión
  const [tvCode, setTvCode] = useState<string>('')
  
  const [activeCuento, setActiveCuento] = useState<CuentoInfo | null>(null)
  const [remoteState, setRemoteState] = useState<RemoteState | null>(null)
  const [lastAction, setLastAction] = useState<string | null>(null)
  
  // Estado para la respuesta de la Inteligencia Artificial
  const [aiResponse, setAiResponse] = useState<{ question: string; answer: string } | null>(null)

  // Capa de transición cinematográfica (fundido a negro)
  const [isFading, setIsFading] = useState(false)

  // Transición suave entre pantallas
  const transitionTo = (newState: TVState, callback?: () => void) => {
    setIsFading(true)
    setTimeout(() => {
      setState(newState)
      if (callback) callback()
      setTimeout(() => {
        setIsFading(false)
      }, 50)
    }, 600)
  }

  // Configuración del canal de comunicación Realtime en la TV
  useEffect(() => {
    // 1. Determinar el código a usar
    let codeVal = ''
    if (sessionParam && sessionParam.trim().length === 4) {
      codeVal = sessionParam.trim().toUpperCase()
    } else {
      codeVal = generateRandomCode()
    }
    setTvCode(codeVal)

    // 2. Conectar al canal
    const channel = supabase.channel(`session:${codeVal}`)
    channel
      .on('broadcast', { event: 'tv_ready' }, () => {
        // El celular se enlazó
        transitionTo('waiting_cuento')
      })
      .on('broadcast', { event: 'show_content' }, ({ payload }) => {
        setActiveCuento(payload)
        transitionTo('playing')
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
      .on('broadcast', { event: 'show_waiting' }, () => {
        transitionTo('waiting_cuento', () => {
          setActiveCuento(null)
          setRemoteState(null)
          setAiResponse(null)
        })
      })
      .subscribe((status, err) => {
        console.log('TV Realtime subscription status:', status, err)
        if (status === 'SUBSCRIBED') {
          // Si iniciamos con un session param, significa que ya estaba enlazado
          if (sessionParam) {
            setState('waiting_cuento')
          } else {
            setState('waiting_remote')
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          if (err) {
            console.error('TV Realtime connection error:', err)
          }
        }
      })

    // Intentar pasar a pantalla completa automáticamente
    if (typeof document !== 'undefined' && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {})
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionParam])

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

        .cinematic-fade-overlay {
          position: fixed;
          inset: 0;
          background: #050508;
          z-index: 9999;
          pointer-events: none;
          transition: opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1);
          opacity: 0;
        }
        .cinematic-fade-overlay.active {
          opacity: 1;
        }
      `}</style>

      {state === 'connecting' && (
        <TVSpinner label="Inicializando canal de TV..." />
      )}
      {state === 'waiting_remote' && (
        <TVWaitingRemote code={tvCode} />
      )}
      {state === 'waiting_cuento' && (
        <TVWaitingCuento code={tvCode} />
      )}
      {state === 'playing' && (
        <TVPlaying cuento={activeCuento} remoteState={remoteState} lastAction={lastAction} aiResponse={aiResponse} />
      )}

      {/* Capa de transición cinematográfica (Dissolve) */}
      <div className={`cinematic-fade-overlay ${isFading ? 'active' : ''}`} />
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

function TVWaitingRemote({ code }: { code: string }) {
  return (
    <div className="tv-card-glow" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem', padding: '4rem', maxWidth: 680, width: '90%', textAlign: 'center',
      animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Nunito', fontSize: '0.9rem',
          letterSpacing: '0.3em', textTransform: 'uppercase',
          color: '#7c6af7', marginBottom: 12, fontWeight: 800
        }}>CuentaJoy Portal TV</p>
        <h1 style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '2.4rem',
          fontWeight: 800, color: 'white', lineHeight: 1.1,
          letterSpacing: '0.02em'
        }}>PANTALLA DE PROYECCIÓN</h1>
        <p style={{ color: '#7a7a9a', marginTop: 12, fontSize: '1.15rem', fontFamily: 'Nunito' }}>
          Para conectar tu control remoto, ingresa este código en tu celular:
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        {code.split('').map((char, i) => (
          <div key={i} style={{
            width: '80px', height: '96px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '2px solid #7c6af7',
            borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Cinzel, serif',
            fontSize: '3.2rem',
            fontWeight: 800, color: 'white',
            boxShadow: '0 0 35px rgba(124, 106, 247, 0.25)',
            textTransform: 'uppercase'
          }}>
            {char}
          </div>
        ))}
      </div>
      
      <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'Nunito', letterSpacing: '0.05em' }}>
        Esperando que escanees o entres al catálogo...
      </p>
    </div>
  )
}

function TVWaitingCuento({ code }: { code: string }) {
  return (
    <div className="tv-card-glow" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '4rem', maxWidth: 720, width: '90%', textAlign: 'center',
      animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-cuentajoy.png" alt="CuentaJoy" style={{ width: 'clamp(280px, 40vw, 440px)', height: 'auto', marginBottom: '1.5rem', objectFit: 'contain', opacity: 0.95 }} />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#4ade80', fontSize: '1.25rem', fontFamily: 'Nunito', fontWeight: 700, letterSpacing: '0.08em' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
        CONTROL REMOTO CONECTADO (SESIÓN: {code})
      </div>
      
      <p style={{ fontSize: '1.2rem', color: '#7a7a9a', lineHeight: 1.6, maxWidth: 500, margin: '0 auto', fontFamily: 'Nunito' }}>
        Elige tu cuento en el celular y presiona <strong>"Proyectar en TV"</strong> para comenzar.
      </p>
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
      animation: 'fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
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