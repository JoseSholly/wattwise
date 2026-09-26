import { z } from 'zod'

/**
 * Form-local shape only. Field names are NOT yet aligned to the DRF
 * serializers — that happens when src/api/ is written against the real
 * Inverter_power_project serializers.
 */
export const applianceSchema = z.object({
  name: z.string().trim().min(1, 'Enter an appliance name'),
  watts: z
    .number({ error: 'Enter the wattage' })
    .positive('Wattage must be greater than 0'),
  quantity: z
    .number({ error: 'Enter a quantity' })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1'),
  hoursPerDay: z
    .number({ error: 'Enter hours used per day' })
    .gt(0, 'Hours must be greater than 0')
    .max(24, 'Hours cannot exceed 24'),
})

export const applianceListSchema = z.object({
  appliances: z.array(applianceSchema).min(1, 'Add at least one appliance'),
})

export type Appliance = z.infer<typeof applianceSchema>
export type ApplianceListInput = z.infer<typeof applianceListSchema>

export const emptyAppliance = {
  name: '',
  watts: undefined as unknown as number,
  quantity: undefined as unknown as number,
  hoursPerDay: undefined as unknown as number,
}
