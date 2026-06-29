import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Pricing from './pages/Pricing'
import ThemeSelector from './components/ThemeSelector'
import ScrollToTop from './components/ScrollToTop'
import ReadingView from './components/ReadingView'
import ChapterView from './components/ChapterView'





function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center px-4">
        <div className="text-8xl mb-4">📖</div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Página no encontrada</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">La página que buscas no existe o ha sido movida.</p>
        <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

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
                          <span className="flex-1 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">                            {seccion.title}
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
        <Route path="/leer/:sectionId" element={<ReadingView />} />
        <Route path="/capitulo/:chapterId" element={<ChapterView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App