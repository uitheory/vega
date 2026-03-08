/** Primitive types that terminate dot-notation recursion */
export type Primitive = string | number | boolean | null | undefined

/**
 * Generates a union of dot-notation string paths for type `T`.
 *
 * @example
 * ```ts
 * type Account = { name: string; owner: { first: string; last: string } }
 * type Paths = DotNotation<Account>
 * // "name" | "owner" | "owner.first" | "owner.last"
 * ```
 */
export type DotNotation<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Primitive
    ? K
    : T[K] extends Array<unknown>
      ? K
      : T[K] extends object
        ? K | `${K}.${DotNotation<T[K]>}`
        : K
  : never
