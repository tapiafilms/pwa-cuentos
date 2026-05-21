'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

const CUENTOS: Record<string, {
  title: string; emoji: string; glow: string; accent: string; tag: string;
  paragraphs: string[]
}> = {
  '1': {
    title: 'El Bosque que Respira', emoji: '🌿', glow: '#52b788', accent: '#95d5b2',
    tag: 'Aventura · 6–10 años',
    paragraphs: [
      'Era una noche como cualquier otra cuando Mía escuchó por primera vez el susurro.',
      'No venía del viento, ni de la lluvia golpeando la ventana. Venía de los árboles del jardín — los mismos que había visto crecer desde que era pequeña.',
      'Pronunciaban su nombre. Despacio. Con una calidez que hacía vibrar el aire.',
      'Mía se puso las botas, cruzó el jardín descalza sobre el pasto húmedo, y se detuvo frente al roble más viejo.',
      'Puso la mano sobre su corteza y sintió algo que nunca olvidaría: el árbol respiraba.',
      'Y bajo sus raíces, esperaba un mundo donde el tiempo fluía al revés...',
    ],
  },
  '2': {
    title: 'La Ballena de Cristal', emoji: '🐋', glow: '#4a90d9', accent: '#90caf9',
    tag: 'Fantasía · 5–9 años',
    paragraphs: [
      'Nadie más en la ciudad miraba hacia arriba con suficiente atención.',
      'Pero Tomás sí. Tomás siempre miraba hacia arriba.',
      'Y fue así como la vio: enorme, silenciosa, traslúcida como el hielo más puro. Una ballena nadando entre las nubes.',
      'Su cuerpo brillaba con los sueños que había recogido — algunos dorados, otros azules, todos olvidados por quienes dormían abajo.',
      'Tomás subió al tejado más alto de su edificio, extendió los brazos, y saltó.',
      'No cayó. Flotó. Y la ballena lo esperaba.',
    ],
  },
  '3': {
    title: 'El Reloj Sin Agujas', emoji: '⏰', glow: '#e07b39', accent: '#ffb74d',
    tag: 'Misterio · 7–11 años',
    paragraphs: [
      'El martes 14 de octubre, a las ocho de la mañana, todos los relojes del mundo dejaron de tener agujas.',
      'No desaparecieron de golpe. Simplemente... se fueron. Como si nunca hubieran estado.',
      'El mundo entró en pánico. Nadie sabía qué hora era. Nadie sabía cuánto tiempo había pasado.',
      'Pero Theo, de nueve años, encontró algo debajo de su cama: una aguja de reloj. Pequeña, dorada, temblorosa.',
      'Y con ella, un mapa al mercado de los sueños, donde las demás agujas esperaban ser rescatadas.',
      'Devolverlas tenía un precio. Theo tendría que entregar algo que nunca más podría recuperar.',
    ],
  },
  '4': {
    title: 'La Reina de la Niebla', emoji: '👑', glow: '#9c6fde', accent: '#ce93d8',
    tag: 'Magia · 6–10 años',
    paragraphs: [
      'El castillo solo aparecía al amanecer, cuando la niebla era tan densa que parecía sólida.',
      'Los adultos del pueblo decían que era una ilusión. Los niños sabían que no lo era.',
      'Sofía lo había visto tres veces. La cuarta vez, decidió entrar.',
      'La reina la esperaba en el salón principal, sentada en un trono hecho de nubes comprimidas, con ojos del color del cielo antes de la tormenta.',
      '"Llevas cien años tardando", dijo la reina sin sorpresa. "Pensé que nunca aprenderías a leer las nubes."',
      'Sofía miró por la ventana. Las nubes formaban letras. Y por primera vez en su vida, las entendió.',
    ],
  },
  '5': {
    title: 'El Cartero de las Estrellas', emoji: '✉️', glow: '#5c8ee0', accent: '#ffd54f',
    tag: 'Ciencia · 8–12 años',
    paragraphs: [
      'Las estrellas fugaces no son rocas. Son cartas.',
      'Luna lo descubrió por accidente, la noche que una carta cayó directamente en sus manos.',
      'Estaba escrita en un idioma que no existía en ningún libro. Pero al tocarla, Luna lo entendió todo.',
      'Era un mensaje de una estrella a otra. Un mensaje de despedida. La estrella iba a apagarse.',
      'En la cima de la montaña más fría del mundo había un buzón. Luna tenía que llegar antes del amanecer.',
      'Porque si la carta no llegaba a tiempo, una estrella moriría sin saber que alguien la había amado.',
    ],
  },
}

