import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function TermCard({ term, children }) {
  const [showModal, setShowModal] = useState(false)
  const [definition, setDefinition] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchDefinition = async () => {
    if (definition) return
    
    setLoading(true)
    const { data } = await supabase
      .from('glossary_terms')
      .select('*')
      .eq('term', term)
      .single()
    
    if (data) {
      setDefinition(data)
    } else {
      // Si no existe en la base de datos, usar el texto hijo como definición temporal
      setDefinition({
        term: term,
        definition: children || 'Término en proceso de definición. Próximamente más información.',
        category: 'En desarrollo'
      })
    }
    setLoading(false)
  }

  const handleClick = () => {
    fetchDefinition()
    setShowModal(true)
  }

  return (
    <>
      <span 
        onClick={handleClick}
        className="key-term inline-block cursor-pointer px-1 rounded transition-all duration-200 hover:scale-105"
        style={{
          backgroundColor: '#fef3c7',
          color: '#92400e',
          fontWeight: '500',
          borderBottom: '1px dashed #d97706'
        }}
      >
        {term}
      </span>

      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">{definition?.term}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="text-gray-700 mb-4 leading-relaxed">
                  {definition?.definition}
                </div>
                {definition?.category && (
                  <div className="text-xs text-gray-400 mt-2 pt-2 border-t">
                    Categoría: {definition?.category}
                  </div>
                )}
              </>
            )}
            
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  )
}