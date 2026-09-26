const DEFAULT_BASE_URL = 'https://watt-wise-2cfq.onrender.com'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(
  /\/+$/,
  '',
)

/** One entry of a 422 `detail` array. `loc` is e.g. ["body", "items", "0", "quantity"]. */
export type ApiIssue = {
  loc: string[]
  msg: string
  type?: string
}

export class ApiError extends Error {
  readonly status: number
  readonly issues: ApiIssue[]

  constructor(status: number, message: string, issues: ApiIssue[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.issues = issues
  }
}

function toIssues(detail: unknown[]): ApiIssue[] {
  return detail.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return []
    const { loc, msg, type } = entry as Record<string, unknown>
    return [
      {
        loc: Array.isArray(loc) ? loc.map(String) : [],
        msg: typeof msg === 'string' ? msg : 'Invalid value',
        type: typeof type === 'string' ? type : undefined,
      },
    ]
  })
}

function toApiError(status: number, body: unknown): ApiError {
  const detail = body && typeof body === 'object' ? (body as { detail?: unknown }).detail : undefined

  if (Array.isArray(detail)) {
    return new ApiError(status, 'The API rejected some values.', toIssues(detail))
  }
  if (typeof detail === 'string' && detail) {
    return new ApiError(status, `${detail} (HTTP ${status})`)
  }
  if (status >= 500) {
    return new ApiError(status, `The API had a server error (HTTP ${status}). Try again shortly.`)
  }
  return new ApiError(status, `Request failed (HTTP ${status}).`)
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError(
      0,
      `Could not reach the API at ${API_BASE_URL}. Check your connection and try again.`,
    )
  }

  const text = await res.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = null
    }
  }

  if (!res.ok) throw toApiError(res.status, body)
  return body as T
}
