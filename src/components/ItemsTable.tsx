import { Plus, X } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useAppliances } from '../api/appliances'
import { blankItem } from '../lib/schemas'
import { Field, Select } from './Field'

type ItemsForm = {
  items: { id: number; quantity: number; power_rating: number; backup_time?: number }[]
}

type Props = {
  /** v2: every appliance has its own backup time. */
  withBackupTime?: boolean
}

const MAX_ITEMS = 100

export function ItemsTable({ withBackupTime = false }: Props) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ItemsForm>()
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const appliances = useAppliances()

  // Static class strings so Tailwind can see them.
  const cols = withBackupTime
    ? 'grid-cols-3 sm:grid-cols-[minmax(0,1fr)_5rem_7rem_6rem_2.25rem]'
    : 'grid-cols-2 sm:grid-cols-[minmax(0,1fr)_5rem_7rem_2.25rem]'

  const listError = errors.items?.root?.message ?? errors.items?.message

  return (
    <div>
      <div className={`hidden gap-x-3 border-b border-neutral-200 pb-2 sm:grid ${cols}`}>
        <span className="eyebrow">Appliance</span>
        <span className="eyebrow">Qty</span>
        <span className="eyebrow">Watts each</span>
        {withBackupTime && <span className="eyebrow">Hours / day</span>}
        <span />
      </div>

      <ul>
        {fields.map((field, index) => {
          const rowErrors = errors.items?.[index]
          const idBase = `item-${index}`
          const canRemove = fields.length > 1
          return (
            <li
              key={field.id}
              className={`grid gap-x-3 gap-y-2 border-b border-neutral-200 py-3 sm:items-start sm:py-2 ${cols}`}
            >
              <div className="col-span-full flex items-center justify-between sm:hidden">
                <span className="eyebrow">Appliance {index + 1}</span>
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-sm text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="col-span-full sm:col-span-1">
                <Select
                  id={`${idBase}-id`}
                  label="Appliance"
                  compactLabel
                  disabled={!appliances.data}
                  error={rowErrors?.id?.message}
                  defaultValue=""
                  {...register(`items.${index}.id`, { valueAsNumber: true })}
                >
                  <option value="" disabled>
                    {appliances.isPending
                      ? 'Loading appliances…'
                      : appliances.isError
                        ? 'Appliances unavailable'
                        : 'Choose…'}
                  </option>
                  {appliances.data?.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </div>

              <Field
                id={`${idBase}-quantity`}
                label="Qty"
                compactLabel
                type="number"
                inputMode="numeric"
                step="1"
                min="1"
                max="1000"
                error={rowErrors?.quantity?.message}
                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
              />

              <Field
                id={`${idBase}-power`}
                label="Watts each"
                compactLabel
                type="number"
                inputMode={withBackupTime ? 'decimal' : 'numeric'}
                step={withBackupTime ? 'any' : '1'}
                min="0"
                placeholder="W"
                error={rowErrors?.power_rating?.message}
                {...register(`items.${index}.power_rating`, { valueAsNumber: true })}
              />

              {withBackupTime && (
                <Field
                  id={`${idBase}-hours`}
                  label="Hours / day"
                  compactLabel
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  max="24"
                  placeholder="h"
                  error={rowErrors?.backup_time?.message}
                  {...register(`items.${index}.backup_time`, { valueAsNumber: true })}
                />
              )}

              <div className="hidden h-9 items-center justify-center sm:flex">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={!canRemove}
                  title="Remove"
                  className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900
                    disabled:invisible"
                >
                  <X size={16} aria-hidden="true" />
                  <span className="sr-only">Remove appliance {index + 1}</span>
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {appliances.isError && (
        <p className="mt-3 text-sm text-red-600">
          Couldn’t load the appliance list: {appliances.error.message}{' '}
          <button
            type="button"
            onClick={() => appliances.refetch()}
            className="font-medium underline underline-offset-2"
          >
            Retry
          </button>
        </p>
      )}

      {listError && <p className="mt-3 text-sm text-red-600">{listError}</p>}

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => append({ ...blankItem })}
          disabled={fields.length >= MAX_ITEMS}
          className="btn-secondary"
        >
          <Plus size={14} aria-hidden="true" />
          Add appliance
        </button>
        <span className="text-xs tabular-nums text-neutral-500">
          {fields.length} / {MAX_ITEMS}
        </span>
      </div>
    </div>
  )
}
