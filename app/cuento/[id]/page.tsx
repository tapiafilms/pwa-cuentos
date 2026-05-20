'use client'

import { useParams } from 'next/navigation'

const CUENTOS: Record<string, { title: string; emoji: string; glow: string; desc: string }> = {
  '1': { title: 'El Bosque que Respira', emoji: '🌿', glow: '#52b788', desc: 'Mía descubre que los árboles de su jardín susurran nombres al anochecer.' },
  '2': { title: 'La Ballena de Cristal',  emoji: '🐋', glow: '#4a90d9', desc: 'En el océano de nubes que flota sobre la ciudad, una ballena de cristal recoge sueños perdidos.' },
  '3': { title: 'El Reloj Sin Agujas',    emoji: '⏰', glow: '#e07b39', desc: 'Una mañana, todos los relojes del mundo perdieron sus agujas.' },
  '4': { title: 'La Reina de la Niebla',  emoji: '👑', glow: '#9c6fde', desc: 'Cada amanecer, cuando la niebla cubre el valle, aparece un castillo que no existe en ningún mapa.' },
  '5': { title: 'El Cartero de las Estrellas', emoji: '✉️', glow: '#5c8ee0', desc: 'Cada estrella fugaz es una carta en camino.' },
}

export default function CuentoPage() {
  const { id } = useParams()
  const cuento = CUENTOS[id as string]

  if (!cuento) return (
    <div style={{ minHeight: '100vh', background: '#060608', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'DM Sans, sans-serif' }}>
      Cuento no encontrado. <a href="/" style={{ color: '#7c6af7', marginLeft: 8 }}>Volver</a>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#060608', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2rem', padding: '2rem', textAlign: 'center' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400&display=swap');`}</style>
      <div style={{ fontSize: '5rem' }}>{cuento.emoji}</div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>
        {cuento.title}
      </h1>
      <p style={{ fontFamily: 'DM Sans', color: 'rgba(255,255,255,0.45)', maxWidth: 480, lineHeight: 1.8, fontSize: '1rem' }}>
        {cuento.desc}
      </p>
      <div style={{ marginTop: '1rem', padding: '20px 32px', background: `${cuento.glow}15`, border: `1px solid ${cuento.glow}30`, borderRadius: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans', fontSize: '0.85rem' }}>
        🚧 &nbsp; El contenido de este cuento estará disponible próximamente
      </div>
      <a href="/" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans', fontSize: '0.85rem', textDecoration: 'none', marginTop: '0.5rem' }}>
        ← Volver a todos los cuentos
      </a>
    </div>
  )
}
