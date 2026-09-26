import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { calculateV1, calculateV2 } from '../../api/calculate'
import type {
  V1CalculationIn,
  V1CalculationOut,
  V2CalculationIn,
  V2CalculationOut,
} from '../../api/types'
import { ApiError, type ApiIssue } from '../../api/client'
import { issueToPath } from '../../lib/serverErrors'
import {
  TOP_LEVEL_FIELDS_V1,
  TOP_LEVEL_FIELDS_V2,
  WIZARD_STEPS,
  type WizardStepSlug,
} from '../../lib/stepFields'
import { blankItem, v1Schema, v2Schema, type V1Form, type V2Form } from '../../lib/schemas'
import { clearDraft, readDraft, useCalculatorDraft } from '../../lib/useCalculatorDraft'
import { Stepper } from './Stepper'

/**
 * Shared context each step can read. The `form` union is discriminated by
 * `version` so a step can narrow safely: `if (ctx.version === 'v1') ctx.form ...`.
 */
export type WizardContext =
  | {
      version: 'v1'
      form: UseFormReturn<V1Form>
      mutation: UseMutationResult<V1CalculationOut, unknown, V1CalculationIn>
      issues: ApiIssue[]
      errorMessage: string
      completed: Set<WizardStepSlug>
      markComplete: (step: WizardStepSlug) => void
      clearCompleted: () => void
      runCalculation: () => void
      startOver: () => void
    }
  | {
      version: 'v2'
      form: UseFormReturn<V2Form>
      mutation: UseMutationResult<V2CalculationOut, unknown, V2CalculationIn>
      issues: ApiIssue[]
      errorMessage: string
      completed: Set<WizardStepSlug>
      markComplete: (step: WizardStepSlug) => void
      clearCompleted: () => void
      runCalculation: () => void
      startOver: () => void
    }

const V1_DEFAULTS: V1Form = {
  backup_time: 6,
  battery_capacity: 200,
  system_voltage: 24,
  solar_panel_watt: 400,
  items: [{ ...blankItem }],
}

const V2_DEFAULTS: V2Form = {
  system_voltage: 24,
  battery_capacity: 200,
  solar_panel_watt: 400,
  items: [{ ...blankItem }],
}

/** Redirects direct navigation to spec/loads without first completing earlier steps. */
function useStepGuard(
  version: 'v1' | 'v2',
  completed: Set<WizardStepSlug>,
) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    const currentSlug = WIZARD_STEPS.find((s) => pathname.endsWith(`/${s.slug}`))?.slug
    if (!currentSlug || currentSlug === 'system') return
    if (currentSlug === 'loads' && !completed.has('system')) {
      navigate(`/${version}/system`, { replace: true })
    }
    if (currentSlug === 'spec' && (!completed.has('system') || !completed.has('loads'))) {
      const target = completed.has('system') ? 'loads' : 'system'
      navigate(`/${version}/${target}`, { replace: true })
    }
  }, [pathname, completed, version, navigate])
}

function useCompletedSteps() {
  const [completed, setCompleted] = useState<Set<WizardStepSlug>>(new Set())
  const markComplete = useCallback((step: WizardStepSlug) => {
    setCompleted((prev) => {
      if (prev.has(step)) return prev
      const next = new Set(prev)
      next.add(step)
      return next
    })
  }, [])
  const clearCompleted = useCallback(() => setCompleted(new Set()), [])
  return { completed, markComplete, clearCompleted }
}

export function V1Wizard() {
  const draft = useMemo(() => readDraft<V1Form>('v1'), [])
  const form = useForm<V1Form>({
    resolver: zodResolver(v1Schema),
    defaultValues: draft ?? V1_DEFAULTS,
    mode: 'onBlur',
  })
  useCalculatorDraft('v1', form)

  const { completed, markComplete, clearCompleted } = useCompletedSteps()
  const [issues, setIssues] = useState<ApiIssue[]>([])
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: calculateV1,
    retry: false,
    onMutate: () => setIssues([]),
    onError: (error) => {
      if (!(error instanceof ApiError)) return
      const unplaced: ApiIssue[] = []
      for (const issue of error.issues) {
        const path = issueToPath(issue, TOP_LEVEL_FIELDS_V1)
        if (path) form.setError(path as never, { type: 'server', message: issue.msg })
        else unplaced.push(issue)
      }
      setIssues(unplaced)
    },
  })

  const runCalculation = useCallback(() => {
    mutation.mutate(form.getValues())
  }, [mutation, form])

  const startOver = useCallback(() => {
    clearDraft('v1')
    form.reset(V1_DEFAULTS)
    clearCompleted()
    mutation.reset()
    navigate('/v1/system')
  }, [form, clearCompleted, mutation, navigate])

  useStepGuard('v1', completed)

  const errorMessage = deriveErrorMessage(mutation.error, issues)
  const ctx: WizardContext = {
    version: 'v1',
    form,
    mutation,
    issues,
    errorMessage,
    completed,
    markComplete,
    clearCompleted,
    runCalculation,
    startOver,
  }

  return (
    <FormProvider {...form}>
      <Frame version="v1" completed={completed}>
        <Outlet context={ctx} />
      </Frame>
    </FormProvider>
  )
}

export function V2Wizard() {
  const draft = useMemo(() => readDraft<V2Form>('v2'), [])
  const form = useForm<V2Form>({
    resolver: zodResolver(v2Schema),
    defaultValues: draft ?? V2_DEFAULTS,
    mode: 'onBlur',
  })
  useCalculatorDraft('v2', form)

  const { completed, markComplete, clearCompleted } = useCompletedSteps()
  const [issues, setIssues] = useState<ApiIssue[]>([])
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: calculateV2,
    retry: false,
    onMutate: () => setIssues([]),
    onError: (error) => {
      if (!(error instanceof ApiError)) return
      const unplaced: ApiIssue[] = []
      for (const issue of error.issues) {
        const path = issueToPath(issue, TOP_LEVEL_FIELDS_V2)
        if (path) form.setError(path as never, { type: 'server', message: issue.msg })
        else unplaced.push(issue)
      }
      setIssues(unplaced)
    },
  })

  const runCalculation = useCallback(() => {
    mutation.mutate(form.getValues())
  }, [mutation, form])

  const startOver = useCallback(() => {
    clearDraft('v2')
    form.reset(V2_DEFAULTS)
    clearCompleted()
    mutation.reset()
    navigate('/v2/system')
  }, [form, clearCompleted, mutation, navigate])

  useStepGuard('v2', completed)

  const errorMessage = deriveErrorMessage(mutation.error, issues)
  const ctx: WizardContext = {
    version: 'v2',
    form,
    mutation,
    issues,
    errorMessage,
    completed,
    markComplete,
    clearCompleted,
    runCalculation,
    startOver,
  }

  return (
    <FormProvider {...form}>
      <Frame version="v2" completed={completed}>
        <Outlet context={ctx} />
      </Frame>
    </FormProvider>
  )
}

function Frame({
  version,
  completed,
  children,
}: {
  version: 'v1' | 'v2'
  completed: Set<WizardStepSlug>
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <Stepper version={version} completed={completed} />
      {children}
    </div>
  )
}

function deriveErrorMessage(error: unknown, unplaced: ApiIssue[]): string {
  if (!error) return ''
  if (error instanceof ApiError) {
    if (error.status === 0) return error.message // network failure
    if (error.issues.length > 0 && unplaced.length === 0) {
      return 'Some inputs need attention. Check the highlighted fields.'
    }
    return error.message
  }
  return 'Something went wrong. Please try again.'
}
