'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Chess } from 'chess.js'

const CUENTOS = [
  {
    id: 1,
    title: 'El Bosque\nque Respira',
    subtitle: 'Una aventura entre raíces y secretos antiguos',
    tag: 'Aventura · 6–10 años',
    color: '#2d6a4f',
    glow: '#52b788',
    accent: '#95d5b2',
    emoji: '🌿',
    desc: 'Mía descubre que los árboles de su jardín susurran nombres al anochecer. Cuando sigue su llamado, encuentra un mundo enterrado bajo las raíces donde el tiempo fluye al revés.',
    bgImage: '/bg2.png',
  },
  {
    id: 2,
    title: 'La Ballena\nde Cristal',
    subtitle: 'Viaje al fondo del cielo invertido',
    tag: 'Fantasía · 5–9 años',
    color: '#1a3a5c',
    glow: '#4a90d9',
    accent: '#90caf9',
    emoji: '🐋',
    desc: 'En el océano de nubes que flota sobre la ciudad, una ballena de cristal recoge sueños perdidos. Solo quien se atreve a saltar desde el tejado más alto puede montarla.',
    bgImage: '/bg3.png',
  },
  {
    id: 3,
    title: 'El Reloj\nSin Agujas',
    subtitle: 'Cuando el tiempo decidió descansar',
    tag: 'Misterio · 7–11 años',
    color: '#5c3317',
    glow: '#e07b39',
    accent: '#ffb74d',
    emoji: '⏰',
    desc: 'Una mañana, todos los relojes del mundo perdieron sus agujas. El pequeño Theo encuentra las agujas escondidas en el mercado de los sueños, pero devolverlas tiene un precio.',
    bgImage: '/bg4.png',
  },
  {
    id: 4,
    title: 'La Reina\nde la Niebla',
    subtitle: 'El reino que aparece solo al amanecer',
    tag: 'Magia · 6–10 años',
    color: '#3d1a78',
    glow: '#9c6fde',
    accent: '#ce93d8',
    emoji: '👑',
    desc: 'Cada amanecer, cuando la niebla cubre el valle, aparece un castillo que no existe en ningún mapa. La reina que lo habita lleva cien años esperando a alguien que sepa leer el lenguaje de las nubes.',
    bgImage: '/bg5.png',
  },
  {
    id: 5,
    title: 'El Cartero\nde las Estrellas',
    subtitle: 'Cartas que viajan más rápido que la luz',
    tag: 'Ciencia · 8–12 años',
    color: '#1a2744',
    glow: '#5c8ee0',
    accent: '#ffd54f',
    emoji: '✉️',
    desc: 'Cada estrella fugaz es una carta en camino. Luna descubre el buzón secreto en la cima de la montaña más fría del mundo, y con él, la responsabilidad de entregar mensajes entre galaxias.',
    bgImage: undefined,
  },
]

