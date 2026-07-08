'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'

const CUENTOS: Record<string, {
  title: string; emoji: string; glow: string; accent: string; tag: string;
  paragraphs: string[]
  bifurcation: {
    question: string;
    optionA: { label: string; text: string };
    optionB: { label: string; text: string };
  }
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
      'Y bajo sus raíces, esperaba un mundo donde el tiempo fluya al revés...',
    ],
    bifurcation: {
      question: '¿Qué debería hacer Mía ahora que está frente al portal de raíces?',
      optionA: {
        label: 'Cruzar el portal de raíces 🌿',
        text: 'Mía cruzó con valentía el portal. Al otro lado, el bosque resplandecía con una aurora verde mágica. Los árboles hablaban de secretos antiguos y el tiempo retrocedía para sanar el bosque.'
      },
      optionB: {
        label: 'Pedir ayuda al roble viejo 🌳',
        text: 'Mía decidió quedarse y hablar con el roble. El anciano árbol le regaló una semilla de luz dorada para proteger su jardín y le prometió guiarla en su próxima gran aventura.'
      }
    }
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
    bifurcation: {
      question: '¿Qué sueño quiere rescatar Tomás primero junto a la ballena?',
      optionA: {
        label: 'El sueño de volar de los niños 🌟',
        text: 'Tomás tocó un sueño dorado de vuelo. Al instante, la ballena los impulsó en un torbellino de nubes y Tomás pudo sentir el viento libre en sus manos mientras volaba alto.'
      },
      optionB: {
        label: 'El sueño de la ciudad brillante 🏙️',
        text: 'Tomás se sumergió en un sueño azul. La ballena por fin proyectó un domo resplandeciente sobre los tejados, transformando la noche en un hermoso concierto de destellos mágicos.'
      }
    }
  },
  '3': {
    title: 'El Reloj Sin Agujas', emoji: '⏰', glow: '#e07b39', accent: '#ffb74d',
    tag: 'Misterio · 7–11 años',
    paragraphs: [
      'El martes 14 de octubre, a las hace ocho de la mañana, todos los relojes del mundo dejaron de tener agujas.',
      'No desaparecieron de golpe. Simplemente... se fueron. Como si nunca hubieran estado.',
      'El mundo entró en pánico. Nadie sabía qué hora era. Nadie sabía cuánto tiempo había pasado.',
      'Pero Theo, de nueve años, encontró algo debajo de su cama: una aguja de reloj. Pequeña, dorada, temblorosa.',
      'Y con ella, un mapa al mercado de los sueños, donde las demás agujas esperaban ser rescatadas.',
      'Devolverlas tenía un precio. Theo tendría que entregar algo que nunca más podría recuperar.',
    ],
    bifurcation: {
      question: '¿Qué precio está dispuesto a pagar Theo para devolver el tiempo?',
      optionA: {
        label: 'Entregar su recuerdo favorito 💭',
        text: 'Theo entregó su recuerdo más feliz al guardián. Al instante, las agujas volvieron a los relojes del mundo y el tiempo reanudó su marcha, dejando a Theo con una cálida sonrisa de héroe.'
      },
      optionB: {
        label: 'Buscar una llave secreta 🔑',
        text: 'Theo se negó a entregar su recuerdo y resolvió un enigma para hallar la llave del reloj primordial. Al abrirlo, el tiempo regresó libre y sin deudas para toda la humanidad.'
      }
    }
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
    bifurcation: {
      question: '¿Qué decide hacer Sofía con el reino de la niebla?',
      optionA: {
        label: 'Disipar la niebla del pueblo ☀️',
        text: 'Sofía leyó la frase de disipación. La niebla se levantó, revelando un valle verde bajo un sol radiante, uniendo por fin el castillo mágico con el pueblo de Sofía.'
      },
      optionB: {
        label: 'Quedarse como guardiana 🏰',
        text: 'Sofía aceptó la corona de niebla. Se convirtió en la nueva guardiana del castillo, escribiendo hermosos mensajes en las nubes para que otros niños soñadores la encontraran.'
      }
    }
  },
  '5': {
    title: 'El Cartero de las Estrellas', emoji: '✉️', glow: '#5c8ee0', accent: '#ffd54f',
    tag: 'Ciencia · 8–12 años',
    paragraphs: [
      'Las estrellas fugaces no son rocas. Son cartas.',
      'Luna lo descubrió por accident, la noche que una carta cayó directamente en sus manos.',
      'Estaba escrita en un idioma que no existía en ningún libro. Pero al tocarla, Luna lo entendió todo.',
      'Era un mensaje de una estrella a otra. Un mensaje de despedida. La estrella iba a apagarse.',
      'En la cima de la montaña más fría del mundo había un buzón. Luna tenía que llegar antes del amanecer.',
      'Porque si la carta no llegaba a tiempo, una estrella moriría sin saber que alguien la había amado.',
    ],
    bifurcation: {
      question: '¿Cómo decide Luna entregar este importante mensaje espacial?',
      optionA: {
        label: 'Lanzarla en un cohete de viento 🚀',
        text: 'Luna usó el viento helado para lanzar la carta en un cohete de luz. El mensaje llegó a tiempo, y la estrella volvió a brillar intensamente en el cielo nocturno.'
      },
      optionB: {
        label: 'Crear una constelación de luz ✨',
        text: 'Luna unió la carta a otras estrellas apagadas, dibujando una nueva constelación en el cielo. Así, el mensaje de amor quedó grabado para siempre y visible para todo el universo.'
      }
    }
  }
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
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#060608', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontFamily: "'Nunito', sans-serif", gap: 16 }}>
        <div style={{
          width: 48, height: 48,
          border: '2px solid rgba(255,255,255,0.1)',
          borderTopColor: '#7c6af7',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p>Cargando historia...</p>
      </div>
    }>
      <CuentoPageInner />
    </Suspense>
  )
}

