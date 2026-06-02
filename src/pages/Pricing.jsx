import PricingPlans from '../components/PricingPlans'
import DarkModeToggle from '../components/DarkModeToggle'
import ThemeSelector from '../components/ThemeSelector'

export default function Pricing() {
  return (
    <div className="py-12">
      <div className="container-custom">
        <PricingPlans />
        <DarkModeToggle />
        <ThemeSelector />
      </div>
    </div>
  )
}