'use client'

import { useEffect, useRef, useState } from 'react'
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

  return (
    <div style={{ background: '#060608', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Beau+Rivage&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');
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
          .story-inner { flex-direction: column !important; padding: 5rem 1.5rem !important; gap: 2.5rem !important; }
          .story-text { align-items: center !important; text-align: center !important; }
          .section-num { display: none; }
          .story-desc { max-width: 100% !important; }
          .story-btns { justify-content: center !important; }
        }
      `}</style>

      <div className="grain" />

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '1.4rem 3rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: `rgba(6,6,8,${Math.min(scrollY / 200, 0.95)})`,
        backdropFilter: scrollY > 20 ? 'blur(12px)' : 'none',
        borderBottom: scrollY > 20 ? '1px solid rgba(255,255,255,0.05)' : 'none',
        transition: 'all 0.4s ease',
      }}>
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
    alignItems: 'center',
    padding: '0 3rem',
    position: 'relative',
    overflow: 'hidden',
    backgroundImage: "url('/public/bg1.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(124,106,247,0.1) 0%, transparent 70%)',
          transform: `translateY(${scrollY * 0.3}px)`,
        }} />
        {[...Array(35)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 37 + 13) % 100}%`, top: `${(i * 53 + 7) % 100}%`,
            width: i % 5 === 0 ? 2 : 1, height: i % 5 === 0 ? 2 : 1,
            background: 'white', borderRadius: '50%',
            opacity: 0.08 + (i % 7) * 0.04,
            transform: `translateY(${scrollY * (0.05 + (i % 5) * 0.04)}px)`,
          }} />
        ))}

        <div style={{
          maxWidth: 1200, margin: '0 auto', width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '4rem', paddingTop: '6rem',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem', animation: 'fadeUp 0.8s ease 0s both' }}>
              <div style={{ width: 28, height: 1, background: 'rgba(255,255,255,0.25)' }} />
              <span style={{ fontFamily: 'Nunito', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                Historias que cobran vida
              </span>
            </div>
            {/* Logo grande en hero */}
            <div style={{ animation: 'fadeUp 0.8s ease 0.15s both', marginBottom: '0.5rem' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-cuentajoy.png" alt="Cuentajoy" style={{ width: 'clamp(200px, 30vw, 340px)', height: 'auto', objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 40px rgba(124,106,247,0.3))' }} />
            </div>
            <h1 style={{
              fontFamily: "'Beau Rivage', cursive",
              fontSize: 'clamp(3.5rem, 8vw, 7.5rem)',
              fontWeight: 900, lineHeight: 0.95, color: 'white',
              letterSpacing: '-0.02em',
              animation: 'fadeUp 0.8s ease 0.15s both',
            }}>
              Donde los<br />
              <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.65)' }}>cuentos</em><br />
              se viven
            </h1>
            <p style={{
              fontFamily: 'Nunito', fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)',
              color: 'rgba(255,255,255,0.4)', fontWeight: 300, lineHeight: 1.75,
              marginTop: '2rem', maxWidth: 400,
              animation: 'fadeUp 0.8s ease 0.3s both',
            }}>
              Cinco historias únicas para la pantalla grande. Tu celular es la llave. La TV, el portal.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', animation: 'fadeUp 0.8s ease 0.45s both' }}>
              <button className="btn btn-solid"
                onClick={() => document.getElementById('cuentos')?.scrollIntoView({ behavior: 'smooth' })}>
                Explorar cuentos
              </button>
              <button className="btn btn-ghost">▶ Ver demo</button>
            </div>
          </div>

          {/* Orb visual */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: 480, animation: 'fadeIn 1.2s ease 0.3s both' }}>
            {CUENTOS.map((c, i) => {
              const angle = (i / CUENTOS.length) * Math.PI * 2 - Math.PI / 2
              const r = 175
              return (
                <div key={c.id} onClick={() => document.getElementById(`cuento-${c.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    position: 'absolute',
                    left: `calc(50% + ${Math.cos(angle) * r}px)`,
                    top: `calc(50% + ${Math.sin(angle) * r}px)`,
                    transform: 'translate(-50%,-50%)',
                    width: 60, height: 60,
                    background: `radial-gradient(circle, ${c.glow}25, transparent)`,
                    border: `1px solid ${c.glow}40`,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem', cursor: 'pointer',
                    animation: `floatSlow ${5 + i}s ease-in-out infinite`,
                    animationDelay: `${i * 0.6}s`,
                    transition: 'transform 0.3s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1.25)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1)')}
                >{c.emoji}</div>
              )
            })}
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 110, height: 110, border: '1px solid rgba(255,255,255,0.07)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 72, height: 72, background: 'radial-gradient(circle, rgba(255,255,255,0.07), transparent)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>✨</div>
            </div>
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 380, height: 380, border: '1px solid rgba(255,255,255,0.03)', borderRadius: '50%' }} />
          </div>
        </div>

        <div className="scroll-hint" style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.2)', fontFamily: 'Nunito', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.12)' }} />
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
      <section style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8rem 3rem', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
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

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'rgba(255,255,255,0.18)', fontFamily: 'Nunito', fontSize: '0.78rem' }}>
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
  const isEven = index % 2 === 0

  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 })
    obs.observe(el)
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      setProgress(Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight)))
    }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll()
    return () => { obs.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [])

  return (
    <section id={`cuento-${cuento.id}`} ref={ref} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '6rem 0' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 70% at ${isEven ? '70%' : '30%'} 50%, ${cuento.glow}15 0%, transparent 70%)`, transform: `translateY(${(progress - 0.5) * -40}px)`, transition: 'transform 0.1s linear' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.04)' }} />

      <div className="story-inner" style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 3rem', display: 'flex', flexDirection: isEven ? 'row' : 'row-reverse', alignItems: 'center', gap: '5rem' }}>

        {/* Emoji */}
        <div style={{ flex: '0 0 auto', width: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transform: visible ? 'translateY(0) scale(1)' : `translateY(${isEven ? 50 : -50}px) scale(0.92)`, opacity: visible ? 1 : 0, transition: 'all 0.85s cubic-bezier(0.16,1,0.3,1) 0.1s' }}>
          <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${cuento.glow}18, transparent 70%)` }} />
          <div style={{ position: 'absolute', width: 190, height: 190, borderRadius: '50%', border: `1px solid ${cuento.glow}28` }} />
          <span className="float" style={{ fontSize: 'clamp(5rem, 10vw, 8rem)', filter: `drop-shadow(0 0 40px ${cuento.glow}88)`, display: 'block', animationDelay: `${index * 0.4}s` }}>
            {cuento.emoji}
          </span>
        </div>

        {/* Text */}
        <div className="story-text" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1.25rem', position: 'relative', transform: visible ? 'translateX(0)' : `translateX(${isEven ? 40 : -40}px)`, opacity: visible ? 1 : 0, transition: 'all 0.85s cubic-bezier(0.16,1,0.3,1) 0.25s' }}>
          <span className="section-num">0{cuento.id}</span>

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Nunito', fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '5px 13px', borderRadius: 100, border: `1px solid ${cuento.accent}55`, color: cuento.accent, opacity: 0.85 }}>
            {cuento.emoji} {cuento.tag}
          </span>

          <h2 style={{ fontFamily: "'Beau Rivage', cursive", fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, lineHeight: 1.05, whiteSpace: 'pre-line', color: 'white', letterSpacing: '-0.02em' }}>
            {cuento.title}
          </h2>

          <p style={{ fontFamily: "'Beau Rivage', cursive", fontSize: '1rem', fontStyle: 'italic', color: `${cuento.accent}cc` }}>
            {cuento.subtitle}
          </p>

          <div style={{ width: 36, height: 1, background: cuento.glow, opacity: 0.4 }} />

          <p style={{ fontFamily: 'Nunito', fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.45)', maxWidth: 460, fontWeight: 300 }}>
            {cuento.desc}
          </p>

          <div className="story-btns" style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn" onClick={onOpenTV} style={{ background: cuento.glow, border: `1px solid ${cuento.glow}`, color: 'white', fontWeight: 500 }}>
              📺 Ver en TV
            </button>
            <button className="btn btn-ghost" style={{ borderColor: `${cuento.glow}44`, color: cuento.accent }}
              onClick={() => window.location.href = `/cuento/${cuento.id}`}>
              Abrir cuento →
            </button>
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
