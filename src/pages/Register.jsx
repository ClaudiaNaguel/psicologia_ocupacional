import RegisterForm from '../components/RegisterForm'
import DarkModeToggle from '../components/DarkModeToggle'
import ThemeSelector from '../components/ThemeSelector'

export default function Register() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <RegisterForm />
      <DarkModeToggle />
      <ThemeSelector />
    </div>
  )
}