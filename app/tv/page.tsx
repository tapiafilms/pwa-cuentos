'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Rive, { useRive } from '@rive-app/react-canvas'
import { Chess } from 'chess.js'

export default function TVPage() {
  return (
    <Suspense fallback={<div className="tv-page"><div className="tv-spinner" /></div>}>
      <TVPageInner />
    </Suspense>
  )
}

type TVState = 'connecting' | 'waiting_remote' | 'waiting_cuento' | 'playing' | 'playing_chess'

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

  // Ajedrez Estado del Avatar (4 estados en video)
  const chessRef = useRef<any>(null)
  const [chessBoard, setChessBoard] = useState<any[][]>([])
  const [chessLastMove, setChessLastMove] = useState<{ from: string; to: string } | null>(null)
  const [chessInCheck, setChessInCheck] = useState<string | null>(null)
  const [chessTurn, setChessTurn] = useState<'w' | 'b'>('w')
  const [aiSpeakingText, setAiSpeakingText] = useState<string | null>(null)
  const [avatarState, setAvatarState] = useState<'waiting' | 'surprised' | 'moving' | 'speaking'>('waiting')
  const [channelRef, setChannelRef] = useState<any>(null)

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

    // Inicialización del motor de ajedrez
    chessRef.current = new Chess()
    setChessBoard(chessRef.current.board())

    // 2. Conectar al canal
    const channel = supabase.channel(`session:${codeVal}`)
    setChannelRef(channel)

    let heartbeatInterval: NodeJS.Timeout | null = null

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
      .on('broadcast', { event: 'start_chess' }, () => {
        handleChessReset()
        transitionTo('playing_chess')
      })
      .on('broadcast', { event: 'chess_move' }, ({ payload }) => {
        handlePlayerChessMove(payload.from, payload.to, channel)
      })
      .on('broadcast', { event: 'chess_reset' }, () => {
        handleChessReset()
      })
      .on('broadcast', { event: 'chess_question' }, async ({ payload }) => {
        const { question } = payload
        if (!question) return
        setAvatarState('speaking')
        const comment = await fetchAiComment(question)
        setAiSpeakingText(comment)
        speakText(comment)

        // Enviar la respuesta de vuelta al celular para que la agregue a su historial local
        channel.send({
          type: 'broadcast',
          event: 'chess_ai_response',
          payload: { question, response: comment }
        }).catch((err: any) => console.error('Error sending chess_ai_response:', err))
      })
      .on('broadcast', { event: 'chess_clear_bubble' }, () => {
        setAiSpeakingText(null)
      })
      .on('broadcast', { event: 'force_tv_reconnect' }, () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel()
        }
        transitionTo('waiting_remote', () => {
          setAiSpeakingText(null)
        })
      })
      .subscribe((status, err) => {
        console.log('TV Realtime subscription status:', status, err)
        if (status === 'SUBSCRIBED') {
          // Emisión periódica de latido de vida (heartbeat) cada 3 segundos
          heartbeatInterval = setInterval(() => {
            channel.send({
              type: 'broadcast',
              event: 'tv_heartbeat',
              payload: { timestamp: Date.now() }
            }).catch(() => {})
          }, 3000)

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
      if (heartbeatInterval) clearInterval(heartbeatInterval)
      supabase.removeChannel(channel)
    }
  }, [sessionParam])

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()

      // Limpiar emojis y signos de puntuación especiales para evitar que el motor TTS los lea en voz alta
      const cleanedText = text
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/g, '')
        .replace(/[\!\¡\?\¿\#\$\%\&\*\(\)\_\+\=\[\]\{\}\<\>\-\/\\\@\:\;\"\'\`\~]/g, ' ')
        .replace(/\b(bip|bop|beep|boop|bit|bot)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim()

      const textToSpeak = cleanedText || text

      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.lang = 'es-ES'
      utterance.rate = 0.95
      utterance.pitch = 1.0
      
      const voices = window.speechSynthesis.getVoices()
      const spanishVoice = voices.find(v => v.lang.startsWith('es'))
      if (spanishVoice) {
        utterance.voice = spanishVoice
      }
      
      utterance.onstart = () => setAvatarState('speaking')
      utterance.onend = () => setAvatarState('waiting')
      
      window.speechSynthesis.speak(utterance)
    }
  }

  const findKingSquare = (color: 'w' | 'b'): string | null => {
    if (!chessRef.current) return null
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']
    const board = chessRef.current.board()
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c]
        if (piece && piece.type === 'k' && piece.color === color) {
          return files[c] + ranks[r]
        }
      }
    }
    return null
  }

  const fetchAiComment = async (promptMessage: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptMessage,
          cuentoId: 'chess'
        })
      })
      if (response.ok) {
        const data = await response.json()
        return data.response
      }
    } catch (e) {
      console.error('Error fetching AI comment:', e)
    }
    return "He movido mi pieza. Tu turno."
  }

  const getPlayerMovePrompt = (move: any): string => {
    const pieceNames: { [key: string]: string } = { p: 'peón', n: 'caballo', b: 'alfil', r: 'torre', q: 'reina', k: 'rey' }
    const pieceName = pieceNames[move.piece] || 'pieza'
    
    if (move.captured) {
      const capturedName = pieceNames[move.captured] || 'pieza'
      return `El jugador movió su ${pieceName} y capturó mi ${capturedName}. Di 1 frase muy corta de máximo 8 palabras sin emojis ni signos de exclamación.`
    }
    if (move.san.includes('+')) {
      return `El jugador movió su ${pieceName} dando jaque. Di 1 frase muy corta de máximo 8 palabras sin emojis ni signos de exclamación.`
    }
    return `El jugador movió su ${pieceName} a ${move.to}. Di 1 frase muy corta de máximo 8 palabras sin emojis ni signos de exclamación.`
  }

  const getAIMovePrompt = (move: any): string => {
    const pieceNames: { [key: string]: string } = { p: 'peón', n: 'caballo', b: 'alfil', r: 'torre', q: 'reina', k: 'rey' }
    const pieceName = pieceNames[move.piece] || 'pieza'
    
    if (move.captured) {
      const capturedName = pieceNames[move.captured] || 'pieza'
      return `Ya he movido mi ${pieceName} a ${move.to} y capturé tu ${capturedName}. Di 1 frase muy corta pasándole el turno al humano. Sin emojis ni signos. PROHIBIDO decir que es mi turno.`
    }
    if (move.san.includes('+')) {
      return `Ya he movido mi ${pieceName} a ${move.to} dando jaque. Di 1 frase muy corta pasándole el turno al humano. Sin emojis ni signos. PROHIBIDO decir que es mi turno.`
    }
    return `Ya he movido mi ${pieceName} a ${move.to}. Di 1 frase muy corta pasándole el turno al humano de máximo 8 palabras. Sin emojis ni signos. PROHIBIDO decir que es mi turno.`
  }

  const handlePlayerChessMove = (from: string, to: string, activeChan: any) => {
    if (!chessRef.current) return

    try {
      const move = chessRef.current.move({ from, to })
      if (!move) return

      setChessBoard([...chessRef.current.board()])
      setChessLastMove({ from, to })
      setChessTurn(chessRef.current.turn())
      
      const inCheckSquare = chessRef.current.inCheck() ? findKingSquare(chessRef.current.turn()) : null
      setChessInCheck(inCheckSquare)

      if (chessRef.current.isGameOver()) {
        handleGameOver(activeChan)
        return
      }

      // El contrincante movió una pieza -> Avatar reacciona con 'surprised' SOLO si pierde una pieza (captura)
      if (move.captured) {
        setAvatarState('surprised')
      } else {
        setAvatarState('waiting')
      }

      // Si hubo captura, dar 2.2s para el video de sorprendido; si no, 1.0s
      const delayBeforeAiMove = move.captured ? 2200 : 1000

      setTimeout(() => {
        makeAIMove(activeChan, !!move.captured)
      }, delayBeforeAiMove)

    } catch (e) {
      console.error('Error aplicando jugada del jugador:', e)
    }
  }

  const makeAIMove = (activeChan: any, isSurprised: boolean) => {
    if (!chessRef.current) return

    try {
      // 1. Calcular la jugada óptima de la IA
      const moves = chessRef.current.moves({ verbose: true })
      if (moves.length === 0) return

      const pieceValues: { [key: string]: number } = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 }
      let bestMoves = []
      let highestScore = -9999

      for (const m of moves) {
        let score = 0
        if (m.san.includes('#')) {
          score = 10000
        } else if (m.captured) {
          score = pieceValues[m.captured] || 10
        } else if (m.san.includes('+')) {
          score = 5
        }
        score += Math.random() * 2

        if (score > highestScore) {
          highestScore = score
          bestMoves = [m]
        } else if (score === highestScore) {
          bestMoves.push(m)
        }
      }

      const aiMove = bestMoves[Math.floor(Math.random() * bestMoves.length)]

      // 2. Iniciar el video 'moving' del Avatar solo si no estaba sorprendido
      if (!isSurprised) {
        setAvatarState('moving')
      }

      // Si se sorprendió, el movimiento de la pieza en el video ocurre a los 8.5s (8500ms - 2200ms de retraso inicial)
      const boardMoveDelay = isSurprised ? 6300 : 1600

      // 3. Mover la pieza en el tablero
      setTimeout(() => {
        if (!chessRef.current) return
        chessRef.current.move({ from: aiMove.from, to: aiMove.to })

        setChessBoard([...chessRef.current.board()])
        setChessLastMove({ from: aiMove.from, to: aiMove.to })
        setChessTurn(chessRef.current.turn())
        
        const inCheckSquare = chessRef.current.inCheck() ? findKingSquare(chessRef.current.turn()) : null
        setChessInCheck(inCheckSquare)

        const targetChan = activeChan || channelRef
        if (targetChan) {
          targetChan.send({
            type: 'broadcast',
            event: 'chess_ai_move',
            payload: {
              fen: chessRef.current.fen(),
              lastMove: { from: aiMove.from, to: aiMove.to }
            }
          })
        }

        if (chessRef.current.isGameOver()) {
          handleGameOver(activeChan)
          return
        }

        // 4. Retornar al estado 'waiting' una vez que finaliza el video de movimiento/sorpresa
        const returnToWaitingDelay = isSurprised ? 1500 : 7000
        setTimeout(() => {
          setAvatarState('waiting')
        }, returnToWaitingDelay)
      }, boardMoveDelay)

    } catch (e) {
      console.error('Error calculando jugada de la IA:', e)
    }
  }

  const handleGameOver = (activeChan: any) => {
    if (!chessRef.current) return
    
    let comment = ''
    if (chessRef.current.isCheckmate()) {
      if (chessRef.current.turn() === 'w') {
        setAvatarState('speaking')
        comment = "¡Jaque mate! He ganado la partida. La Inteligencia Artificial es insuperable. ¡Inténtalo de nuevo!"
      } else {
        setAvatarState('surprised')
        comment = "¡¿Qué?! ¡¿Jaque mate?! Esto es imposible... Debo haber tenido una falla en mis algoritmos..."
      }
    } else if (chessRef.current.isDraw()) {
      setAvatarState('waiting')
      comment = "La partida ha terminado en tablas. Un empate digno, pero la próxima vez te venceré."
    }

    setAiSpeakingText(comment)
    speakText(comment)
    
    const targetChan = activeChan || channelRef
    if (targetChan) {
      targetChan.send({
        type: 'broadcast',
        event: 'chess_game_over',
        payload: {
          result: chessRef.current.isCheckmate() ? (chessRef.current.turn() === 'w' ? 'ai_won' : 'player_won') : 'draw',
          comment
        }
      })
    }
  }

  const handleChessReset = () => {
    if (chessRef.current) {
      chessRef.current.reset()
      setChessBoard([...chessRef.current.board()])
      setChessLastMove(null)
      setChessInCheck(null)
      setChessTurn('w')
      setAiSpeakingText(null)
      setAvatarState('waiting')
    }
  }

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

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes pulseAvatar {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
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
      {state === 'playing_chess' && (
        <PlayingChessView 
          board={chessBoard} 
          lastMove={chessLastMove} 
          inCheck={chessInCheck} 
          turn={chessTurn} 
          aiSpeakingText={aiSpeakingText} 
          avatarState={avatarState} 
        />
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
  const [waitingIntroState, setWaitingIntroState] = useState<'video' | 'fading' | 'code'>('video')
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoOpacity, setVideoOpacity] = useState(1)

  const handleVideoEnded = () => {
    setVideoOpacity(0)
    setWaitingIntroState('fading')
    setTimeout(() => {
      setWaitingIntroState('code')
    }, 800) // 800ms fade-out
  }

  // Si ya terminó el video, mostramos el código de conexión con su animación de entrada
  if (waitingIntroState === 'code') {
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

  // Reproduciendo video intro antes de mostrar el código
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      inset: 0,
      background: '#050508',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      {/* Indicador de carga elegante */}
      {!videoLoaded && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          zIndex: 3
        }}>
          <div className="tv-spinner" style={{ width: 48, height: 48, borderWidth: 3 }} />
          <p style={{ fontFamily: 'Nunito', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            Cargando presentación...
          </p>
        </div>
      )}

      {/* Video Fullscreen */}
      <video
        src="/logo-animado.mp4"
        autoPlay
        muted
        playsInline
        poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        onLoadedData={() => setVideoLoaded(true)}
        onEnded={handleVideoEnded}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: videoLoaded ? videoOpacity : 0,
          transition: 'opacity 0.8s ease-in-out',
          zIndex: 1
        }}
      />
    </div>
  )
}

