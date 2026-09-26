import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { useAppliances } from '../api/appliances'
import { isNum, num } from '../lib/format'
import { blankItem } from '../lib/schemas'
import { Field, Select } from './Field'
import { Panel } from './Panel'

type Row = { id: number; quantity: number; power_rating: number; backup_time?: number }
type ItemsForm = { items: Row[] }

type Props = {
  index: string
  /** v2: every appliance has its own backup time. */
  withBackupTime?: boolean
  /** v1: the single backup time from the System panel, for the live energy estimate. */
  sharedHours?: number
}

const MAX_ITEMS = 100

/** Watts and watt-hours for one row from what's typed so far; null when incomplete. */
function rowLoad(row: Row | undefined, hours: number | undefined) {
  if (!row || !isNum(row.quantity) || !isNum(row.power_rating)) return null
  const watts = row.quantity * row.power_rating
  return { watts, wh: isNum(hours) ? watts * hours : null }
}

export function ItemsTable({ index, withBackupTime = false, sharedHours }: Props) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ItemsForm>()
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const rows = useWatch({ control, name: 'items' })
  const appliances = useAppliances()

  const loads = fields.map((_, i) =>
    rowLoad(rows?.[i], withBackupTime ? rows?.[i]?.backup_time : sharedHours),
  )
  const complete = loads.every((l) => l !== null)
  const totalW = loads.reduce((sum, l) => sum + (l?.watts ?? 0), 0)
  const totalWh = complete && loads.every((l) => l?.wh !== null)
    ? loads.reduce((sum, l) => sum + (l?.wh ?? 0), 0)
    : null

  // Desktop grid columns. Static strings so Tailwind can see them.
  const cols = withBackupTime
    ? 'sm:grid-cols-[1.75rem_minmax(0,1fr)_4.5rem_6.5rem_5.5rem_2.25rem] xl:grid-cols-[1.75rem_minmax(0,1fr)_4.5rem_6.5rem_5.5rem_6.5rem_2.25rem]'
    : 'sm:grid-cols-[1.75rem_minmax(0,1fr)_4.5rem_7rem_2.25rem] xl:grid-cols-[1.75rem_minmax(0,1fr)_4.5rem_7rem_6.5rem_2.25rem]'

  const listError = errors.items?.root?.message ?? errors.items?.message

  return (
    <Panel
      index={index}
      title="Loads"
      aside={
        <span className="font-mono text-[11px] text-subtle">
          {fields.length}/{MAX_ITEMS}
        </span>
      }
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => append({ ...blankItem })}
            disabled={fields.length >= MAX_ITEMS}
            className="btn-secondary self-start"
          >
            <Plus size={15} aria-hidden="true" />
            Add appliance
          </button>
          <dl className="grid grid-cols-2 gap-x-6 text-right sm:flex sm:gap-6">
            <div className="text-left sm:text-right">
              <dt className="label-mono">Connected load</dt>
              <dd className="num text-sm font-semibold">{num(totalW)} W</dd>
            </div>
            <div>
              <dt className="label-mono">Daily energy</dt>
              <dd className="num text-sm font-semibold">
                {totalWh === null ? <span className="text-subtle">—</span> : `${num(totalWh)} Wh`}
              </dd>
            </div>
          </dl>
        </div>
      }
    >
      {/* Column header, table layout only. */}
      <div
        aria-hidden="true"
        className={`label-mono -mt-1 mb-1 hidden gap-x-3 border-b border-line pb-2 sm:grid ${cols}`}
      >
        <span>#</span>
        <span>Appliance</span>
        <span>Qty</span>
        <span>Watts each</span>
        {withBackupTime && <span>Hours/day</span>}
        <span className="hidden text-right xl:block">Load</span>
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
          const removeLabel = `Remove appliance ${i + 1}`

          return (
            <li
              key={field.id}
              className={`rounded-md border border-line bg-surface2/40 p-3 sm:grid sm:items-start sm:gap-x-3 sm:rounded-none sm:border-0 sm:border-b sm:bg-transparent sm:px-0 sm:py-2.5 sm:last:border-b-0 ${cols}`}
            >
              {/* Card header on phones; first three grid cells on wider screens. */}
              <div className="flex items-center gap-2 sm:contents">
                <span className="grid h-10 w-8 shrink-0 place-items-center rounded border border-line bg-surface font-mono text-xs text-muted sm:w-auto sm:border-0 sm:bg-transparent sm:text-subtle">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Select
                    id={`${idBase}-id`}
                    label={`Appliance ${i + 1}`}
                    hideLabel
                    disabled={!appliances.data}
                    error={rowErrors?.id?.message}
                    defaultValue=""
                    {...register(`items.${i}.id`, { valueAsNumber: true })}
                  >
                    <option value="" disabled>
                      {appliances.isPending
                        ? 'Loading appliances…'
                        : appliances.isError
                          ? 'Appliances unavailable'
                          : 'Choose appliance…'}
                    </option>
                    {appliances.data?.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  disabled={!canRemove}
                  aria-label={removeLabel}
                  className="grid h-10 w-10 shrink-0 place-items-center self-start rounded-md border border-line bg-surface text-muted hover:text-danger disabled:opacity-40 sm:hidden"
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>

              {/* Fixed columns on phones so every card lines up; qty needs the least room. */}
              <div
                className={`mt-3 grid gap-2.5 sm:contents ${withBackupTime ? 'grid-cols-[4rem_minmax(0,1fr)_minmax(0,1fr)]' : 'grid-cols-2'}`}
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

              <p className="num mt-2.5 text-right text-xs text-muted sm:hidden xl:mt-0 xl:flex xl:h-10 xl:flex-col xl:items-end xl:justify-center xl:leading-tight">
                {subtotal}
              </p>

              <div className="hidden h-10 items-center justify-center sm:flex">
                <button
                  type="button"
                  onClick={() => remove(i)}
                  disabled={!canRemove}
                  title="Remove"
                  aria-label={removeLabel}
                  className="grid h-8 w-8 place-items-center rounded-md text-subtle transition-colors hover:bg-surface2 hover:text-danger disabled:invisible"
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {appliances.isError && (
        <p className="mt-3 text-sm text-danger">
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

      {listError && <p className="mt-3 text-sm text-danger">{listError}</p>}
    </Panel>
  )
}
