import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { user, logout } = useAuth()

  // Verificar si el usuario es administrador
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false)
        return
      }
      const { data } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setIsAdmin(!!data)
    }
    checkAdmin()
  }, [user])

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container-custom py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600">
            Arq<span className="text-gray-800">Trabajo</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/volumen/1" className="text-gray-700 hover:text-primary-600">Volumen I</Link>
            <Link to="/volumen/2" className="text-gray-700 hover:text-primary-600">Volumen II</Link>
            <Link to="/volumen/3" className="text-gray-700 hover:text-primary-600">Volumen III</Link>
            <Link to="/pricing" className="text-gray-700 hover:text-primary-600">Planes</Link>
            
            {/* Solo mostrar Admin si el usuario es administrador */}
            {isAdmin && (
              <Link to="/admin" className="text-gray-700 hover:text-primary-600 bg-yellow-100 px-3 py-1 rounded-full">
                🔧 Admin
              </Link>
            )}
            
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600">Mi Cuenta</Link>
                <button onClick={logout} className="btn-secondary">Cerrar Sesión</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600">Iniciar Sesión</Link>
                <Link to="/register" className="btn-primary">Registrarse</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t space-y-3">
            <Link to="/volumen/1" className="block text-gray-700">Volumen I</Link>
            <Link to="/volumen/2" className="block text-gray-700">Volumen II</Link>
            <Link to="/volumen/3" className="block text-gray-700">Volumen III</Link>
            <Link to="/pricing" className="block text-gray-700">Planes</Link>
            {isAdmin && (
              <Link to="/admin" className="block text-yellow-600">🔧 Admin</Link>
            )}
            {user ? (
              <>
                <Link to="/dashboard" className="block text-gray-700">Mi Cuenta</Link>
                <button onClick={logout} className="block w-full text-left text-red-600">Cerrar Sesión</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700">Iniciar Sesión</Link>
                <Link to="/register" className="block btn-primary text-center">Registrarse</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}