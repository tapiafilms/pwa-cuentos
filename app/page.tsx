'use client'

import { useEffect, useRef, useState } from 'react'

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
  },
]

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: '#060608', overflowX: 'hidden', cursor: 'default' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --display: 'Playfair Display', serif;
          --body: 'DM Sans', sans-serif;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        html { scroll-behavior: smooth; }

        ::selection { background: rgba(255,255,255,0.15); }

        .nav-link {
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: color 0.3s;
        }
        .nav-link:hover { color: white; }

        .story-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.25);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 14px 28px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        .story-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.05);
          transform: translateX(-100%);
          transition: transform 0.4s ease;
        }
        .story-btn:hover::before { transform: translateX(0); }
        .story-btn:hover { border-color: rgba(255,255,255,0.5); }

        .story-btn-primary {
          background: white;
          color: #060608;
          border-color: white;
          font-weight: 500;
        }
        .story-btn-primary:hover { background: rgba(255,255,255,0.9); }
        .story-btn-primary::before { background: rgba(0,0,0,0.05); }

        .grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-12px) rotate(1deg); }
          66%       { transform: translateY(-6px) rotate(-0.5deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes scroll-hint {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50%       { transform: translateY(8px); opacity: 1; }
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(4rem, 9vw, 8rem);
          font-weight: 900;
          line-height: 0.95;
          color: white;
          animation: fadeUp 1s ease 0.2s both;
          letter-spacing: -0.02em;
        }

        .hero-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(1rem, 1.8vw, 1.2rem);
          color: rgba(255,255,255,0.45);
          font-weight: 300;
          letter-spacing: 0.05em;
          animation: fadeUp 1s ease 0.5s both;
          max-width: 420px;
          line-height: 1.7;
        }

        .section-number {
          font-family: 'Playfair Display', serif;
          font-size: clamp(6rem, 15vw, 14rem);
          font-weight: 900;
          line-height: 1;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.06);
          user-select: none;
          position: absolute;
          right: -0.05em;
          top: -0.2em;
          pointer-events: none;
        }

        .story-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.8rem, 5.5vw, 5rem);
          font-weight: 900;
          line-height: 1.05;
          white-space: pre-line;
          letter-spacing: -0.02em;
        }

        .tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 100px;
          border: 1px solid currentColor;
          opacity: 0.7;
        }

        .divider-line {
          width: 40px;
          height: 1px;
          background: currentColor;
          opacity: 0.4;
        }

        .story-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(0.9rem, 1.4vw, 1rem);
          line-height: 1.8;
          color: rgba(255,255,255,0.5);
          max-width: 480px;
          font-weight: 300;
        }

        .emoji-float {
          font-size: clamp(5rem, 12vw, 10rem);
          animation: floatSlow 6s ease-in-out infinite;
          user-select: none;
          filter: drop-shadow(0 0 40px currentColor);
          display: block;
        }

        .scroll-indicator {
          animation: scroll-hint 2s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .story-section-inner {
            flex-direction: column !important;
            gap: 3rem !important;
            padding: 6rem 1.5rem !important;
          }
          .story-right {
            align-items: center !important;
            text-align: center !important;
          }
          .story-desc { max-width: 100% !important; }
          .section-number { display: none; }
          .hero-btns { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {/* Grain overlay */}
      <div className="grain" />

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 50,
        padding: '1.5rem 3rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: `rgba(6,6,8,${Math.min(scrollY / 200, 0.95)})`,
        backdropFilter: scrollY > 20 ? 'blur(12px)' : 'none',
        borderBottom: scrollY > 20 ? '1px solid rgba(255,255,255,0.05)' : 'none',
        transition: 'all 0.4s ease',
      }}>
        <span style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.2rem',
          fontWeight: 700,
          color: 'white',
          letterSpacing: '-0.01em',
        }}>Cuentos<span style={{ color: 'rgba(255,255,255,0.35)' }}>.tv</span></span>

        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {CUENTOS.slice(0, 3).map(c => (
            <a key={c.id} href={`#cuento-${c.id}`} className="nav-link"
              style={{ display: 'none' }}
            >{c.title.split('\n')[0]}</a>
          ))}
          <a href="#cuentos" className="nav-link">Cuentos</a>
          <a href="#" className="nav-link">Nosotros</a>
          <button className="story-btn-primary story-btn" style={{ padding: '10px 22px', fontSize: '0.8rem' }}>
            Ver en TV
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        padding: '0 3rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background radial */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(124,106,247,0.12) 0%, transparent 70%)',
          transform: `translateY(${scrollY * 0.3}px)`,
        }} />

        {/* Stars */}
        {[...Array(40)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 37 + 13) % 100}%`,
            top: `${(i * 53 + 7) % 100}%`,
            width: i % 5 === 0 ? 2 : 1,
            height: i % 5 === 0 ? 2 : 1,
            background: 'white',
            borderRadius: '50%',
            opacity: 0.1 + (i % 7) * 0.05,
            transform: `translateY(${scrollY * (0.1 + (i % 5) * 0.05)}px)`,
          }} />
        ))}

        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '4rem',
          paddingTop: '6rem',
        }}>
          <div style={{ flex: 1 }}>
            {/* Label */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              marginBottom: '2rem',
              animation: 'fadeUp 1s ease 0s both',
            }}>
              <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.3)' }} />
              <span style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.72rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
              }}>Historias que cobran vida</span>
            </div>

            <h1 className="hero-title">
              Donde los<br />
              <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.75)' }}>cuentos</em><br />
              se viven
            </h1>

            <p className="hero-sub" style={{ marginTop: '2rem' }}>
              Cinco historias únicas diseñadas para la pantalla grande. Tu celular se convierte en la llave. La TV, en el portal.
            </p>

            <div className="hero-btns" style={{ display: 'flex', gap: '1rem', marginTop: '3rem', alignItems: 'center' }}>
              <button className="story-btn-primary story-btn" onClick={() => document.getElementById('cuentos')?.scrollIntoView({ behavior: 'smooth' })}>
                Explorar cuentos
              </button>
              <button className="story-btn">
                <span style={{ fontSize: '1rem' }}>▶</span> Ver demo
              </button>
            </div>
          </div>

          {/* Hero visual */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: 500,
            animation: 'fadeIn 1.5s ease 0.3s both',
          }}>
            {/* Orbiting emojis */}
            {CUENTOS.map((c, i) => {
              const angle = (i / CUENTOS.length) * Math.PI * 2 - Math.PI / 2
              const radius = 180
              const x = Math.cos(angle) * radius
              const y = Math.sin(angle) * radius
              return (
                <div key={c.id} style={{
                  position: 'absolute',
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                  width: 64, height: 64,
                  background: `radial-gradient(circle, ${c.glow}22, transparent)`,
                  border: `1px solid ${c.glow}44`,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem',
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  animation: `floatSlow ${5 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
                  onClick={() => document.getElementById(`cuento-${c.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.2)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)')}
                >
                  {c.emoji}
                </div>
              )
            })}

            {/* Center */}
            <div style={{
              position: 'absolute',
              left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 120, height: 120,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 80, height: 80,
                background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '2rem' }}>✨</span>
              </div>
            </div>

            {/* Outer ring */}
            <div style={{
              position: 'absolute',
              left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400, height: 400,
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '50%',
            }} />
          </div>
        </div>

        {/* Scroll hint */}
        <div className="scroll-indicator" style={{
          position: 'absolute', bottom: '3rem', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          color: 'rgba(255,255,255,0.25)',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase',
        }}>
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.15)' }} />
          scroll
        </div>
      </section>

      {/* CUENTOS */}
      <div id="cuentos">
        {CUENTOS.map((cuento, index) => (
          <StorySection key={cuento.id} cuento={cuento} index={index} />
        ))}
      </div>

      {/* FOOTER CTA */}
      <section style={{
        minHeight: '60vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '8rem 3rem',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(124,106,247,0.1), transparent)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.75rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
            marginBottom: '1.5rem',
          }}>¿Listo para empezar?</p>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 900, color: 'white',
            lineHeight: 1.1, marginBottom: '2rem',
            letterSpacing: '-0.02em',
          }}>
            La historia<br />
            <em style={{ color: 'rgba(255,255,255,0.5)' }}>te espera</em>
          </h2>
          <button className="story-btn-primary story-btn" style={{ fontSize: '0.95rem', padding: '16px 36px' }}>
            📺 &nbsp; Conectar a la TV
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '2rem 3rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: 'rgba(255,255,255,0.2)',
        fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem',
      }}>
        <span>Cuentos.tv © 2025</span>
        <span>Hecho con ✨ para pequeños exploradores</span>
      </footer>
    </div>
  )
}

function StorySection({ cuento, index }: { cuento: typeof CUENTOS[0], index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const isEven = index % 2 === 0

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 }
    )
    observer.observe(el)

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const windowH = window.innerHeight
      const p = 1 - (rect.top / windowH)
      setProgress(Math.max(0, Math.min(1, p)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => { observer.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [])

  return (
    <section
      id={`cuento-${cuento.id}`}
      ref={ref}
      style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '6rem 0',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 70% 70% at ${isEven ? '70%' : '30%'} 50%, ${cuento.glow}18 0%, transparent 70%)`,
        transform: `translateY(${(progress - 0.5) * -40}px)`,
        transition: 'transform 0.1s linear',
      }} />

      {/* Subtle horizontal line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 1, background: 'rgba(255,255,255,0.04)',
      }} />

      <div className="story-section-inner" style={{
        maxWidth: 1200, margin: '0 auto', width: '100%',
        padding: '0 3rem',
        display: 'flex',
        flexDirection: isEven ? 'row' : 'row-reverse',
        alignItems: 'center',
        gap: '6rem',
      }}>
        {/* Emoji visual side */}
        <div style={{
          flex: '0 0 auto',
          width: 320,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          transform: visible ? 'translateY(0) scale(1)' : `translateY(${isEven ? 60 : -60}px) scale(0.9)`,
          opacity: visible ? 1 : 0,
          transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
        }}>
          {/* Glow circle behind */}
          <div style={{
            position: 'absolute',
            width: 260, height: 260,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${cuento.glow}20, transparent 70%)`,
            animation: 'pulse-glow 4s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute',
            width: 200, height: 200,
            borderRadius: '50%',
            border: `1px solid ${cuento.glow}30`,
          }} />
          <span className="emoji-float" style={{ color: cuento.glow }}>
            {cuento.emoji}
          </span>
        </div>

        {/* Text side */}
        <div className="story-right" style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '1.5rem',
          position: 'relative',
          transform: visible ? 'translateX(0)' : `translateX(${isEven ? 50 : -50}px)`,
          opacity: visible ? 1 : 0,
          transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.25s',
        }}>
          {/* Section number */}
          <span className="section-number">0{cuento.id}</span>

          <span className="tag-pill" style={{ color: cuento.accent }}>
            {cuento.emoji} {cuento.tag}
          </span>

          <h2 className="story-title" style={{ color: 'white' }}>
            {cuento.title}
          </h2>

          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)',
            fontStyle: 'italic',
            color: `${cuento.accent}cc`,
            letterSpacing: '0.01em',
          }}>
            {cuento.subtitle}
          </p>

          <div className="divider-line" style={{ color: cuento.glow }} />

          <p className="story-desc">{cuento.desc}</p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <button className="story-btn-primary story-btn" style={{
              background: cuento.glow,
              border: `1px solid ${cuento.glow}`,
              color: 'white',
            }}>
              📺 Ver en TV
            </button>
            <button className="story-btn" style={{ borderColor: `${cuento.glow}55`, color: cuento.accent }}>
              Leer más →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}