function useTypewriter(text: string, speed: number, active: boolean) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!active) return
    setDisplayed('')
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(interval); setDone(true) }
    }, speed)
    return () => clearInterval(interval)
  }, [text, active, speed])

  return { displayed, done }
}

function Paragraph({ text, active, onDone }: {
  text: string; active: boolean; onDone: () => void; isLast: boolean
}) {
  const { displayed, done } = useTypewriter(text, 22, active)

  useEffect(() => { if (done) onDone() }, [done, onDone])

  const isVisible = active || done || displayed !== ''

  return (
    <p style={{
      fontFamily: "'Nunito', sans-serif",
      fontSize: 'clamp(1.1rem, 2.2vw, 1.35rem)',
      lineHeight: 1.9,
      color: done ? 'rgba(255,255,255,0.85)' : 'white',
      transition: 'color 1s ease, opacity 0.4s ease',
      minHeight: '1.9em',
      opacity: isVisible ? 1 : 0,
    }}>
      {displayed}
      {active && !done && (
        <span style={{
          display: 'inline-block', width: 2, height: '1.1em',
          background: 'white', marginLeft: 2,
          verticalAlign: 'text-bottom',
          animation: 'blink 0.8s ease infinite',
        }} />
      )}
    </p>
  )
}

function Particle({ glow, index }: { glow: string; index: number }) {
  const size = 2 + (index % 4)
  const left = `${(index * 37 + 11) % 100}%`
  const duration = 4 + (index % 6)
  const delay = (index * 0.3) % 4
  const startTop = 20 + (index * 17) % 60

  return (
    <div style={{
      position: 'absolute',
      left,
      top: `${startTop}%`,
      width: size,
      height: size,
      borderRadius: '50%',
      background: index % 3 === 0 ? glow : 'white',
      opacity: 0.15 + (index % 5) * 0.08,
      animation: `particleFloat ${duration}s ease-in-out ${delay}s infinite`,
    }} />
  )
}

