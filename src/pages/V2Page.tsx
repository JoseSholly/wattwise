import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { calculateV2 } from '../api/calculate'
import { CalculatorLayout } from '../components/CalculatorLayout'
import { Field } from '../components/Field'
import { ItemsTable } from '../components/ItemsTable'
import { Results } from '../components/Results'
import { EmptyState, ErrorState, LoadingState } from '../components/states'
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
    <CalculatorLayout
      title="Per-appliance backup time"
      description="Each appliance runs for its own number of hours, e.g. a fridge overnight and a TV for the evening. Any 12 V multiple, battery size and panel rating."
      resultKey={data}
      form={
        <FormProvider {...form}>
          <form
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            noValidate
            className="flex flex-col gap-8"
          >
            <fieldset>
              <legend className="eyebrow mb-3">System</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Field
                  id="system_voltage"
                  label="System voltage (V)"
                  type="number"
                  inputMode="numeric"
                  step="12"
                  min="12"
                  max="240"
                  hint="Multiple of 12"
                  error={errors.system_voltage?.message}
                  {...register('system_voltage', { valueAsNumber: true })}
                />
                <Field
                  id="battery_capacity"
                  label="Battery, 12 V (Ah)"
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
                  label="Solar panel (W)"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="1"
                  max="1000"
                  error={errors.solar_panel_watt?.message}
                  {...register('solar_panel_watt', { valueAsNumber: true })}
                />
              </div>
            </fieldset>

            <fieldset>
              <legend className="eyebrow mb-3">Appliances</legend>
              <ItemsTable withBackupTime />
            </fieldset>

            <div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="btn-primary w-full sm:w-auto"
              >
                {mutation.isPending ? 'Calculating…' : 'Calculate'}
              </button>
            </div>
          </form>
        </FormProvider>
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
    />
  )
}
