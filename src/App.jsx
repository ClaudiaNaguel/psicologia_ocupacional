import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

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
      <nav className="bg-white shadow-lg p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">ArqTrabajo</Link>
          <div className="space-x-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600">Inicio</Link>
            <Link to="/volumen/1" className="text-gray-700 hover:text-blue-600">Volumen I</Link>
            <Link to="/volumen/2" className="text-gray-700 hover:text-blue-600">Volumen II</Link>
            <Link to="/volumen/3" className="text-gray-700 hover:text-blue-600">Volumen III</Link>
            <Link to="/admin" className="text-gray-700 hover:text-blue-600 bg-yellow-100 px-3 py-1 rounded-full">🔧 Admin</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">La Arquitectura del Trabajo</h1>
        <p className="text-xl mb-8">Psicología, Subjetividad y Dinámicas Organizacionales</p>

        <div className="grid md:grid-cols-3 gap-6">
          {volumenes.map(vol => (
            <Link key={vol.id} to={`/volumen/${vol.number}`} className="bg-white p-6 rounded-lg shadow hover:shadow-lg">
              <h2 className="text-xl font-semibold mb-2">Volumen {vol.number}</h2>
              <p className="text-gray-600">{vol.title}</p>
            </Link>
          ))}
        </div>
      </div>
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

  if (!seccion) return <div className="p-8">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link to="/volumen/1" className="text-blue-600">← Volver</Link>
      <h1 className="text-3xl font-bold mt-4 mb-6">{seccion.title}</h1>
      <div className="bg-white p-8 rounded-lg shadow prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: seccion.content || '<p>Contenido próximamente...</p>' }} />
      </div>
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link to="/" className="text-blue-600">← Volver</Link>
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
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App