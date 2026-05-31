import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function VolumeView() {
  const { id } = useParams()
  const [volume, setVolume] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVolumeData()
  }, [id])

  const loadVolumeData = async () => {
    setLoading(true)
    try {
      // Obtener el volumen por número
      const { data: volumeData, error: volError } = await supabase
        .from('volumes')
        .select('*')
        .eq('number', parseInt(id))
        .single()

      if (volError) throw volError
      setVolume(volumeData)

      // Obtener capítulos del volumen
      const { data: chaptersData, error: chapError } = await supabase
        .from('chapters')
        .select('*')
        .eq('volume_id', volumeData.id)
        .order('order_index')

      if (chapError) throw chapError

      // Obtener secciones para cada capítulo
      const chaptersWithSections = await Promise.all(
        chaptersData.map(async (chapter) => {
          const { data: sectionsData } = await supabase
            .from('sections')
            .select('*')
            .eq('chapter_id', chapter.id)
            .order('order_index')
          
          return { ...chapter, sections: sectionsData || [] }
        })
      )

      setChapters(chaptersWithSections)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  if (!volume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
        <p className="text-gray-500 text-xl mb-4">Volumen no encontrado</p>
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

      <div className="max-w-4xl mx-auto py-12 px-4">
        <Link to="/" className="text-blue-600 hover:underline inline-block mb-6">← Volver al inicio</Link>
        
        <h1 className="text-4xl font-bold mb-4">
          Volumen {volume.number}: {volume.title}
        </h1>
        <p className="text-gray-600 text-lg mb-8">{volume.description}</p>
        
        {chapters.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Próximamente: contenido completo del Volumen {volume.number}</p>
          </div>
        )}
        
        {chapters.map((chapter) => (
          <div key={chapter.id} className="mb-8 border-l-4 border-blue-200 pl-4">
            <h2 className="text-2xl font-semibold mb-3">
              Capítulo {chapter.number}: {chapter.title}
            </h2>
            <div className="space-y-2 ml-4">
              {chapter.sections.map((section) => (
                <Link
                  key={section.id}
                  to={`/lectura/${section.slug}`}
                  className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-100"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 hover:text-blue-800">
                      {section.title}
                    </span>
                    {section.tier !== 'free' && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}