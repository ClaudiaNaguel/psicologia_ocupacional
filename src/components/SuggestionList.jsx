import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SuggestionList() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [stats, setStats] = useState({ pending: 0, reviewed: 0, total: 0 })

  useEffect(() => {
    cargarSugerencias()
  }, [filter])

  const cargarSugerencias = async () => {
    setLoading(true)
    
    // Cargar sugerencias según filtro
    const { data } = await supabase
      .from('suggestions')
      .select('*')
      .eq('status', filter)
      .order('created_at', { ascending: false })
    
    setSuggestions(data || [])
    
    // Cargar estadísticas
    const { data: statsData } = await supabase
      .from('suggestions')
      .select('status')
    
    const pending = statsData?.filter(s => s.status === 'pending').length || 0
    const reviewed = statsData?.filter(s => s.status === 'reviewed').length || 0
    
    setStats({ pending, reviewed, total: statsData?.length || 0 })
    setLoading(false)
  }

  const updateStatus = async (id, newStatus) => {
    await supabase
      .from('suggestions')
      .update({ status: newStatus })
      .eq('id', id)
    
    cargarSugerencias()
  }

  const deleteSuggestion = async (id) => {
    if (confirm('¿Eliminar esta sugerencia?')) {
      await supabase.from('suggestions').delete().eq('id', id)
      cargarSugerencias()
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando sugerencias...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-gray-500">Pendientes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.reviewed}</div>
          <div className="text-xs text-gray-500">Revisadas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 p-4 border-b">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-1 rounded-full text-sm ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
        >
          📋 Pendientes
        </button>
        <button
          onClick={() => setFilter('reviewed')}
          className={`px-4 py-1 rounded-full text-sm ${filter === 'reviewed' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        >
          ✅ Revisadas
        </button>
      </div>

      {/* Lista de sugerencias */}
      <div className="divide-y divide-gray-200">
        {suggestions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay sugerencias {filter === 'pending' ? 'pendientes' : 'revisadas'}
          </div>
        ) : (
          suggestions.map(sug => (
            <div key={sug.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {sug.name || 'Anónimo'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(sug.created_at).toLocaleString('es-AR')}
                    </span>
                    {sug.email && (
                      <a href={`mailto:${sug.email}`} className="text-xs text-blue-500 hover:underline">
                        📧 {sug.email}
                      </a>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{sug.suggestion}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>📄 Sección: {sug.section_slug || 'General'}</span>
                    {sug.page_url && <span>🔗 <a href={sug.page_url} target="_blank" className="text-blue-500">Ver página</a></span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {sug.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(sug.id, 'reviewed')}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                    >
                      ✅ Marcar revisada
                    </button>
                  )}
                  <button
                    onClick={() => deleteSuggestion(sug.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}