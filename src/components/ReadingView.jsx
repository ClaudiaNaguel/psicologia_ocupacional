import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ChevronLeft, ChevronRight, BookOpen, Lock } from 'lucide-react';
import SafeHTML from './SafeHTML';
import SuggestionForm from './SuggestionForm';


const ReadingView = () => {
  const { sectionId } = useParams();
  const [section, setSection] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [volume, setVolume] = useState(null);
  const [allSections, setAllSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);


  useEffect(() => {
    loadSection();
  }, [sectionId]);

  // Función para detectar el nivel jerárquico basado en el título (ej: "1.1" = nivel 2, "1.1.2" = nivel 3)
  const getLevelFromTitle = (title) => {
    const match = title.match(/^(\d+(?:\.\d+)*)/);
    if (match) {
      return match[1].split('.').length;
    }
    return 1;
  };

  // Función para extraer el número de sección del título
  const getSectionNumberFromTitle = (title) => {
    const match = title.match(/^(\d+(?:\.\d+)*)/);
    return match ? match[1] : '';
  };

  // Función para limpiar el título (remover el número)
  const getCleanTitle = (title) => {
    return title.replace(/^[\d\.]+\s*/, '');
  };

  const loadSection = async () => {
    setLoading(true);

    try {
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .select(`
          *,
          chapter:chapters(*)
        `)
        .eq('id', sectionId)
        .single();

      if (sectionError) throw sectionError;

      if (sectionData) {
        setSection(sectionData);
        setChapter(sectionData.chapter);

        if (sectionData.chapter?.volume_id) {
          const { data: volumeData } = await supabase
            .from('volumes')
            .select('*')
            .eq('id', sectionData.chapter.volume_id)
            .single();
          setVolume(volumeData);
        }

        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('*')
          .eq('chapter_id', sectionData.chapter_id)
          .order('order_index', { ascending: true });

        if (!sectionsError && sectionsData) {
          setAllSections(sectionsData);
          const currentIndex = sectionsData.findIndex(s => s.id === parseInt(sectionId));
          setProgress(((currentIndex + 1) / sectionsData.length) * 100);
        }
      }
    } catch (error) {
      console.error('Error loading section:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextSection = () => {
    const currentIndex = allSections.findIndex(s => s.id === parseInt(sectionId));
    if (currentIndex < allSections.length - 1) {
      return allSections[currentIndex + 1];
    }
    return null;
  };

  const getPrevSection = () => {
    const currentIndex = allSections.findIndex(s => s.id === parseInt(sectionId));
    if (currentIndex > 0) {
      return allSections[currentIndex - 1];
    }
    return null;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-gray-500">Cargando contenido...</div>
    </div>
  );

  if (!section) return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-700">Sección no encontrada</h2>
      <Link to="/" className="text-blue-600 mt-4 inline-block">Volver al inicio</Link>
    </div>
  );

  const nextSection = getNextSection();
  const prevSection = getPrevSection();
  const currentIndex = allSections.findIndex(s => s.id === parseInt(sectionId));
  const sectionLevel = getLevelFromTitle(section.title);
  const sectionNumber = getSectionNumberFromTitle(section.title);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar izquierdo */}
      <aside
        className={`${sidebarOpen ? 'w-80' : 'w-0'
          } transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 relative overflow-hidden`}
      >
        {sidebarOpen && (
          <div className="p-4 h-full overflow-y-auto">
            {/* Botón para cerrar DENTRO del sidebar */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-2 top-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Cerrar índice"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {chapter?.title}
              </h3>
              {volume && (
                <p className="text-sm text-gray-500 mt-1">
                  Volumen {volume.volume_number}: {volume.title}
                </p>
              )}
            </div>

            <nav className="space-y-1">
              {allSections.map((s) => {
                const level = getLevelFromTitle(s.title);
                const indent = (level - 1) * 16;
                const isActive = s.id === parseInt(sectionId);

                return (
                  <Link
                    key={s.id}
                    to={`/leer/${s.id}`}
                    className={`block p-2 rounded-lg text-sm transition-colors ${isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    style={{ marginLeft: indent }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-xs text-gray-400 shrink-0">
                        {getSectionNumberFromTitle(s.title)}
                      </span>
                      <span className="flex-1">
                        {getCleanTitle(s.title)}
                        {s.tier === 'premium' && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                            Premium
                          </span>
                        )}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </aside>

      {/* Botón flotante para ABRIR el menú (solo visible cuando sidebar está CERRADO) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-20 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition"
          aria-label="Abrir índice"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Contenido principal */}
      <main className="flex-1 min-w-0">
        {/* Barra de progreso - Ahora dentro del flujo normal */}
        <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pt-1">
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Navegación superior */}


          {/* Jerarquía del contenido - MEJORADA */}
          <div className="mb-8">
            {/* Migas de pan */}
            <div className="text-sm text-gray-500 mb-4">
              <Link to="/" className="hover:text-blue-600">Inicio</Link>
              {' / '}
              <Link to={`/volumen/${volume?.id}`} className="hover:text-blue-600">
                Volumen {volume?.id}
              </Link>
              {' / '}
              <span className="text-gray-700 dark:text-gray-300">
                {chapter?.title}
              </span>
            </div>

            {/* Título del capítulo */}
            <div className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2 uppercase tracking-wide">
                Capítulo {chapter?.id}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {chapter?.title}
              </h1>
            </div>

            {/* Título de la sección con jerarquía visual */}
            <div className="mt-6">
              {sectionLevel === 1 && (
                <div className="mb-2">
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                    Sección principal
                  </span>
                </div>
              )}
              {sectionLevel === 2 && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-2">
                  <span className="font-mono">{sectionNumber}</span>
                  <span>• Subsección</span>
                </div>
              )}
              {sectionLevel === 3 && (
                <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 mb-2">
                  <span className="font-mono">{sectionNumber}</span>
                  <span>• Sub-subsección</span>
                </div>
              )}

              <h2 className={`font-semibold text-gray-800 dark:text-gray-200 ${sectionLevel === 1 ? 'text-2xl md:text-3xl' :
                sectionLevel === 2 ? 'text-xl md:text-2xl' :
                  'text-lg md:text-xl'
                }`}>
                {getCleanTitle(section.title)}
              </h2>

              {section.tier === 'premium' && (
                <div className="mt-3 inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  <Lock size={12} />
                  Contenido Premium
                </div>
              )}
            </div>
          </div>

          {/* Contenido HTML */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {section.content ? (
              <SafeHTML
                html={section.content}
                className="space-y-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:border-l-4 [&_h2]:border-blue-500 [&_h2]:pl-3 [&_h3]:text-xl [&_h3]:font-medium [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed"
              />
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Contenido en desarrollo. Próximamente disponible.
                </p>
              </div>
            )}
          </div>

          {/* 🔥 AGREGAR FORMULARIO DE SUGERENCIAS AQUÍ 🔥 */}
          <SuggestionForm
            sectionId={section.id}
            sectionTitle={section.title}
          />

          {/* Navegación inferior - Versión con texto multilínea */}
          <div className="flex justify-between mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 gap-4">
            {prevSection ? (
              <Link
                to={`/leer/${prevSection.id}`}
                className="group flex-1 flex items-start gap-3 text-blue-600 hover:text-blue-700"
              >
                <ChevronLeft size={20} className="mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Anterior</div>
                  <div className="font-medium group-hover:underline break-words leading-tight">
                    {getCleanTitle(prevSection.title)}
                  </div>
                </div>
              </Link>
            ) : <div className="flex-1" />}

            {nextSection ? (
              <Link
                to={`/leer/${nextSection.id}`}
                className="group flex-1 flex items-start justify-end gap-3 text-blue-600 hover:text-blue-700 text-right"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Siguiente</div>
                  <div className="font-medium group-hover:underline break-words leading-tight">
                    {getCleanTitle(nextSection.title)}
                  </div>
                </div>
                <ChevronRight size={20} className="mt-1 shrink-0" />
              </Link>
            ) : <div className="flex-1" />}
          </div>
        </div>
      </main>



      {/* Sidebar derecho */}
      <aside className="w-72 hidden xl:block p-6 border-l border-gray-200 dark:border-gray-700">
        <div className="sticky top-20">
          <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Tu progreso</h4>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>{chapter?.title}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {currentIndex + 1} de {allSections.length} secciones
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estructura del capítulo
            </h5>
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Secciones principales (nivel 1):</span>
                <span>{allSections.filter(s => getLevelFromTitle(s.title) === 1).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Subsecciones (nivel 2):</span>
                <span>{allSections.filter(s => getLevelFromTitle(s.title) === 2).length}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ReadingView;