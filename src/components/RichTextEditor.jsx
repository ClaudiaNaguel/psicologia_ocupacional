import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const RichTextEditor = ({ value, onChange, placeholder = 'Escribe aquí...' }) => {
  const [text, setText] = useState(value || '');
  const [mode, setMode] = useState('edit'); // 'edit' o 'preview'

  useEffect(() => {
    setText(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setText(newValue);
    onChange(newValue);
  };

  // Botones para dar formato fácilmente
  const insertFormat = (before, after = '') => {
    const textarea = document.getElementById('markdown-editor');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    
    let newText;
    let cursorPos;
    
    if (selectedText) {
      newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
      cursorPos = start + before.length + selectedText.length + after.length;
    } else {
      newText = text.substring(0, start) + before + 'texto' + after + text.substring(end);
      cursorPos = start + before.length + 4;
    }
    
    setText(newText);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 10);
  };

  const buttons = [
    { label: 'Negrita', icon: 'B', action: () => insertFormat('**', '**') },
    { label: 'Cursiva', icon: 'I', action: () => insertFormat('*', '*') },
    { label: 'Título', icon: 'H1', action: () => insertFormat('# ', '') },
    { label: 'Subtítulo', icon: 'H2', action: () => insertFormat('## ', '') },
    { label: 'Link', icon: '🔗', action: () => insertFormat('[', '](url)') },
    { label: 'Lista', icon: '•', action: () => insertFormat('- ', '') },
    { label: 'Cita', icon: '“', action: () => insertFormat('> ', '') },
    { label: 'Código', icon: '</>', action: () => insertFormat('```\n', '\n```') },
  ];

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      {/* Barra de herramientas */}
      <div className="bg-gray-100 dark:bg-gray-700 p-2 flex gap-1 flex-wrap border-b">
        <button
          onClick={() => setMode('edit')}
          className={`px-3 py-1 rounded text-sm ${mode === 'edit' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => setMode('preview')}
          className={`px-3 py-1 rounded text-sm ${mode === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
        >
          👁️ Vista previa
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={btn.action}
            className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
            title={btn.label}
          >
            {btn.icon}
          </button>
        ))}
      </div>
      
      {/* Área de edición o vista previa */}
      {mode === 'edit' ? (
        <textarea
          id="markdown-editor"
          value={text}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full p-4 font-mono text-sm focus:outline-none resize-y bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          rows={20}
        />
      ) : (
        <div className="p-4 prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 min-h-[500px] overflow-y-auto">
          <ReactMarkdown>{text || '*Sin contenido*'}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;