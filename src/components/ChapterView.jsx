import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ChevronRight, Lock, BookOpen } from 'lucide-react';

const ChapterView = () => {
  const { chapterId } = useParams();
  const [chapter, setChapter] = useState(null);
  const [sections, setSections] = useState([]);
  const [volume, setVolume] = useState(null);
  const [loading, setLoading] = useState(true);

  const getLevelFromTitle = (title) => {
    const match = title.match(/^(\d+(?:\.\d+)*)/);
    if (match) {
      return match[1].split('.').length;
    }
    return 1;
  };

  const getSectionNumberFromTitle = (title) => {
    const match = title.match(/^(\d+(?:\.\d+)*)/);
    return match ? match[1] : '';
  };

  const getCleanTitle = (title) => {
    return title.replace(/^[\d\.]+\s*/, '');
  };

  useEffect(() => {
    loadChapter();
  }, [chapterId]);

  const loadChapter = async () => {
    setLoading(true);
    
    const { data: chapterData } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single();
    
    if (chapterData) {
      setChapter(chapterData);
      
      if (chapterData.volume_id) {
        const { data: volumeData } = await supabase
          .from('volumes')
          .select('*')
          .eq('id', chapterData.volume_id)
          .single();
        setVolume(volumeData);
      }
      
      const { data: sectionsData } = await supabase
        .from('sections')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('order_index', { ascending: true });
      
      setSections(sectionsData || []);
    }
    
    setLoading(false);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-gray-500">Cargando capítulo...</div>
    </div>
  );
  
  if (!chapter) return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-700">Capítulo no encontrado</h2>
      <Link to="/" className="text-blue-600 mt-4 inline-block">Volver al inicio</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navegación */}
      <div className="mb-8 text-sm text-gray-500">
        <Link to="/" className="hover:text-blue-600">Inicio</Link>
        {' / '}
        <Link to={`/volumen/${volume?.id}`} className="hover:text-blue-600">
          Volumen {volume?.id}: {volume?.title}
        </Link>
        {' / '}
        <span className="text-gray-700">{chapter.title}</span>
      </div>

      {/* Header del capítulo */}
      <div className="mb-10 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
          Capítulo {chapter.id}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {chapter.title}
        </h1>
        {chapter.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {chapter.description}
          </p>
        )}
      </div>

      {/* Índice del capítulo con jerarquía visual */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <BookOpen size={20} />
          Contenido del capítulo
        </h2>
        
        {sections.map((section) => {
          const level = getLevelFromTitle(section.title);
          const indent = (level - 1) * 20;
          const sectionNum = getSectionNumberFromTitle(section.title);
          const cleanTitle = getCleanTitle(section.title);
          
          return (
            <Link
              key={section.id}
              to={`/leer/${section.id}`}
              className="block group"
              style={{ marginLeft: indent }}
            >
              <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                level === 1 
                  ? 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
                <span className={`font-mono text-sm shrink-0 ${
                  level === 1 
                    ? 'text-blue-600 dark:text-blue-400 font-bold' 
                    : 'text-gray-400'
                }`}>
                  {sectionNum}
                </span>
                <div className="flex-1">
                  <h3 className={`${
                    level === 1 
                      ? 'text-lg font-semibold text-gray-900 dark:text-white' 
                      : level === 2
                      ? 'text-base font-medium text-gray-800 dark:text-gray-200'
                      : 'text-sm text-gray-700 dark:text-gray-300'
                  } group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
                    {cleanTitle}
                  </h3>
                </div>
                {section.tier === 'premium' && (
                  <div className="flex items-center gap-1 text-yellow-600 text-xs bg-yellow-50 px-2 py-1 rounded">
                    <Lock size={12} />
                    Premium
                  </div>
                )}
                <ChevronRight size={18} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Estadísticas del capítulo */}
      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{sections.length}</div>
              <div className="text-xs text-gray-500">Total secciones</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {sections.filter(s => s.tier !== 'premium').length}
              </div>
              <div className="text-xs text-gray-500">Gratuitas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {sections.filter(s => s.tier === 'premium').length}
              </div>
              <div className="text-xs text-gray-500">Premium</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterView;