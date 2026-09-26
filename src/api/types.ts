/** Mirrors the msgspec schemas in Inverter_power_project/inverter_project/api/{v1,v2}/schemas.py. */

export type Appliance = {
  id: number
  name: string
}

export type SizingOutput = {
  /** W */
  total_load: number
  /** kVA */
  inverter_rating: number
  /** Ah at the system voltage */
  total_battery_capacity: number
  numbers_of_batteries: number
  /** Wp */
  total_solar_panel_capacity_needed: number
  numbers_of_solar_panel: number
  /** A, installed array */
  total_current: number
  /** A, with 1.25 headroom */
  controller_current: number
}

// v1: one backup time for every appliance, fixed component sizes.

export type V1BatteryCapacity = 150 | 200 | 220 | 250
export type V1SystemVoltage = 12 | 24 | 48
export type V1SolarPanelWatt = 300 | 350 | 400 | 450

export type V1ItemIn = {
  id: number
  quantity: number
  power_rating: number
}

export type V1CalculationIn = {
  backup_time: number
  battery_capacity: V1BatteryCapacity
  system_voltage: V1SystemVoltage
  solar_panel_watt: V1SolarPanelWatt
  items: V1ItemIn[]
}

export type V1CalculationOut = SizingOutput & {
  backup_time: number
  battery_capacity: number
  system_voltage: number
  solar_panel_watt: number
  items: (V1ItemIn & { name: string })[]
}

// v2: backup time per appliance, free component sizes.

export type V2ItemIn = {
  id: number
  quantity: number
  power_rating: number
  backup_time: number
}

export type V2CalculationIn = {
  system_voltage: number
  battery_capacity: number
  solar_panel_watt: number
  items: V2ItemIn[]
}

export type V2CalculationOut = SizingOutput & {
  system_voltage: number
  battery_capacity: number
  solar_panel_watt: number
  items: (V2ItemIn & { name: string })[]
}
