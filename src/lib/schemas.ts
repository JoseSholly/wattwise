import { z } from 'zod'

/**
 * Client-side mirror of the API limits (api/common/limits.py and the v1/v2
 * msgspec schemas), so most mistakes are caught before a request is sent.
 * Field names match the API exactly.
 */

export const V1_BATTERY_CAPACITIES = [150, 200, 220, 250] as const
export const V1_SYSTEM_VOLTAGES = [12, 24, 48] as const
export const V1_SOLAR_PANEL_WATTS = [300, 350, 400, 450] as const

const applianceId = z.number({ error: 'Choose an appliance' }).int().positive()

const quantity = z
  .number({ error: 'Enter a quantity' })
  .int('Whole number')
  .min(1, 'At least 1')
  .max(1000, 'At most 1,000')

// v1

export const v1Schema = z.object({
  backup_time: z
    .number({ error: 'Enter backup hours' })
    .int('Whole hours only')
    .min(1, 'At least 1 h')
    .max(24, 'At most 24 h'),
  battery_capacity: z.literal(V1_BATTERY_CAPACITIES, { error: 'Choose a battery size' }),
  system_voltage: z.literal(V1_SYSTEM_VOLTAGES, { error: 'Choose a system voltage' }),
  solar_panel_watt: z.literal(V1_SOLAR_PANEL_WATTS, { error: 'Choose a panel size' }),
  items: z
    .array(
      z.object({
        id: applianceId,
        quantity,
        power_rating: z
          .number({ error: 'Enter watts' })
          .int('Whole watts')
          .min(1, 'At least 1 W')
          .max(100_000, 'At most 100,000 W'),
      }),
    )
    .min(1, 'Add at least one appliance')
    .max(100, 'At most 100 appliances'),
})

export type V1Form = z.infer<typeof v1Schema>

// v2

export const v2Schema = z.object({
  system_voltage: z
    .number({ error: 'Enter a voltage' })
    .min(12, 'At least 12 V')
    .max(240, 'At most 240 V')
    .refine((v) => v % 12 === 0, 'Must be a multiple of 12 V'),
  battery_capacity: z
    .number({ error: 'Enter battery Ah' })
    .min(1, 'At least 1 Ah')
    .max(5000, 'At most 5,000 Ah'),
  solar_panel_watt: z
    .number({ error: 'Enter panel watts' })
    .min(1, 'At least 1 W')
    .max(1000, 'At most 1,000 W'),
  items: z
    .array(
      z.object({
        id: applianceId,
        quantity,
        power_rating: z
          .number({ error: 'Enter watts' })
          .min(0.01, 'At least 0.01 W')
          .max(100_000, 'At most 100,000 W'),
        backup_time: z
          .number({ error: 'Enter hours' })
          .min(0.01, 'More than 0 h')
          .max(24, 'At most 24 h'),
      }),
    )
    .min(1, 'Add at least one appliance')
    .max(100, 'At most 100 appliances'),
})

export type V2Form = z.infer<typeof v2Schema>

/** A blank appliance row; numbers start empty so the inputs render blank. */
export const blankItem = {
  id: undefined as unknown as number,
  quantity: 1,
  power_rating: undefined as unknown as number,
  backup_time: undefined as unknown as number,
}
