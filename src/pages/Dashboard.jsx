import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      checkAdmin()
    } else {
      setLoading(false)
    }
  }, [user])

  const checkAdmin = async () => {
    try {
      console.log('Verificando admin para:', user.id)
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
      console.log('Resultado:', data)
      setIsAdmin(!!data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Debes iniciar sesión</p>
          <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg">Iniciar Sesión</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Mi Cuenta</h1>
        <p className="text-gray-600 mb-8">Bienvenido, {user.email}</p>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Información de la cuenta</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Miembro desde:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
        
        {isAdmin && (
          <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
            <h2 className="text-xl font-semibold mb-4 text-yellow-800">🔧 Panel de Administración</h2>
            <p className="text-gray-600 mb-4">Tienes acceso al panel de administración para editar el contenido del libro.</p>
            <Link to="/admin" className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 inline-block">
              Ir al Admin
            </Link>
          </div>
        )}
        
        {!isAdmin && (
          <div className="bg-gray-50 rounded-lg shadow p-6">
            <p className="text-gray-500">Eres un usuario regular. No tienes permisos de administrador.</p>
          </div>
        )}
      </div>
    </div>
  )
}