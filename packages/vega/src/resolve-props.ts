/**
 * Resolve a component props object by calling any function-valued props with the given data.
 * Static values pass through unchanged.
 */
export function resolveComponentProps(
  props: Record<string, unknown> | undefined,
  data: unknown,
): Record<string, unknown> | undefined {
  if (!props) return undefined
  const resolved: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    resolved[key] = typeof value === "function" ? value(data) : value
  }
  return resolved
}
