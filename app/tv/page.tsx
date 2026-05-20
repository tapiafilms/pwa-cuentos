'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'

export default function TVPage() {
  return (
    <Suspense fallback={<div className="tv-page"><div className="tv-spinner" /></div>}>
      <TVPageInner />
    </Suspense>
  )
}

type TVState = 'input' | 'connecting' | 'waiting' | 'playing'

function TVPageInner() {
  const [state, setState] = useState<TVState>('input')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleConnect = () => {
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length !== 4) { setError('El código debe tener 4 caracteres'); return }
    setError('')
    setState('connecting')

    const channel = supabase.channel(`session:${trimmed}`)
    channel
      .on('broadcast', { event: 'show_content' }, () => setState('playing'))
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({ type: 'broadcast', event: 'tv_ready', payload: {} })
          setState('waiting')
        }
      })

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }

  return (
    <div className="tv-page">
      {state === 'input'      && <TVInput code={code} setCode={setCode} onConnect={handleConnect} error={error} />}
      {state === 'connecting' && <TVSpinner label="Conectando..." />}
      {state === 'waiting'    && <TVWaiting />}
      {state === 'playing'    && <TVPlaying code={code.trim().toUpperCase()} />}
    </div>
  )
}

function TVInput({ code, setCode, onConnect, error }: {
  code: string; setCode: (v: string) => void; onConnect: () => void; error: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: '0.85rem',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--accent)', marginBottom: 12,
        }}>Cuentos TV</p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800, color: 'var(--text)', lineHeight: 1.1,
        }}>Ingresa el código</h1>
        <p style={{ color: 'var(--muted)', marginTop: 12, fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
          El código aparece en tu teléfono
        </p>
      </div>

      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
        onKeyDown={(e) => e.key === 'Enter' && onConnect()}
        placeholder="ej: K7MX"
        maxLength={4}
        autoFocus
        style={{
          background: 'var(--surface)',
          border: `2px solid ${error ? '#f87171' : 'var(--accent)'}`,
          borderRadius: 16, color: 'var(--text)',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3rem, 8vw, 5rem)',
          fontWeight: 800, letterSpacing: '0.3em',
          textAlign: 'center',
          width: 'clamp(240px, 40vw, 380px)',
          padding: '20px 24px', outline: 'none',
          boxShadow: '0 0 40px var(--accent-glow)',
          textTransform: 'uppercase',
        }}
      />

      {error && <p style={{ color: '#f87171', fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>{error}</p>}

      <button
        className="tv-button"
        onClick={onConnect}
        style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', padding: '20px 48px' }}
      >
        Conectar
      </button>
    </div>
  )
}

function TVSpinner({ label }: { label: string }) {
  return (
    <div className="tv-waiting">
      <div className="tv-spinner" />
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--muted)' }}>
        {label}
      </p>
    </div>
  )
}

function TVWaiting() {
  return (
    <div className="tv-waiting">
      <div className="tv-spinner" />
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(1.2rem, 3vw, 2rem)',
        fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.05em',
      }}>Listo para recibir</p>
      <p style={{ fontSize: 'clamp(0.8rem, 1.5vw, 1rem)', color: 'var(--muted)', opacity: 0.5 }}>
        Presiona "Enviar animación" en tu teléfono
      </p>
    </div>
  )
}

function TVPlaying({ code }: { code: string }) {
  const riveRef = useRef<any>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = document.getElementById('rive-canvas') as HTMLCanvasElement
    if (!canvas) return

    // Ajustar canvas a la resolución real de la pantalla con devicePixelRatio
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width  = window.innerWidth  * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width  = window.innerWidth  + 'px'
      canvas.style.height = window.innerHeight + 'px'
      riveRef.current?.resizeDrawingSurfaceToCanvas()
    }
    resize()
    window.addEventListener('resize', resize)

    import('@rive-app/canvas').then(({ Rive, Fit, Alignment, Layout }) => {
      const r = new Rive({
        src: '/animation.riv',
        canvas,
        autoplay: true,
        // Cover: llena toda la pantalla manteniendo aspect ratio
        layout: new Layout({
          fit: Fit.Cover,
          alignment: Alignment.Center,
        }),
        onLoad: () => {
          r.resizeDrawingSurfaceToCanvas()
          riveRef.current = r
          setReady(true)
        },
      })
    })

    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    if (!ready || !code) return

    const channel = supabase.channel(`session:${code}`)
    channel
      .on('broadcast', { event: 'interaction' }, ({ payload }) => {
        const r = riveRef.current
        if (!r) return
        const { action } = payload
        if (action === 'play')    { r.play() }
        if (action === 'pause')   { r.pause() }
        if (action === 'restart') { r.reset(); r.play() }
        if (action?.startsWith('seek:')) {
          const pct = parseFloat(action.split(':')[1]) / 100
          r.pause()
          const anim = r.animationNames[0]
          if (anim) { r.scrub(anim, pct) }
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [ready, code])

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#000',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <canvas
        id="rive-canvas"
        style={{ position: 'absolute', top: 0, left: 0, display: 'block' }}
      />
      {!ready && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          <div className="tv-spinner" />
          <p style={{ fontFamily: 'var(--font-display)', color: 'var(--muted)' }}>Cargando...</p>
        </div>
      )}
    </div>
  )
}