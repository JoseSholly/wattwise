import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { ApiError, type ApiIssue } from '../api/client'
import { issueToPath } from './serverErrors'

/**
 * Runs a calculation and maps API 422 issues back onto the form fields they
 * point at. Anything that can't be placed on a field is returned as `issues`.
 */
export function useCalculation<TForm extends FieldValues, TBody, TOut>(
  form: UseFormReturn<TForm>,
  calculate: (body: TBody) => Promise<TOut>,
  topLevelFields: readonly string[],
) {
  const [issues, setIssues] = useState<ApiIssue[]>([])

  const mutation = useMutation({
    mutationFn: calculate,
    retry: false,
    onMutate: () => setIssues([]),
    onError: (error) => {
      if (!(error instanceof ApiError)) return
      const unplaced: ApiIssue[] = []
      for (const issue of error.issues) {
        const path = issueToPath(issue, topLevelFields)
        if (path) form.setError(path as Path<TForm>, { type: 'server', message: issue.msg })
        else unplaced.push(issue)
      }
      setIssues(unplaced)
    },
  })

  const error = mutation.error
  const message =
    error instanceof ApiError && error.issues.length > 0 && issues.length === 0
      ? 'The API rejected some values. Check the highlighted fields.'
      : (error?.message ?? '')

  return { mutation, issues, message }
}
