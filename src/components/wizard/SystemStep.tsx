import { useNavigate, useOutletContext } from 'react-router'
import { Field, Select } from '../Field'
import { Panel } from '../Panel'
import { WizardShell } from './WizardShell'
import type { WizardContext } from './CalculatorWizard'
import {
  SYSTEM_FIELDS_V1,
  SYSTEM_FIELDS_V2,
  type WizardStepSlug,
} from '../../lib/stepFields'
import {
  V1_BATTERY_CAPACITIES,
  V1_SOLAR_PANEL_WATTS,
  V1_SYSTEM_VOLTAGES,
  type V1Form,
  type V2Form,
} from '../../lib/schemas'
import type { UseFormReturn } from 'react-hook-form'
import type { ReactNode } from 'react'
import type { SizingOutput } from '../../api/types'
import { suggestedVoltage, warningsOf } from '../../lib/warnings'

const SYSTEM: WizardStepSlug = 'system'

export function SystemStep() {
  const ctx = useOutletContext<WizardContext>()
  const navigate = useNavigate()

  const onContinue = async () => {
    const fields = ctx.version === 'v1' ? SYSTEM_FIELDS_V1 : SYSTEM_FIELDS_V2
    const valid = await ctx.form.trigger(fields as never)
    if (!valid) return
    ctx.markComplete(SYSTEM)
    navigate(`/${ctx.version}/loads`)
  }

  return (
    <WizardShell
      version={ctx.version}
      currentStep="system"
      title="Configure your system"
      description={
        ctx.version === 'v1'
          ? 'Pick a system voltage, battery size and panel size, and set how long you want the system to run during an outage. All appliances will share this backup time. For example, choosing a 24V system with 200Ah batteries and 400W panels for a 6-hour backup will calculate exactly how many batteries and panels you need to keep your selected loads running.'
          : 'Pick any system voltage that is a multiple of 12, plus your battery and panel sizes. Each appliance will get its own runtime in the next step. For example, entering a 24V system with 200Ah batteries and 400W panels lets you tailor distinct operating hours for your fridge, TV, or lights later.'
      }
      back={{ to: '/', label: 'Back to overview', labelShort: 'Back' }}
      primary={{ onClick: onContinue, label: 'Continue to loads', labelShort: 'Continue' }}
    >
      <Panel eyebrow="System inputs" title="Backup power system">
        {ctx.version === 'v1' ? (
          <V1Fields form={ctx.form} lastSuggested={lastSuggested(ctx.mutation.data)} />
        ) : (
          <V2Fields form={ctx.form} lastSuggested={lastSuggested(ctx.mutation.data)} />
        )}
      </Panel>
    </WizardShell>
  )
}

/** The voltage the previous result suggested, if any. Shown as a hint; never auto-selected. */
function lastSuggested(data: (SizingOutput & { system_voltage: number }) | undefined) {
  return data ? suggestedVoltage(warningsOf(data), data.system_voltage) : null
}

function voltageHint(lastSuggested: number | null, voltage: number): ReactNode {
  return lastSuggested !== null && lastSuggested > voltage ? (
    <span className="text-accent-ink">{lastSuggested} V advised</span>
  ) : (
    'DC bus'
  )
}

function V1Fields({ form, lastSuggested }: { form: UseFormReturn<V1Form>; lastSuggested: number | null }) {
  const {
    register,
    watch,
    formState: { errors },
  } = form
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
      <Field
        id="backup_time"
        label="Backup time"
        hint="Hours during an outage"
        unit="h"
        type="number"
        inputMode="numeric"
        step="1"
        min="1"
        max="24"
        error={errors.backup_time?.message}
        {...register('backup_time', { valueAsNumber: true })}
      />
      <Select
        id="system_voltage"
        label="System voltage"
        hint={voltageHint(lastSuggested, watch('system_voltage'))}
        error={errors.system_voltage?.message}
        {...register('system_voltage', { valueAsNumber: true })}
      >
        {V1_SYSTEM_VOLTAGES.map((v) => (
          <option key={v} value={v}>
            {v} V
          </option>
        ))}
      </Select>
      <Select
        id="battery_capacity"
        label="Battery size"
        hint="12 V unit"
        error={errors.battery_capacity?.message}
        {...register('battery_capacity', { valueAsNumber: true })}
      >
        {V1_BATTERY_CAPACITIES.map((v) => (
          <option key={v} value={v}>
            {v} Ah
          </option>
        ))}
      </Select>
      <Select
        id="solar_panel_watt"
        label="Solar panel"
        hint="Per panel"
        error={errors.solar_panel_watt?.message}
        {...register('solar_panel_watt', { valueAsNumber: true })}
      >
        {V1_SOLAR_PANEL_WATTS.map((v) => (
          <option key={v} value={v}>
            {v} W
          </option>
        ))}
      </Select>
    </div>
  )
}

function V2Fields({ form, lastSuggested }: { form: UseFormReturn<V2Form>; lastSuggested: number | null }) {
  const {
    register,
    watch,
    formState: { errors },
  } = form
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-3">
      <Select
        id="system_voltage"
        label="System voltage"
        hint={voltageHint(lastSuggested, watch('system_voltage'))}
        error={errors.system_voltage?.message}
        {...register('system_voltage', { valueAsNumber: true })}
      >
        {V1_SYSTEM_VOLTAGES.map((v) => (
          <option key={v} value={v}>
            {v} V
          </option>
        ))}
      </Select>
      <Select
        id="battery_capacity"
        label="Battery size"
        hint="12 V unit"
        error={errors.battery_capacity?.message}
        {...register('battery_capacity', { valueAsNumber: true })}
      >
        {V1_BATTERY_CAPACITIES.map((v) => (
          <option key={v} value={v}>
            {v} Ah
          </option>
        ))}
      </Select>
      <Field
        id="solar_panel_watt"
        label="Solar panel"
        hint="1–1,000"
        unit="W"
        type="number"
        inputMode="decimal"
        step="any"
        min="1"
        max="1000"
        error={errors.solar_panel_watt?.message}
        {...register('solar_panel_watt', { valueAsNumber: true })}
      />
    </div>
  )
}
