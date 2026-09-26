import { request } from './client'
import type { V1CalculationIn, V1CalculationOut, V2CalculationIn, V2CalculationOut } from './types'

export function calculateV1(body: V1CalculationIn) {
  return request<V1CalculationOut>('/api/v1/power_calculator/calculate/', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function calculateV2(body: V2CalculationIn) {
  return request<V2CalculationOut>('/api/v2/power_calculator/calculate/', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
