import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container-custom py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">La Arquitectura del Trabajo</h3>
            <p className="text-sm">Psicología, Subjetividad y Dinámicas Organizacionales</p>
            <p className="text-sm mt-2">Claudia Nagüel</p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Contenido</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/articles" className="hover:text-white">Artículos</Link></li>
              <li><Link to="/pricing" className="hover:text-white">Planes de Suscripción</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Términos de Uso</a></li>
              <li><a href="#" className="hover:text-white">Política de Privacidad</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <p className="text-sm">Buenos Aires, Argentina</p>
            <p className="text-sm mt-2">Mayo de 2026</p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Claudia Nagüel. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}