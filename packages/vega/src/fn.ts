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

/**
 * Create a named VegaFn. Directly callable and serializes to `{ __fn: name }`
 * via `toJSON()`. Pass VegaFn instances to `fromJSON` for deserialization.
 */
export function fn<TArgs extends unknown[], TReturn>(
  name: string,
  impl: (...args: TArgs) => TReturn,
): VegaFn<TArgs, TReturn> {
  return Object.assign(
    (...args: TArgs): TReturn => impl(...args),
    {
      _brand: "VegaFn" as const,
      _name: name,
      toJSON: () => ({ __fn: name }),
    },
  )
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
 * with the corresponding VegaFn from the provided function set.
 *
 * Throws if a referenced function is not found in `fns`.
 */
export function deserialize<T>(value: T, fns: VegaFn[]): T {
  const map = new Map(fns.map((f) => [f._name, f]))
  return _walk(value, map)
}

function _walk<T>(value: T, map: Map<string, VegaFn>): T {
  if (Array.isArray(value)) {
    return value.map((v) => _walk(v, map)) as T
  }
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj)
    if (keys.length === 1 && keys[0] === "__fn" && typeof obj.__fn === "string") {
      const fn = map.get(obj.__fn)
      if (!fn) {
        throw new Error(`VegaFn "${obj.__fn}" not found in provided functions`)
      }
      return fn as T
    }
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      result[k] = _walk(v, map)
    }
    return result as T
  }
  return value
}

/**
 * Parse a JSON string and restore all `{ __fn: "name" }` sentinels
 * to live VegaFn instances from the provided function set.
 */
export function fromJSON<T>(json: string, fns: VegaFn[]): T {
  return deserialize(JSON.parse(json) as T, fns)
}

// ---------------------------------------------------------------------------
// Built-in Comparators
// ---------------------------------------------------------------------------

export const Comparators = {
  number: fn<[unknown, unknown], number>(
    "builtin:comparator:number",
    (a, b) => Number(a) - Number(b),
  ),
  string: fn<[unknown, unknown], number>(
    "builtin:comparator:string",
    (a, b) => String(a).localeCompare(String(b)),
  ),
  date: fn<[unknown, unknown], number>(
    "builtin:comparator:date",
    (a, b) => new Date(String(a)).getTime() - new Date(String(b)).getTime(),
  ),
  boolean: fn<[unknown, unknown], number>(
    "builtin:comparator:boolean",
    (a, b) => Number(a) - Number(b),
  ),
} as const

// ---------------------------------------------------------------------------
// Built-in Formatters
// ---------------------------------------------------------------------------

export const Formatters = {
  currency: fn<[unknown], string>(
    "builtin:formatter:currency",
    (value) => "$" + Number(value).toLocaleString(),
  ),
  percent: fn<[unknown], string>(
    "builtin:formatter:percent",
    (value) => Number(value) + "%",
  ),
  number: fn<[unknown], string>(
    "builtin:formatter:number",
    (value) => Number(value).toLocaleString(),
  ),
} as const

/** All built-in VegaFn instances for convenience when calling fromJSON. */
export const builtins: VegaFn[] = [
  ...Object.values(Comparators),
  ...Object.values(Formatters),
]
