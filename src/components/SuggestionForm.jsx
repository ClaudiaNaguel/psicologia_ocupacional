// src/components/SuggestionForm.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SuggestionForm = ({ sectionId, sectionTitle }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // 1. Guardar en Supabase
      const { error: supabaseError } = await supabase
        .from('suggestions')
        .insert([{
          section_id: sectionId,
          section_title: sectionTitle,
          name: name || 'Anónimo',
          email: email || null,
          suggestion: suggestion,
          status: 'pending'
        }]);

      if (supabaseError) throw supabaseError;

      // 2. Enviar email via Netlify Function
      const response = await fetch('/.netlify/functions/send-suggestion-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Anónimo',
          email: email,
          suggestion: suggestion,
          sectionTitle: sectionTitle
        })
      });

      if (!response.ok) throw new Error('Error al enviar email');

      setMessage('✅ ¡Gracias por tu sugerencia! La revisaré pronto.');
      setName('');
      setEmail('');
      setSuggestion('');
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error al enviar. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">💬</div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            ¿Sugerencias o comentarios?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tu opinión es importante. Si encuentras errores o tienes ideas para mejorar, compártelas.
          </p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('✅') 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre (opcional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email (opcional, para respuesta)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tu sugerencia *
          </label>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            required
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            placeholder="Ej: Encontré un error tipográfico en la sección 3.1.1... / Sugiero agregar información sobre... / Me gustaría ver más ejemplos de..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </>
          ) : (
            'Enviar sugerencia'
          )}
        </button>
      </form>
    </div>
  );
};

export default SuggestionForm;