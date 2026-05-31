import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'

// Página de inicio
function Home() {
  const [volumenes, setVolumenes] = useState([])

  useEffect(() => {
    cargarVolumenes()
  }, [])

  const cargarVolumenes = async () => {
    const { data } = await supabase.from('volumes').select('*').order('order_index')
    setVolumenes(data || [])
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">ArqTrabajo</h1>
            <div className="space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600">Inicio</Link>
              {volumenes.map(v => (
                <Link key={v.id} to={`/volumen/${v.number}`} className="text-gray-700 hover:text-blue-600">
                  Volumen {v.number}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">La Arquitectura del Trabajo</h1>
          <p className="text-xl mb-8">Psicología, Subjetividad y Dinámicas Organizacionales</p>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Una obra completa de Claudia Nagüel sobre psicología del trabajo, 
            salud ocupacional y gestión organizacional.
          </p>
          {volumenes.length > 0 && (
            <Link to={`/volumen/${volumenes[0].number}`} className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Comenzar a leer
            </Link>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Los Tres Volúmenes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {volumenes.map(volumen => (
              <Link key={volumen.id} to={`/volumen/${volumen.number}`} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition block">
                <h3 className="text-xl font-semibold mb-2">Volumen {volumen.number}</h3>
                <p className="text-gray-600">{volumen.title}</p>
                <p className="text-gray-500 text-sm mt-2">{volumen.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2026 Claudia Nagüel - Buenos Aires, Argentina</p>
        </div>
      </footer>
    </div>
  )
}

// Página de volumen con capítulos y secciones
function VolumenPage() {
  const { id } = useParams()
  const [volumen, setVolumen] = useState(null)
  const [capitulos, setCapitulos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [id])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const { data: volData, error: volError } = await supabase
        .from('volumes')
        .select('*')
        .eq('number', parseInt(id))
        .single()

      if (volError) throw volError
      setVolumen(volData)

      const { data: capsData } = await supabase
        .from('chapters')
        .select('*')
        .eq('volume_id', volData.id)
        .order('order_index')

      const capsConSecciones = await Promise.all(
        (capsData || []).map(async (cap) => {
          const { data: secsData } = await supabase
            .from('sections')
            .select('*')
            .eq('chapter_id', cap.id)
            .order('order_index')
          return { ...cap, secciones: secsData || [] }
        })
      )

      setCapitulos(capsConSecciones)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  if (!volumen) {
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
        
        <h1 className="text-4xl font-bold mb-4">Volumen {volumen.number}: {volumen.title}</h1>
        <p className="text-gray-600 text-lg mb-8">{volumen.description}</p>
        
        {capitulos.map((capitulo) => (
          <div key={capitulo.id} className="mb-8 border-l-4 border-blue-200 pl-4">
            <h2 className="text-2xl font-semibold mb-3">Capítulo {capitulo.number}: {capitulo.title}</h2>
            <div className="space-y-2 ml-4">
              {capitulo.secciones.map((seccion) => (
                <Link key={seccion.id} to={`/lectura/${seccion.slug}`} className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 hover:text-blue-800">{seccion.title}</span>
                    {seccion.tier !== 'free' && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Premium</span>}
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

// Página de lectura de sección
function LecturaPage() {
  const { slug } = useParams()
  const [seccion, setSeccion] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarSeccion()
  }, [slug])

  const cargarSeccion = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) throw error
      setSeccion(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando contenido...</div>
  }

  if (!seccion) {
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
        <Link to="/volumen/1" className="text-blue-600 hover:underline inline-flex items-center mb-6">← Volver al volumen</Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-6">{seccion.title}</h1>
        <div className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow">
          <div dangerouslySetInnerHTML={{ __html: seccion.content || '<p>Contenido próximamente...</p>' }} />
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>© 2026 - La Arquitectura del Trabajo - Claudia Nagüel</p>
        </div>
      </article>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/volumen/:id" element={<VolumenPage />} />
        <Route path="/lectura/:slug" element={<LecturaPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App