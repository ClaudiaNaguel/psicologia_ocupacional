import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      // Obtener suscripción
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      // Obtener compras de artículos
      const { data: purchasesData } = await supabase
        .from('article_purchases')
        .select('*, article:articles(*)')
        .eq('user_id', user.id)

      setSubscription(subData)
      setPurchases(purchasesData || [])
      setLoading(false)
    }

    fetchData()
  }, [user])

  return { subscription, purchases, loading }
}