function CuentoPageInner() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  
  const session = searchParams.get('session')
  const role = searchParams.get('role')
  const isRemote = role === 'remote' && !!session

  const cuento = CUENTOS[id as string]
  const [currentPara, setCurrentPara] = useState(-1)
  const [started, setStarted] = useState(false)
  const [allDone, setAllDone] = useState(false)
  const [bifurcationShown, setBifurcationShown] = useState(false)
  const [bifurcationChoice, setBifurcationChoice] = useState<'A' | 'B' | null>(null)
  
  const doneRef = useRef(0)

  // Estados de micrófono e Inteligencia Artificial
  const [isListening, setIsListening] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [micSupported, setMicSupported] = useState(false)
  const [speechError, setSpeechError] = useState('')
  const [lastSpokenText, setLastSpokenText] = useState('')

  const recognitionRef = useRef<any>(null)

  // Configuración del reconocimiento de voz nativo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setMicSupported(true)
        const rec = new SpeechRecognition()
        rec.lang = 'es-ES'
        rec.interimResults = false
        rec.continuous = false

        rec.onstart = () => {
          setIsListening(true)
          setSpeechError('')
          // Cambiar animación del personaje en la TV a "pensar"
          sendInteraction('think')
        }

        rec.onresult = async (event: any) => {
          const text = event.results[0][0].transcript
          setIsListening(false)
          if (text && text.trim() !== '') {
            setLastSpokenText(text)
            await handleAskAI(text)
          }
        }

        rec.onerror = (event: any) => {
          setIsListening(false)
          console.error('Speech recognition error:', event.error)
          if (event.error === 'not-allowed') {
            setSpeechError('Permiso de micrófono denegado')
          } else {
            setSpeechError(`Error: ${event.error}`)
          }
        }

        rec.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = rec
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (err) {
        console.error('Failed to start recognition:', err)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (err) {
        console.error('Failed to stop recognition:', err)
      }
    }
  }

  const handleAskAI = async (messageText: string) => {
    if (!messageText.trim()) return
    setLastSpokenText(messageText)
    setAiLoading(true)
    setSpeechError('')
    sendInteraction('think')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, cuentoId: id })
      })
      const data = await res.json()
      const replyText = data.response || "¡Hola! He sentido tu voz."

      if (isRemote && session) {
        // Enviar evento de respuesta a la TV
        await supabase.channel(`session:${session}`).send({
          type: 'broadcast',
          event: 'character_response',
          payload: {
            question: messageText,
            answer: replyText
          }
        })
        // Activar gesto alegre en la TV
        sendInteraction('celebrate')
      }
    } catch (err) {
      console.error('Error asking AI:', err)
      setSpeechError('Error de red al consultar a la IA')
    } finally {
      setAiLoading(false)
    }
  }

  const clearTVBubble = async () => {
    if (isRemote && session) {
      await supabase.channel(`session:${session}`).send({
        type: 'broadcast',
        event: 'character_response',
        payload: {
          clear: true
        }
      })
      sendInteraction('wave')
    }
  }

  // Volver al Home persistiendo la conexión y mandando a la TV a la pantalla de espera
  const handleBackToHome = async () => {
    if (isRemote && session) {
      localStorage.setItem('cuentajoy_session', session)
      
      // Enviar evento para volver al estado de espera en la TV
      await supabase.channel(`session:${session}`).send({
        type: 'broadcast',
        event: 'show_waiting',
        payload: {}
      })
      
      window.location.href = `/?session=${session}`
    } else {
      window.location.href = '/'
    }
  }

  // Sincronizar estado inicial al conectar el remoto
  useEffect(() => {
    if (!isRemote || !session) return
    const channel = supabase.channel(`session:${session}`)
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Enviar estado inicial
        channel.send({
          type: 'broadcast',
          event: 'remote_ready',
          payload: { cuentoId: id }
        })
      }
    })
    return () => { supabase.removeChannel(channel) }
  }, [isRemote, session, id])

  const syncState = async (paraIndex: number, showBifurcation: boolean, choice: 'A' | 'B' | null) => {
    if (!isRemote || !session || !cuento) return
    
    let text = ''
    let ending = false
    
    if (choice === 'A') {
      text = cuento.bifurcation.optionA.text
      ending = true
    } else if (choice === 'B') {
      text = cuento.bifurcation.optionB.text
      ending = true
    } else if (paraIndex >= 0 && paraIndex < cuento.paragraphs.length) {
      text = cuento.paragraphs[paraIndex]
    }

    await supabase.channel(`session:${session}`).send({
      type: 'broadcast',
      event: 'sync_state',
      payload: {
        started: paraIndex >= 0 || choice !== null,
        currentPara: paraIndex,
        text,
        showBifurcation,
        bifurcationQuestion: cuento.bifurcation.question,
        optionALabel: cuento.bifurcation.optionA.label,
        optionBLabel: cuento.bifurcation.optionB.label,
        bifurcationSelected: choice,
        ending
      }
    })
  }

  const sendInteraction = async (action: string) => {
    if (!isRemote || !session) return
    await supabase.channel(`session:${session}`).send({
      type: 'broadcast',
      event: 'interaction',
      payload: { action }
    })
  }

  const start = () => {
    setStarted(true)
    setCurrentPara(0)
    if (isRemote) {
      syncState(0, false, null)
    }
  }

  const handleNext = () => {
    if (!cuento) return
    const nextIdx = currentPara + 1
    if (nextIdx < cuento.paragraphs.length) {
      setCurrentPara(nextIdx)
      if (isRemote) {
        syncState(nextIdx, false, null)
      }
    } else {
      setBifurcationShown(true)
      if (isRemote) {
        syncState(currentPara, true, null)
      }
    }
  }

  const handlePrev = () => {
    if (bifurcationChoice !== null) {
      setBifurcationChoice(null)
      setBifurcationShown(true)
      if (isRemote) {
        syncState(cuento.paragraphs.length - 1, true, null)
      }
      return
    }
    
    if (bifurcationShown) {
      setBifurcationShown(false)
      if (isRemote) {
        syncState(cuento.paragraphs.length - 1, false, null)
      }
      return
    }

    const prevIdx = currentPara - 1
    if (prevIdx >= 0) {
      setCurrentPara(prevIdx)
      if (isRemote) {
        syncState(prevIdx, false, null)
      }
    } else {
      setStarted(false)
      setCurrentPara(-1)
      if (isRemote) {
        syncState(-1, false, null)
      }
    }
  }

  const handleChoose = (choice: 'A' | 'B') => {
    setBifurcationChoice(choice)
    setBifurcationShown(false)
    setAllDone(true)
    if (isRemote) {
      syncState(currentPara, false, choice)
    }
  }

  const handleReset = () => {
    setCurrentPara(-1)
    setStarted(false)
    setAllDone(false)
    setBifurcationShown(false)
    setBifurcationChoice(null)
    doneRef.current = 0
    if (isRemote) {
      syncState(-1, false, null)
    }
  }

  const handleDone = (index: number) => {
    doneRef.current = index
    if (cuento && index < cuento.paragraphs.length - 1) {
      setTimeout(() => {
        setCurrentPara(index + 1)
      }, 600)
    } else {
      setTimeout(() => {
        setBifurcationShown(true)
      }, 400)
    }
  }

  if (!cuento) {
    return (
      <div style={{ minHeight: '100vh', background: '#060608', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontFamily: "'Nunito', sans-serif" }}>
        <a href="/" style={{ color: '#7c6af7' }}>← Volver</a>
      </div>
    )
  }

  // INTERFAZ DE CONTROL REMOTO
  if (isRemote) {
    return (
      <div className="remote-container">
        <style>{`
          .remote-container {
            min-height: 100vh;
            background: #07080c;
            display: flex;
            flex-direction: column;
            color: white;
            font-family: 'Nunito', sans-serif;
            max-width: 480px;
            margin: 0 auto;
            box-shadow: 0 0 50px rgba(0,0,0,0.8), 0 0 20px rgba(124, 106, 247, 0.05);
            border-left: 1px solid rgba(255,255,255,0.05);
            border-right: 1px solid rgba(255,255,255,0.05);
            position: relative;
          }

          .remote-header {
            padding: 1.25rem 1.5rem;
            background: #0e1017;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 10;
          }

          .remote-main {
            flex: 1;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 1.25rem;
            z-index: 5;
            overflow-y: auto;
          }

          .paragraph-box {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            padding: 1.25rem;
            min-height: 140px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
            box-shadow: inset 0 2px 8px rgba(0,0,0,0.4);
          }

          .paragraph-text {
            font-size: 1.1rem;
            line-height: 1.6;
            color: white;
            fontWeight: 500;
            text-align: center;
            margin: 0.75rem 0 0.25rem;
          }

          .trigger-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }

          .remote-btn {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            font-family: 'Nunito', sans-serif; font-size: 0.9rem; font-weight: 700;
            padding: 18px; border-radius: 14px; border: none; cursor: pointer;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            user-select: none; width: 100%;
          }
          .remote-btn-primary {
            background: ${cuento.glow}; color: white;
            box-shadow: 0 4px 20px ${cuento.glow}44;
          }
          .remote-btn-primary:active { transform: scale(0.97); }
          .remote-btn-secondary {
            background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.8);
          }
          .remote-btn-secondary:active { transform: scale(0.97); background: rgba(255,255,255,0.1); }
          .remote-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none !important; }
          
          .trigger-btn {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px; padding: 12px; cursor: pointer; transition: all 0.2s;
            font-family: 'Nunito', sans-serif; font-size: 0.72rem; font-weight: 600; color: rgba(255,255,255,0.6);
          }
          .trigger-btn:active {
            background: ${cuento.glow}22; border-color: ${cuento.glow}60; color: white;
            box-shadow: 0 0 12px ${cuento.glow}30;
          }
          
          .pulse-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: #4ade80; box-shadow: 0 0 10px #4ade80;
            animation: remotePulse 1.5s ease infinite;
          }
          @keyframes remotePulse {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          @keyframes spin { to { transform: rotate(360deg); } }

          .mic-btn {
            border-radius: 16px;
            padding: 16px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            width: 100%;
            font-family: 'Nunito', sans-serif;
          }
          .mic-btn-inactive {
            background: linear-gradient(135deg, #1b1c24 0%, #111218 100%);
            border: 1px solid rgba(255,255,255,0.08);
            color: #d1d1e0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          }
          .mic-btn-inactive:active {
            transform: scale(0.97);
            background: rgba(255,255,255,0.05);
          }
          .mic-btn-listening {
            background: #ef4444;
            color: white;
            animation: pulseRecord 1.5s ease infinite;
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
          }
          @keyframes pulseRecord {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.85; }
          }

          /* --- RESPONSIVE OPTIMIZATIONS FOR TIGHT HEIGHT SCREEN (eg. iPhone 12 Mini / SE / PWA standalone) --- */
          @media (max-height: 740px) {
            .remote-header {
              padding: 0.85rem 1.15rem;
            }
            .remote-main {
              padding: 1rem;
              gap: 0.75rem;
            }
            .remote-btn {
              padding: 14px;
              font-size: 0.85rem;
              border-radius: 10px;
            }
            .mic-btn {
              padding: 12px;
              border-radius: 12px;
              font-size: 0.85rem;
            }
            .trigger-btn {
              padding: 8px;
              font-size: 0.68rem;
              border-radius: 10px;
            }
            .paragraph-box {
              min-height: 100px;
              padding: 1rem;
            }
            .paragraph-text {
              font-size: 0.95rem;
              line-height: 1.45;
              margin: 0.5rem 0 0.15rem;
            }
          }

          @media (max-width: 360px) {
            .remote-main {
              padding: 0.75rem;
              gap: 0.5rem;
            }
            .trigger-grid {
              gap: 6px;
            }
            .trigger-btn {
              padding: 6px;
              font-size: 0.62rem;
            }
          }
        `}</style>

        {/* Header del control */}
        <header className="remote-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.5rem' }}>{cuento.emoji}</span>
            <div>
              <h1 style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.02em' }}>{cuento.title.replace('\n', ' ')}</h1>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="pulse-dot" /> CONTROL REMOTO ACTIVO
              </p>
            </div>
          </div>
          <button onClick={handleBackToHome} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, color: cuento.accent, cursor: 'pointer', fontFamily: 'Nunito' }}>
            Salir ✕
          </button>
        </header>

        {/* Panel Central de Lectura */}
        <main className="remote-main">
          
          {!started ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                El cuento está listo en la Smart TV.<br />Presiona el botón para comenzar la proyección.
              </p>
              <button className="remote-btn remote-btn-primary" onClick={start}>
                ✨ COMENZAR HISTORIA
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', justifyContent: 'space-between' }}>
              
              {/* Caja de texto del párrafo actual */}
              <div className="paragraph-box">
                <span style={{ position: 'absolute', top: 12, left: 16, fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: cuento.accent, textTransform: 'uppercase' }}>
                  {bifurcationChoice ? 'FINAL ALTERNATIVO' : bifurcationShown ? 'BIFURCACIÓN DE HISTORIA' : `Párrafo ${currentPara + 1} de ${cuento.paragraphs.length}`}
                </span>
                
                <p className="paragraph-text">
                  {bifurcationChoice === 'A' && cuento.bifurcation.optionA.text}
                  {bifurcationChoice === 'B' && cuento.bifurcation.optionB.text}
                  {!bifurcationChoice && bifurcationShown && cuento.bifurcation.question}
                  {!bifurcationChoice && !bifurcationShown && cuento.paragraphs[currentPara]}
                </p>
              </div>

              {/* Botones de bifurcación (cuando está activa) */}
              {!bifurcationChoice && bifurcationShown && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeIn 0.4s ease' }}>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, textAlign: 'center', marginBottom: 4 }}>
                    Pídele a los niños que elijan un camino:
                  </p>
                  <button className="remote-btn remote-btn-primary" style={{ background: `linear-gradient(135deg, ${cuento.glow}, ${cuento.accent})` }} onClick={() => handleChoose('A')}>
                    {cuento.bifurcation.optionA.label}
                  </button>
                  <button className="remote-btn remote-btn-primary" style={{ background: `linear-gradient(135deg, ${cuento.glow}dd, #1a1a24)` }} onClick={() => handleChoose('B')}>
                    {cuento.bifurcation.optionB.label}
                  </button>
                </div>
              )}

              {/* INTERFAZ DE MICRÓFONO Y PREGUNTAS IA (solo mientras lee la historia principal) */}
              {!bifurcationShown && !bifurcationChoice && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16,
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.72rem', color: cuento.accent, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                      Preguntarle al personaje (IA):
                    </p>
                    <button onClick={clearTVBubble} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', fontWeight: 700 }}>
                      Ocultar globo 💬
                    </button>
                  </div>

                  {/* Botón de micrófono */}
                  {micSupported ? (
                    <div>
                      {isListening ? (
                        <button className="mic-btn mic-btn-listening" onClick={stopListening}>
                          🛑 DETENER GRABACIÓN
                        </button>
                      ) : (
                        <button className="mic-btn mic-btn-inactive" onClick={startListening} disabled={aiLoading}>
                          🎙️ HABLAR POR MICRÓFONO
                        </button>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
                      Reconocimiento de voz no soportado. Usa el teclado abajo.
                    </p>
                  )}

                  {/* Input de texto alternativo / respaldo */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (chatInput.trim()) {
                      handleAskAI(chatInput);
                      setChatInput('');
                    }
                  }} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <input
                      type="text"
                      placeholder="Escribe tu pregunta aquí..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={aiLoading}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(0,0,0,0.3)',
                        color: 'white',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={aiLoading || !chatInput.trim()}
                      style={{
                        padding: '10px 16px',
                        background: cuento.glow,
                        border: 'none',
                        color: 'white',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      Enviar
                    </button>
                  </form>

                  {/* Estado de carga / errores */}
                  {aiLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: cuento.accent, fontSize: '0.78rem', fontWeight: 600 }}>
                      <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: cuento.glow, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      Procesando respuesta del personaje...
                    </div>
                  )}
                  
                  {speechError && (
                    <p style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: 600, textAlign: 'center' }}>
                      {speechError}
                    </p>
                  )}
                  {lastSpokenText && (
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 4 }}>
                      Preguntado: <strong style={{ color: cuento.accent }}>"{lastSpokenText}"</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Panel de interactividad de gestos */}
              {!bifurcationShown && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                    Reacciones del Personaje Rive:
                  </p>
                  <div className="trigger-grid">
                    <button className="trigger-btn" onClick={() => sendInteraction('wave')}>
                      <span style={{ fontSize: '1.25rem', marginBottom: 4 }}>👋</span>
                      Saludar
                    </button>
                    <button className="trigger-btn" onClick={() => sendInteraction('celebrate')}>
                      <span style={{ fontSize: '1.25rem', marginBottom: 4 }}>🎉</span>
                      Celebrar
                    </button>
                    <button className="trigger-btn" onClick={() => sendInteraction('think')}>
                      <span style={{ fontSize: '1.25rem', marginBottom: 4 }}>🤔</span>
                      Pensar
                    </button>
                    <button className="trigger-btn" onClick={() => sendInteraction('sad')}>
                      <span style={{ fontSize: '1.25rem', marginBottom: 4 }}>😢</span>
                      Triste
                    </button>
                  </div>
                </div>
              )}

              {/* Navegación estándar del control */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
                <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                  <button className="remote-btn remote-btn-secondary" onClick={handlePrev} disabled={currentPara === 0 && !bifurcationShown && bifurcationChoice === null}>
                    ◀ Atrás
                  </button>
                  
                  {bifurcationChoice !== null ? (
                    <button className="remote-btn remote-btn-primary" onClick={handleReset}>
                      🔄 Volver a empezar
                    </button>
                  ) : !bifurcationShown ? (
                    <button className="remote-btn remote-btn-primary" onClick={handleNext}>
                      {currentPara === cuento.paragraphs.length - 1 ? 'Bifurcación ✦' : 'Siguiente ▶'}
                    </button>
                  ) : null}
                </div>

                {bifurcationChoice !== null && (
                  <button className="remote-btn remote-btn-secondary" onClick={handleBackToHome} style={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)' }}>
                    🏠 Volver al Inicio (Elegir otro cuento)
                  </button>
                )}
              </div>

            </div>
          )}

        </main>
        
        {/* Footer del control */}
        <footer style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          CuentaJoy © 2026 · Panel de Control de Proyección
        </footer>
      </div>
    )
  }

  // INTERFAZ DE LECTOR LOCAL (SIN CONEXIÓN TV)
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

        {/* Bifurcación Local */}
        {bifurcationShown && !bifurcationChoice && (
          <div style={{ marginTop: '3rem', textAlign: 'center', animation: 'fadeUp 0.8s ease' }}>
            <p style={{ fontFamily: "'Nunito', sans-serif", color: cuento.accent, fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              {cuento.bifurcation.question}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400, margin: '0 auto' }}>
              <button className="start-btn" style={{ borderColor: cuento.glow, background: `${cuento.glow}15` }} onClick={() => handleChoose('A')}>
                {cuento.bifurcation.optionA.label}
              </button>
              <button className="start-btn" style={{ borderColor: cuento.glow, background: 'rgba(255,255,255,0.03)' }} onClick={() => handleChoose('B')}>
                {cuento.bifurcation.optionB.label}
              </button>
            </div>
          </div>
        )}

        {/* Bifurcación elegida local */}
        {bifurcationChoice && (
          <div style={{ marginTop: '2rem', animation: 'fadeIn 1s ease' }}>
            <p style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 'clamp(1.1rem, 2.2vw, 1.35rem)',
              lineHeight: 1.9,
              color: 'white',
              textAlign: 'center'
            }}>
              {bifurcationChoice === 'A' ? cuento.bifurcation.optionA.text : cuento.bifurcation.optionB.text}
            </p>
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
                onClick={handleReset}>
                🔄 Volver a empezar
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