function TVWaitingCuento({ code }: { code: string }) {
  const [videoLoaded, setVideoLoaded] = useState(false)

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: '#050508',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: '4rem 2rem',
      animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      {/* Indicador de carga elegante detrás/encima del video */}
      {!videoLoaded && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          zIndex: 3
        }}>
          <div className="tv-spinner" style={{ width: 48, height: 48, borderWidth: 3 }} />
          <p style={{ fontFamily: 'Nunito', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            Cargando presentación...
          </p>
        </div>
      )}

      {/* Video Fullscreen */}
      <video
        src="/logo-animado.mp4"
        autoPlay
        muted
        playsInline
        poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        onLoadedData={() => setVideoLoaded(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: videoLoaded ? 0.95 : 0,
          transition: 'opacity 0.6s ease-in-out',
          zIndex: 1
        }}
      />
      
      {/* Degradado inferior para legibilidad de textos */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '35vh',
        background: 'linear-gradient(to top, rgba(5,5,8,0.9) 0%, rgba(5,5,8,0.3) 60%, transparent 100%)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      {/* Contenedor de Textos al Fondo */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.65rem',
        textAlign: 'center',
        maxWidth: 600
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#4ade80', fontSize: '0.9rem', fontFamily: 'Nunito', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
          CONECTADO (SESIÓN: {code})
        </div>
        
        <p style={{ fontSize: '0.95rem', color: '#7a7a9a', lineHeight: 1.4, fontFamily: 'Nunito', fontWeight: 600 }}>
          Elige tu cuento en el celular y presiona <strong>"Proyectar en TV"</strong> para comenzar.
        </p>
      </div>
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

type AvatarVideoState = 'waiting' | 'surprised' | 'moving' | 'speaking'

const AVATAR_VIDEOS: Record<AvatarVideoState, { src: string; label: string; emoji: string }> = {
  waiting: { src: '/avatar-waiting.mp4', label: 'Esperando', emoji: '🤖' },
  surprised: { src: '/avatar-surprised.mp4', label: 'Sorprendido', emoji: '😲' },
  moving: { src: '/avatar-moving.mp4', label: 'Moviendo Pieza', emoji: '♟️' },
  speaking: { src: '/avatar-speaking.mp4', label: 'Hablando', emoji: '💬' },
}

function AvatarVideoPlayer({ avatarState }: { avatarState: AvatarVideoState }) {
  const [hasVideoError, setHasVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const info = AVATAR_VIDEOS[avatarState]

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      try {
        video.load()
        video.currentTime = 0
        video.play().catch(() => {})
      } catch (e) {
        console.error('Error playing video:', e)
      }
    }
  }, [avatarState])

  if (hasVideoError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        color: 'white',
        fontFamily: "'Nunito', sans-serif",
        textAlign: 'center',
        padding: '2rem',
        animation: 'fadeIn 0.4s ease'
      }}>
        <div style={{
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 106, 247, 0.4) 0%, rgba(10, 10, 15, 0.85) 70%)',
          border: '2px solid rgba(124, 106, 247, 0.6)',
          boxShadow: '0 0 40px rgba(124, 106, 247, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4.5rem'
        }}>
          {info.emoji}
        </div>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#b8aeff' }}>Avatar: {info.label}</span>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
            Coloca <code style={{ color: '#7c6af7', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px' }}>public{info.src}</code> para cargar este video
          </p>
        </div>
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      src={info.src}
      autoPlay
      loop
      muted
      playsInline
      onError={() => {
        setHasVideoError(true)
      }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        pointerEvents: 'none'
      }}
    />
  )
}

