import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import Admin from './pages/Admin'


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
  const [selectedTerm, setSelectedTerm] = useState(null)

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

  // Procesar el contenido HTML para hacer los términos clickeables
  const procesarContenido = (html) => {
    if (!html) return ''
    
    const termsList = {
      'experimentalismo': {
        definition: 'Corriente psicológica que defiende el uso del método experimental para estudiar los procesos psicológicos. Busca establecer relaciones causa-efecto en condiciones controladas de laboratorio. Sus máximos exponentes fueron Wilhelm Wundt (primer laboratorio de psicología, 1879) y los estructuralistas.',
        category: 'Corriente Psicológica'
      },
      'Gestalt': {
        definition: 'Escuela psicológica alemana que sostiene que "el todo es más que la suma de las partes". Se centra en la percepción y la organización de la experiencia. Sus principales representantes son Max Wertheimer, Wolfgang Köhler y Kurt Koffka.',
        category: 'Corriente Psicológica'
      },
      'psicoanálisis': {
        definition: 'Teoría psicológica fundada por Sigmund Freud que estudia el inconsciente, los procesos psíquicos no conscientes y su influencia en la conducta. Introduce conceptos como ello, yo y superyó, mecanismos de defensa.',
        category: 'Corriente Psicológica'
      },
      'conductismo': {
        definition: 'Corriente psicológica fundada por John B. Watson que se centra en el estudio de la conducta observable, ignorando los procesos mentales internos. Su lema es "estímulo-respuesta". B.F. Skinner desarrolló el conductismo radical.',
        category: 'Corriente Psicológica'
      },
      'Luis Leopold': {
        definition: 'Psicólogo argentino, referente en psicología institucional y del trabajo. Propuso una redefinición de la psicología como "la ciencia que estudia a los individuos y las relaciones que estos sostienen para constituir, mantener y reproducir la vida institucional y organizacional".',
        category: 'Autor'
      },
      'mundo del trabajo': {
        definition: 'Concepto que abarca no solo el lugar físico donde se trabaja, sino todas las relaciones, normas, valores, conflictos y cooperaciones que constituyen la experiencia laboral.',
        category: 'Concepto'
      },
      'dialéctica individuo-sociedad': {
        definition: 'Concepto filosófico y sociológico que describe la relación de influencia mutua entre el individuo y la sociedad. El individuo construye la sociedad (externalización), la sociedad se le presenta como algo objetivo (objetivación), y luego la internaliza en su conciencia (internalización).',
        category: 'Concepto Teórico'
      }
    }

    let processedHtml = html
    
    Object.keys(termsList).forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi')
      const termData = termsList[term]
      processedHtml = processedHtml.replace(regex, (match) => {
        return `<span class="clickable-term" data-term="${match}" data-definition="${termData.definition.replace(/"/g, '&quot;')}" data-category="${termData.category}" style="background-color:#fef3c7; color:#92400e; padding:0.1rem 0.3rem; border-radius:0.25rem; font-weight:500; cursor:pointer; border-bottom:1px dashed #d97706;">${match}</span>`
      })
    })
    
    return processedHtml
  }

  const handleTermClick = (e) => {
    const target = e.target
    if (target.classList && target.classList.contains('clickable-term')) {
      const term = target.getAttribute('data-term')
      const definition = target.getAttribute('data-definition')
      const category = target.getAttribute('data-category')
      setSelectedTerm({ term, definition, category })
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

  const processedContent = procesarContenido(seccion.content)

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

      <article className="max-w-3xl mx-auto py-12 px-4" onClick={handleTermClick}>
        <Link to="/volumen/1" className="text-blue-600 hover:underline inline-flex items-center mb-6">← Volver al volumen</Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-6">{seccion.title}</h1>
        <div className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow">
          <div dangerouslySetInnerHTML={{ __html: processedContent }} />
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>© 2026 - La Arquitectura del Trabajo - Claudia Nagüel</p>
        </div>
      </article>

      {selectedTerm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTerm(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">{selectedTerm.term}</h3>
              <button 
                onClick={() => setSelectedTerm(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="text-gray-700 mb-4 leading-relaxed">
              {selectedTerm.definition}
            </div>
            <div className="text-xs text-gray-400 mt-2 pt-2 border-t">
              Categoría: {selectedTerm.category}
            </div>
            <button
              onClick={() => setSelectedTerm(null)}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
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
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App