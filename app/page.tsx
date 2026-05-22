'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

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

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

type ModalState = { open: false } | { open: true; cuento: typeof CUENTOS[0]; step: 'code' | 'connected'; code: string }

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [modal, setModal] = useState<ModalState>({ open: false })

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openTV = (cuento: typeof CUENTOS[0]) => {
    const code = generateCode()
    setModal({ open: true, cuento, step: 'code', code })
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
          display: flex; align-items: center; justifyContent: center;
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

        .code-char {
          width: 60px; height: 72px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Beau Rivage', cursive;
          font-size: 2rem; font-weight: 900; color: white;
        }

        @media (max-width: 768px) {
          .story-inner { flex-direction: column !important; padding: 5rem 1.5rem !important; gap: 2rem !important; }
          .story-text { align-items: center !important; text-align: center !important; }
          .section-num { display: none; }
          .story-desc { max-width: 100% !important; }
          .story-btns { justify-content: center !important; }
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
          .code-char { width: 48px !important; height: 60px !important; font-size: 1.6rem !important; }
          .modal-box { padding: 1.75rem !important; }
        }

        @media (max-width: 400px) {
          .hero-title { font-size: 1.9rem !important; }
          .story-pills { gap: 0.4rem !important; }
          .story-pill { font-size: 0.7rem !important; padding: 7px 10px !important; }
          .code-char { width: 42px !important; height: 54px !important; font-size: 1.4rem !important; }
        }
      `}</style>

      <div className="grain" />

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '1.4rem 3rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: `rgba(6,6,8,${Math.min(Math.max((scrollY - 80) / 150, 0), 0.95)})`,
        backdropFilter: scrollY > 20 ? 'blur(12px)' : 'none',
        borderBottom: scrollY > 20 ? '1px solid rgba(255,255,255,0.05)' : 'none',
        transition: 'all 0.4s ease',
        opacity: scrollY > 60 ? 1 : 0,
        pointerEvents: scrollY > 60 ? 'auto' : 'none',
      }} className="nav-inner">
        <a href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-cuentajoy.png" alt="Cuentajoy" style={{ height: 38, width: 'auto', objectFit: 'contain', display: 'block' }} />
        </a>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#cuentos" className="nav-link">Cuentos</a>
          <a href="#" className="nav-link">Nosotros</a>
          <button className="btn btn-solid" style={{ padding: '9px 20px', fontSize: '0.78rem' }}
            onClick={() => document.getElementById('cuentos')?.scrollIntoView({ behavior: 'smooth' })}>
            Ver cuentos
          </button>
        </div>
      </nav>

      {/* HERO */}
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
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />
        {/* Gradiente izquierda para legibilidad del logo y texto */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />
        {/* Gradiente inferior para legibilidad del texto */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 45%)' }} />

        {/* Logo grande arriba izquierda */}
        <div style={{ position: 'relative', zIndex: 2, padding: '2.5rem 9rem', animation: 'fadeIn 1s ease 0s both' }} className="hero-logo-area">
          <span style={{ fontFamily: 'Nunito', fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '0.5rem' }}><img style={{ width: '90px'}} src="/logo-genofy.png"/></span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-cuentajoy.png" alt="Cuentajoy" style={{ width: 'clamp(220px, 28vw, 420px)', height: 'auto', objectFit: 'contain', display: 'block' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 2, padding: '0 9rem 3.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem' }} className="hero-bottom">
          {/* Título + descripción */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h1 className="hero-title" style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '50px',
              fontWeight: 500, lineHeight: 1, color: 'white',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              animation: 'fadeUp 0.8s ease 0.1s both',
            }}>
              Historias Vivas
            </h1>
            <p className="hero-subtitle" style={{
              fontFamily: 'Cinzel', fontSize: 'clamp(0.8rem, 1.2vw, 1.95rem)',
              color: 'rgb(109 98 163)', fontWeight: 300, lineHeight: 1.2,
              animation: 'fadeUp 0.8s ease 0.25s both',
            }}>
              Cinco historias únicas para la pantalla grande.<br />
              Tu celular es la llave. La TV, el portal.
            </p>
          </div>

          {/* Botones abajo derecha */}
          <div className="hero-btns" style={{ display: 'flex', gap: '1rem', flexShrink: 0, animation: 'fadeUp 0.8s ease 0.4s both' }}>
            <button className="btn btn-solid"
              onClick={() => document.getElementById('cuentos')?.scrollIntoView({ behavior: 'smooth' })}>
              Explorar cuentos
            </button>
            <button className="btn btn-ghost">▶ Ver demo</button>
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

        {/* Scroll hint */}
        <div className="scroll-hint" style={{ position: 'absolute', bottom: '2rem', right: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.25)', fontFamily: 'Nunito', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', zIndex: 2 }}>
          <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.15)' }} />
          scroll
        </div>
      </section>

      {/* CUENTOS */}
      <div id="cuentos">
        {CUENTOS.map((cuento, index) => (
          <StorySection key={cuento.id} cuento={cuento} index={index} onOpenTV={() => openTV(cuento)} />
        ))}
      </div>

      {/* FOOTER CTA */}
      <section className="cta-section" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8rem 3rem', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(124,106,247,0.08), transparent)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: 'Nunito', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>¿Listo para empezar?</p>
          <h2 style={{ fontFamily: "'Beau Rivage', cursive", fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, color: 'white', lineHeight: 1.05, marginBottom: '2rem', letterSpacing: '-0.02em' }}>
            La historia<br /><em style={{ color: 'rgba(255,255,255,0.4)' }}>te espera</em>
          </h2>
          <button className="btn btn-solid" style={{ fontSize: '0.9rem', padding: '15px 34px' }}
            onClick={() => document.getElementById('cuentos')?.scrollIntoView({ behavior: 'smooth' })}>
            📺 &nbsp; Elegir un cuento
          </button>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'rgba(255,255,255,0.18)', fontFamily: 'Nunito', fontSize: '0.78rem' }} className="footer-inner">
        <span>Cuentajoy © 2025</span>
        <span>Hecho con ✨ para pequeños exploradores</span>
      </footer>

      {/* MODAL VER EN TV */}
      {modal.open && (
        <TVModal cuento={modal.cuento} code={modal.code} step={modal.step}
          onStepChange={(step) => setModal(m => m.open ? { ...m, step } : m)}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

function StorySection({ cuento, index, onOpenTV }: {
  cuento: typeof CUENTOS[0]; index: number; onOpenTV: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
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


      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3rem', position: 'relative', zIndex: 1 }}>

        {/* COLUMNA IZQUIERDA: texto */}
        <div style={{ flex: '0 0 42%', display: 'flex', flexDirection: 'column', gap: '1.1rem', transform: visible ? 'translateX(0)' : 'translateX(-40px)', opacity: visible ? 1 : 0, transition: 'all 0.85s cubic-bezier(0.16,1,0.3,1) 0.1s' }}>

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
          <p style={{ fontFamily: 'Nunito', fontSize: '0.9rem', lineHeight: 1.2, color: '#ffffff', maxWidth: 400, fontWeight: 300, marginTop: '0.25rem' }}>
            {cuento.desc}
          </p>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={onOpenTV} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Nunito', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 20px', borderRadius: 8, background: cuento.glow, border: 'none', color: 'white', cursor: 'pointer' }}>
              📺 Ver en TV
            </button>
            <button onClick={() => window.location.href = `/cuento/${cuento.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Nunito', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: 'white', cursor: 'pointer' }}>
              Abrir cuento →
            </button>
          </div>
        </div>

        {/* COLUMNA DERECHA: card QR + pills */}
        <div className="story-right" style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', transform: visible ? 'translateX(0)' : 'translateX(40px)', opacity: visible ? 1 : 0, transition: 'all 0.85s cubic-bezier(0.16,1,0.3,1) 0.25s' }}>

          {/* Placeholder card blanca (donde irá el personaje) */}
          <div className="story-card" style={{ width: 200, height: 200, background: 'white', borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }} />

          {/* Pills TE HABLA / TE ESCUCHA / TE ENSEÑA */}
          <div className="story-pills" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
          {['TE HABLA', 'TE ESCUCHA', 'TE ENSEÑA'].map((label, i) => (
            <div key={label} className="story-pill" style={{ display: 'flex', alignItems: 'center', gap: 10, background: cuento.glow, borderRadius: 8, padding: '10px 20px', minWidth: 180, boxShadow: `0 4px 20px ${cuento.glow}44`, transform: visible ? 'translateX(0)' : 'translateX(30px)', opacity: visible ? 1 : 0, transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${0.35 + i * 0.1}s` }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />
              <span style={{ fontFamily: 'Nunito', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', color: 'white' }}>{label}</span>
            </div>
          ))}
          </div>
        </div>

      </div>
    </section>
  )
}

function TVModal({ cuento, code, step, onStepChange, onClose }: {
  cuento: typeof CUENTOS[0]
  code: string
  step: 'code' | 'connected'
  onStepChange: (s: 'code' | 'connected') => void
  onClose: () => void
}) {
  const tvUrl = typeof window !== 'undefined' ? `${window.location.origin}/tv` : ''

  useEffect(() => {
    const channel = supabase.channel(`session:${code}`)
    channel
      .on('broadcast', { event: 'tv_ready' }, () => onStepChange('connected'))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [code])

  const handleSend = async () => {
    await supabase.channel(`session:${code}`).send({
      type: 'broadcast', event: 'show_content', payload: { show: true },
    })
    onClose()
  }

  return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem', cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'white')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>✕</button>

        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '2rem' }}>{cuento.emoji}</span>
          <h3 style={{ fontFamily: "'Beau Rivage', cursive", fontSize: '1.4rem', fontWeight: 700, color: 'white', marginTop: 8, whiteSpace: 'pre-line', lineHeight: 1.2 }}>
            {cuento.title}
          </h3>
          <p style={{ fontFamily: 'Nunito', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
            {step === 'code' ? 'Conecta tu TV para ver este cuento' : '¡TV conectada! Envía el cuento'}
          </p>
        </div>

        {step === 'code' && (
          <>
            <p style={{ fontFamily: 'Nunito', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
              1. En tu TV abre el navegador y ve a
            </p>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 16px', marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: 'Nunito', fontSize: '0.95rem', color: 'white', fontWeight: 500 }}>{tvUrl}</span>
            </div>

            <p style={{ fontFamily: 'Nunito', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
              2. Ingresa este código
            </p>
            <div style={{ display: 'flex', gap: 10, marginBottom: '1.75rem' }}>
              {code.split('').map((char, i) => (
                <div key={i} className="code-char" style={{ borderColor: `${cuento.glow}60`, boxShadow: `0 0 16px ${cuento.glow}30` }}>{char}</div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'Nunito', fontSize: '0.82rem' }}>
              <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: cuento.glow, borderRadius: '50%', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              Esperando conexión de la TV...
            </div>
          </>
        )}

        {step === 'connected' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: '1.5rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', flexShrink: 0 }} />
              <span style={{ fontFamily: 'Nunito', fontWeight: 500, color: '#4ade80', fontSize: '0.88rem' }}>TV conectada y lista</span>
            </div>
            <button className="btn" onClick={handleSend} style={{ width: '100%', justifyContent: 'center', background: cuento.glow, border: `1px solid ${cuento.glow}`, color: 'white', fontWeight: 500, fontSize: '0.9rem', padding: '15px' }}>
              ▶ &nbsp; Enviar cuento a la TV
            </button>
          </>
        )}
      </div>
    </div>
  )
}