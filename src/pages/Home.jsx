import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import ArticleList from '../components/ArticleList'
import SubscribeForm from '../components/SubscribeForm'

export default function Home() {
  return (
    <div>
      <Hero />
      
      {/* Featured Articles Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Artículos Destacados</h2>
            <p className="text-gray-600 mt-2">Explora los contenidos más relevantes de "La Arquitectura del Trabajo"</p>
          </div>
          <ArticleList limit={3} />
          <div className="text-center mt-8">
            <Link to="/articles" className="btn-primary inline-block">Ver todos los artículos →</Link>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom max-w-3xl mx-auto">
          <SubscribeForm />
        </div>
      </section>
    </div>
  )
}