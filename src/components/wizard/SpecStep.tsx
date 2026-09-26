import { useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router'
import { EnergyBreakdown } from '../EnergyBreakdown'
import { Panel } from '../Panel'
import { SpecSheet } from '../SpecSheet'
import { ErrorState, LoadingState } from '../states'
import { WizardShell } from './WizardShell'
import type { WizardContext } from './CalculatorWizard'
import { num } from '../../lib/format'
import { ASSUMPTIONS } from '../../lib/model'
import type {
  V1CalculationOut,
  V2CalculationOut,
} from '../../api/types'

export function SpecStep() {
  const ctx = useOutletContext<WizardContext>()
  const navigate = useNavigate()

  // Fire on every entry: the user may have edited earlier steps between visits.
  useEffect(() => {
    ctx.runCalculation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const back = { to: `/${ctx.version}/loads`, label: 'Edit loads', labelShort: 'Back' }

  if (ctx.mutation.isPending) {
    return (
      <WizardShell
        version={ctx.version}
        currentStep="spec"
        title="Sizing your system"
        description="Running the calculation against your inputs. This can take up to a minute if the API is waking up."
        back={back}
        primary={null}
      >
        <Panel eyebrow="Result" title="Spec sheet">
          <LoadingState />
        </Panel>
      </WizardShell>
    )
  }

  if (ctx.mutation.isError) {
    return (
      <WizardShell
        version={ctx.version}
        currentStep="spec"
        title="We couldn’t size the system"
        description="The calculation didn’t complete. See the details below and adjust your inputs."
        back={back}
        primary={{ onClick: () => ctx.runCalculation(), label: 'Try again', accent: true }}
      >
        <ErrorState
          message={ctx.errorMessage}
          issues={ctx.issues}
          action={
            <button
              type="button"
              onClick={() => navigate(`/${ctx.version}/loads`)}
              className="btn-secondary"
            >
              Fix in Loads
            </button>
          }
        />
      </WizardShell>
    )
  }

  const data = ctx.mutation.data as V1CalculationOut | V2CalculationOut | undefined
  if (!data) {
    return (
      <WizardShell
        version={ctx.version}
        currentStep="spec"
        title="Sizing your system"
        description="Preparing the calculation."
        back={back}
        primary={null}
      >
        <Panel eyebrow="Result" title="Spec sheet">
          <LoadingState />
        </Panel>
      </WizardShell>
    )
  }

  // v1 has a shared backup_time on the response; v2 does not.
  const sharedBackupTime = 'backup_time' in data ? data.backup_time : undefined
  const items = data.items.map((item) => ({
    ...item,
    backup_time:
      'backup_time' in item && typeof item.backup_time === 'number'
        ? item.backup_time
        : (sharedBackupTime ?? 0),
  }))
  const meta =
    sharedBackupTime !== undefined
      ? `${num(data.system_voltage)} V system · ${num(sharedBackupTime)} h backup`
      : `${num(data.system_voltage)} V system · per-appliance backup`

  return (
    <WizardShell
      version={ctx.version}
      currentStep="spec"
      title="Your specification"
      description="Below is the equipment sizing that matches your inputs. Take this to a qualified installer to confirm and quote."
      back={back}
      primary={{ onClick: ctx.startOver, label: 'Start over', accent: true }}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel
          eyebrow={ctx.version === 'v1' ? 'Standard sizing' : 'Custom sizing'}
          title="Specification sheet"
          aside={<span className="font-mono text-[11px] text-subtle">{meta}</span>}
        >
          <SpecSheet
            spec={{
              output: data,
              system_voltage: data.system_voltage,
              battery_capacity: data.battery_capacity,
              solar_panel_watt: data.solar_panel_watt,
            }}
          />
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel eyebrow="Consumption" title="Energy breakdown" bare={false}>
            <EnergyBreakdown items={items} />
          </Panel>

          <Panel eyebrow="Reference" title="Model assumptions">
            <dl className="flex flex-col">
              {ASSUMPTIONS.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between border-b border-line py-2.5 text-sm last:border-b-0"
                >
                  <dt className="text-muted">{label}</dt>
                  <dd className="num text-fg">{value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
      </div>
    </WizardShell>
  )
}