export default function CuentoPage() {
  const { id } = useParams()
  const cuento = CUENTOS[id as string]
  const [currentPara, setCurrentPara] = useState(-1)
  const [started, setStarted] = useState(false)
  const [allDone, setAllDone] = useState(false)
  const doneRef = useRef(0)

  const start = () => {
    setStarted(true)
    setCurrentPara(0)
  }

  const handleDone = (index: number) => {
    doneRef.current = index
    if (cuento && index < cuento.paragraphs.length - 1) {
      setTimeout(() => setCurrentPara(index + 1), 600)
    } else {
      setTimeout(() => setAllDone(true), 400)
    }
  }

  if (!cuento) {
    return (
      <div style={{ minHeight: '100vh', background: '#060608', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontFamily: "'Nunito', sans-serif" }}>
        <a href="/" style={{ color: '#7c6af7' }}>← Volver</a>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060608', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Beau+Rivage&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes particleFloat {
          0%   { transform: translateY(0px); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-120px); opacity: 0; }
        }
        @keyframes breathe {
          0%,100% { transform: scale(1); opacity: 0.6; }
          50%      { transform: scale(1.08); opacity: 0.9; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes dropIn {
          0%   { opacity:0; transform:translateY(-40px) scale(0.85); }
          60%  { transform:translateY(6px) scale(1.04); }
          100% { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes glowPulse {
          0%,100% { opacity:0.4; transform:scale(1); }
          50%      { opacity:0.7; transform:scale(1.1); }
        }

        .start-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          font-family: 'Nunito', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 16px 40px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .start-btn:hover {
          border-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.04);
        }
        .tv-btn {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'Nunito', sans-serif; font-size: 0.85rem;
          font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 14px 28px; border-radius: 4px; cursor: pointer;
          transition: all 0.25s; border: none;
        }
        .back-link {
          color: rgba(255,255,255,0.3); font-family: 'Nunito', sans-serif;
          font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase;
          text-decoration: none; transition: color 0.2s;
          display: flex; align-items: center; gap: 6px;
        }
        .back-link:hover { color: rgba(255,255,255,0.7); }
      `}</style>

      {/* Particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {[...Array(24)].map((_, i) => <Particle key={i} glow={cuento.glow} index={i} />)}
      </div>

      {/* Background glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: `radial-gradient(ellipse 60% 60% at 50% 40%, ${cuento.glow}18 0%, transparent 70%)`, animation: 'breathe 6s ease-in-out infinite' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: `radial-gradient(ellipse 40% 40% at 80% 70%, ${cuento.accent}0a 0%, transparent 60%)`, animation: 'breathe 9s ease-in-out 2s infinite' }} />

      {/* Back */}
      <div style={{ position: 'fixed', top: '1.5rem', left: '2rem', zIndex: 10 }}>
        <a href="/" className="back-link">← Volver</a>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '8rem 2rem 6rem', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem', animation: 'dropIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
            <div style={{ position: 'absolute', inset: -20, background: `radial-gradient(circle, ${cuento.glow}30, transparent 70%)`, animation: 'glowPulse 3s ease-in-out infinite', borderRadius: '50%' }} />
            <span style={{ fontSize: 'clamp(4rem, 10vw, 6rem)', display: 'block', filter: `drop-shadow(0 0 30px ${cuento.glow})`, animation: 'breathe 5s ease-in-out infinite' }}>
              {cuento.emoji}
            </span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: "'Nunito', sans-serif", fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, border: `1px solid ${cuento.accent}44`, color: cuento.accent, marginBottom: '1.25rem' }}>
            {cuento.tag}
          </div>

          <h1 style={{
            fontFamily: "'Beau Rivage', cursive",
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            fontWeight: 400,
            lineHeight: 1.1,
            color: 'white',
            background: `linear-gradient(135deg, white 0%, ${cuento.accent} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {cuento.title}
          </h1>
        </div>

        {/* Separador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '3rem', animation: 'fadeIn 1s ease 0.5s both' }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${cuento.glow}40)` }} />
          <span style={{ color: cuento.accent }}>✦</span>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${cuento.glow}40)` }} />
        </div>

        {/* Start */}
        {!started && (
          <div style={{ textAlign: 'center', animation: 'fadeUp 0.8s ease 0.7s both', opacity: 0 }}>
            <p style={{ fontFamily: "'Nunito', sans-serif", color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Cuando estés listo, comienza la historia
            </p>
            <button className="start-btn" onClick={start}>✨ Comenzar historia</button>
          </div>
        )}

        {/* Paragraphs */}
        {started && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {cuento.paragraphs.map((text, i) => (
              <div key={i} style={{
                opacity: currentPara >= i ? 1 : 0,
                transform: currentPara >= i ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
              }}>
                <Paragraph
                  text={text}
                  active={currentPara === i}
                  onDone={() => handleDone(i)}
                  isLast={i === cuento.paragraphs.length - 1}
                />
              </div>
            ))}
          </div>
        )}

        {/* End */}
        {allDone && (
          <div style={{ marginTop: '4rem', animation: 'fadeUp 1s ease 0.3s both', opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '3rem' }}>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${cuento.glow}40)` }} />
              <span style={{ color: cuento.accent }}>✦</span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${cuento.glow}40)` }} />
            </div>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <p style={{ fontFamily: "'Beau Rivage', cursive", fontSize: '1.8rem', color: 'rgba(255,255,255,0.5)' }}>
                ¿Quieres vivirlo en la pantalla grande?
              </p>
              <button className="tv-btn" style={{ background: cuento.glow, color: 'white' }}
                onClick={() => window.history.back()}>
                📺 Ver en TV
              </button>
              <a href="/" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Nunito', sans-serif", fontSize: '0.8rem', textDecoration: 'none', letterSpacing: '0.08em' }}>
                Explorar otros cuentos →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}