type ModalState = { open: false } | { open: true; cuento: typeof CUENTOS[0] }

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [modal, setModal] = useState<ModalState>({ open: false })
  
  // Persistencia de la sesión de TV
  const [tvSessionCode, setTvSessionCode] = useState<string | null>(null)

  // Video de introducción para celular (PWA)
  const [showIntro, setShowIntro] = useState(false)
  const [isMuted, setIsMuted] = useState(false) // Iniciamos con audio activado
  const [introOpacity, setIntroOpacity] = useState(0)
  const [introFinished, setIntroFinished] = useState(false)
  const [currentView, setCurrentView] = useState<'hub' | 'cuentos' | 'chess'>('hub')
  const [showWelcome, setShowWelcome] = useState(false)
  const [welcomeOpacity, setWelcomeOpacity] = useState(1)
  const [viewTransitionActive, setViewTransitionActive] = useState(false)
  const [viewTransitionOpacity, setViewTransitionOpacity] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Ajedrez Estado local en celular
  const chessRef = useRef<any>(null)
  const [board, setBoard] = useState<any[][]>([])
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [validMoves, setValidMoves] = useState<string[]>([])
  const [gameResult, setGameResult] = useState<string | null>(null)
  const [aiTextLog, setAiTextLog] = useState<string[]>([])
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [activeChannel, setActiveChannel] = useState<any>(null)
  const [showChessModal, setShowChessModal] = useState(false)

  // Detección de dispositivo móvil para mostrar video de introducción
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 1366
      const introSeen = sessionStorage.getItem('cuentajoy_intro_seen')
      if (isMobile && !introSeen) {
        setShowWelcome(true)
      } else {
        setIntroFinished(true)
      }
    }
  }, [])

  const handleIntroEnded = () => {
    // Animación de salida: fade-out de ambos contenedores al mismo tiempo
    setIntroOpacity(0)
    setIntroFinished(true)
    sessionStorage.setItem('cuentajoy_intro_seen', 'true')
    setTimeout(() => {
      setShowIntro(false)
    }, 800) // Esperar a que termine la transición de 800ms
  }

  const handleWelcomeStart = () => {
    setWelcomeOpacity(0)
    setTimeout(() => {
      setShowWelcome(false)
      setShowIntro(true)
      setIsMuted(false)
      setTimeout(() => {
        setIntroOpacity(1)
        videoRef.current?.play().catch(e => console.log('Play error:', e))
      }, 100)
    }, 500)
  }

  const changeViewWithTransition = (newView: 'hub' | 'cuentos' | 'chess') => {
    setViewTransitionActive(true)
    setTimeout(() => {
      setViewTransitionOpacity(1)
    }, 50)
    
    setTimeout(() => {
      setCurrentView(newView)
      window.scrollTo(0, 0)
      
      setTimeout(() => {
        setViewTransitionOpacity(0)
        setTimeout(() => {
          setViewTransitionActive(false)
        }, 500)
      }, 100)
    }, 550)
  }

  // Canal Realtime para Ajedrez
  useEffect(() => {
    if (currentView !== 'chess' || !tvSessionCode) return

    const channel = supabase.channel(`session:${tvSessionCode}`)
    setActiveChannel(channel)

    channel
      .on('broadcast', { event: 'chess_ai_move' }, ({ payload }) => {
        if (chessRef.current) {
          chessRef.current.load(payload.fen)
          setBoard([...chessRef.current.board()])
          setIsAiThinking(false)
          setSelectedSquare(null)
          setValidMoves([])
        }
      })
      .on('broadcast', { event: 'chess_game_over' }, ({ payload }) => {
        setGameResult(payload.result)
        setAiTextLog(prev => [payload.comment, ...prev])
        setIsAiThinking(false)
      })
      .subscribe((status) => {
        console.log('Mobile Chess Channel status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
      setActiveChannel(null)
    }
  }, [currentView, tvSessionCode])

  // Inicializar Chess local
  useEffect(() => {
    if (currentView === 'chess') {
      chessRef.current = new Chess()
      setBoard(chessRef.current.board())
      setSelectedSquare(null)
      setValidMoves([])
      setGameResult(null)
      setAiTextLog(["La partida ha comenzado. ¡Buena suerte!"])
      setIsAiThinking(false)
    }
  }, [currentView])

  const startChess = (codeToUse?: string) => {
    const sessionCode = codeToUse || tvSessionCode
    if (!sessionCode) return
    
    localStorage.setItem('cuentajoy_session', sessionCode)
    setTvSessionCode(sessionCode)
    changeViewWithTransition('chess')

    // Si no vinimos del modal de conexión, enviamos la señal de inicio de ajedrez por separado
    if (!codeToUse) {
      const channel = supabase.channel(`session:${sessionCode}`)
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.send({
            type: 'broadcast',
            event: 'start_chess'
          })
        }
      })
    }
  }

  const resetChessGame = async () => {
    if (chessRef.current) {
      chessRef.current.reset()
      setBoard([...chessRef.current.board()])
      setSelectedSquare(null)
      setValidMoves([])
      setGameResult(null)
      setAiTextLog(["Partida reiniciada. ¡Buena suerte!"])
      setIsAiThinking(false)
      
      if (activeChannel) {
        await activeChannel.send({
          type: 'broadcast',
          event: 'chess_reset'
        })
      }
    }
  }

  const exitChessView = async () => {
    if (activeChannel) {
      await activeChannel.send({
        type: 'broadcast',
        event: 'show_waiting'
      })
    }
    changeViewWithTransition('hub')
  }

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Comprobar si hay una sesión activa en URL o LocalStorage al cargar la página
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const codeParam = params.get('session')
      if (codeParam && codeParam.trim().length === 4) {
        const formattedCode = codeParam.trim().toUpperCase()
        localStorage.setItem('cuentajoy_session', formattedCode)
        setTvSessionCode(formattedCode)
      } else {
        const storedCode = localStorage.getItem('cuentajoy_session')
        if (storedCode) {
          setTvSessionCode(storedCode)
        }
      }
    }
  }, [])

  const openTV = (cuento: typeof CUENTOS[0]) => {
    setModal({ open: true, cuento })
  }

  const projectToTV = async (cuento: typeof CUENTOS[0]) => {
    if (!tvSessionCode) return
    
    // Conectar temporalmente y enviar evento
    const channel = supabase.channel(`session:${tvSessionCode}`)
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'show_content',
          payload: {
            show: true,
            cuentoId: cuento.id,
            title: cuento.title,
            emoji: cuento.emoji,
            glow: cuento.glow,
            accent: cuento.accent,
            bgImage: cuento.bgImage,
          },
        })
        window.location.href = `/cuento/${cuento.id}?session=${tvSessionCode}&role=remote`
      }
    })
  }

  const disconnectSession = () => {
    localStorage.removeItem('cuentajoy_session')
    setTvSessionCode(null)
  }

  const closeModal = () => setModal({ open: false })

  const fireflies = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: 10 + (i * 37.3 + 13.7) % 80,
    y: 10 + (i * 53.1 + 7.3) % 80,
    size: 1.5 + (i % 4) * 0.6,
    duration: 4 + (i % 7) * 1.2,
    delay: (i % 11) * 0.7,
    driftX: ((i * 17 + 3) % 40) - 20,
    driftY: ((i * 23 + 5) % 40) - 20,
    glowColor: i % 3 === 0 ? '#ffe878' : i % 3 === 1 ? '#b8ff78' : '#ffd54f',
  })), [])

  return (
    <div style={{ background: '#0c0d10', overflowX: 'hidden' }}>
      {/* Capa negra protectora inicial en móviles para evitar el flash del home */}
      <div
        className="mobile-only-cover"
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000000',
          zIndex: 99998,
          pointerEvents: introFinished ? 'none' : 'auto',
          opacity: introFinished ? 0 : 1,
          transition: 'opacity 0.8s ease-in-out',
        }}
      />
      {showWelcome && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#07070a',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2.5rem',
          padding: '2rem',
          textAlign: 'center',
          opacity: welcomeOpacity,
          transition: 'opacity 0.5s ease-in-out',
          pointerEvents: welcomeOpacity === 0 ? 'none' : 'auto'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'Nunito', fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img style={{ width: '80px', margin: '0 auto' }} src="/logo-genofy.png" alt="Genofy" />
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-cuentajoy.png" alt="Cuentajoy" style={{ width: '260px', height: 'auto', objectFit: 'contain' }} />
          </div>

          <button 
            onClick={handleWelcomeStart}
            style={{
              background: '#7c6af7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '30px',
              padding: '16px 36px',
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(124, 106, 247, 0.4)',
              transition: 'transform 0.2s'
            }}
          >
            Comenzar Experiencia ✨
          </button>
        </div>
      )}
      {showIntro && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#000000',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          opacity: introOpacity,
          transition: 'opacity 0.8s ease-in-out',
          pointerEvents: introOpacity === 0 ? 'none' : 'auto'
        }}>
          <video
            ref={videoRef}
            src="/intro-cuenta-joy.mp4"
            autoPlay
            playsInline
            muted={isMuted}
            onEnded={handleIntroEnded}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          
        </div>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Beau+Rivage&family=Cinzel:wght@400..900&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: rgba(255,255,255,0.15); }

        .nav-link {
          color: rgba(255,255,255,0.5); text-decoration: none;
          font-family: 'Nunito', sans-serif; font-size: 0.85rem;
          letter-spacing: 0.1em; text-transform: uppercase; transition: color 0.3s;
        }
        .nav-link:hover { color: white; }

        .btn {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'Nunito', sans-serif; font-size: 0.82rem;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 13px 24px; border-radius: 4px; cursor: pointer;
          transition: all 0.25s; border: 1px solid transparent;
        }
        .btn-ghost {
          background: transparent; border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.7);
        }
        .btn-ghost:hover { border-color: rgba(255,255,255,0.5); color: white; }
        .btn-solid {
          background: white; color: #060608; border-color: white; font-weight: 500;
        }
        .btn-solid:hover { background: rgba(255,255,255,0.88); }

        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 100;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }
        
        .ripple-subtle {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
        }

        .ripple-subtle::before,
        .ripple-subtle::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          border: 1px solid rgba(144, 202, 249, 0.4);
          transform: translate(-50%, -50%);
          animation: subtle-ripple 3s ease-out infinite;
          pointer-events: none;
        }

        .ripple-subtle::after {
          animation-delay: 1.5s;
        }

        @keyframes subtle-ripple {
          0% {
            width: 20px;
            height: 20px;
            opacity: 0.8;
          }
          100% {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }

        @keyframes fireflyFloat {
          0%   { transform: translate(0px, 0px) scale(1);   opacity: 0; }
          15%  { opacity: 1; }
          50%  { transform: translate(var(--dx), var(--dy)) scale(1.3); opacity: 0.9; }
          85%  { opacity: 0.7; }
          100% { transform: translate(0px, 0px) scale(1);   opacity: 0; }
        }
        @keyframes fireflyGlow {
          0%, 100% { box-shadow: 0 0 3px 1px var(--gc), 0 0 6px 2px var(--gc); }
          50%       { box-shadow: 0 0 6px 3px var(--gc), 0 0 14px 5px var(--gc); }
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes floatSlow {
          0%,100% { transform:translateY(0) rotate(0deg); }
          33% { transform:translateY(-10px) rotate(1deg); }
          66% { transform:translateY(-5px) rotate(-0.5deg); }
        }
        @keyframes scroll-hint {
          0%,100% { transform:translateY(0); opacity:0.4; }
          50% { transform:translateY(8px); opacity:1; }
        }
        @keyframes modal-in {
          from { opacity:0; transform:scale(0.96) translateY(10px); }
          to { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .scroll-hint { animation: scroll-hint 2s ease-in-out infinite; }
        .float { animation: floatSlow 6s ease-in-out infinite; }

        .section-num {
          font-family: 'Beau Rivage', cursive;
          font-size: clamp(6rem, 14vw, 13rem);
          font-weight: 900; line-height: 1; color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.05);
          user-select: none; position: absolute; right: -0.05em; top: -0.2em;
          pointer-events: none;
        }

        .modal-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        .modal-box {
          background: #0f0f14;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 2.5rem;
          width: 90%; max-width: 480px;
          animation: modal-in 0.3s cubic-bezier(0.16,1,0.3,1);
          position: relative;
        }
        
        .floating-banner {
          position: fixed; top: 1.25rem; left: 50%; transform: translateX(-50%);
          background: rgba(74, 222, 128, 0.12); border: 1px solid rgba(74, 222, 128, 0.3);
          border-radius: 30px; padding: 10px 24px; zIndex: 1000; display: flex; align-items: center; gap: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5); backdrop-filter: blur(12px);
          animation: fadeIn 0.3s ease;
        }

        @media (min-width: 769px) {
          .mobile-only-cover {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .story-inner { flex-direction: column !important; padding: 5rem 1.5rem !important; gap: 2.5rem !important; }
          .story-text { align-items: center !important; text-align: center !important; flex: 1 1 100% !important; max-width: 100% !important; }
          .section-num { display: none; }
          .story-desc { max-width: 100% !important; }
          .story-btns { display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; justify-content: center !important; width: 100% !important; gap: 0.5rem !important; }
          .story-btns button { flex: 1; justify-content: center !important; padding: 10px 8px !important; font-size: 0.72rem !important; }
          .tablet-only-btn { display: none !important; }
          .nav-link { display: none; }
          .nav-inner { padding: 1rem 1.25rem !important; }
          .hero-logo-area { padding: 2rem 1.5rem !important; }
          .hero-bottom { padding: 0 1.5rem 2.5rem !important; flex-direction: column !important; align-items: flex-start !important; gap: 1.25rem !important; }
          .hero-title { font-size: 2.2rem !important; }
          .hero-subtitle { font-size: 0.85rem !important; }
          .hero-btns { flex-direction: column !important; width: 100% !important; }
          .hero-btns .btn { width: 100% !important; justify-content: center !important; }
          .story-right { align-items: center !important; width: 100% !important; }
          .story-card { width: 160px !important; height: 160px !important; }
          .story-pills { flex-direction: row !important; flex-wrap: wrap !important; justify-content: center !important; }
          .story-pill { min-width: auto !important; padding: 8px 14px !important; }
          .footer-inner { flex-direction: column !important; gap: 0.5rem !important; align-items: center !important; text-align: center !important; padding: 1.5rem !important; }
          .cta-section { padding: 5rem 1.5rem !important; }
          .modal-box { padding: 1.75rem !important; }
        }

        @media (max-width: 400px) {
          .hero-title { font-size: 1.9rem !important; }
          .story-pills { gap: 0.4rem !important; }
          .story-pill { font-size: 0.7rem !important; padding: 7px 10px !important; }
        }
      `}</style>

      <div className="grain" />

      {/* BANNER FLOTANTE DE CONTROL REMOTO */}
      {tvSessionCode && (
        <div style={{
          position: 'fixed',
          top: '12px',
          right: '12px',
          background: 'rgba(74, 222, 128, 0.18)',
          border: '1px solid rgba(74, 222, 128, 0.45)',
          borderRadius: '16px',
          padding: '6px 10px',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.35)',
          fontFamily: "'Nunito', sans-serif",
          fontSize: '0.65rem',
          color: '#4ade80',
          fontWeight: 800,
          letterSpacing: '0.05em'
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
          <span>TV: {tvSessionCode}</span>
          <button 
            onClick={disconnectSession} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'rgba(255,255,255,0.4)', 
              fontSize: '0.8rem', 
              cursor: 'pointer', 
              marginLeft: 4, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: 0
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* NAV */}
      {/* NAV / BOTÓN VOLVER FLOTANTE EN CATÁLOGO */}
      {currentView === 'cuentos' && (
        <button
          onClick={() => changeViewWithTransition('hub')}
          style={{
            position: 'fixed',
            top: '12px',
            left: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '6px 12px',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.35)',
            fontFamily: "'Nunito', sans-serif",
            fontSize: '0.65rem',
            color: '#ffffff',
            fontWeight: 800,
            letterSpacing: '0.05em',
            cursor: 'pointer'
          }}
        >
          <span>← VOLVER</span>
        </button>
      )}

      {/* HERO (Hub principal) */}
      {currentView === 'hub' && (
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '0',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: "url('/bg1.png')",
          backgroundSize: 'cover',
          backgroundPosition: `center ${scrollY * 0.4}px`,
          backgroundRepeat: 'no-repeat',
        }}>
          {/* Overlay sutil */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }} />
          {/* Gradiente izquierda para legibilidad del logo y texto */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />
          {/* Gradiente inferior para legibilidad del texto */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 45%)' }} />

          {/* Logos centrados arriba */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '4rem 1.5rem 1rem',
            marginTop: 'auto'
          }}>
            <span style={{ fontFamily: 'Nunito', fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '0.5rem' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img style={{ width: '80px', margin: '0 auto' }} src="/logo-genofy.png" alt="Genofy" />
            </span>
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src="/logo-cuentajoy.png" alt="Cuentajoy" style={{ width: '196px', height: 'auto', objectFit: 'contain', margin: '0 auto' }} />
          </div>

          {/* Contenedor centrado para los botones cuadrangulares */}
          <div className="hub-buttons-container" style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            margin: '2.5rem 0',
            padding: '0 1rem',
            marginBottom: 'auto'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem',
              width: '100%',
              maxWidth: '340px'
            }}>
              {/* Botón Cuentos */}
              <button 
                onClick={() => changeViewWithTransition('cuentos')}
                style={{
                  aspectRatio: '1',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(12px)',
                  textAlign: 'center',
                  outline: 'none'
                }}
              >
                <span style={{ fontSize: '2.2rem' }}>🌿</span>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.05em' }}>Cuentos</span>
                <span style={{ fontFamily: 'Nunito', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.25 }}>Historias mágicas interactivas</span>
              </button>

              {/* Botón Juegos */}
              <button 
                onClick={() => {
                  if (!tvSessionCode) {
                    setShowChessModal(true)
                    return
                  }
                  startChess()
                }}
                style={{
                  aspectRatio: '1',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                  outline: 'none',
                  position: 'relative'
                }}
              >
                <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(124, 106, 247, 0.2)', border: '1px solid rgba(124, 106, 247, 0.4)', color: '#b8aeff', fontSize: '0.55rem', fontWeight: 800, padding: '2px 6px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Próximamente</span>
                <span style={{ fontSize: '2.2rem', opacity: 0.65 }}>🎲</span>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.05em' }}>Juegos</span>
                <span style={{ fontFamily: 'Nunito', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.25 }}>Tablero Joy en tu pantalla TV</span>
              </button>
            </div>
          </div>

          {/* Luciérnagas */}
          {fireflies.map(f => (
            <div key={f.id} style={{
              position: 'absolute',
              left: `${f.x}%`,
              top: `${f.y}%`,
              width: f.size,
              height: f.size,
              borderRadius: '50%',
              background: f.glowColor,
              zIndex: 3,
              '--dx': `${f.driftX}px`,
              '--dy': `${f.driftY}px`,
              '--gc': f.glowColor,
              animation: `fireflyFloat ${f.duration}s ease-in-out ${f.delay}s infinite, fireflyGlow ${f.duration * 0.7}s ease-in-out ${f.delay}s infinite`,
            } as React.CSSProperties} />
          ))}
        </section>
      )}

      {/* CUENTOS (Vista de catálogo vertical) */}
      {currentView === 'cuentos' && (
        <div id="cuentos" style={{ paddingTop: '64px', background: 'rgb(12 12 15)' }}>
          {CUENTOS.map((cuento, index) => (
            <StorySection key={cuento.id} cuento={cuento} index={index} onOpenTV={tvSessionCode ? () => projectToTV(cuento) : () => openTV(cuento)} hasSession={!!tvSessionCode} />
          ))}
          
          <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'rgba(255,255,255,0.18)', fontFamily: 'Nunito', fontSize: '0.78rem', background: '#050508' }} className="footer-inner">
            <span>Cuentajoy © 2026</span>
            <span>Hecho con ✨ para pequeños exploradores</span>
          </footer>
        </div>
      )}

      {currentView === 'chess' && (
        <div style={{ minHeight: '100vh', background: '#0c0d10', color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 1.5rem 2rem 1.5rem', position: 'relative' }}>
          {/* Botones de navegación flotantes */}
          <button
            onClick={exitChessView}
            style={{
              position: 'fixed',
              top: '12px',
              left: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '6px 12px',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.35)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '0.65rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            ← Volver
          </button>



          {/* Título de la sección */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
            <h1 className="cinzel-decorative-regular" style={{ fontSize: '1.8rem', color: '#ffffff', fontWeight: 400, letterSpacing: '0.05em' }}>
              Tablero Joy
            </h1>
            <p style={{ fontFamily: 'Nunito', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>
              Ajedrez vs Joy IA
            </p>
          </div>

          {/* Turno e indicador de estado */}
          <div style={{
            width: '100%',
            maxWidth: '340px',
            background: isAiThinking ? 'rgba(33, 150, 243, 0.08)' : 'rgba(124, 106, 247, 0.08)',
            border: isAiThinking ? '1px solid rgba(33, 150, 243, 0.2)' : '1px solid rgba(124, 106, 247, 0.2)',
            borderRadius: '12px',
            padding: '10px 16px',
            marginBottom: '1.25rem',
            textAlign: 'center',
            fontFamily: 'Nunito',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: isAiThinking ? '#2196f3' : '#b8aeff',
            transition: 'all 0.3s ease'
          }}>
            {isAiThinking ? '⏳ Joy IA está pensando...' : '⚔️ ¡Tu turno! Mueves Blancas'}
          </div>

          {/* Tablero de Ajedrez Táctil */}
          <div style={{
            padding: '6px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            width: '100%',
            maxWidth: '340px',
            aspectRatio: '1'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateRows: 'repeat(8, 1fr)',
              gridTemplateColumns: 'repeat(8, 1fr)',
              width: '100%',
              height: '100%',
              background: '#07070a',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              {board.map((row, rIdx) => 
                row.map((col, cIdx) => {
                  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
                  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']
                  const squareName = files[cIdx] + ranks[rIdx]
                  
                  const isLight = (rIdx + cIdx) % 2 === 0
                  const isSelected = selectedSquare === squareName
                  const isValidDestination = validMoves.includes(squareName)
                  
                  let bg = isLight ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.01)'
                  let borderStyle = 'none'

                  if (isSelected) {
                    bg = 'rgba(124, 106, 247, 0.25)'
                    borderStyle = '1.5px solid #7c6af7'
                  }

                  const piece = col
                  let pieceChar = ''
                  let pieceColor = '#ffffff'

                  const pieceUnicodeMap: { [key: string]: string } = {
                    'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
                    'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
                  }

                  if (piece) {
                    const key = piece.color + piece.type
                    pieceChar = pieceUnicodeMap[key] || ''
                    pieceColor = piece.color === 'w' ? '#ffffff' : '#b8aeff'
                  }

                  const handleSquareTap = () => {
                    if (isAiThinking || gameResult) return

                    if (selectedSquare && isValidDestination) {
                      if (chessRef.current) {
                        const move = chessRef.current.move({ from: selectedSquare, to: squareName })
                        if (move) {
                          setBoard([...chessRef.current.board()])
                          setSelectedSquare(null)
                          setValidMoves([])
                          
                          if (activeChannel) {
                            activeChannel.send({
                              type: 'broadcast',
                              event: 'chess_move',
                              payload: { from: selectedSquare, to: squareName }
                            })
                            setIsAiThinking(true)
                          }
                        }
                      }
                      return
                    }

                    if (piece && piece.color === 'w') {
                      if (chessRef.current) {
                        const moves = chessRef.current.moves({ square: squareName, verbose: true })
                        const targets = moves.map((m: any) => m.to)
                        setSelectedSquare(squareName)
                        setValidMoves(targets)
                      }
                    } else {
                      setSelectedSquare(null)
                      setValidMoves([])
                    }
                  }

                  return (
                    <div 
                      key={squareName} 
                      onClick={handleSquareTap}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: bg,
                        border: borderStyle,
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                    >
                      {isValidDestination && (
                        <div style={{
                          position: 'absolute',
                          width: pieceChar ? '80%' : '10px',
                          height: pieceChar ? '80%' : '10px',
                          borderRadius: pieceChar ? '8px' : '50%',
                          background: pieceChar ? 'rgba(255, 213, 79, 0.15)' : 'rgba(255, 213, 79, 0.7)',
                          border: pieceChar ? '2px solid rgba(255, 213, 79, 0.6)' : 'none',
                          zIndex: 1
                        }} />
                      )}

                      {pieceChar && (
                        <span style={{
                          fontSize: '2.1rem',
                          color: pieceColor,
                          userSelect: 'none',
                          zIndex: 2,
                          textShadow: piece.color === 'w' ? '0 0 5px rgba(255,255,255,0.4)' : '0 0 5px rgba(184,174,255,0.4)'
                        }}>
                          {pieceChar}
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>



          {/* Botón Reiniciar Partida */}
          <button
            onClick={resetChessGame}
            style={{
              marginTop: '1.5rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '30px',
              padding: '10px 24px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'Nunito',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            Reiniciar Partida
          </button>
        </div>
      )}

      {/* MODAL VER EN TV */}
      {modal.open && (
        <TVModal cuento={modal.cuento} onClose={closeModal} />
      )}

      {/* MODAL CONECTAR AJEDREZ */}
      {showChessModal && (
        <ChessTVModal 
          onClose={() => setShowChessModal(false)} 
          onConnect={(code) => {
            setShowChessModal(false)
            startChess(code)
          }} 
        />
      )}

      {/* Capa negra de transición de vistas */}
      {viewTransitionActive && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#07070a',
          zIndex: 99997, // justo debajo de welcome / intro
          pointerEvents: 'all',
          opacity: viewTransitionOpacity,
          transition: 'opacity 0.5s ease-in-out'
        }} />
      )}
    </div>
  )
}

function StorySection({ cuento, index, onOpenTV, hasSession }: {
  cuento: typeof CUENTOS[0]; index: number; onOpenTV: () => void; hasSession: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const firefliesRef = useRef<HTMLDivElement>(null)
  const bubblesRef = useRef<HTMLDivElement>(null)
  const butterfliesRef = useRef<HTMLDivElement>(null)
  const lanternsRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 })
    obs.observe(el)
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      setProgress(Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight)))
    }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll()
    return () => { obs.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [])

  // 🌿 Efecto de luciérnagas revoloteando - Cuento 1: El Bosque que Respira
  useEffect(() => {
    if (cuento.id !== 1) return;
    
    const contenedor = firefliesRef.current;
    if (!contenedor) return;

    const NUMERO_LUCIERNAGAS = 25;
    const luciernagas: Array<{
      element: HTMLDivElement;
      x: number;
      y: number;
      vx: number;
      vy: number;
    }> = [];

    contenedor.innerHTML = '';

    for (let i = 0; i < NUMERO_LUCIERNAGAS; i++) {
      const luciernaga = document.createElement('div');
      
      const x = 10 + Math.random() * 80;
      const y = 10 + Math.random() * 80;
      const tamaño = Math.random() * 1.5 + 1;
      
      luciernaga.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        width: ${tamaño}px;
        height: ${tamaño}px;
        background: #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 ${tamaño * 1.5}px #ffffff,
                   0 0 ${tamaño * 3}px #f0f0ff,
                   0 0 ${tamaño * 6}px #e0e0ff;
        pointer-events: none;
        will-change: transform, opacity;
        opacity: 0.7;
        transition: opacity 0.3s ease;
      `;
      
      contenedor.appendChild(luciernaga);
      
      luciernagas.push({
        element: luciernaga,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2
      });
    }

    let animationId: number;
    function animarLuciernagas() {
      luciernagas.forEach(lucy => {
        lucy.vx += (Math.random() - 0.5) * 0.06;
        lucy.vy += (Math.random() - 0.5) * 0.06;
        
        const maxVel = 0.25;
        lucy.vx = Math.max(-maxVel, Math.min(maxVel, lucy.vx));
        lucy.vy = Math.max(-maxVel, Math.min(maxVel, lucy.vy));
        
        lucy.x += lucy.vx;
        lucy.y += lucy.vy;
        
        if (lucy.x < 5) { lucy.x = 5; lucy.vx *= -1; }
        if (lucy.x > 95) { lucy.x = 95; lucy.vx *= -1; }
        if (lucy.y < 5) { lucy.y = 5; lucy.vy *= -1; }
        if (lucy.y > 95) { lucy.y = 95; lucy.vy *= -1; }
        
        lucy.element.style.left = lucy.x + '%';
        lucy.element.style.top = lucy.y + '%';
        
        const brillo = 0.4 + Math.sin(Date.now() * 0.003 + lucy.x) * 0.3;
        lucy.element.style.opacity = brillo.toString();
      });
      
      animationId = requestAnimationFrame(animarLuciernagas);
    }

    animarLuciernagas();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [cuento.id]);

  // 🌊 Efecto de burbujas marinas - Cuento 2: La Ballena de Cristal
  useEffect(() => {
    if (cuento.id !== 2) return;
    
    const contenedor = bubblesRef.current;
    if (!contenedor) return;

    const NUMERO_BURBUJAS = 30;
    const bubbles: Array<{
      element: HTMLDivElement;
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      phase: number;
    }> = [];

    contenedor.innerHTML = '';

    for (let i = 0; i < NUMERO_BURBUJAS; i++) {
      const bubble = document.createElement('div');
      
      const x = Math.random() * 100;
      const y = 60 + Math.random() * 40;
      const size = Math.random() * 3 + 1;
      const speed = 0.3 + Math.random() * 0.7;
      
      bubble.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(144,202,249,0.2));
        border-radius: 50%;
        box-shadow: 0 0 ${size * 2}px rgba(144,202,249,0.3);
        pointer-events: none;
        will-change: transform;
        opacity: 0;
      `;
      
      contenedor.appendChild(bubble);
      
      bubbles.push({
        element: bubble,
        x: x,
        y: y,
        size: size,
        speed: speed,
        opacity: 0.2 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2
      });
    }

    let animationId: number;
    const startTime = Date.now();
    
    function animarBurbujas() {
      const elapsed = (Date.now() - startTime) * 0.001;
      
      bubbles.forEach(bubble => {
        bubble.y -= bubble.speed * 0.15;
        
        const sway = Math.sin(elapsed * 0.5 + bubble.phase) * 0.3;
        bubble.x += sway * 0.1;
        
        if (bubble.y < -5) {
          bubble.y = 105;
          bubble.x = Math.random() * 100;
        }
        
        if (bubble.x < -5) bubble.x = 105;
        if (bubble.x > 105) bubble.x = -5;
        
        const glow = bubble.opacity + Math.sin(elapsed * 2 + bubble.phase) * 0.15;
        
        bubble.element.style.left = bubble.x + '%';
        bubble.element.style.top = bubble.y + '%';
        bubble.element.style.opacity = Math.min(1, Math.max(0.1, glow)).toString();
      });
      
      animationId = requestAnimationFrame(animarBurbujas);
    }

    animarBurbujas();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [cuento.id]);

  // 🦋 Efecto de mariposas revoloteando - Cuento 4: La Reina de la Niebla
  useEffect(() => {
    if (cuento.id !== 4) return;
    
    const contenedor = butterfliesRef.current;
    if (!contenedor) return;

    const NUMERO_MARIPOSAS = 15;
    const mariposas: Array<{
      element: HTMLDivElement;
      x: number;
      y: number;
      vx: number;
      vy: number;
      phase: number;
    }> = [];

    contenedor.innerHTML = '';

    for (let i = 0; i < NUMERO_MARIPOSAS; i++) {
      const mariposa = document.createElement('div');
      
      const x = 10 + Math.random() * 80;
      const y = 10 + Math.random() * 80;
      const size = 6 + Math.random() * 8;
      
      const color1 = `hsla(${270 + Math.random() * 30}, 70%, 75%, 0.9)`;
      const color2 = `hsla(${270 + Math.random() * 30}, 50%, 55%, 0.4)`;
      
      const alaIzq = document.createElement('div');
      alaIzq.style.cssText = `
        position: absolute;
        right: 0;
        width: ${size}px;
        height: ${size * 0.6}px;
        background: radial-gradient(ellipse at center, ${color1}, ${color2});
        border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
        transform-origin: right center;
        animation: wingFlap 0.3s ease-in-out infinite;
      `;
      
      const alaDer = document.createElement('div');
      alaDer.style.cssText = `
        position: absolute;
        left: 0;
        width: ${size}px;
        height: ${size * 0.6}px;
        background: radial-gradient(ellipse at center, ${color1}, ${color2});
        border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        transform-origin: right center;
        animation: wingFlap 0.3s ease-in-out infinite;
        animation-delay: 0.15s;
      `;
      
      const cuerpo = document.createElement('div');
      cuerpo.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 1.5px;
        height: ${size * 0.8}px;
        background: rgba(100, 70, 140, 0.8);
        border-radius: 1px;
      `;
      
      mariposa.appendChild(alaIzq);
      mariposa.appendChild(alaDer);
      mariposa.appendChild(cuerpo);
      
      mariposa.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size}px;
        pointer-events: none;
        z-index: 5;
      `;
      
      contenedor.appendChild(mariposa);
      
      mariposas.push({
        element: mariposa,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        phase: Math.random() * Math.PI * 2
      });
    }

    if (!document.getElementById('wingFlapStyle')) {
      const style = document.createElement('style');
      style.id = 'wingFlapStyle';
      style.textContent = `
        @keyframes wingFlap {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.2); }
        }
      `;
      document.head.appendChild(style);
    }

    let animationId: number;
    
    function animarMariposas() {
      mariposas.forEach(mariposa => {
        mariposa.x += mariposa.vx * 0.05;
        mariposa.y += mariposa.vy * 0.05;
        
        if (Math.random() < 0.02) {
          mariposa.vx += (Math.random() - 0.5) * 1;
          mariposa.vy += (Math.random() - 0.5) * 1;
          
          const maxSpeed = 3;
          const speed = Math.sqrt(mariposa.vx ** 2 + mariposa.vy ** 2);
          if (speed > maxSpeed) {
            mariposa.vx = (mariposa.vx / speed) * maxSpeed;
            mariposa.vy = (mariposa.vy / speed) * maxSpeed;
          }
        }
        
        if (mariposa.x < 5 || mariposa.x > 95) {
          mariposa.vx *= -1;
          mariposa.x = Math.max(5, Math.min(95, mariposa.x));
        }
        if (mariposa.y < 5 || mariposa.y > 95) {
          mariposa.vy *= -1;
          mariposa.y = Math.max(5, Math.min(95, mariposa.y));
        }
        
        const angle = Math.atan2(mariposa.vy, mariposa.vx) * (180 / Math.PI);
        
        mariposa.element.style.left = mariposa.x + '%';
        mariposa.element.style.top = mariposa.y + '%';
        mariposa.element.style.transform = `rotate(${angle + 90}deg)`;
      });
      
      animationId = requestAnimationFrame(animarMariposas);
    }

    animarMariposas();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [cuento.id]);
  
  // 🏮 Efecto de faroles mágicos - Cuento 3: El Reloj Sin Agujas
  useEffect(() => {
    if (cuento.id !== 3) return;
    
    const contenedor = lanternsRef.current;
    if (!contenedor) return;

    const NUMERO_FAROLES = 8;
    
    contenedor.innerHTML = '';

    for (let i = 0; i < NUMERO_FAROLES; i++) {
      const farol = document.createElement('div');
      
      const posiciones = [
        { x: 20, y: 60 },
        { x: 40, y: 55 },
        { x: 60, y: 58 },
        { x: 80, y: 62 },
        { x: 30, y: 40 },
        { x: 50, y: 35 },
        { x: 70, y: 42 },
        { x: 15, y: 30 },
      ];
      
      const pos = posiciones[i] || { 
        x: 20 + Math.random() * 60, 
        y: 30 + Math.random() * 40 
      };
      
      farol.style.cssText = `
        position: absolute;
        left: ${pos.x}%;
        top: ${pos.y}%;
        width: 20px;
        height: 30px;
        pointer-events: none;
        z-index: 5;
      `;
      
      const halo = document.createElement('div');
      halo.style.cssText = `
        position: absolute;
        left: 50%;
        top: 30%;
        transform: translate(-50%, -50%);
        width: 60px;
        height: 60px;
        background: radial-gradient(circle, rgba(255, 180, 50, 0.4) 0%, rgba(255, 140, 30, 0.2) 30%, transparent 70%);
        border-radius: 50%;
        animation: lanternGlow 2s ease-in-out ${Math.random() * 2}s infinite;
      `;
      
      const llama = document.createElement('div');
      llama.style.cssText = `
        position: absolute;
        left: 50%;
        top: 30%;
        transform: translate(-50%, -50%);
        width: 4px;
        height: 6px;
        background: #fff8e7;
        border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        box-shadow: 0 0 8px #ffaa30, 0 0 15px #ff8800;
        animation: lanternFlicker 0.5s ease-in-out ${Math.random() * 0.5}s infinite;
      `;
      
      farol.appendChild(halo);
      farol.appendChild(llama);
      contenedor.appendChild(farol);
    }

    if (!document.getElementById('lanternStyle')) {
      const style = document.createElement('style');
      style.id = 'lanternStyle';
      style.textContent = `
        @keyframes lanternGlow {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        }
        @keyframes lanternFlicker {
          0%, 100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
          25% { opacity: 1; transform: translate(-50%, -50%) scale(1.3, 0.8); }
          50% { opacity: 0.9; transform: translate(-50%, -50%) scale(0.9, 1.1); }
          75% { opacity: 1; transform: translate(-50%, -50%) scale(1.2, 0.9); }
        }
      `;
      document.head.appendChild(style);
    }
  }, [cuento.id]);

  const parallaxY = (progress - 0.5) * -80

  return (
    <section id={`cuento-${cuento.id}`} ref={ref} style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden', padding: '6rem 0',
      ...(cuento.bgImage ? {
        backgroundImage: `url('${cuento.bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: `center ${parallaxY}px`,
        backgroundRepeat: 'no-repeat',
      } : {}),
    }}>
      {/* 🌿 LUCIÉRNAGAS DEL BOSQUE - Cuento 1 */}
      {cuento.id === 1 && (
        <div 
          ref={firefliesRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}

      {/* 🌊 BURBUJAS MARINAS - Cuento 2 */}
      {cuento.id === 2 && (
        <div 
          ref={bubblesRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}

      {/* 🦋 MARIPOSAS - Cuento 4: La Reina de la Niebla */}
      {cuento.id === 4 && (
        <div 
          ref={butterfliesRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}
      
      {/* 🏮 FAROLES MÁGICOS - Cuento 3: El Reloj Sin Agujas */}
      {cuento.id === 3 && (
        <div 
          ref={lanternsRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}

      {cuento.id === 1 && (
        <div className="scroll-hint animate-bounce" style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          color: cuento.accent,
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          <span style={{ fontFamily: 'Nunito', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.8 }}>Ver más cuentos</span>
          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>↓</span>
        </div>
      )}

      <div className="story-inner" style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', position: 'relative', zIndex: 1 }}>

        {/* COLUMNA IZQUIERDA: texto */}
        <div className="story-text" style={{ 
          flex: '1 1 100%', 
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
          alignItems: 'center',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.1rem', 
          transform: visible ? 'translateX(0)' : 'translateX(-40px)', 
          opacity: visible ? 1 : 0, 
          transition: 'all 0.85s cubic-bezier(0.16,1,0.3,1) 0.1s' 
        }}>

          {/* Tag pill */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Nunito', fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 100, background: `${cuento.glow}22`, border: `1px solid ${cuento.glow}55`, color: cuento.accent, width: 'fit-content' }}>
            {cuento.emoji} {cuento.tag}
          </span>

          {/* Título serif uppercase */}
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', fontWeight: 500, lineHeight: 1.0, whiteSpace: 'pre-line', color: 'white', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            {cuento.title}
          </h2>

          {/* Subtítulo cursiva */}
          <p style={{ fontFamily: "'Cinzel, serif', cursive", fontSize: '1.1rem', fontStyle: 'italic', color: `${cuento.accent}cc`, marginTop: '-0.25rem' }}>
            {cuento.subtitle}
          </p>

          {/* Descripción */}
          <p className="story-desc" style={{ fontFamily: 'Nunito', fontSize: '0.9rem', lineHeight: 1.2, color: '#ffffff', maxWidth: 400, fontWeight: 300, marginTop: '0.25rem' }}>
            {cuento.desc}
          </p>

          {/* Botones */}
          <div className="story-btns" style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'nowrap', width: '100%' }}>
            <button onClick={onOpenTV} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'Nunito', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 16px', borderRadius: 8, background: cuento.glow, border: 'none', color: 'white', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {hasSession ? 'Proyectar en TV' : 'Ver en TV'}
            </button>
            <button onClick={() => window.location.href = `/cuento/${cuento.id}`} className="tablet-only-btn" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'Nunito', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: 'white', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Abrir cuento
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}

function TVModal({ cuento, onClose }: {
  cuento: typeof CUENTOS[0]
  onClose: () => void
}) {
  const [inputCode, setInputCode] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    const codeVal = inputCode.trim().toUpperCase()
    if (codeVal.length !== 4) {
      setError('El código debe tener 4 caracteres')
      return
    }
    setError('')
    setIsConnecting(true)

    const channel = supabase.channel(`session:${codeVal}`)
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Enviar tv_ready para confirmar conexión
        await channel.send({
          type: 'broadcast',
          event: 'tv_ready',
          payload: {}
        })

        // Retardo para asegurar que la TV recibe el evento y transiciona
        setTimeout(async () => {
          // Enviar show_content del cuento
          await channel.send({
            type: 'broadcast',
            event: 'show_content',
            payload: {
              show: true,
              cuentoId: cuento.id,
              title: cuento.title,
              emoji: cuento.emoji,
              glow: cuento.glow,
              accent: cuento.accent,
              bgImage: cuento.bgImage,
            },
          })

          // Guardar en localStorage y redirigir
          localStorage.setItem('cuentajoy_session', codeVal)
          window.location.href = `/cuento/${cuento.id}?session=${codeVal}&role=remote`
          onClose()
        }, 300)
      } else {
        setIsConnecting(false)
        setError('Error al conectar. Inténtalo de nuevo.')
      }
    })
  }

  return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ textAlign: 'center' }}>
        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem', cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'white')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>✕</button>

        {/* Header */}
        <div style={{ marginBottom: '1.75rem', textAlign: 'left' }}>
          <span style={{ fontSize: '2rem' }}>{cuento.emoji}</span>
          <h3 style={{ fontFamily: "'Beau Rivage', cursive", fontSize: '1.4rem', fontWeight: 700, color: 'white', marginTop: 8, whiteSpace: 'pre-line', lineHeight: 1.2 }}>
            Conectar {cuento.title.replace('\n', ' ')}
          </h3>
          <p style={{ fontFamily: 'Nunito', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
            Escribe el código que aparece en la pantalla de la TV
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <input
            type="text"
            placeholder="CÓDIGO"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 4))}
            onKeyDown={(e) => e.key === 'Enter' && !isConnecting && handleConnect()}
            maxLength={4}
            disabled={isConnecting}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: `2px solid ${error ? '#f87171' : cuento.glow}`,
              borderRadius: 14,
              color: 'white',
              fontFamily: 'Cinzel, serif',
              fontSize: '2.2rem',
              fontWeight: 800,
              letterSpacing: '0.25em',
              textAlign: 'center',
              width: '240px',
              padding: '12px 16px',
              outline: 'none',
              boxShadow: `0 0 25px ${cuento.glow}20`,
              textTransform: 'uppercase'
            }}
          />

          {error && (
            <p style={{ color: '#f87171', fontSize: '0.85rem', fontFamily: 'Nunito', fontWeight: 600 }}>{error}</p>
          )}

          <button
            onClick={handleConnect}
            disabled={isConnecting || inputCode.length !== 4}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Nunito',
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              padding: '14px 36px',
              borderRadius: 10,
              background: inputCode.length === 4 ? cuento.glow : 'rgba(255,255,255,0.05)',
              color: inputCode.length === 4 ? 'white' : 'rgba(255,255,255,0.2)',
              border: 'none',
              cursor: inputCode.length === 4 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              width: '100%'
            }}
          >
            {isConnecting ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                CONECTANDO...
              </div>
            ) : (
              'CONECTAR CONTROL'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function ChessTVModal({ onClose, onConnect }: {
  onClose: () => void
  onConnect: (code: string) => void
}) {
  const [inputCode, setInputCode] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    const codeVal = inputCode.trim().toUpperCase()
    if (codeVal.length !== 4) {
      setError('El código debe tener 4 caracteres')
      return
    }
    setError('')
    setIsConnecting(true)

    const channel = supabase.channel(`session:${codeVal}`)
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'tv_ready',
          payload: {}
        })

        setTimeout(async () => {
          await channel.send({
            type: 'broadcast',
            event: 'start_chess'
          })

          onConnect(codeVal)
        }, 800)
      } else {
        setError('Error al conectar. Inténtalo de nuevo.')
        setIsConnecting(false)
      }
    })
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 5, 8, 0.85)',
      backdropFilter: 'blur(20px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '360px',
        background: '#0c0d10',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '1.25rem',
            cursor: 'pointer',
            padding: 0
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '2.5rem' }}>⚔️</span>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
            Conectar Ajedrez
          </h2>
          <p style={{ fontFamily: 'Nunito', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
            Ingresa el código de 4 letras que aparece en tu pantalla de TV para iniciar la partida.
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input 
            type="text"
            maxLength={4}
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="ABCD"
            disabled={isConnecting}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '1.5rem',
              fontWeight: 800,
              letterSpacing: '0.2em',
              textAlign: 'center',
              color: 'white',
              outline: 'none',
              fontFamily: 'monospace'
            }}
          />
          {error && (
            <p style={{ fontFamily: 'Nunito', fontSize: '0.75rem', color: '#f44336', textAlign: 'center' }}>
              {error}
            </p>
          )}
        </div>

        <button 
          onClick={handleConnect}
          disabled={isConnecting}
          style={{
            width: '100%',
            background: '#7c6af7',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '0.9rem',
            fontWeight: 700,
            fontFamily: 'Nunito',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(124, 106, 247, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          {isConnecting ? (
            <>
              <div className="button-spinner" style={{ width: 16, height: 16, border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <span>Conectando...</span>
            </>
          ) : (
            'CONECTAR Y JUGAR'
          )}
        </button>
      </div>
    </div>
  )
}