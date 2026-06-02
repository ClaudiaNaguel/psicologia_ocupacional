import LoginForm from '../components/LoginForm'
import DarkModeToggle from '../components/DarkModeToggle'
import ThemeSelector from '../components/ThemeSelector'


export default function Login() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <LoginForm />
      <DarkModeToggle />
      <ThemeSelector />
    </div>
  )
}