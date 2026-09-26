import { useNavigate, useOutletContext } from 'react-router'
import { useWatch, type Control } from 'react-hook-form'
import { ItemsTable } from '../ItemsTable'
import { Panel } from '../Panel'
import { WizardShell } from './WizardShell'
import type { WizardContext } from './CalculatorWizard'
import type { V1Form } from '../../lib/schemas'

export function LoadsStep() {
  const ctx = useOutletContext<WizardContext>()
  const navigate = useNavigate()

  // v1 shares one backup time across every appliance; we read it live for the totals bar.
  // v2's form has no backup_time so we widen the control before subscribing.
  const sharedHours = useWatch({
    control: ctx.form.control as unknown as Control<V1Form>,
    name: 'backup_time',
  })

  const onContinue = async () => {
    const valid = await ctx.form.trigger('items' as never)
    if (!valid) return
    ctx.markComplete('loads')
    navigate(`/${ctx.version}/spec`)
  }

  const description =
    ctx.version === 'v1'
      ? 'Add every appliance you want to run during an outage. Set the quantity and wattage for each — they will all run for the backup time you set on the previous step.'
      : 'Add every appliance you want to run and set its own daily runtime. Fridges, freezers and comfort loads usually run longer than lights or a TV.'

  return (
    <WizardShell
      version={ctx.version}
      currentStep="loads"
      title="Add your loads"
      description={description}
      back={{ to: `/${ctx.version}/system`, label: 'Back to system', labelShort: 'Back' }}
      primary={{ onClick: onContinue, label: 'Review specification', labelShort: 'Review' }}
    >
      <Panel eyebrow="Loads" title="Appliances" bare={false}>
        <ItemsTable
          withBackupTime={ctx.version === 'v2'}
          sharedHours={ctx.version === 'v1' ? sharedHours : undefined}
        />
      </Panel>
    </WizardShell>
  )
}
