// src/components/SafeHTML.jsx - Sin dependencias externas
const SafeHTML = ({ html, className }) => {
  // Función de sanitización básica
  const sanitizeHtml = (content) => {
    if (!content) return '';
    
    let cleaned = content;
    
    // Eliminar etiquetas script
    cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Eliminar atributos on* (onclick, onload, onerror, etc.)
    cleaned = cleaned.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Eliminar javascript: en href
    cleaned = cleaned.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
    
    // Eliminar iframes
    cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    
    // Eliminar etiquetas object y embed
    cleaned = cleaned.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
    cleaned = cleaned.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
    
    // Eliminar formularios
    cleaned = cleaned.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
    
    return cleaned;
  };
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
};

export default SafeHTML;