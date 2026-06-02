import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import DarkModeToggle from '../components/DarkModeToggle'
import ThemeSelector from '../components/ThemeSelector'



export default function Admin() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [sections, setSections] = useState([])
  const [editingSection, setEditingSection] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editTier, setEditTier] = useState('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdmin()
  }, [user])

  const checkAdmin = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    
    const { data } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    setIsAdmin(!!data)
    if (data) {
      loadSections()
    }
    setLoading(false)
  }

  const loadSections = async () => {
    const { data } = await supabase
      .from('sections')
      .select('*')
      .order('order_index')
    setSections(data || [])
  }

  const startEdit = (section) => {
    setEditingSection(section)
    setEditTitle(section.title)
    setEditContent(section.content)
    setEditTier(section.tier)
  }

  const saveSection = async () => {
    const { error } = await supabase
      .from('sections')
      .update({
        title: editTitle,
        content: editContent,
        tier: editTier
      })
      .eq('id', editingSection.id)
    
    if (!error) {
      loadSections()
      setEditingSection(null)
      alert('✅ Sección guardada correctamente')
    } else {
      alert('❌ Error al guardar: ' + error.message)
    }
  }

  if (loading) return <div className="text-center py-20">Cargando...</div>
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Debes iniciar sesión</p>
          <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg">Iniciar Sesión</Link>
        </div>
      </div>
    )
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">No tienes permisos de administrador</p>
      </div>
    )
  }

  if (editingSection) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-6">✏️ Editando: {editingSection.title}</h1>
            
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
              <label className="block font-semibold mb-2">Tipo de acceso</label>
              <select
                value={editTier}
                onChange={(e) => setEditTier(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="free">📖 Gratis</option>
                <option value="premium">⭐ Premium</option>
              </select>
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
                💡 Puedes usar HTML: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, 
                &lt;div class="concept-card"&gt;, &lt;div class="blockquote"&gt;, &lt;div class="timeline"&gt;
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={saveSection}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                💾 Guardar cambios
              </button>
              <button
                onClick={() => setEditingSection(null)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
        <DarkModeToggle />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sección</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sections.map(section => (
                <tr key={section.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium">{section.title}</div>
                    <div className="text-sm text-gray-500">{section.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${section.tier === 'free' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {section.tier === 'free' ? '📖 Gratis' : '⭐ Premium'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => startEdit(section)}
                      className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                      ✏️ Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">💡 Consejos para editar contenido:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Usa <code className="bg-gray-100 px-1">&lt;h2&gt;</code> para títulos principales</li>
            <li>• Usa <code className="bg-gray-100 px-1">&lt;h3&gt;</code> para subtítulos</li>
            <li>• Usa <code className="bg-gray-100 px-1">&lt;p&gt;</code> para párrafos</li>
            <li>• Usa <code className="bg-gray-100 px-1">&lt;ul&gt;</code> y <code className="bg-gray-100 px-1">&lt;li&gt;</code> para listas</li>
            <li>• Usa <code className="bg-gray-100 px-1">&lt;strong&gt;</code> para negritas</li>
            <li>• Usa <code className="bg-gray-100 px-1">&lt;div class="concept-card"&gt;</code> para tarjetas de concepto</li>
            <li>• Usa <code className="bg-gray-100 px-1">&lt;div class="blockquote"&gt;</code> para citas destacadas</li>
          </ul>
        </div>
      </div>
      <DarkModeToggle />
      <ThemeSelector />

    </div>
  )
}