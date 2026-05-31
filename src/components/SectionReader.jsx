import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function SectionReader() {
  const { slug } = useParams()
  const [section, setSection] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSection()
  }, [slug])

  const loadSection = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) throw error
      setSection(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Cargando contenido...</div>
      </div>
    )
  }

  if (!section) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
        <p className="text-gray-500 text-xl mb-4">Contenido no encontrado</p>
        <Link to="/" className="text-blue-600 hover:underline">Volver al inicio</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">ArqTrabajo</Link>
            <div className="space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600">Inicio</Link>
              <Link to="/volumen/1" className="text-gray-700 hover:text-blue-600">Volumen I</Link>
              <Link to="/volumen/2" className="text-gray-700 hover:text-blue-600">Volumen II</Link>
              <Link to="/volumen/3" className="text-gray-700 hover:text-blue-600">Volumen III</Link>
            </div>
          </div>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto py-12 px-4">
        <Link to="/volumen/1" className="text-blue-600 hover:underline inline-flex items-center mb-6">
          ← Volver al volumen
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-6">{section.title}</h1>
        
        <div className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow">
          <div dangerouslySetInnerHTML={{ __html: section.content || '<p>Contenido próximamente...</p>' }} />
        </div>
        
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>© 2026 - La Arquitectura del Trabajo - Claudia Nagüel</p>
        </div>
      </article>
    </div>
  )
}