import DOMPurify from 'dompurify'

const SafeHTML = ({ html, className }) => {
  const sanitized = DOMPurify.sanitize(html || '', {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'a', 'blockquote', 'pre', 'code', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'hr', 'sub', 'sup'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'id', 'style', 'width', 'height', 'align', 'border', 'cellpadding', 'cellspacing'],
    ALLOW_DATA_ATTR: false,
  })

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}

export default SafeHTML