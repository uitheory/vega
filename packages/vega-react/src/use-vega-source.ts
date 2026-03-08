import { useState, useEffect, useRef } from "react"
import type { SourceDescriptor, SourceParam, Context } from "vega"
import type { SourceFetcher } from "./types.js"

/** Result returned by {@link useVegaSource} */
export interface UseVegaSourceResult {
  data: unknown
  loading: boolean
  error: Error | null
}

/**
 * Resolve a single source param against state and context.
 * `$`-prefixed binds resolve from state, others from context.
 */
function resolveParam(
  param: SourceParam,
  state: Record<string, unknown>,
  context: Context,
): unknown {
  if (typeof param === "object" && param !== null && "bind" in param) {
    const path = param.bind
    return path.startsWith("$") ? state[path] : context[path]
  }
  return param
}

/**
 * Resolves source params, calls the matching fetcher, and refetches
 * when bound state params change.
 *
 * @example
 * ```ts
 * const { data, loading, error } = useVegaSource(
 *   config.source,
 *   state,
 *   context,
 *   { accounts: (params) => fetchAccounts(params) },
 * )
 * ```
 */
export function useVegaSource(
  source: SourceDescriptor | undefined,
  state: Record<string, unknown>,
  context: Context,
  fetchers: Record<string, SourceFetcher>,
): UseVegaSourceResult {
  const [data, setData] = useState<unknown>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const requestIdRef = useRef(0)
  const fetchersRef = useRef(fetchers)
  fetchersRef.current = fetchers

  // Resolve all params
  const resolvedParams: Record<string, unknown> = {}
  if (source) {
    for (const [key, param] of Object.entries(source.params)) {
      resolvedParams[key] = resolveParam(param, state, context)
    }
  }

  const paramsKey = JSON.stringify(resolvedParams)
  const sourceKey = source?.key

  useEffect(() => {
    if (!sourceKey) return

    const fetcher = fetchersRef.current[sourceKey]
    if (!fetcher) return

    const id = ++requestIdRef.current
    setLoading(true)
    setError(null)

    fetcher(JSON.parse(paramsKey) as Record<string, unknown>)
      .then((result) => {
        if (requestIdRef.current === id) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (requestIdRef.current === id) {
          setError(err instanceof Error ? err : new Error(String(err)))
          setLoading(false)
        }
      })
  }, [sourceKey, paramsKey])

  return { data, loading, error }
}
