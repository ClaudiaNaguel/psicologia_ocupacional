import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function TableOfContents({ currentSlug }) {
  const [sections, setSections] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    cargarSecciones()
  }, [])

  const cargarSecciones = async () => {
    const { data } = await supabase
      .from('sections')
      .select('title, slug, chapter_id')
      .order('order_index')
    setSections(data || [])
  }

  return (
    <>
      {/* Botón flotante para móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-20 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Panel lateral */}
      <div className={`
        fixed lg:sticky top-20 lg:top-24 right-0 lg:right-auto lg:left-auto
        w-80 lg:w-64 bg-white dark:bg-gray-800 shadow-xl lg:shadow-none rounded-l-xl lg:rounded-xl
        transition-transform duration-300 z-30
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        lg:block
      `}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white">📑 Índice del libro</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Navegación rápida</p>
        </div>
        <div className="h-96 lg:max-h-[70vh] overflow-y-auto p-2">
          {sections.map((section, idx) => (
            <Link
              key={section.id}
              to={`/lectura/${section.slug}`}
              onClick={() => setIsOpen(false)}
              className={`
                block px-3 py-2 rounded-lg text-sm transition-all duration-200 mb-1
                ${currentSlug === section.slug 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium border-l-4 border-blue-500' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <span className="text-xs text-gray-400 mr-2">{String(idx + 1).padStart(2, '0')}</span>
              {section.title.length > 40 ? section.title.substring(0, 40) + '...' : section.title}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}