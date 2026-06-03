import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'claudianaguel@gmail.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, suggestion, sectionSlug, pageUrl } = await req.json()

    // Enviar email al administrador
    const adminEmailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Sugerencias <sugerencias@tudominio.com>',
        to: [ADMIN_EMAIL],
        subject: `📝 Nueva sugerencia para el libro`,
        html: `
          <h2>Nueva sugerencia de lector</h2>
          
          <p><strong>De:</strong> ${name || 'Anónimo'} ${email ? `(${email})` : ''}</p>
          <p><strong>Sección:</strong> ${sectionSlug || 'General'}</p>
          <p><strong>Página:</strong> <a href="${pageUrl}">${pageUrl}</a></p>
          
          <div style="background-color: #f3f4f6; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <strong>Sugerencia:</strong>
            <p style="margin-top: 0.5rem;">${suggestion}</p>
          </div>
          
          <hr />
          <p style="color: #6b7280; font-size: 0.8rem;">
            Puedes revisar todas las sugerencias en el panel de administración: 
            <a href="https://psicologiaocupacional.netlify.app/admin">https://psicologiaocupacional.netlify.app/admin</a>
          </p>
        `,
      }),
    })

    // Si hay email del lector, enviarle confirmación
    let emailToReaderRes = null
    if (email) {
      emailToReaderRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Claudia Nagüel <claudia@tudominio.com>',
          to: [email],
          subject: '✅ Recibí tu sugerencia',
          html: `
            <h2>¡Gracias por tu sugerencia!</h2>
            <p>Hola ${name || 'lector/a'},</p>
            <p>Recibí tu sugerencia sobre el libro <strong>"La Arquitectura del Trabajo"</strong>.</p>
            <p>La revisaré y si es pertinente, la incorporaré en futuras actualizaciones del libro.</p>
            <br />
            <p>¡Gracias por ayudarme a mejorar!</p>
            <p>Claudia Nagüel</p>
          `,
        }),
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email enviado correctamente' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})