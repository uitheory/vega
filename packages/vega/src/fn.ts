/**
 * A callable function with serialization support.
 * Structurally compatible with plain function types, so it can be used
 * anywhere a function is expected (valueFormatter, comparator, DynamicProps).
 *
 * Serializes to `{ __fn: "name" }` via `toJSON()`, enabling JSON round-trips.
 */
export interface VegaFn<TArgs extends unknown[] = unknown[], TReturn = unknown> {
  (...args: TArgs): TReturn
  readonly _brand: "VegaFn"
  readonly _name: string
  toJSON(): { __fn: string }
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const registry = new Map<string, VegaFn>()

/**
 * Register a named function. Returns a VegaFn that is directly callable
 * and serializes to `{ __fn: name }` via `toJSON()`.
 *
 * Throws if a function with the same name is already registered.
 */
export function register<TArgs extends unknown[], TReturn>(
  name: string,
  fn: (...args: TArgs) => TReturn,
): VegaFn<TArgs, TReturn> {
  if (registry.has(name)) {
    throw new Error(`VegaFn "${name}" is already registered`)
  }
  const vegaFn = Object.assign(
    (...args: TArgs): TReturn => fn(...args),
    {
      _brand: "VegaFn" as const,
      _name: name,
      toJSON: () => ({ __fn: name }),
    },
  )
  registry.set(name, vegaFn as VegaFn)
  return vegaFn
}

/** Look up a registered VegaFn by name. */
export function resolve(name: string): VegaFn | undefined {
  return registry.get(name)
}

/** Runtime type guard for VegaFn instances. */
export function isVegaFn(value: unknown): value is VegaFn {
  return (
    typeof value === "function" &&
    "_brand" in value &&
    (value as VegaFn)._brand === "VegaFn"
  )
}

/**
 * Walk a JSON-parsed tree, replacing `{ __fn: "name" }` sentinel objects
 * (single-key objects) with the corresponding registered VegaFn.
 *
 * Throws if a referenced function is not registered.
 */
export function deserialize<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(deserialize) as T
  }
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj)
    if (keys.length === 1 && keys[0] === "__fn" && typeof obj.__fn === "string") {
      const fn = registry.get(obj.__fn)
      if (!fn) {
        throw new Error(`VegaFn "${obj.__fn}" not found in registry`)
      }
      return fn as T
    }
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      result[k] = deserialize(v)
    }
    return result as T
  }
  return value
}

/** @internal Clear all registered functions. For testing only. */
export function clearRegistry(): void {
  registry.clear()
}

// ---------------------------------------------------------------------------
// Built-in Comparators
// ---------------------------------------------------------------------------

export const Comparators = {
  number: register<[unknown, unknown], number>(
    "builtin:comparator:number",
    (a, b) => Number(a) - Number(b),
  ),
  string: register<[unknown, unknown], number>(
    "builtin:comparator:string",
    (a, b) => String(a).localeCompare(String(b)),
  ),
  date: register<[unknown, unknown], number>(
    "builtin:comparator:date",
    (a, b) => new Date(String(a)).getTime() - new Date(String(b)).getTime(),
  ),
  boolean: register<[unknown, unknown], number>(
    "builtin:comparator:boolean",
    (a, b) => Number(a) - Number(b),
  ),
} as const

// ---------------------------------------------------------------------------
// Built-in Formatters
// ---------------------------------------------------------------------------

export const Formatters = {
  currency: register<[unknown], string>(
    "builtin:formatter:currency",
    (value) => "$" + Number(value).toLocaleString(),
  ),
  percent: register<[unknown], string>(
    "builtin:formatter:percent",
    (value) => Number(value) + "%",
  ),
  number: register<[unknown], string>(
    "builtin:formatter:number",
    (value) => Number(value).toLocaleString(),
  ),
} as const
