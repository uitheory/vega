import { useState, useCallback } from "react"

/**
 * Manages the state bag for a Vega view node.
 * Wraps React state with a merge-style updater.
 *
 * @example
 * ```ts
 * const [state, setState] = useVegaState({ $search: "", $page: 1 })
 * setState({ $search: "foo" }) // merges, keeps $page
 * ```
 */
export function useVegaState<T extends Record<string, unknown>>(
  initialState?: T,
): [T, (partial: Partial<T>) => void] {
  const [state, setRawState] = useState<T>((initialState ?? {}) as T)

  const setState = useCallback((partial: Partial<T>) => {
    setRawState((prev) => ({ ...prev, ...partial }))
  }, [])

  return [state, setState]
}
