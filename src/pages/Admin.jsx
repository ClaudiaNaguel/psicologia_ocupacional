import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import RichTextEditor from '../components/RichTextEditor';
import ThemeSelector from '../components/ThemeSelector';

function AdminPage() {
  const [sections, setSections] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    verificarUsuario();
  }, []);

  const verificarUsuario = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const usuario = session?.user ?? null;
      setUser(usuario);

      if (usuario) {
        const { data } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', usuario.id)
          .maybeSingle();
        setIsAdmin(!!data);
      }
    } catch (error) {
      console.error('Error verificando usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      cargarSecciones();
    }
  }, [isAdmin]);

  const cargarSecciones = async () => {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error cargando secciones:', error);
      setSaveMessage({ type: 'error', text: 'Error al cargar secciones' });
    }
  };

  const startEdit = (section) => {
    setEditing(section);
    setEditTitle(section.title);
    setEditContent(section.content || '');
    setSaveMessage(null);
  };

  const saveSection = async () => {
    if (!editing) return;
    
    setSaving(true);
    setSaveMessage(null);
    
    try {
      console.log('Guardando sección:', editing.id);
      console.log('Título:', editTitle);
      console.log('Contenido length:', editContent?.length);
      
      const { error } = await supabase
        .from('sections')
        .update({ 
          title: editTitle, 
          content: editContent 
        })
        .eq('id', editing.id);

      if (error) throw error;
      
      // Recargar la lista de secciones
      await cargarSecciones();
      
      setSaveMessage({ type: 'success', text: '✅ Guardado correctamente' });
      
      // Opcional: salir del modo edición después de 1 segundo
      setTimeout(() => {
        setEditing(null);
        setSaveMessage(null);
      }, 1000);
      
    } catch (error) {
      console.error('Error guardando:', error);
      setSaveMessage({ type: 'error', text: '❌ Error: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">🔐 Acceso restringido</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Debes iniciar sesión para acceder al panel de administración.</p>
          <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block">
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">⛔ Acceso denegado</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">No tienes permisos de administrador.</p>
          <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block">
            Ir a mi cuenta
          </Link>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => setEditing(null)} 
            className="text-blue-600 dark:text-blue-400 mb-4 hover:underline flex items-center gap-1"
          >
            ← Volver al listado
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4 dark:text-white">Editando: {editing.title}</h1>

            {saveMessage && (
              <div className={`mb-4 p-3 rounded-lg ${
                saveMessage.type === 'success' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {saveMessage.text}
              </div>
            )}

            <div className="mb-4">
              <label className="block font-semibold mb-2 dark:text-gray-300">Título</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2 dark:text-gray-300">Contenido</label>
              <RichTextEditor
                value={editContent}
                onChange={setEditContent}
                placeholder="Escribe o pega el contenido aquí..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Puedes usar formato Markdown: **negrita**, *cursiva*, # títulos, - listas, > citas, etc.
              </p>
            </div>

            <button
              onClick={saveSection}
              disabled={saving}
              className={`bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? '💾 Guardando...' : '💾 Guardar cambios'}
            </button>
          </div>
        </div>
        <ThemeSelector />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">← Volver al Dashboard</Link>
      <h1 className="text-3xl font-bold mt-4 mb-6 dark:text-white">Panel de Administración</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">Bienvenido, {user.email}</p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left dark:text-gray-300">Sección</th>
                <th className="px-6 py-3 text-left dark:text-gray-300">Slug</th>
                <th className="px-6 py-3 text-left dark:text-gray-300">Orden</th>
                <th className="px-6 py-3 text-left dark:text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <tr key={section.id} className="border-t dark:border-gray-700">
                  <td className="px-6 py-4 dark:text-gray-300">{section.title}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">{section.slug}</td>
                  <td className="px-6 py-4 dark:text-gray-300">{section.order_index}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => startEdit(section)}
                      className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                    >
                      ✏️ Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </tr>
        </div>
      </div>
      <ThemeSelector />
    </div>
  );
}

export default AdminPage;