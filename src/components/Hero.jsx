import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
      <div className="container-custom text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          La Arquitectura del Trabajo
        </h1>
        <p className="text-xl md:text-2xl mb-6 opacity-90">
          Psicología, Subjetividad y Dinámicas Organizacionales
        </p>
        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-80">
          Una obra completa sobre psicología del trabajo, salud ocupacional y gestión organizacional.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/pricing" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Comenzar a leer
          </Link>
          <Link to="/articles" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition">
            Explorar contenido gratuito
          </Link>
        </div>
      </div>
    </section>
  )
}