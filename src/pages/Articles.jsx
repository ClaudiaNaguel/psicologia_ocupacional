import ArticleList from '../components/ArticleList'

export default function Articles() {
  return (
    <div className="py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Todos los Artículos</h1>
          <p className="text-gray-600 mt-2">Explora el contenido completo de "La Arquitectura del Trabajo"</p>
        </div>
        <ArticleList />
      </div>
    </div>
  )
}