import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { isNum, num } from '../lib/format'
import { blankItem } from '../lib/schemas'
import { ApplianceCombobox } from './ApplianceCombobox'
import { Field } from './Field'

type Row = { id: number; quantity: number; power_rating: number; backup_time?: number }
type ItemsForm = { items: Row[] }

type Props = {
  /** v2: every appliance has its own backup time. */
  withBackupTime?: boolean
  /** v1: the single backup time from the System step, for the live energy estimate. */
  sharedHours?: number
}

const MAX_ITEMS = 100

function rowLoad(row: Row | undefined, hours: number | undefined) {
  if (!row || !isNum(row.quantity) || !isNum(row.power_rating)) return null
  const watts = row.quantity * row.power_rating
  return { watts, wh: isNum(hours) ? watts * hours : null }
}

export function ItemsTable({ withBackupTime = false, sharedHours }: Props) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ItemsForm>()
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const rows = useWatch({ control, name: 'items' })

  const loads = fields.map((_, i) =>
    rowLoad(rows?.[i], withBackupTime ? rows?.[i]?.backup_time : sharedHours),
  )
  const complete = loads.every((l) => l !== null)
  const totalW = loads.reduce((sum, l) => sum + (l?.watts ?? 0), 0)
  const totalWh =
    complete && loads.every((l) => l?.wh !== null)
      ? loads.reduce((sum, l) => sum + (l?.wh ?? 0), 0)
      : null

  // Desktop grid columns. Static strings so Tailwind can see them.
  const cols = withBackupTime
    ? 'sm:grid-cols-[1.75rem_minmax(0,1fr)_4.5rem_6.5rem_5.5rem_6.5rem_auto] xl:gap-x-4'
    : 'sm:grid-cols-[1.75rem_minmax(0,1fr)_4.5rem_7rem_6.5rem_auto] xl:gap-x-4'

  const listError = errors.items?.root?.message ?? errors.items?.message

  return (
    <div className="flex flex-col gap-5">
      {/* Totals bar. Stacks on mobile so the totals never overflow. */}
      <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="label-mono">
          {fields.length} appliance{fields.length === 1 ? '' : 's'}
          <span className="mx-2 text-line-strong">/</span>
          <span className="text-subtle">{MAX_ITEMS} max</span>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 sm:flex sm:items-baseline sm:gap-6 sm:text-right">
          <div>
            <dt className="label-mono">Connected</dt>
            <dd className="num mt-1 text-sm font-semibold text-fg">
              {num(totalW)} <span className="text-xs font-normal text-muted">W</span>
            </dd>
          </div>
          <div>
            <dt className="label-mono">Daily energy</dt>
            <dd className="num mt-1 text-sm font-semibold text-fg">
              {totalWh === null ? (
                <span className="text-subtle">—</span>
              ) : (
                <>
                  {num(totalWh)} <span className="text-xs font-normal text-muted">Wh</span>
                </>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Column header, table layout only. */}
      <div
        aria-hidden="true"
        className={`label-mono -mb-2 hidden gap-x-3 border-b border-line pb-2 sm:grid ${cols}`}
      >
        <span>#</span>
        <span>Appliance</span>
        <span>Qty</span>
        <span>Watts each</span>
        {withBackupTime && <span>Hours/day</span>}
        <span className="text-right">Load</span>
        <span />
      </div>

      <ul className="flex flex-col gap-3 sm:gap-0">
        {fields.map((field, i) => {
          const rowErrors = errors.items?.[i]
          const idBase = `item-${i}`
          const canRemove = fields.length > 1
          const load = loads[i]
          const subtotal = load ? (
            <>
              <span className="whitespace-nowrap">{num(load.watts)} W</span>
              {load.wh !== null && (
                <span className="whitespace-nowrap text-subtle">
                  <span className="xl:hidden"> · </span>
                  {num(load.wh)} Wh
                </span>
              )}
            </>
          ) : (
            <span className="text-subtle">—</span>
          )

          return (
            <li
              key={field.id}
              className={`min-w-0 rounded-md border border-line bg-surface2/40 p-3.5 sm:grid sm:items-start sm:gap-x-3 sm:rounded-none sm:border-0 sm:border-b sm:bg-transparent sm:p-0 sm:py-3 sm:last:border-b-0 ${cols}`}
            >
              {/* Card top row on phones: index + appliance select. Remove sits below. */}
              <div className="flex items-center gap-2.5 sm:contents">
                <span className="grid h-11 w-9 shrink-0 place-items-center rounded border border-line bg-surface font-mono text-xs text-muted sm:w-auto sm:border-0 sm:bg-transparent sm:text-subtle">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <Controller
                    control={control}
                    name={`items.${i}.id`}
                    render={({ field: idField }) => (
                      <ApplianceCombobox
                        id={`${idBase}-id`}
                        label={`Appliance ${i + 1}`}
                        hideLabel
                        value={
                          typeof idField.value === 'number' && !Number.isNaN(idField.value)
                            ? idField.value
                            : undefined
                        }
                        onChange={(next) => idField.onChange(next)}
                        onBlur={idField.onBlur}
                        error={rowErrors?.id?.message}
                      />
                    )}
                  />
                </div>
              </div>

              <div
                className={`mt-3 grid gap-2.5 sm:contents ${
                  withBackupTime ? 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]' : 'grid-cols-2'
                }`}
              >
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
                  {...register(`items.${i}.quantity`, { valueAsNumber: true })}
                />
                <Field
                  id={`${idBase}-power`}
                  label="Watts"
                  compactLabel
                  unit="W"
                  type="number"
                  inputMode={withBackupTime ? 'decimal' : 'numeric'}
                  step={withBackupTime ? 'any' : '1'}
                  min="0"
                  error={rowErrors?.power_rating?.message}
                  {...register(`items.${i}.power_rating`, { valueAsNumber: true })}
                />
                {withBackupTime && (
                  <Field
                    id={`${idBase}-hours`}
                    label="Hours"
                    compactLabel
                    unit="h"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    max="24"
                    error={rowErrors?.backup_time?.message}
                    {...register(`items.${i}.backup_time`, { valueAsNumber: true })}
                  />
                )}
              </div>

              {/* Mobile: subtotal + Remove sit on the same line below the inputs. */}
              <div className="mt-3 flex items-center justify-between gap-3 sm:hidden">
                <p className="num text-xs text-muted">{subtotal}</p>
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label={`Remove appliance ${i + 1}`}
                    className="rounded px-2 py-1 text-xs font-medium text-muted transition-colors hover:text-danger"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Desktop: subtotal and Remove sit in their own grid cells. */}
              <p className="num hidden text-right text-xs text-muted sm:flex sm:h-11 sm:flex-col sm:items-end sm:justify-center sm:leading-tight">
                {subtotal}
              </p>

              <div className="hidden h-11 items-center justify-end sm:flex">
                <button
                  type="button"
                  onClick={() => remove(i)}
                  disabled={!canRemove}
                  aria-label={`Remove appliance ${i + 1}`}
                  className="rounded px-2 py-1 text-xs font-medium text-subtle transition-colors hover:text-danger disabled:opacity-30"
                >
                  Remove
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <div>
        <button
          type="button"
          onClick={() => append({ ...blankItem })}
          disabled={fields.length >= MAX_ITEMS}
          className="btn-secondary w-full sm:w-auto"
        >
          Add appliance
        </button>
      </div>

      {listError && <p className="text-sm text-danger">{listError}</p>}
    </div>
  )
}
