import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SuggestionForm({ sectionTitle, sectionSlug }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

const handleSubmit = async (e) => {
  e.preventDefault()
  
  if (!suggestion.trim()) {
    setMessage('Por favor, escribí tu sugerencia')
    return
  }

  setStatus('loading')
  setMessage('')

  // 1. Guardar en Supabase
  const { error: dbError } = await supabase
    .from('suggestions')
    .insert([{
      name: name || null,
      email: email || null,
      suggestion: suggestion.trim(),
      section_slug: sectionSlug,
      page_url: window.location.href,
      status: 'pending'
    }])

  if (dbError) {
    setStatus('error')
    setMessage('Error al guardar: ' + dbError.message)
    return
  }

  // 2. Llamar a la Edge Function para enviar email
  try {
    const { error: fnError } = await supabase.functions.invoke('send-suggestion-email', {
      body: {
        name,
        email,
        suggestion: suggestion.trim(),
        sectionSlug,
        pageUrl: window.location.href
      }
    })

    if (fnError) {
      console.error('Error en Edge Function:', fnError)
    }
  } catch (err) {
    console.error('Error:', err)
  }

  setStatus('success')
  setMessage('✅ ¡Gracias! Tu sugerencia fue enviada. La revisaré pronto.')
  setName('')
  setEmail('')
  setSuggestion('')
  setTimeout(() => setStatus('idle'), 5000)
}

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              ¿Sugerencia o corrección?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ayudame a mejorar este libro. Tu opinión es valiosa.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tu nombre (opcional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Claudia"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tu email (opcional, para responder)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tu sugerencia o corrección *
            </label>
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              rows={4}
              placeholder="Ej: En esta sección falta mencionar... / Encontré un error en... / Sugiero agregar..."
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            La sección actual: <strong>{sectionTitle}</strong>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {status === 'loading' ? 'Enviando...' : '📨 Enviar sugerencia'}
          </button>

          {message && (
            <p className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}