import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { calculateV1 } from '../api/calculate'
import { CalculatorLayout } from '../components/CalculatorLayout'
import { Field, Select } from '../components/Field'
import { ItemsTable } from '../components/ItemsTable'
import { Panel } from '../components/Panel'
import { Results } from '../components/Results'
import { EmptyState, ErrorState, LoadingState } from '../components/states'
import { num } from '../lib/format'
import {
  blankItem,
  V1_BATTERY_CAPACITIES,
  V1_SOLAR_PANEL_WATTS,
  V1_SYSTEM_VOLTAGES,
  v1Schema,
  type V1Form,
} from '../lib/schemas'
import { useCalculation } from '../lib/useCalculation'

const TOP_LEVEL_FIELDS = ['backup_time', 'battery_capacity', 'system_voltage', 'solar_panel_watt']

export function V1Page() {
  const form = useForm<V1Form>({
    resolver: zodResolver(v1Schema),
    defaultValues: {
      backup_time: 6,
      battery_capacity: 200,
      system_voltage: 24,
      solar_panel_watt: 400,
      items: [{ ...blankItem }],
    },
  })
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form
  const backupTime = useWatch({ control, name: 'backup_time' })
  const { mutation, issues, message } = useCalculation(form, calculateV1, TOP_LEVEL_FIELDS)
  const data = mutation.data

  return (
    <FormProvider {...form}>
      <CalculatorLayout
        version="v1"
        title="Single backup time"
        description="Every appliance runs for the same number of hours during an outage. Batteries, panels and system voltage are limited to standard sizes."
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        isSubmitting={mutation.isPending}
        resultKey={data}
        resultsMeta={
          data && (
            <span className="font-mono text-[11px] text-subtle">
              {num(data.system_voltage)} V · {num(data.backup_time)} h
            </span>
          )
        }
        results={
          mutation.isPending ? (
            <LoadingState />
          ) : mutation.isError ? (
            <ErrorState message={message} issues={issues} />
          ) : data ? (
            <Results
              output={data}
              system_voltage={data.system_voltage}
              battery_capacity={data.battery_capacity}
              solar_panel_watt={data.solar_panel_watt}
              sharedBackupTime={data.backup_time}
              items={data.items.map((item) => ({ ...item, backup_time: data.backup_time }))}
            />
          ) : (
            <EmptyState />
          )
        }
      >
        <Panel index="01" title="System">
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 md:grid-cols-4">
            <Field
              id="backup_time"
              label="Backup time"
              hint="1–24"
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
              label="Battery"
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
        </Panel>

        <ItemsTable index="02" sharedHours={backupTime} />
      </CalculatorLayout>
    </FormProvider>
  )
}
