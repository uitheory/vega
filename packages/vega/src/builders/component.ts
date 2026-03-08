import type { ZodType, ZodTypeDef } from "zod"

/**
 * A typed component definition token.
 * Created via `Component.define()` and consumed by `.component()` on field builders.
 *
 * `TName` captures the literal component name for compile-time renderer validation.
 * `TProps` captures the shape of the component's props as inferred from a Zod schema.
 */
export interface ComponentDef<
  TName extends string = string,
  TProps = Record<string, unknown>,
> {
  /** Unique component name used as a lookup key by renderers */
  readonly name: TName
  /** The Zod schema (kept for runtime validation if needed) */
  readonly schema: ZodType<TProps, ZodTypeDef, unknown>
  /** Brand to prevent structural overlap */
  readonly _brand: "ComponentDef"
}

/**
 * Define a named component with a typed props schema.
 *
 * @example
 * ```ts
 * import { z } from "zod"
 * const Badge = defineComponent("badge", z.object({
 *   value: z.string(),
 *   color: z.enum(["red", "green", "yellow"]),
 * }))
 * // Badge is ComponentDef<"badge", { value: string; color: "red" | "green" | "yellow" }>
 * ```
 */
export function defineComponent<TName extends string, TProps>(
  name: TName,
  schema: ZodType<TProps, ZodTypeDef, unknown>,
): ComponentDef<TName, TProps> {
  return {
    name,
    schema,
    _brand: "ComponentDef" as const,
  }
}
