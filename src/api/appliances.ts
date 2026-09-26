import { useQuery } from '@tanstack/react-query'
import { request } from './client'
import type { Appliance } from './types'

/**
 * v1 and v2 serve the same list. Fetched once per session; it also wakes the
 * API (free Render instance) before the user submits a calculation.
 */
export function useAppliances() {
  return useQuery({
    queryKey: ['appliances'],
    queryFn: async () => {
      const list = await request<Appliance[]>('/api/v2/power_calculator/appliances/')
      return [...list].sort((a, b) => a.name.localeCompare(b.name))
    },
    staleTime: Infinity,
    retry: 1,
  })
}
