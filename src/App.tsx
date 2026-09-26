import { useMutation } from '@tanstack/react-query'
import { ApplianceForm } from './components/ApplianceForm'
import { EmptyState, ErrorState, LoadingState } from './components/states'
import type { ApplianceListInput } from './lib/applianceSchema'

/**
 * Placeholder for the real call. When src/api/ is written against the
 * Inverter_power_project serializers, only this function body changes —
 * the states below are already wired to the mutation.
 */
async function sizeSystem(_input: ApplianceListInput): Promise<never> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  if (!baseUrl) {
    throw new Error(
      'VITE_API_BASE_URL is not set. Copy .env.example to .env and point it at the API.',
    )
  }
  throw new Error(
    'The API client is not wired up yet — no endpoint has been called. This pass is UI only.',
  )
}

export default function App() {
  const mutation = useMutation({
    mutationFn: sizeSystem,
    retry: false,
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Watt Wise</h1>
          <p className="mt-1 text-sm text-slate-600">
            Size an inverter, battery bank, solar array and charge controller from the
            appliances you want to run.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <section aria-labelledby="appliances-heading" className="mb-8">
          <h2 id="appliances-heading" className="mb-3 text-base font-semibold text-slate-800">
            Your appliances
          </h2>
          <ApplianceForm
            onSubmit={(values) => mutation.mutate(values)}
            isSubmitting={mutation.isPending}
          />
        </section>

        <section aria-labelledby="results-heading">
          <h2 id="results-heading" className="mb-3 text-base font-semibold text-slate-800">
            Results
          </h2>

          {mutation.isPending && <LoadingState />}

          {mutation.isError && (
            <ErrorState
              message={mutation.error.message}
              onRetry={() => mutation.reset()}
            />
          )}

          {mutation.isIdle && <EmptyState />}

          {/* Success branch renders once the response shape is known from the serializers. */}
        </section>
      </main>
    </div>
  )
}
