'use client'

import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import MobileHome from './page.backup'

export default function Home() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isSmallScreen = window.innerWidth < 1024 // Tablets y móviles
      setIsMobile(isMobileUA || isSmallScreen)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile === null) {
    return <div style={{ background: '#0c0d10', minHeight: '100vh' }} />
  }

  if (isMobile) {
    return <MobileHome />
  }

  return <DesktopLanding />
}

function DesktopLanding() {
  const [scrollY, setScrollY] = useState(0)
  const [activeTab, setActiveTab] = useState<'cuentos' | 'juegos'>('cuentos')
  const [showQRModal, setShowQRModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Luces mágicas flotantes
  const fireflies = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: 5 + (i * 31.7) % 90,
    y: 10 + (i * 47.3) % 80,
    size: 1.5 + (i % 4) * 0.8,
    duration: 6 + (i % 6) * 1.5,
    delay: (i % 9) * 0.8,
    driftX: ((i * 13 + 7) % 50) - 25,
    driftY: ((i * 19 + 3) % 50) - 25,
    glowColor: i % 3 === 0 ? 'rgba(124, 106, 247, 0.6)' : i % 3 === 1 ? 'rgba(74, 222, 128, 0.6)' : 'rgba(255, 213, 79, 0.6)',
  })), [])

  const cuentos = [
    {
      id: 1,
      title: 'El Bosque que Respira',
      tag: 'Aventura · 6–10 años',
      emoji: '🌿',
      glow: '#2d6a4f',
      accent: '#52b788',
      desc: 'Mía descubre que los árboles de su jardín susurran nombres al anochecer. Encuentra un mundo enterrado bajo las raíces donde el tiempo fluye al revés.',
      image: '/bg2.png'
    },
    {
      id: 2,
      title: 'La Ballena de Cristal',
      tag: 'Fantasía · 5–9 años',
      emoji: '🐋',
      glow: '#1a3a5c',
      accent: '#4a90d9',
      desc: 'En el océano de nubes que flota sobre la ciudad, una ballena de cristal recoge sueños perdidos. Solo quien salte desde el tejado más alto puede montarla.',
      image: '/bg3.png'
    },
    {
      id: 3,
      title: 'El Reloj Sin Agujas',
      tag: 'Misterio · 7–11 años',
      emoji: '⏰',
      glow: '#5c3317',
      accent: '#e07b39',
      desc: 'Una mañana, todos los relojes del mundo perdieron sus agujas. El pequeño Theo encuentra las agujas escondidas en el mercado de los sueños.',
      image: '/bg4.png'
    },
    {
      id: 4,
      title: 'La Reina de la Niebla',
      tag: 'Magia · 6–10 años',
      emoji: '👑',
      glow: '#3d1a78',
      accent: '#9c6fde',
      desc: 'Al amanecer, aparece un castillo en la niebla que no está en ningún mapa. La reina lleva cien años esperando a alguien que sepa leer el lenguaje de las nubes.',
      image: '/bg5.png'
    },
    {
      id: 5,
      title: 'El Cartero de las Estrellas',
      tag: 'Ciencia · 8–12 años',
      emoji: '✉️',
      glow: '#1a2744',
      accent: '#5c8ee0',
      desc: 'Cada estrella fugaz es una carta en camino. Luna descubre el buzón secreto y con él, la responsabilidad de entregar mensajes entre galaxias.',
      image: '/bg1.png'
    }
  ]

  const juegos = [
    {
      id: 1,
      title: 'Ajedrez Real',
      tag: 'Estrategia · 2 Jugadores o Solitario',
      emoji: '👑',
      glow: '#3a2010',
      accent: '#e5a93b',
      desc: 'Juega una partida majestuosa contra nuestra IA. El avatar tridimensional piensa, reacciona, mueve las piezas e interactúa verbalmente contigo.',
    },
    {
      id: 2,
      title: 'Crupier Joy (Blackjack)',
      tag: 'Cartas · 1 a 4 Jugadores',
      emoji: '🃏',
      glow: '#0a3a2a',
      accent: '#2ec4b6',
      desc: 'Enfréntate a la casa. Un crupier IA 3D reparte las cartas, maneja las apuestas y desafía a los jugadores con comentarios ingeniosos en tiempo real.',
    },
    {
      id: 3,
      title: 'Sintonía',
      tag: 'Cooperativo · 2 a 4 Jugadores',
      emoji: '🧠',
      glow: '#2a1b4e',
      accent: '#9d4edd',
      desc: 'Inspirado en "The Mind". Descarta tus cartas del 1 al 100 en orden ascendente en silencio total. La TV refleja la vibración y sincronía de tu equipo.',
    },
    {
      id: 4,
      title: 'Showtime',
      tag: 'Estrategia · 2 a 5 Jugadores',
      emoji: '🎪',
      glow: '#5a1215',
      accent: '#ff4d6d',
      desc: 'Inspirado en "Scout". Recluta artistas y organiza la gala más espectacular de la noche. Gestiona tu mano móvil sin poder reordenar tus cartas.',
    },
    {
      id: 5,
      title: 'Legado',
      tag: 'Estrategia · 2 Jugadores',
      emoji: '🏰',
      glow: '#1d2d44',
      accent: '#64dfdf',
      desc: 'Inspirado en "Claim". Compite por el trono reclutando facciones fantásticas. Disfruta combates animados en la TV mientras planeas tu mano.',
    },
    {
      id: 6,
      title: 'Ochos Locos',
      tag: 'Familiar · 2 a 4 Jugadores',
      emoji: '🤪',
      glow: '#485c17',
      accent: '#aacc00',
      desc: 'El clásico juego de descarte familiar. Agrega bots de IA para rellenar la mesa y ve cómo reacciona el presentador de la TV ante tus jugadas especiales.',
    }
  ]

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  return (
    <div style={{ background: '#07070a', color: '#f0effe', fontFamily: "'Nunito', sans-serif", overflowX: 'hidden', minHeight: '100vh', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Beau+Rivage&family=Cinzel:wght@400..900&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');
        
        .title-display {
          font-family: 'Cinzel', serif;
        }
        
        .title-cursive {
          font-family: 'Beau Rivage', cursive;
        }

        .gradient-text {
          background: linear-gradient(135deg, #ffffff 0%, #b8aeff 50%, #7c6af7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .btn-landing-solid {
          background: #7c6af7;
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 0 25px rgba(124, 106, 247, 0.4);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-landing-solid:hover {
          background: #8e7eff;
          transform: translateY(-2px);
          box-shadow: 0 0 35px rgba(124, 106, 247, 0.6);
        }

        .btn-landing-outline {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.85);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-landing-outline:hover {
          border-color: rgba(255,255,255,0.3);
          color: white;
          background: rgba(255,255,255,0.08);
          transform: translateY(-2px);
        }

        @keyframes fireflyFloat {
          0%   { transform: translate(0px, 0px) scale(1); opacity: 0; }
          15%  { opacity: 1; }
          50%  { transform: translate(var(--dx), var(--dy)) scale(1.4); opacity: 0.85; }
          85%  { opacity: 0.6; }
          100% { transform: translate(0px, 0px) scale(1); opacity: 0; }
        }

        .step-card {
          background: rgba(19, 19, 26, 0.45);
          border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .step-card:hover {
          border-color: rgba(124, 106, 247, 0.3);
          box-shadow: 0 10px 30px rgba(124, 106, 247, 0.08);
          transform: translateY(-4px);
        }

        .showcase-card {
          background: rgba(15, 15, 22, 0.8);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        .showcase-card:hover {
          transform: translateY(-6px);
          border-color: var(--glow-color);
          box-shadow: 0 15px 40px var(--glow-shadow);
        }

        .feature-card {
          background: rgba(15, 15, 22, 0.6);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 20px;
          padding: 2.5rem;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .feature-card:hover {
          border-color: rgba(255,255,255,0.1);
          background: rgba(19, 19, 28, 0.7);
        }

        .tv-mockup {
          box-shadow: 0 25px 70px rgba(0,0,0,0.8), 0 0 50px rgba(124, 106, 247, 0.15);
        }
        
        .phone-mockup {
          box-shadow: 0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(124, 106, 247, 0.2);
        }

        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 100; opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 150px 150px;
        }

        .modal-overlay {
          animation: fadeInOverlay 0.3s ease forwards;
        }
        .modal-content {
          animation: scaleInModal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeInOverlay {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(12px); }
        }
        @keyframes scaleInModal {
          from { opacity: 0; transform: scale(0.95) translateY(15px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Capa de textura de grano analógico */}
      <div className="grain" />

      {/* Luciérnagas de Fondo */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
        {fireflies.map(f => (
          <div key={f.id} style={{
            position: 'absolute',
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: f.size,
            height: f.size,
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: `0 0 ${f.size * 2}px #ffffff, 0 0 ${f.size * 5}px ${f.glowColor}, 0 0 ${f.size * 10}px ${f.glowColor}`,
            opacity: 0,
            '--dx': `${f.driftX}px`,
            '--dy': `${f.driftY}px`,
            animation: `fireflyFloat ${f.duration}s ease-in-out ${f.delay}s infinite`
          } as React.CSSProperties} />
        ))}
      </div>

      {/* NAV BAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '1.25rem 4rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: `rgba(7, 7, 10, ${Math.min(Math.max((scrollY - 40) / 100, 0), 0.95)})`,
        backdropFilter: scrollY > 10 ? 'blur(16px)' : 'none',
        borderBottom: scrollY > 10 ? '1px solid rgba(255,255,255,0.05)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-cuentajoy.png" alt="Cuenta Joy" style={{ height: '38px', width: 'auto' }} />
          </a>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="#cómo-funciona" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '0.05em', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>Cómo funciona</a>
            <a href="#catálogo" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '0.05em', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>Catálogo</a>
            <a href="#características" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '0.05em', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>Características</a>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo-genofy.png" alt="Genofy" style={{ height: '14px', width: 'auto', opacity: 0.6 }} />
          </span>
          <button className="btn-landing-solid" style={{ padding: '0.65rem 1.75rem', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', border: 'none' }} onClick={() => setShowQRModal(true)}>
            Iniciar Experiencia
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '7rem 4rem 4rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4rem', alignItems: 'center', width: '100%' }}>
          
          {/* Info Izquierda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(124, 106, 247, 0.1)', border: '1px solid rgba(124, 106, 247, 0.2)', padding: '6px 16px', borderRadius: '30px', alignSelf: 'flex-start' }}>
              <div className="status-dot" style={{ margin: 0 }} />
              <span style={{ fontSize: '0.75rem', color: '#b8aeff', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Entretenimiento Multipantalla</span>
            </div>
            
            <h1 className="title-display gradient-text" style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              El Portal de Experiencias Interactivas <br />
              <em className="title-cursive" style={{ fontSize: '4.5rem', fontWeight: 400, color: '#f0effe', fontStyle: 'normal', opacity: 0.9 }}>para la familia</em>
            </h1>
            
            <p style={{ fontSize: '1.25rem', color: '#7a7a9a', lineHeight: 1.6, maxWidth: '600px' }}>
              Convierte tu Smart TV en tu pantalla principal y usa tu celular como el control táctil. Explora mundos interactivos y dinámicas en grupo guiadas por Inteligencia Artificial.
            </p>
            
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem' }}>
              <button className="btn-landing-solid" style={{ padding: '1rem 2.25rem', borderRadius: '30px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setShowQRModal(true)}>
                <span>✨ Conectar mi celular</span>
              </button>
              <a href="/tv" className="btn-landing-outline" style={{ padding: '1rem 2.25rem', borderRadius: '30px', fontSize: '1rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>📺 Usar pantalla como TV</span>
              </a>
            </div>
          </div>

          {/* Logo Grande Cuenta Joy */}
          <div style={{ position: 'relative', width: '100%', height: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo-cuentajoy.png" 
              alt="Cuenta Joy" 
              className="animate-float"
              style={{ 
                width: '85%', 
                maxWidth: '460px', 
                height: 'auto', 
                objectFit: 'contain',
                filter: 'drop-shadow(0 15px 40px rgba(124, 106, 247, 0.35))'
              }} 
            />
            {/* Círculo decorativo de fondo */}
            <div style={{
              position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,106,247,0.05) 0%, transparent 70%)',
              zIndex: -1, top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
            }} />
          </div>

        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="cómo-funciona" style={{ padding: '8rem 4rem', position: 'relative', zIndex: 2, background: 'linear-gradient(to bottom, transparent, #09090d, transparent)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#7c6af7', letterSpacing: '0.2em', fontWeight: 800, textTransform: 'uppercase' }}>El Portal Multipantalla</span>
            <h2 className="title-display" style={{ fontSize: '2.6rem', fontWeight: 800, letterSpacing: '-0.01em' }}>¿Cómo empezar a jugar en 3 pasos?</h2>
            <div style={{ width: '40px', height: '3px', background: '#7c6af7', margin: '1rem auto 0', borderRadius: '2px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
            
            {/* Paso 1 */}
            <div className="step-card" style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(124, 106, 247, 0.1)', border: '1px solid rgba(124, 106, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#b8aeff', fontWeight: 800 }}>
                1
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Prepara la pantalla</h3>
              <p style={{ color: '#7a7a9a', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Entra a <strong style={{ color: '#f0effe' }}>cuentajoy.cl/tv</strong> en tu Smart TV, computadora o monitor. Ahí se proyectarán los juegos y personajes en alta resolución.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="step-card" style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#82f7a5', fontWeight: 800 }}>
                2
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Conecta tu celular</h3>
              <p style={{ color: '#7a7a9a', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Escanea el código QR de esta página o de la TV con tu celular/tablet para entrar al control remoto. No requiere descargas de tiendas de apps.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="step-card" style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255, 213, 79, 0.1)', border: '1px solid rgba(255, 213, 79, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#ffd54f', fontWeight: 800 }}>
                3
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Conéctate y juega</h3>
              <p style={{ color: '#7a7a9a', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Ingresa el código de 4 dígitos de la TV en tu móvil. Elige un cuento interactivo o juego de tablero, y disfruta de avatares IA con voz propia.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CATÁLOGO DE ENTRETENIMIENTO */}
      <section id="catálogo" style={{ padding: '6rem 4rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#7c6af7', letterSpacing: '0.2em', fontWeight: 800, textTransform: 'uppercase' }}>Universo Joy</span>
              <h2 className="title-display" style={{ fontSize: '2.6rem', fontWeight: 800, letterSpacing: '-0.01em' }}>Explora el Catálogo</h2>
            </div>
            
            {/* TABS SELECTOR */}
            <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '5px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={() => setActiveTab('cuentos')} style={{
                padding: '10px 24px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700,
                background: activeTab === 'cuentos' ? '#7c6af7' : 'transparent', color: activeTab === 'cuentos' ? '#ffffff' : 'rgba(255,255,255,0.6)',
                transition: 'all 0.25s'
              }}>
                🌿 Cuentos Vivos
              </button>
              <button onClick={() => setActiveTab('juegos')} style={{
                padding: '10px 24px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700,
                background: activeTab === 'juegos' ? '#7c6af7' : 'transparent', color: activeTab === 'juegos' ? '#ffffff' : 'rgba(255,255,255,0.6)',
                transition: 'all 0.25s'
              }}>
                🎲 Tablero Joy
              </button>
            </div>
          </div>

          {/* GRID CUENTOS */}
          {activeTab === 'cuentos' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem', animation: 'fadeInUp 0.6s ease' }}>
              {cuentos.map(c => (
                <div key={c.id} className="showcase-card" style={{ '--glow-color': c.accent, '--glow-shadow': `${c.glow}25` } as React.CSSProperties}>
                  {/* Imagen de fondo simulada */}
                  <div style={{ height: '200px', position: 'relative', overflow: 'hidden', background: c.glow }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${c.image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.65 }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0f0f16 0%, transparent 80%)' }} />
                    <span style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: c.accent }}>
                      {c.tag}
                    </span>
                    <span style={{ position: 'absolute', bottom: '1rem', left: '1.5rem', fontSize: '2.5rem' }}>{c.emoji}</span>
                  </div>
                  
                  {/* Texto */}
                  <div style={{ padding: '1.75rem 2rem 2.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 className="title-display" style={{ fontSize: '1.45rem', fontWeight: 800 }}>{c.title}</h3>
                    <p style={{ color: '#7a7a9a', lineHeight: 1.5, fontSize: '0.9rem' }}>{c.desc}</p>
                    <button style={{ background: 'transparent', border: 'none', color: c.accent, fontSize: '0.85rem', fontWeight: 800, alignSelf: 'flex-start', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.5rem' }} onClick={() => setShowQRModal(true)}>
                      <span>Proyectar cuento ➔</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GRID JUEGOS */}
          {activeTab === 'juegos' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem', animation: 'fadeInUp 0.6s ease' }}>
              {juegos.map(j => (
                <div key={j.id} className="showcase-card" style={{ '--glow-color': j.accent, '--glow-shadow': `${j.glow}33`, padding: '2.25rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'space-between', minHeight: '260px' } as React.CSSProperties}>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '2.2rem' }}>{j.emoji}</span>
                      <span style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: j.accent }}>
                        {j.tag}
                      </span>
                    </div>
                    {/* Texto */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <h3 className="title-display" style={{ fontSize: '1.45rem', fontWeight: 800 }}>{j.title}</h3>
                      <p style={{ color: '#7a7a9a', lineHeight: 1.5, fontSize: '0.9rem' }}>{j.desc}</p>
                    </div>
                  </div>
                  
                  {/* Acción */}
                  <button style={{ background: 'transparent', border: 'none', color: j.accent, fontSize: '0.85rem', fontWeight: 800, alignSelf: 'flex-start', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1rem' }} onClick={() => setShowQRModal(true)}>
                    <span>Montar mesa ➔</span>
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* CARACTERÍSTICAS CLAVE */}
      <section id="características" style={{ padding: '8rem 4rem', position: 'relative', zIndex: 2, background: 'linear-gradient(to top, transparent, #09090d, transparent)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#7c6af7', letterSpacing: '0.2em', fontWeight: 800, textTransform: 'uppercase' }}>Valor de Marca</span>
            <h2 className="title-display" style={{ fontSize: '2.6rem', fontWeight: 800 }}>La Magia Detrás de Cuenta Joy</h2>
            <div style={{ width: '40px', height: '3px', background: '#7c6af7', margin: '1rem auto 0', borderRadius: '2px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            
            {/* Feat 1 */}
            <div className="feature-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ fontSize: '2.2rem' }}>🗣️</div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>IA Conversacional Activa</h3>
              <p style={{ color: '#7a7a9a', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Los avatares tridimensionales no son planos. Tienen voz y personalidad propia. Háblales por el micrófono de tu celular; te responderán y reaccionarán a tus movimientos.
              </p>
            </div>

            {/* Feat 2 */}
            <div className="feature-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ fontSize: '2.2rem' }}>🛡️</div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Privacidad Multitablero</h3>
              <p style={{ color: '#7a7a9a', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Diseñado para conservar el misterio de los juegos de mesa. Tus cartas secretas, dados y estrategias ocultas se quedan en tu celular; la TV muestra solo el tablero compartido.
              </p>
            </div>

            {/* Feat 3 */}
            <div className="feature-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ fontSize: '2.2rem' }}>⚡</div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Instalación Cero (PWA)</h3>
              <p style={{ color: '#7a7a9a', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Olvídate de buscar en la App Store. Al escanear el QR, entras a una Progressive Web App directa y optimizada. Ligera, rápida y compatible con cualquier Smart TV o navegador de consola.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '4rem 4rem 3rem', background: '#050508', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-cuentajoy.png" alt="Cuenta Joy" style={{ height: '36px', width: 'auto', alignSelf: 'flex-start' }} />
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Historias y juegos que conectan pantallas y familias.</p>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <a href="#cómo-funciona" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem' }}>Cómo funciona</a>
              <a href="#catálogo" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem' }}>Catálogo</a>
              <a href="/tv" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem' }}>Portal TV</a>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>
              <span>Cuenta Joy © 2026</span>
              <span>Desarrollado con ✨ para pequeños y grandes exploradores</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.7rem', lineHeight: 1.4, maxWidth: '800px' }}>
              * Nota: Las secciones de juegos como Sintonía, Showtime y Legado están inspiradas de forma independiente en las mecánicas de juego de The Mind, Scout y Claim respectivamente, sin afiliación, patrocinio ni derechos oficiales sobre las marcas o editoriales originales.
            </p>
          </div>

        </div>
      </footer>

      {/* MODAL QR DE CONEXIÓN */}
      {showQRModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex', alignItems: 'center', justifyConnection: 'center', justifyContent: 'center'
        } as React.CSSProperties}>
          <div className="modal-content" style={{
            background: '#0d0d14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
            padding: '3rem', maxWidth: '480px', width: '90%', position: 'relative', display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(124, 106, 247, 0.15)'
          }}>
            {/* Botón cerrar */}
            <button onClick={() => setShowQRModal(false)} style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none',
              color: 'rgba(255,255,255,0.4)', fontSize: '1.2rem', cursor: 'pointer', transition: 'color 0.2s'
            }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
              ✕
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#7c6af7', letterSpacing: '0.25em', fontWeight: 800, textTransform: 'uppercase' }}>Comenzar el juego</span>
              <h3 className="title-display" style={{ fontSize: '1.8rem', fontWeight: 800 }}>Conecta tu Celular</h3>
              <p style={{ color: '#7a7a9a', fontSize: '0.9rem', lineHeight: 1.4 }}>
                Escanea este código QR con la cámara de tu celular o tablet para abrir la aplicación de control remoto.
              </p>
            </div>

            {/* Código QR SVG */}
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '20px', alignSelf: 'center', boxShadow: '0 0 25px rgba(255,255,255,0.05)', display: 'inline-flex' }}>
              {typeof window !== 'undefined' ? (
                <QRCodeSVG value={window.location.origin} size={180} />
              ) : (
                <div style={{ width: 180, height: 180, background: '#f0f0f0' }} />
              )}
            </div>

            {/* Link alternativo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>O entra desde tu navegador móvil a:</p>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '8px 14px', fontSize: '0.9rem'
              }}>
                <code style={{ color: '#b8aeff', fontWeight: 700 }}>cuentajoy.cl</code>
                <button onClick={handleCopyLink} style={{
                  background: 'transparent', border: 'none', color: '#7c6af7', fontSize: '0.8rem', fontWeight: 800,
                  cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  {copiedLink ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}