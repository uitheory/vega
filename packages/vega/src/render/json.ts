import type { AnyNode } from "../types/nodes.js"

interface Buildable<C extends string = string> {
  build(): AnyNode<C>
}

function isBuildable(value: unknown): value is Buildable {
  return (
    typeof value === "object" &&
    value !== null &&
    "build" in value &&
    typeof (value as Buildable).build === "function"
  )
}

/**
 * Render a builder or node tree to a plain JSON-compatible object.
 * Useful for snapshot testing.
 *
 * @example
 * ```ts
 * import { renderToJson } from "vega/test"
 * const json = renderToJson(myView)
 * expect(json).toMatchSnapshot()
 * ```
 */
export function renderToJson<C extends string = string>(
  input: AnyNode<C> | Buildable<C>,
): AnyNode<C> {
  if (isBuildable(input)) {
    return input.build() as AnyNode<C>
  }
  return input
}
