import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import SubscribeForm from '../components/SubscribeForm'
import ThemeSelector from '../components/ThemeSelector'

export default function Home() {
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

  const stats = [
    { value: "3", label: "Volúmenes", icon: "📚" },
    { value: "6", label: "Capítulos", icon: "📖" },
    { value: "60+", label: "Secciones", icon: "📑" },
    { value: "1000+", label: "Páginas", icon: "📄" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-white-50 dark:text-white-50">
              La Arquitectura del Trabajo
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl mb-6 text-blue-100 max-w-3xl mx-auto">
              Psicología, Subjetividad y Dinámicas Organizacionales
            </p>

            <p className="text-base sm:text-lg mb-8 text-blue-200 max-w-2xl mx-auto">
              Una obra completa de <strong className="text-white font-semibold">Claudia Nagüel</strong> sobre psicología del trabajo,
              salud ocupacional y gestión organizacional.
            </p>

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

        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 text-gray-50 dark:text-gray-900" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

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
