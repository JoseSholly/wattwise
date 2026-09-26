import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { calculateV2 } from '../api/calculate'
import { CalculatorLayout } from '../components/CalculatorLayout'
import { Field } from '../components/Field'
import { ItemsTable } from '../components/ItemsTable'
import { Panel } from '../components/Panel'
import { Results } from '../components/Results'
import { EmptyState, ErrorState, LoadingState } from '../components/states'
import { num } from '../lib/format'
import { blankItem, v2Schema, type V2Form } from '../lib/schemas'
import { useCalculation } from '../lib/useCalculation'

const TOP_LEVEL_FIELDS = ['system_voltage', 'battery_capacity', 'solar_panel_watt']

export function V2Page() {
  const form = useForm<V2Form>({
    resolver: zodResolver(v2Schema),
    defaultValues: {
      system_voltage: 24,
      battery_capacity: 200,
      solar_panel_watt: 400,
      items: [{ ...blankItem }],
    },
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form
  const { mutation, issues, message } = useCalculation(form, calculateV2, TOP_LEVEL_FIELDS)
  const data = mutation.data

  return (
    <FormProvider {...form}>
      <CalculatorLayout
        version="v2"
        title="Per-appliance backup time"
        description="Each appliance runs for its own number of hours, e.g. a fridge overnight and a TV for the evening. Any 12 V multiple, battery size and panel rating."
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        isSubmitting={mutation.isPending}
        resultKey={data}
        resultsMeta={
          data && (
            <span className="font-mono text-[11px] text-subtle">
              {num(data.system_voltage)} V system
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
              items={data.items}
            />
          ) : (
            <EmptyState />
          )
        }
      >
        <Panel index="01" title="System">
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3">
            <Field
              id="system_voltage"
              label="System voltage"
              hint="×12"
              unit="V"
              type="number"
              inputMode="numeric"
              step="12"
              min="12"
              max="240"
              error={errors.system_voltage?.message}
              {...register('system_voltage', { valueAsNumber: true })}
            />
            <Field
              id="battery_capacity"
              label="Battery"
              hint="12 V unit"
              unit="Ah"
              type="number"
              inputMode="decimal"
              step="any"
              min="1"
              max="5000"
              error={errors.battery_capacity?.message}
              {...register('battery_capacity', { valueAsNumber: true })}
            />
            <Field
              id="solar_panel_watt"
              label="Solar panel"
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
        </Panel>

        <ItemsTable index="02" withBackupTime />
      </CalculatorLayout>
    </FormProvider>
  )
}
