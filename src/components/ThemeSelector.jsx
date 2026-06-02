import { useState, useEffect } from 'react'

export default function ThemeSelector() {
  const [theme, setTheme] = useState('system')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      applyTheme('system')
    }
  }, [])

  const applyTheme = (selectedTheme) => {
    const isDark = selectedTheme === 'dark' || 
      (selectedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 999,
      display: 'flex',
      gap: '8px',
      backgroundColor: 'var(--card-bg, #ffffff)',
      padding: '8px 12px',
      borderRadius: '40px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border: '1px solid var(--border-color, #e5e7eb)'
    }}>
      <button
        onClick={() => handleThemeChange('light')}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme === 'light' ? '#3b82f6' : 'transparent',
          color: theme === 'light' ? 'white' : 'inherit'
        }}
        title="Modo claro"
      >
        ☀️
      </button>
      <button
        onClick={() => handleThemeChange('dark')}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme === 'dark' ? '#f59e0b' : 'transparent',
          color: theme === 'dark' ? 'white' : 'inherit'
        }}
        title="Modo oscuro"
      >
        🌙
      </button>
      <button
        onClick={() => handleThemeChange('system')}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme === 'system' ? '#3b82f6' : 'transparent',
          color: theme === 'system' ? 'white' : 'inherit'
        }}
        title="Según el sistema"
      >
        💻
      </button>
    </div>
  )
}