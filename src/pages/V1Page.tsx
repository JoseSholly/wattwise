import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { calculateV1 } from '../api/calculate'
import { CalculatorLayout } from '../components/CalculatorLayout'
import { Field, Select } from '../components/Field'
import { ItemsTable } from '../components/ItemsTable'
import { Results } from '../components/Results'
import { EmptyState, ErrorState, LoadingState } from '../components/states'
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
    formState: { errors },
  } = form
  const { mutation, issues, message } = useCalculation(form, calculateV1, TOP_LEVEL_FIELDS)
  const data = mutation.data

  return (
    <CalculatorLayout
      title="Single backup time"
      description="Every appliance runs for the same number of hours during an outage. Component sizes are limited to standard options."
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field
                  id="backup_time"
                  label="Backup (hours)"
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
                  label="Battery (12 V)"
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
            </fieldset>

            <fieldset>
              <legend className="eyebrow mb-3">Appliances</legend>
              <ItemsTable />
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
            sharedBackupTime={data.backup_time}
            items={data.items.map((item) => ({ ...item, backup_time: data.backup_time }))}
          />
        ) : (
          <EmptyState />
        )
      }
    />
  )
}
