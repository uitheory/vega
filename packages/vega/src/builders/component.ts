import type { ZodType, ZodTypeDef } from "zod"

/**
 * A typed component definition token.
 * Created via `Component.define()` and consumed by `.component()` on builders.
 *
 * `TName` captures the literal component name for compile-time renderer validation.
 * `TProps` captures the shape of the component's props.
 */
export interface ComponentDef<
  TName extends string = string,
  TProps = Record<string, unknown>,
> {
  /** Unique component name used as a lookup key by renderers */
  readonly name: TName
  /** Optional Zod schema for runtime validation */
  readonly schema?: ZodType<TProps, ZodTypeDef, unknown>
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
 * ```
 *
 * @example
 * ```ts
 * // Type-only, no runtime schema
 * const Label = defineComponent<"label", { text: string }>("label")
 * ```
 */
export function defineComponent<TName extends string, TProps>(
  name: TName,
  schema: ZodType<TProps, ZodTypeDef, unknown>,
): ComponentDef<TName, TProps>
export function defineComponent<TName extends string, TProps = Record<string, unknown>>(
  name: TName,
): ComponentDef<TName, TProps>
export function defineComponent<TName extends string, TProps>(
  name: TName,
  schema?: ZodType<TProps, ZodTypeDef, unknown>,
): ComponentDef<TName, TProps> {
  return {
    name,
    ...(schema ? { schema } : {}),
    _brand: "ComponentDef" as const,
  } as ComponentDef<TName, TProps>
}
