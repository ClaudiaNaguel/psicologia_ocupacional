import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SubscribeForm from './components/SubscribeForm'
import ThemeSelector from './components/ThemeSelector'
import ScrollToTop from './components/ScrollToTop'
import SuggestionForm from './components/SuggestionForm'
import ReadingProgress from './components/ReadingProgress'
import ReadingView from './components/ReadingView';
import ChapterView from './components/ChapterView';




function Home() {
  const [volumenes, setVolumenes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    cargarVolumenes()
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
      return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600 px-0.5 rounded">$1</mark>')
    } catch {
      return text
    }
  }

  // Estadísticas para mostrar credibilidad
  const stats = [
    { value: "3", label: "Volúmenes", icon: "📚" },
    { value: "6", label: "Capítulos", icon: "📖" },
    { value: "60+", label: "Secciones", icon: "📑" },
    { value: "1000+", label: "Páginas", icon: "📄" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
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

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28 lg:py-32">
          <div className="text-center fade-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 animate-pulse">
              <span className="text-yellow-400 text-sm">📚 Obra completa</span>
              <span className="text-white/40">•</span>
              <span className="text-blue-200 text-sm">3 volúmenes</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              La Arquitectura del Trabajo
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl mb-6 text-blue-100 max-w-3xl mx-auto">
              Psicología, Subjetividad y Dinámicas Organizacionales
            </p>

            <p className="text-base sm:text-lg mb-8 text-blue-200 max-w-2xl mx-auto">
              Una obra completa de <strong className="text-white font-semibold">Claudia Nagüel</strong> sobre psicología del trabajo,
              salud ocupacional y gestión organizacional.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/volumen/1" className="group bg-white text-blue-700 px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg inline-flex items-center justify-center gap-2">
                <span>📖</span>
                <span>Comenzar a leer</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/pricing" className="group border-2 border-white text-white px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-700 transition-all transform hover:scale-105 inline-flex items-center justify-center gap-2">
                <span>⭐</span>
                <span>Ver planes</span>
              </Link>
            </div>

            {/* Buscador */}
            <div className="max-w-xl mx-auto">
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
                  className="w-full pl-12 pr-28 py-4 rounded-2xl text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-xl"
                  aria-label="Buscar en el libro"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-5 py-2 rounded-xl font-medium hover:shadow-lg transition-all"
                  aria-label="Ejecutar búsqueda"
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Resultados de búsqueda */}
            {showSearch && (
              <div className="max-w-xl mx-auto mt-4 bg-white rounded-2xl shadow-2xl text-left max-h-96 overflow-y-auto border border-gray-200">
                <div className="px-4 py-3 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
                  <span className="text-sm font-semibold text-gray-700">
                    🔍 "{searchTerm}" - {searchResults.length} resultado(s)
                  </span>
                  <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600">✕</button>
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
                        to={`/leer/${result.id}`}
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
          </div>
        </div>

        {/* Ola decorativa */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 text-gray-50 dark:text-gray-900" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section - Credibilidad */}
      <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="text-3xl sm:text-4xl mb-2">{stat.icon}</div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recorrido por el libro */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 fade-up">
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider">Guía de lectura</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-2 mb-4">Recorrido por el libro</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full"></div>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto">
              Descubre qué contiene cada volumen antes de empezar a leer
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
            {/* Volumen 1 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-up">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">📚</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Volumen I</span>
                </div>
                <h3 className="text-lg font-bold mt-1 text-white">Fundamentos Teóricos</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Establece la base científica de la disciplina. Explora cómo el ser humano construye su realidad social y analiza la evolución histórica del trabajo.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-xs bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">🧠 Subjetividad</span>
                  <span className="text-xs bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">📜 Historia</span>
                  <span className="text-xs bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">🔄 Dialéctica</span>
                </div>
                <Link to="/volumen/1" className="mt-3 inline-flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group">
                  Explorar volumen
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Volumen 2 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-up" style={{ animationDelay: "0.1s" }}>
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">👥</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Volumen II</span>
                </div>
                <h3 className="text-lg font-bold mt-1 text-white">Dinámicas de Grupo</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Analiza la trama colectiva (equipos, clima grupal, seguridad psicológica) y el rol del liderazgo.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-xs bg-emerald-100 dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">🏆 Liderazgo</span>
                  <span className="text-xs bg-emerald-100 dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">📊 Psicometría</span>
                  <span className="text-xs bg-emerald-100 dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">🎯 Competencias</span>
                </div>
                <Link to="/volumen/2" className="mt-3 inline-flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium group">
                  Explorar volumen
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Volumen 3 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">🏥</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Volumen III</span>
                </div>
                <h3 className="text-lg font-bold mt-1 text-white">Salud Ocupacional</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Desarrolla la Salud Mental Positiva Ocupacional, la gestión de riesgos y estrategias de intervención.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-xs bg-purple-100 dark:bg-gray-800 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">🧘 Salud mental</span>
                  <span className="text-xs bg-purple-100 dark:bg-gray-800 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">⚠️ Riesgos</span>
                  <span className="text-xs bg-purple-100 dark:bg-gray-800 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">🔄 Cambio</span>
                </div>
                <Link to="/volumen/3" className="mt-3 inline-flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium group">
                  Explorar volumen
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 fade-up">
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider">Características</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-2 mb-4">¿Qué encontrarás?</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full"></div>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto">
              Contenido interactivo y herramientas para profesionales y estudiantes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 fade-up">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📖</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Contenido completo</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Los 3 volúmenes completos con acceso a todo el material</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 fade-up cursor-pointer" style={{ animationDelay: "0.1s" }}
              onClick={() => document.querySelector('input[placeholder="Buscar en el libro..."]')?.focus()}>
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Búsqueda inteligente</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Busca cualquier palabra o concepto en todo el libro</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⭐</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Contenido premium</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Accede a capítulos exclusivos y material complementario</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center fade-up">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xl">📧</span>
            <span className="text-sm">Mantente informado</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Newsletter</h2>
          <p className="text-gray-300 mb-8">
            Recibe los resúmenes y novedades directamente en tu correo
          </p>
          <SubscribeForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center space-x-6 mb-6">
            <span className="text-2xl">📚</span>
            <span className="text-2xl">👥</span>
            <span className="text-2xl">🏥</span>
          </div>
          <p>© 2026 Claudia Nagüel - Buenos Aires, Argentina</p>
          <p className="text-sm mt-2 text-gray-500">La Arquitectura del Trabajo: Psicología, Subjetividad y Dinámicas Organizacionales</p>
        </div>
      </footer>

      <ThemeSelector />
    </div>
  )
}

// Página de volumen - VERSIÓN REDISEÑADA
function VolumenPage() {
  const { id } = useParams()
  const [volumen, setVolumen] = useState(null)
  const [capitulos, setCapitulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedChapter, setExpandedChapter] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [id])

  const cargarDatos = async () => {
    setLoading(true)
    try {
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
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleChapter = (chapterId) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Cargando volumen...</p>
        </div>
      </div>
    )
  }

  if (!volumen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-xl mb-4">Volumen no encontrado</p>
          <Link to="/" className="text-blue-600 hover:underline">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  // Colores según el volumen
  const colors = {
    1: { bg: "from-blue-500 to-blue-600", light: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600", border: "border-blue-200", icon: "📚" },
    2: { bg: "from-emerald-500 to-emerald-600", light: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600", border: "border-emerald-200", icon: "👥" },
    3: { bg: "from-purple-500 to-purple-600", light: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600", border: "border-purple-200", icon: "🏥" }
  }

  const color = colors[parseInt(id)] || colors[1]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header con gradiente */}
      <div className={`bg-gradient-to-r ${color.bg} text-white`}>
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl sm:text-6xl">{color.icon}</div>
            <div>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Volumen {volumen.number}</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">{volumen.title}</h1>
            </div>
          </div>
          <p className="text-white/80 text-lg max-w-2xl mt-2">{volumen.description}</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Contador de capítulos */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Contenido</span>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Capítulos</h2>
          </div>
          <div className={`px-3 py-1 ${color.light} rounded-full text-sm ${color.text}`}>
            {capitulos.length} capítulos
          </div>
        </div>

        {/* Lista de capítulos estilo acordeón */}
        <div className="space-y-4">
          {capitulos.map((capitulo, idx) => (
            <div key={capitulo.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md">
              <button
                onClick={() => toggleChapter(capitulo.id)}
                className="w-full px-5 py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-750 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full ${color.light} flex items-center justify-center text-sm font-medium ${color.text}`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      Capítulo {capitulo.number}: {capitulo.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {capitulo.secciones?.length || 0} secciones
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedChapter === capitulo.id ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedChapter === capitulo.id && (
                <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  {capitulo.secciones?.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {capitulo.secciones.map((seccion, secIdx) => (
                        <Link
                          key={seccion.id}
                          to={`/leer/${seccion.id}`}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition group"
                        >
                          <span className="w-6 text-xs text-gray-400">{String(secIdx + 1).padStart(2, '0')}</span>
                          <span className="flex-1 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                            {seccion.title}
                          </span>
                          {seccion.tier === 'premium' && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                              ⭐ Premium
                            </span>
                          )}
                          <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-6 text-center text-gray-400 text-sm">
                      Próximamente más contenido
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ThemeSelector />
    </div>
  )
}

// Página de lectura - VERSIÓN MEJORADA
function LecturaPage() {
  const { slug } = useParams()
  const [seccion, setSeccion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fontSize, setFontSize] = useState('medium')
  const [showOptions, setShowOptions] = useState(false)

  useEffect(() => {
    cargarSeccion()
    window.scrollTo(0, 0)
  }, [slug])

  const cargarSeccion = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('sections')
      .select('*')
      .eq('slug', slug)
      .single()
    setSeccion(data)
    setLoading(false)
  }

  const fontSizes = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl'
  }

  const lineHeights = {
    small: 'leading-relaxed',
    medium: 'leading-relaxed',
    large: 'leading-loose'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Cargando contenido...</p>
        </div>
      </div>
    )
  }

  if (!seccion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-xl mb-4">Contenido no encontrado</p>
          <Link to="/" className="text-blue-600 hover:underline">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ReadingProgress />


      {/* Header simplificado */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/volumen/1" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm hidden sm:inline">Volver al volumen</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Selector de fuente */}
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Opciones de lectura"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>

              {showOptions && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-30">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => { setFontSize('small'); setShowOptions(false) }}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition ${fontSize === 'small' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      🔤 Pequeño
                    </button>
                    <button
                      onClick={() => { setFontSize('medium'); setShowOptions(false) }}
                      className={`w-full text-left px-3 py-1.5 text-base rounded-md transition ${fontSize === 'medium' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      🔤 Mediano
                    </button>
                    <button
                      onClick={() => { setFontSize('large'); setShowOptions(false) }}
                      className={`w-full text-left px-3 py-1.5 text-lg rounded-md transition ${fontSize === 'large' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      🔤 Grande
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
        <article className={`${fontSizes[fontSize]} ${lineHeights[fontSize]} prose dark:prose-invert max-w-none`}>
          {/* Título con decoración */}
          <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-3">
              <span className="bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full text-xs">
                {seccion.tier === 'free' ? '📖 Gratis' : '⭐ Premium'}
              </span>
              <span>•</span>
              <span>Lectura</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              {seccion.title}
            </h1>
          </div>

          {/* Contenido */}
          <div className="text-gray-700 dark:text-gray-300">
            <div dangerouslySetInnerHTML={{ __html: seccion.content || '<p class="text-center py-12 text-gray-400">Contenido próximamente...</p>' }} />
          </div>
        </article>
      </div>

      <SuggestionForm sectionTitle={seccion.title} sectionSlug={seccion.slug} />


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
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/volumen/:id" element={<VolumenPage />} />
        <Route path="/lectura/:slug" element={<LecturaPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/leer/:sectionId" element={<ReadingView />} />
        <Route path="/capitulo/:chapterId" element={<ChapterView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App