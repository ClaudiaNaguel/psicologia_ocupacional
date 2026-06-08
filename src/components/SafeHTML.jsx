import DOMPurify from 'dompurify';

const SafeHTML = ({ html, className }) => {
  // Limpia el HTML para prevenir XSS
  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'strong', 'em', 'u', 'br', 'hr',
      'ul', 'ol', 'li', 'blockquote', 'pre',
      'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'a', 'img'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style']
  });
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};

export default SafeHTML;