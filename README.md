# Cuentos TV — Fase 1 (Test)

PWA para validar sincronización celular → Smart TV via QR + Supabase Realtime.

## Stack
- Next.js 14 (App Router)
- Supabase Realtime (broadcast channels)
- Rive (animación)
- QRCode.react
- Tailwind CSS

## Setup local

```bash
npm install
npm run dev
```

Abre http://localhost:3000 en el celular y http://localhost:3000/tv?session=TEST en la TV.

## Deploy en Vercel

1. Sube este proyecto a un repositorio de GitHub
2. Importa el repo en vercel.com
3. Agrega las variables de entorno en Vercel → Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Flujo de prueba

1. Abre la PWA en el celular desde la URL de Vercel
2. Presiona **"Ver en TV"** → aparece el QR
3. En la Smart TV, abre el navegador y escanea el QR (o escribe la URL manualmente)
4. El celular detecta la conexión → muestra botón **"Enviar animación"**
5. Presiona el botón → la animación Rive aparece en la TV

## Notas para Smart TV (Google TV / Android TV)

- El navegador integrado es Chrome → compatibilidad total con WebSockets
- Si el QR no funciona con la cámara de la TV, puedes escribir la URL manualmente
- La pantalla TV pide fullscreen automáticamente
- Supabase Realtime usa WebSockets sobre HTTPS → funciona en redes WiFi del hogar

## Archivos clave

| Archivo | Rol |
|---|---|
| `app/page.tsx` | PWA del celular |
| `app/tv/page.tsx` | Pantalla de la TV |
| `lib/supabase.ts` | Cliente Supabase compartido |
| `public/animation.riv` | Animación Rive |
