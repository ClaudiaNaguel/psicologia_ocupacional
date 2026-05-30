import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()
  const { subscription, purchases, loading } = useSubscription()

  if (loading) {
    return <div className="container-custom py-12 text-center">Cargando...</div>
  }

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-8">Mi Cuenta</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Información del Usuario */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Información de la Cuenta</h2>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Miembro desde:</strong> {new Date(user?.created_at).toLocaleDateString('es-AR')}</p>
          </div>
          
          {/* Artículos Comprados */}
          {purchases && purchases.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Artículos Comprados</h2>
              <ul className="space-y-2">
                {purchases.map(purchase => (
                  <li key={purchase.id}>
                    <Link to={`/articles/${purchase.article.slug}`} className="text-primary-600 hover:underline">
                      {purchase.article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Estado de Suscripción */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Plan Actual</h2>
            {subscription?.status === 'active' ? (
              <>
                <p className="text-lg font-semibold text-green-600">Mensual Activo</p>
                <p className="text-sm text-gray-600 mt-2">
                  Válido hasta: {new Date(subscription.current_period_end).toLocaleDateString('es-AR')}
                </p>
                <button className="mt-4 text-red-600 text-sm hover:underline">
                  Cancelar suscripción
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600">Plan Gratuito</p>
                <Link to="/pricing" className="btn-primary inline-block mt-4 text-center w-full">
                  Suscribirse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}