function PlayingChessView({ 
  board, 
  lastMove, 
  inCheck, 
  turn, 
  aiSpeakingText, 
  avatarState 
}: {
  board: any[][]
  lastMove: { from: string; to: string } | null
  inCheck: string | null
  turn: 'w' | 'b'
  aiSpeakingText: string | null
  avatarState: AvatarVideoState
}) {
  const getSquareName = (r: number, c: number) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']
    return files[c] + ranks[r]
  }

  const pieceUnicode: { [key: string]: string } = {
    'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
    'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
  }

  let avatarColor = '#7c6af7'
  if (avatarState === 'surprised') avatarColor = '#ff9800'
  else if (avatarState === 'moving') avatarColor = '#2196f3'
  else if (avatarState === 'speaking') avatarColor = '#00bcd4'

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: '#07070a'
    }}>
      {/* 1. Video del Avatar a Pantalla Completa (Full Screen Centrado) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0
      }}>
        <AvatarVideoPlayer avatarState={avatarState} />
      </div>

      {/* 2. Sombra y Gradiente sutil para legibilidad de la interfaz */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.7) 100%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* 3. Tarjeta de Diálogo de la IA (Lado Inferior Izquierdo) */}
      {aiSpeakingText && (
        <div style={{
          position: 'absolute',
          left: '17%',
          bottom: '8%',
          background: 'rgba(10, 10, 15, 0.92)',
          border: `2px solid ${avatarColor}`,
          borderRadius: '24px 24px 24px 4px',
          padding: '1.25rem 1.75rem',
          maxWidth: '420px',
          boxShadow: `0 20px 40px rgba(0,0,0,0.65), 0 0 25px ${avatarColor}44`,
          animation: 'bubbleAppear 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          backdropFilter: 'blur(12px)',
          zIndex: 3
        }}>
          <span style={{
            fontFamily: 'Nunito',
            fontSize: '0.8rem',
            color: avatarColor,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em'
          }}>
            Joy IA
          </span>
          <p style={{
            fontFamily: 'Nunito',
            fontSize: '1.25rem',
            color: '#ffffff',
            lineHeight: 1.45,
            fontWeight: 600,
            margin: 0
          }}>
            "{aiSpeakingText}"
          </p>
        </div>
      )}

      {/* 4. Panel del Tablero 2D (Lado Derecho Centrado) */}
      <div style={{
        position: 'absolute',
        right: '5%',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        zIndex: 2
      }}>
        {/* Indicador de Turno */}
        <div style={{
          background: 'rgba(10, 10, 15, 0.75)',
          border: `1.5px solid ${turn === 'w' ? 'rgba(255,255,255,0.15)' : avatarColor + '77'}`,
          borderRadius: '20px',
          padding: '12px 28px',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.5s ease'
        }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: turn === 'w' ? '#ffffff' : avatarColor,
            boxShadow: turn === 'w' ? '0 0 10px #ffffff' : `0 0 10px ${avatarColor}`
          }} />
          <span style={{
            fontFamily: 'Nunito',
            fontSize: '1.1rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '0.05em'
          }}>
            {turn === 'w' ? 'Tu Turno (Blancas)' : 'Pensando Joy IA...'}
          </span>
        </div>

        {/* Tablero de Ajedrez */}
        <div style={{
          padding: '12px',
          background: 'rgba(10, 10, 15, 0.75)',
          border: `2.5px solid ${avatarColor}55`,
          borderRadius: '24px',
          boxShadow: `0 20px 50px rgba(0,0,0,0.7), 0 0 30px ${avatarColor}15`,
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateRows: 'repeat(8, 70px)',
            gridTemplateColumns: 'repeat(8, 70px)',
            background: '#07070a',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            {board.map((row, rIdx) => 
              row.map((col, cIdx) => {
                const squareName = getSquareName(rIdx, cIdx)
                const isLight = (rIdx + cIdx) % 2 === 0
                const isLastMove = lastMove && (lastMove.from === squareName || lastMove.to === squareName)
                const isCheck = inCheck === squareName
                
                let bg = isLight ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.01)'
                let borderStyle = 'none'

                if (isLastMove) {
                  bg = isLight ? 'rgba(255, 213, 79, 0.12)' : 'rgba(255, 213, 79, 0.08)'
                }
                if (isCheck) {
                  bg = 'rgba(244, 67, 54, 0.2)'
                  borderStyle = '2px solid #f44336'
                }

                const piece = col
                let pieceChar = ''
                let pieceColor = '#ffffff'
                let pieceShadow = 'none'

                if (piece) {
                  const key = piece.color + piece.type
                  pieceChar = pieceUnicode[key] || ''
                  pieceColor = piece.color === 'w' ? '#ffffff' : '#b8aeff'
                  pieceShadow = piece.color === 'w' ? '0 0 10px rgba(255,255,255,0.6)' : '0 0 10px rgba(184,174,255,0.6)'
                }

                return (
                  <div key={squareName} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: bg, border: borderStyle, position: 'relative',
                    overflow: 'hidden',
                    transition: 'background 0.3s ease'
                  }}>
                    {pieceChar && (
                      <span style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem', color: pieceColor, textShadow: pieceShadow,
                        userSelect: 'none', zIndex: 2
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
      </div>
    </div>
  )
}