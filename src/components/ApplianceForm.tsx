import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import {
  applianceListSchema,
  emptyAppliance,
  type ApplianceListInput,
} from '../lib/applianceSchema'
import { Field } from './Field'

type Props = {
  onSubmit: (values: ApplianceListInput) => void
  isSubmitting: boolean
}

export function ApplianceForm({ onSubmit, isSubmitting }: Props) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplianceListInput>({
    resolver: zodResolver(applianceListSchema),
    defaultValues: { appliances: [{ ...emptyAppliance }] },
    mode: 'onSubmit',
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'appliances' })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <ul className="flex flex-col gap-4">
        {fields.map((field, index) => {
          const rowErrors = errors.appliances?.[index]
          return (
            <li
              key={field.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-600">
                  Appliance {index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-slate-500
                    hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40
                    disabled:hover:bg-transparent disabled:hover:text-slate-500"
                >
                  <Trash2 size={16} aria-hidden="true" />
                  <span>Remove</span>
                  <span className="sr-only">appliance {index + 1}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field
                    id={`appliance-${index}-name`}
                    label="Appliance name"
                    placeholder="e.g. Ceiling fan"
                    autoComplete="off"
                    error={rowErrors?.name?.message}
                    {...register(`appliances.${index}.name`)}
                  />
                </div>

                <Field
                  id={`appliance-${index}-watts`}
                  label="Power rating (watts)"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  error={rowErrors?.watts?.message}
                  {...register(`appliances.${index}.watts`, { valueAsNumber: true })}
                />

                <Field
                  id={`appliance-${index}-quantity`}
                  label="Quantity"
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="1"
                  error={rowErrors?.quantity?.message}
                  {...register(`appliances.${index}.quantity`, { valueAsNumber: true })}
                />

                <div className="sm:col-span-2">
                  <Field
                    id={`appliance-${index}-hours`}
                    label="Hours used per day"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    max="24"
                    error={rowErrors?.hoursPerDay?.message}
                    {...register(`appliances.${index}.hoursPerDay`, { valueAsNumber: true })}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {errors.appliances?.root?.message && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {errors.appliances.root.message}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => append({ ...emptyAppliance })}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300
            bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Plus size={16} aria-hidden="true" />
          Add appliance
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-2.5
            text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? 'Calculating…' : 'Calculate system size'}
        </button>
      </div>
    </form>
  )
}
