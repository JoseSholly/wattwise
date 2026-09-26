import type { V1Form, V2Form } from './schemas'

export const SYSTEM_FIELDS_V1 = [
  'backup_time',
  'battery_capacity',
  'system_voltage',
  'solar_panel_watt',
] as const satisfies readonly (keyof V1Form)[]

export const SYSTEM_FIELDS_V2 = [
  'system_voltage',
  'battery_capacity',
  'solar_panel_watt',
] as const satisfies readonly (keyof V2Form)[]

/** Fields that map back to 422 errors from the API top-level body. */
export const TOP_LEVEL_FIELDS_V1 = SYSTEM_FIELDS_V1 as unknown as readonly string[]
export const TOP_LEVEL_FIELDS_V2 = SYSTEM_FIELDS_V2 as unknown as readonly string[]

/** The three ordered steps for the wizard. */
export const WIZARD_STEPS = [
  { slug: 'system', label: 'System' },
  { slug: 'loads', label: 'Loads' },
  { slug: 'spec', label: 'Spec Sheet' },
] as const

export type WizardStepSlug = (typeof WIZARD_STEPS)[number]['slug']
