import type { ZodType, ZodTypeDef } from "zod"
import type { ComponentNode, DynamicProps } from "../types/nodes.js"

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
  /** Event prop names — the renderer wraps these as callbacks */
  readonly events?: readonly string[]
  /** Brand to prevent structural overlap */
  readonly _brand: "ComponentDef"
  /** Create a ComponentNode from this definition */
  create(props?: DynamicProps<any, NoInfer<TProps>>): ComponentNode<TName>
  create(id: string, props?: DynamicProps<any, NoInfer<TProps>>): ComponentNode<TName>
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
 *
 * @example
 * ```ts
 * // With events
 * const Button = defineComponent<"button", { label: string; onClick?: Record<string, unknown> }>(
 *   "button",
 *   { events: ["onClick"] },
 * )
 * ```
 */
export function defineComponent<TName extends string, TProps>(
  name: TName,
  schema: ZodType<TProps, ZodTypeDef, unknown>,
): ComponentDef<TName, TProps>
export function defineComponent<TName extends string, TProps = Record<string, unknown>>(
  name: TName,
  options?: { events?: readonly string[] },
): ComponentDef<TName, TProps>
export function defineComponent<TName extends string, TProps>(
  name: TName,
  schemaOrOptions?: ZodType<TProps, ZodTypeDef, unknown> | { events?: readonly string[] },
): ComponentDef<TName, TProps> {
  const isZod = schemaOrOptions && "parse" in schemaOrOptions
  const events = !isZod && schemaOrOptions?.events ? schemaOrOptions.events : undefined
  return {
    name,
    ...(isZod ? { schema: schemaOrOptions } : {}),
    ...(events ? { events } : {}),
    _brand: "ComponentDef" as const,
    create(
      idOrProps?: string | Record<string, unknown>,
      maybeProps?: Record<string, unknown>,
    ): ComponentNode<TName> {
      const id = typeof idOrProps === "string" ? idOrProps : undefined
      const props = typeof idOrProps === "string" ? maybeProps : (idOrProps as Record<string, unknown> | undefined)
      const node = { type: "component" as const, name } as ComponentNode<TName>
      if (id) node.id = id
      if (props) node.props = props
      if (events?.length) node.events = events
      return node
    },
  } as ComponentDef<TName, TProps>
}
