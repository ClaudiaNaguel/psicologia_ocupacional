import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SubscribeForm from './components/SubscribeForm'
import ThemeSelector from './components/ThemeSelector'

function Home() {
  const [volumenes, setVolumenes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    cargarVolumenes()
    // Efecto de aparición para elementos
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const cargarVolumenes = async () => {
    const { data } = await supabase.from('volumes').select('*').order('order_index')
    console.log('Volúmenes cargados:', data)  // <-- Agrega esta línea
    setVolumenes(data || [])
  }



  const normalizeText = (text) => {
    if (!text) return ''
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "")
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    setShowSearch(true)
    setSearchLoading(true)
    const searchNormalized = normalizeText(searchTerm)
    const { data } = await supabase.from('sections').select('*').limit(100)
    if (data) {
      const results = data.filter(section => {
        const titleNormalized = normalizeText(section.title)
        const contentNormalized = normalizeText(section.content || '')
        return titleNormalized.includes(searchNormalized) || contentNormalized.includes(searchNormalized)
      })
      setSearchResults(results)
    }
    setSearchLoading(false)
  }

  const highlightText = (text) => {
    if (!text) return ''
    try {
      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      return text.replace(regex, '<mark style="background-color:#fef3c7; padding:0 2px; border-radius:4px;">$1</mark>')
    } catch {
      return text
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section Mejorada */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        {/* Fondo con patrones */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="1000" height="1000" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center fade-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <span className="text-yellow-400 text-sm">📚 Obra completa</span>
              <span className="text-white/40">•</span>
              <span className="text-blue-200 text-sm">3 volúmenes</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              La Arquitectura del Trabajo
            </h1>

            <p className="text-xl md:text-2xl mb-6 text-blue-100 max-w-3xl mx-auto">
              Psicología, Subjetividad y Dinámicas Organizacionales
            </p>

            <p className="text-lg mb-10 text-blue-200 max-w-2xl mx-auto">
              Una obra completa de <strong className="text-white font-semibold">Claudia Nagüel</strong> sobre psicología del trabajo,
              salud ocupacional y gestión organizacional.
            </p>

            {/* Buscador */}
            <div className="max-w-lg mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Buscar en el libro..."
                  className="w-full pl-12 pr-28 py-4 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-xl"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-5 py-2 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Resultados de búsqueda */}
            {showSearch && (
              <div className="max-w-2xl mx-auto mt-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl text-left max-h-96 overflow-y-auto border border-gray-200">
                <div className="px-4 py-3 border-b flex justify-between items-center sticky top-0 bg-white/95 rounded-t-2xl">
                  <span className="text-sm font-semibold text-gray-700">
                    🔍 "{searchTerm}" - {searchResults.length} resultado(s)
                  </span>
                  <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                </div>
                {searchLoading ? (
                  <div className="p-8 text-center text-gray-500">Buscando...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No se encontraron resultados</p>
                    <p className="text-sm text-gray-400 mt-1">💡 Prueba con otra palabra</p>
                  </div>
                ) : (
                  <div>
                    {searchResults.map(result => (
                      <Link
                        key={result.id}
                        to={`/lectura/${result.slug}`}
                        onClick={() => setShowSearch(false)}
                        className="block px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition"
                      >
                        <p className="font-medium text-blue-600 text-sm">{result.title}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1"
                          dangerouslySetInnerHTML={{
                            __html: highlightText(result.content?.substring(0, 100) || '')
                          }} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link to="/volumen/1" className="group bg-white text-blue-700 px-8 py-3.5 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-2">
                📖 Comenzar a leer
                <svg className="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/pricing" className="group border-2 border-white text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white hover:text-blue-700 transition-all transform hover:scale-105 inline-flex items-center gap-2">
                ⭐ Ver planes
                <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Ola decorativa */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 text-gray-50 dark:text-gray-800" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>

      {/* Sección: Recorrido por el libro */}
      <div className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 fade-up">
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider">Guía de lectura</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-2 mb-4">Recorrido por el libro</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto">
              Descubre qué contiene cada volumen antes de empezar a leer
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {/* Volumen 1 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 fade-up">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 sm:px-3 sm:py-2 text-white">
              <div className="flex justify-between items-center">
                <span className="text-2xl sm:text-xl">📚</span>
                <span className="text-xs sm:text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Volumen I</span>
              </div>
              <h3 className="text-lg sm:text-base font-bold mt-1">Fundamentos Teóricos</h3>
            </div>
            <div className="p-4 sm:p-3">
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-xs leading-relaxed line-clamp-3">
                Establece la base científica de la disciplina. Explora cómo el ser humano construye su realidad social y analiza la evolución histórica del trabajo, desde el higienismo del siglo XIX hasta la psicodinámica de Dejours.
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs sm:text-[10px] bg-blue-100 dark:bg-gray-700 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full">🧠 Subjetividad</span>
                <span className="text-xs sm:text-[10px] bg-blue-100 dark:bg-gray-700 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full">📜 Historia</span>
                <span className="text-xs sm:text-[10px] bg-blue-100 dark:bg-gray-700 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full">🔄 Dialéctica</span>
              </div>
              <Link to="/volumen/1" className="mt-2 inline-flex items-center text-blue-600 dark:text-blue-400 text-sm sm:text-xs font-medium">
                Explorar volumen →
              </Link>
            </div>
          </div>

          {/* Volumen 2 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 sm:px-3 sm:py-2 text-white">
              <div className="flex justify-between items-center">
                <span className="text-2xl sm:text-xl">👥</span>
                <span className="text-xs sm:text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Volumen II</span>
              </div>
              <h3 className="text-lg sm:text-base font-bold mt-1">Dinámicas de Grupo</h3>
            </div>
            <div className="p-4 sm:p-3">
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-xs leading-relaxed line-clamp-3">
                Analiza la trama colectiva (equipos, clima grupal, seguridad psicológica) y el rol del liderazgo. Aborda la psicometría, la descripción de puestos y la selección por competencias.
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs sm:text-[10px] bg-emerald-100 dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full">🏆 Liderazgo</span>
                <span className="text-xs sm:text-[10px] bg-emerald-100 dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full">📊 Psicometría</span>
                <span className="text-xs sm:text-[10px] bg-emerald-100 dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full">🎯 Competencias</span>
              </div>
              <Link to="/volumen/2" className="mt-2 inline-flex items-center text-emerald-600 dark:text-emerald-400 text-sm sm:text-xs font-medium">
                Explorar volumen →
              </Link>
            </div>
          </div>

          {/* Volumen 3 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 sm:px-3 sm:py-2 text-white">
              <div className="flex justify-between items-center">
                <span className="text-2xl sm:text-xl">🏥</span>
                <span className="text-xs sm:text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Volumen III</span>
              </div>
              <h3 className="text-lg sm:text-base font-bold mt-1">Salud Ocupacional</h3>
            </div>
            <div className="p-4 sm:p-3">
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-xs leading-relaxed line-clamp-3">
                Desarrolla la Salud Mental Positiva Ocupacional, la gestión de riesgos (modelo Demanda-Control) y estrategias de intervención. Aborda clima, cultura y cambio organizacional.
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs sm:text-[10px] bg-purple-100 dark:bg-gray-700 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full">🧘 Salud mental</span>
                <span className="text-xs sm:text-[10px] bg-purple-100 dark:bg-gray-700 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full">⚠️ Riesgos</span>
                <span className="text-xs sm:text-[10px] bg-purple-100 dark:bg-gray-700 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full">🔄 Cambio</span>
              </div>
              <Link to="/volumen/3" className="mt-2 inline-flex items-center text-purple-600 dark:text-purple-400 text-sm sm:text-xs font-medium">
                Explorar volumen →
              </Link>
            </div>
          </div>
        </div>
      </div>


      {/* Sección de características interactivas mejorada */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 fade-up">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Características</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">¿Qué encontrarás?</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full"></div>
            <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">
              Contenido interactivo y herramientas para profesionales y estudiantes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Contenido completo */}
            <Link to="/volumen/1" className="group text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-up">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <div className="text-4xl">📖</div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Contenido completo</h3>
              <p className="text-gray-500 text-sm">Los 3 volúmenes completos del libro con acceso a todo el material</p>
              <span className="inline-block mt-4 text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">Explorar →</span>
            </Link>

            {/* Búsqueda inteligente */}
            <div className="group text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer fade-up"
              onClick={() => document.querySelector('input[placeholder="Buscar en el libro..."]')?.focus()}>
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <div className="text-4xl">🔍</div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Búsqueda inteligente</h3>
              <p className="text-gray-500 text-sm">Busca cualquier palabra o concepto en todo el libro</p>
              <span className="inline-block mt-4 text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">Buscar ahora →</span>
            </div>

            {/* Contenido premium */}
            <Link to="/pricing" className="group text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-up">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <div className="text-4xl">⭐</div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Contenido premium</h3>
              <p className="text-gray-500 text-sm">Accede a capítulos exclusivos y material complementario</p>
              <span className="inline-block mt-4 text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">Ver planes →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Newsletter Section mejorada */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center fade-up">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <span className="text-2xl">📧</span>
            <span className="text-sm">Mantente informado</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Newsletter</h2>
          <p className="text-gray-300 mb-8">
            Recibe los resúmenes y novedades directamente en tu correo
          </p>
          <SubscribeForm />
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center space-x-6 mb-6">
            <span className="text-2xl">📚</span>
            <span className="text-2xl">🏥</span>
            <span className="text-2xl">👥</span>
          </div>
          <p>© 2026 Claudia Nagüel - Buenos Aires, Argentina</p>
          <p className="text-sm mt-2 text-gray-500">La Arquitectura del Trabajo: Psicología, Subjetividad y Dinámicas Organizacionales</p>
        </div>
      </footer>

      <ThemeSelector />
    </div>
  )
}

// Página de volumen
function VolumenPage() {
  const { id } = useParams()
  const [volumen, setVolumen] = useState(null)
  const [capitulos, setCapitulos] = useState([])

  useEffect(() => {
    cargarDatos()
  }, [id])

  const cargarDatos = async () => {
    const { data: volData } = await supabase
      .from('volumes')
      .select('*')
      .eq('number', parseInt(id))
      .single()

    setVolumen(volData)

    if (volData) {
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
    }
  }

  if (!volumen) return <div className="p-8">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link to="/" className="text-blue-600">← Volver</Link>
      <h1 className="text-3xl font-bold mt-4">Volumen {volumen.number}: {volumen.title}</h1>
      <p className="text-gray-600 mb-8">{volumen.description}</p>

      {capitulos.map(cap => (
        <div key={cap.id} className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Capítulo {cap.number}: {cap.title}</h2>
          <div className="space-y-2 ml-4">
            {cap.secciones.map(sec => (
              <Link key={sec.id} to={`/lectura/${sec.slug}`} className="block p-4 bg-white rounded-lg shadow">
                {sec.title}
                {sec.tier !== 'free' && <span className="ml-2 text-xs bg-yellow-100 px-2 py-1 rounded">Premium</span>}
              </Link>
            ))}
          </div>
        </div>
      ))}
      <ThemeSelector />
    </div>
  )
}

// Página de lectura
function LecturaPage() {
  const { slug } = useParams()
  const [seccion, setSeccion] = useState(null)

  useEffect(() => {
    cargarSeccion()
  }, [slug])

  const cargarSeccion = async () => {
    const { data } = await supabase
      .from('sections')
      .select('*')
      .eq('slug', slug)
      .single()
    setSeccion(data)
  }

  if (!seccion) return <div className="p-8 text-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link to="/volumen/1" className="text-blue-600">← Volver</Link>
      <h1 className="text-3xl font-bold mt-4 mb-6">{seccion.title}</h1>
      <div className="bg-white p-8 rounded-lg shadow prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: seccion.content || '<p>Contenido próximamente...</p>' }} />
      </div>

      {seccion.tier === 'premium' && (
        <div className="mt-4 text-center text-xs text-gray-400">
          ⭐ Este artículo es premium (el bloqueo está desactivado temporalmente para feedback)
        </div>
      )}
      <ThemeSelector />
    </div>
  )
}

// Panel de Administración
function AdminPage() {
  const [sections, setSections] = useState([])
  const [editing, setEditing] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verificarUsuario()
  }, [])

  const verificarUsuario = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const usuario = session?.user ?? null
    setUser(usuario)

    if (usuario) {
      const { data } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', usuario.id)
        .maybeSingle()
      setIsAdmin(!!data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isAdmin) {
      cargarSecciones()
    }
  }, [isAdmin])

  const cargarSecciones = async () => {
    const { data } = await supabase.from('sections').select('*').order('order_index')
    setSections(data || [])
  }

  const startEdit = (section) => {
    setEditing(section)
    setEditTitle(section.title)
    setEditContent(section.content)
  }

  const saveSection = async () => {
    const { error } = await supabase
      .from('sections')
      .update({ title: editTitle, content: editContent })
      .eq('id', editing.id)

    if (!error) {
      cargarSecciones()
      setEditing(null)
      alert('✅ Guardado correctamente')
    } else {
      alert('❌ Error: ' + error.message)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-100 p-8 text-center">Cargando...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">🔐 Acceso restringido</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para acceder al panel de administración.</p>
          <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block">
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">⛔ Acceso denegado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos de administrador.</p>
          <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block">
            Ir a mi cuenta
          </Link>
        </div>
      </div>
    )
  }

  if (editing) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <button onClick={() => setEditing(null)} className="text-blue-600 mb-4">← Cancelar</button>
        <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Editando: {editing.title}</h1>

          <div className="mb-4">
            <label className="block font-semibold mb-2">Título</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-2">Contenido (HTML)</label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 font-mono text-sm"
              rows={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              Puedes usar: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;
            </p>
          </div>

          <button
            onClick={saveSection}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            💾 Guardar cambios
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link to="/dashboard" className="text-blue-600">← Volver al Dashboard</Link>
      <h1 className="text-3xl font-bold mt-4 mb-6">Panel de Administración</h1>
      <p className="text-gray-600 mb-4">Bienvenido, {user.email}</p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Sección</th>
              <th className="px-6 py-3 text-left">Slug</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sections.map(section => (
              <tr key={section.id} className="border-t">
                <td className="px-6 py-4">{section.title}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">{section.slug}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => startEdit(section)}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  >
                    ✏️ Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ThemeSelector />
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App