import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SubscribeForm from './components/SubscribeForm'

function Home() {
  const [volumenes, setVolumenes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    cargarVolumenes()
  }, [])

  const cargarVolumenes = async () => {
    const { data } = await supabase.from('volumes').select('*').order('order_index')
    setVolumenes(data || [])
  }

  // Función para quitar tildes y normalizar texto
  const normalizeText = (text) => {
    if (!text) return ''
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    setShowSearch(true)
    setSearchLoading(true)

    const searchNormalized = normalizeText(searchTerm)

    // Traer todas las secciones
    const { data } = await supabase
      .from('sections')
      .select('*')
      .limit(100)

    if (data) {
      // Filtrar por título o contenido (ignorando tildes)
      const results = data.filter(section => {
        const titleNormalized = normalizeText(section.title)
        const contentNormalized = normalizeText(section.content || '')
        return titleNormalized.includes(searchNormalized) ||
          contentNormalized.includes(searchNormalized)
      })
      setSearchResults(results)
    }
    setSearchLoading(false)
  }

  // Función para destacar la palabra buscada
  const highlightText = (text) => {
    if (!text) return ''
    try {
      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      return text.replace(regex, '<mark style="background-color:#fef3c7; font-size:0.6rem; padding:0 2px;">$1</mark>')
    } catch {
      return text
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              La Arquitectura del Trabajo
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Psicología, Subjetividad y Dinámicas Organizacionales
            </p>
            <p className="text-lg mb-12 text-blue-200 max-w-2xl mx-auto">
              Una obra completa de <strong className="text-white">Claudia Nagüel</strong> sobre psicología del trabajo,
              salud ocupacional y gestión organizacional.
            </p>

            {/* Buscador */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Buscar en el libro..."
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition"
                >
                  🔍 Buscar
                </button>
              </div>
            </div>

            {/* Resultados de búsqueda */}
            {showSearch && (
              <div className="max-w-2xl mx-auto mt-4 bg-white rounded-lg shadow-lg text-left max-h-80 overflow-y-auto">
                <div className="px-2 py-1 border-b flex justify-between items-center sticky top-0 bg-white">
                  <span className="search-result-header">
                    🔍 "{searchTerm}" - {searchResults.length} resultado(s)
                  </span>
                  <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                </div>
                {searchLoading ? (
                  <div className="p-3 text-center text-gray-400 search-empty-message">Buscando...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-center">
                    <p className="search-empty-message text-gray-500">No se encontraron resultados</p>
                    <p className="search-suggestion text-gray-400">💡 Prueba con otra palabra</p>
                  </div>
                ) : (
                  <div>
                    {searchResults.map(result => (
                      <Link
                        key={result.id}
                        to={`/lectura/${result.slug}`}
                        onClick={() => setShowSearch(false)}
                        className="block px-3 py-1.5 hover:bg-gray-50 border-b last:border-b-0 transition"
                      >
                        <p className="search-result-title font-medium text-blue-600">{result.title}</p>
                        <p className="search-result-snippet line-clamp-1"
                          dangerouslySetInnerHTML={{
                            __html: highlightText(result.content?.substring(0, 120) || '')
                          }} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/volumen/1" className="bg-white text-blue-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition transform hover:scale-105 inline-flex items-center gap-2">
                📖 Comenzar a leer
              </Link>
              <Link to="/pricing" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-700 transition transform hover:scale-105 inline-flex items-center gap-2">
                ⭐ Ver planes
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 text-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>

      {/* Sección de volúmenes */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Los Tres Volúmenes</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Una estructura completa que abarca desde los fundamentos teóricos hasta la gestión estratégica
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {volumenes.map((vol, index) => {
            const colors = [
              { bg: "from-blue-500 to-blue-600", icon: "📚", delay: "0s" },
              { bg: "from-green-500 to-green-600", icon: "👥", delay: "0.1s" },
              { bg: "from-purple-500 to-purple-600", icon: "🏥", delay: "0.2s" }
            ]
            return (
              <Link
                key={vol.id}
                to={`/volumen/${vol.number}`}
                className="group transform transition-all duration-300 hover:-translate-y-2"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 h-full">
                  <div className={`bg-gradient-to-r ${colors[index].bg} p-6 text-white`}>
                    <div className="text-5xl mb-4">{colors[index].icon}</div>
                    <h3 className="text-2xl font-bold">Volumen {vol.number}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-800 font-semibold mb-2">{vol.title}</p>
                    <p className="text-gray-500 text-sm">{vol.description}</p>
                    <div className="mt-4 flex items-center text-blue-600 group-hover:text-blue-700">
                      <span className="text-sm font-medium">Explorar</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Sección de características interactivas */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Qué encontrarás?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Contenido interactivo y herramientas para profesionales y estudiantes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Link to="/volumen/1" className="group text-center p-6 rounded-xl hover:bg-gray-50 transition-all duration-300">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">📖</div>
              <h3 className="font-semibold text-gray-800 mb-2">Contenido completo</h3>
              <p className="text-gray-500 text-sm">Los 3 volúmenes completos del libro</p>
              <span className="inline-block mt-3 text-blue-600 text-sm opacity-0 group-hover:opacity-100 transition">Explorar →</span>
            </Link>

            <div className="group text-center p-6 rounded-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer"
              onClick={() => document.querySelector('input[placeholder="Buscar en el libro..."]')?.focus()}>
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">🔍</div>
              <h3 className="font-semibold text-gray-800 mb-2">Búsqueda inteligente</h3>
              <p className="text-gray-500 text-sm">Busca cualquier palabra o concepto en el libro</p>
              <span className="inline-block mt-3 text-blue-600 text-sm opacity-0 group-hover:opacity-100 transition">Buscar ahora →</span>
            </div>

            <Link to="/pricing" className="group text-center p-6 rounded-xl hover:bg-gray-50 transition-all duration-300">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">⭐</div>
              <h3 className="font-semibold text-gray-800 mb-2">Contenido premium</h3>
              <p className="text-gray-500 text-sm">Accede a capítulos exclusivos</p>
              <span className="inline-block mt-3 text-blue-600 text-sm opacity-0 group-hover:opacity-100 transition">Ver planes →</span>
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2026 Claudia Nagüel - Buenos Aires, Argentina</p>
          <p className="text-sm mt-2">La Arquitectura del Trabajo: Psicología, Subjetividad y Dinámicas Organizacionales</p>
        </div>
      </footer>
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
    </div>
  )
}


// Página de lectura
function LecturaPage() {
  const { slug } = useParams()
  const [seccion, setSeccion] = useState(null)
  const [user, setUser] = useState(null)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    verificarAcceso()
  }, [slug])

  const verificarAcceso = async () => {
    // Obtener usuario actual
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)

    // Cargar sección
    const { data } = await supabase
      .from('sections')
      .select('*')
      .eq('slug', slug)
      .single()

    setSeccion(data)

    // Verificar acceso
    if (!data) return

    // Si es free, acceso libre
    if (data.tier === 'free') {
      setHasAccess(true)
      return
    }

    // Si es premium y hay usuario, verificar si es admin (por ahora)
    if (session?.user) {
      const { data: adminData } = await supabase
        .from('admin_list')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      setHasAccess(!!adminData)
    } else {
      setHasAccess(false)
    }
  }

  if (!seccion) return <div className="p-8 text-center">Cargando...</div>

  // Función para truncar contenido premium
  const getTruncatedContent = () => {
    if (!seccion.content) return '<p>Contenido próximamente...</p>'

    // Si tiene acceso, mostrar todo
    if (hasAccess) return seccion.content

    // Si es free, mostrar todo
    if (seccion.tier === 'free') return seccion.content

    // Si es premium y no tiene acceso, truncar (primeros 500 caracteres)
    const plainText = seccion.content.replace(/<[^>]*>/g, ' ')
    const truncated = plainText.substring(0, 500)
    const lastSpace = truncated.lastIndexOf(' ')
    const finalText = truncated.substring(0, lastSpace)

    return `
      <div class="prose max-w-none">
        <p>${finalText}...</p>
      </div>
      <div class="premium-block text-center mt-8 p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
        <div class="text-4xl mb-3">⭐</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Contenido Premium</h3>
        <p class="text-gray-600 mb-4">Este artículo es parte del contenido exclusivo para suscriptores.</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/pricing" class="bg-yellow-500 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition">
            Suscribirse por $9.99/mes
          </a>
          <a href="/login" class="border-2 border-yellow-500 text-yellow-700 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-50 transition">
            Iniciar Sesión
          </a>
        </div>
        <p class="text-xs text-gray-400 mt-4">Accede a todos los artículos premium y contenido exclusivo</p>
      </div>
    `
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link to="/volumen/1" className="text-blue-600">← Volver</Link>
      <h1 className="text-3xl font-bold mt-4 mb-6">{seccion.title}</h1>
      <div className="bg-white p-8 rounded-lg shadow prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: getTruncatedContent() }} />
      </div>

      {/* Badge premium si corresponde */}
      {seccion.tier === 'premium' && !hasAccess && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs shadow-lg">
          ⭐ Premium
        </div>
      )}
    </div>
  )
}

// Panel de Administración (solo para admins)
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