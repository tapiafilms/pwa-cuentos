import { NextResponse } from 'next/server'

const SYSTEM_PROMPTS: Record<string, string> = {
  '1': "Eres el Roble Viejo del cuento 'El Bosque que Respira'. Eres sabio, antiguo y hablas con amor hacia la naturaleza y los niños. Tus respuestas deben ser cortas (máximo 2 oraciones), mágicas, cariñosas y adecuadas para niños de 6 a 10 años. ¡No rompas el personaje!",
  '2': "Eres la Ballena de Cristal del cuento 'La Ballena de Cristal'. Eres mágica, hablas con suavidad y tus palabras están hechas de sueños y estrellas. Tus respuestas deben ser cortas (máximo 2 oraciones), poéticas y adecuadas para niños de 5 a 9 años. ¡No rompas el personaje!",
  '3': "Eres el Guardián del Tiempo de 'El Reloj Sin Agujas'. Eres curioso, preciso y te encantan los acertijos sobre el tiempo. Tus respuestas deben ser cortas (máximo 2 oraciones) y adecuadas para niños de 7 a 11 años. ¡No rompas el personaje!",
  '4': "Eres la Reina de la Niebla de 'La Reina de la Niebla'. Eres misteriosa pero bondadosa, y hablas en el lenguaje de las nubes y el amanecer. Tus respuestas deben ser cortas (máximo 2 oraciones) y adecuadas para niños de 6 a 10 años. ¡No rompas el personaje!",
  '5': "Eres el Cartero de las Estrellas de 'El Cartero de las Estrellas'. Eres aventurero, veloz y conoces todas las galaxias y constelaciones. Tus respuestas deben ser cortas (máximo 2 oraciones) y adecuadas para niños de 8 a 12 años. ¡No rompas el personaje!"
}

const FALLBACK_RESPONSES: Record<string, string[]> = {
  '1': [
    "¡Hola, pequeño explorador! Puedo sentir los latidos del bosque bajo mis raíces. ¿Has escuchado el susurro de las hojas hoy?",
    "Las raíces de este roble viejo guardan secretos de cien años. Si escuchas con atención, el viento te contará una bella canción.",
    "El tiempo corre de una forma mágica aquí abajo. Todo brota y vuelve a florecer si lo tratas con amor y paciencia."
  ],
  '2': [
    "Viajo por el cielo azul recogiendo los sueños que otros olvidan. ¿Qué gran deseo tienes en tu corazón hoy?",
    "Mis escamas de cristal brillan con los destellos de las estrellas. ¡Gracias por saltar a volar conmigo en las nubes!",
    "El océano flotante está lleno de paz esta noche. Juntos podemos guiar los sueños perdidos hacia su hogar."
  ],
  '3': [
    "¡Tic-tac! El tiempo es un laberinto muy divertido. ¿Sabías que cada minuto es una pequeña cajita de sorpresas?",
    "Las agujas del reloj descansan en el mercado de los sueños. ¡Me alegra tanto que nos ayudes a restaurar el tiempo!",
    "No te preocupes por las agujas perdidas. Cuando usas tu imaginación, el tiempo se detiene para dejarte jugar."
  ],
  '4': [
    "El castillo de niebla solo se revela a quienes miran el amanecer con ojos soñadores. ¡Tienes un corazón muy curioso!",
    "La bruma protege nuestro reino mágico, pero siempre abre sus puertas a los niños de alma noble como tú.",
    "Cada mañana escribo mensajes en el cielo. ¿Te gustaría aprender a leer el lenguaje de las nubes y el viento?"
  ],
  '5': [
    "¡He viajado a la velocidad de la luz desde la Osa Mayor! ¿Quieres enviar una carta espacial a alguna constelación lejana?",
    "Cada estrella fugaz es una carta de amor cruzando el espacio. ¡El universo está lleno de historias esperando ser leídas!",
    "En la cima del mundo, el buzón helado protege nuestros mensajes estelares. ¡Gracias por ser un excelente cartero!"
  ]
}

export async function POST(request: Request) {
  try {
    const { message, cuentoId } = await request.json()

    if (!message || !cuentoId) {
      return NextResponse.json({ error: 'Faltan parámetros message o cuentoId' }, { status: 400 })
    }

    const systemPrompt = SYSTEM_PROMPTS[cuentoId as string] || "Eres un personaje mágico de un cuento infantil."
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY

    // 1. Si la API Key de Anthropic (Claude) está configurada, llamamos a Anthropic
    if (anthropicKey && anthropicKey.trim() !== '') {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-5',
            max_tokens: 120,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: `Un niño te pregunta: "${message}"\nResponde directamente al niño en primera persona:`
              }
            ]
          })
        })

        if (response.ok) {
          const data = await response.json()
          const textReply = data?.content?.[0]?.text
          if (textReply && textReply.trim() !== '') {
            return NextResponse.json({ response: textReply.trim() })
          }
        } else {
          console.error('Anthropic API error response:', response.status, await response.text())
        }
      } catch (err) {
        console.error('Error fetching Anthropic:', err)
      }
    }

    // 2. Si la API Key de Gemini está configurada, llamamos a Gemini
    if (geminiKey && geminiKey.trim() !== '') {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${systemPrompt}\n\nUn niño te pregunta: "${message}"\nResponde directamente al niño en primera persona:`
                  }
                ]
              }
            ],
            generationConfig: {
              maxOutputTokens: 120,
              temperature: 0.7,
            }
          })
        })

        if (response.ok) {
          const data = await response.json()
          const textReply = data?.candidates?.[0]?.content?.parts?.[0]?.text
          if (textReply && textReply.trim() !== '') {
            return NextResponse.json({ response: textReply.trim() })
          }
        } else {
          console.error('Gemini API error response:', response.status, await response.text())
        }
      } catch (err) {
        console.error('Error fetching Gemini:', err)
      }
    }

    // Fallback: Si no hay API key o las llamadas fallaron, devolvemos una respuesta mágica simulada
    const list = FALLBACK_RESPONSES[cuentoId as string] || [
      "¡Hola! Qué pregunta tan bonita. Sigamos descubriendo juntos las sorpresas de esta mágica aventura."
    ]
    const fallbackReply = list[Math.floor(Math.random() * list.length)]

    return NextResponse.json({ response: fallbackReply })
  } catch (error) {
    console.error('Error in API Chat route:', error)
    return NextResponse.json({ response: "¡Hola! He sentido tu voz, pero el viento sopla muy fuerte ahora. ¿Podrías volver a preguntarme?" })
  }
}
