import { createElement, type ReactElement, type ReactNode } from "react"
import {
  resolveComponentProps,
  isVegaFn,
  type AnyNode,
  type ViewNode,
  type GridNode,
  type MenuNode,
  type MenuItemNode,
  type ComponentNode,
} from "vega"
import type { RendererConfig, RenderContext } from "./types.js"

const noop = () => {}

/**
 * A typed renderer that walks a Vega node tree and maps each node
 * to the registered React component.
 */
export interface Renderer<C extends string> {
  /** Render a Vega node tree to a React element */
  render(tree: AnyNode<C>, context?: RenderContext): ReactElement
}

function renderNode<C extends string>(
  node: AnyNode<C>,
  config: RendererConfig<C>,
  context: RenderContext,
  key?: string | number,
): ReactElement | null {
  const state = context.state ?? {}
  const setState = context.setState ?? noop

  switch (node.type) {
    case "view":
      return renderView(node, config, context, key)
    case "grid":
      return renderGrid(node, config, context, state, setState, key)
    case "menu":
      return renderMenu(node, config, context, key)
    case "component":
      return renderComponent(node, config, context, state, setState, key)
    default:
      return null
  }
}

function renderView<C extends string>(
  node: ViewNode<C>,
  config: RendererConfig<C>,
  context: RenderContext,
  key?: string | number,
): ReactElement {
  const state = context.state ?? {}
  const setState = context.setState ?? noop

  const children: ReactNode[] | undefined = node.children?.map((child, i) =>
    renderNode(child, config, context, i),
  )

  return createElement(
    config.view,
    { key, node: node as ViewNode, context, state, setState },
    ...(children ?? []),
  )
}

function renderGrid<C extends string>(
  node: GridNode<C>,
  config: RendererConfig<C>,
  context: RenderContext,
  state: Record<string, unknown>,
  setState: (state: Partial<Record<string, unknown>>) => void,
  key?: string | number,
): ReactElement {
  return createElement(config.grid, {
    key,
    node: node as GridNode,
    context,
    state,
    setState,
    components: config.components,
  })
}

/** Recursively collect item children, wrapping each item's children in a keyed div */
function collectItemChildren<C extends string>(
  items: MenuItemNode<C>[],
  config: RendererConfig<C>,
  context: RenderContext,
): ReactNode[] {
  return items.flatMap((item) => {
    const results: ReactNode[] = []
    if (item.children?.length) {
      const rendered = item.children.map((child, j) =>
        renderNode(child, config, context, j),
      )
      results.push(
        createElement("div", { key: item.key, "data-item-key": item.key }, ...rendered),
      )
    }
    if (item.items?.length) {
      results.push(...collectItemChildren(item.items, config, context))
    }
    return results
  })
}

function renderMenu<C extends string>(
  node: MenuNode<C>,
  config: RendererConfig<C>,
  context: RenderContext,
  key?: string | number,
): ReactElement {
  const state = context.state ?? {}
  const setState = context.setState ?? noop

  // Group children per item for active-item filtering
  const groupedChildren = collectItemChildren(node.items, config, context)

  return createElement(
    config.menu,
    { key, node: node as MenuNode, context, state, setState },
    ...(groupedChildren.length > 0 ? groupedChildren : []),
  )
}

function renderComponent<C extends string>(
  node: ComponentNode<C>,
  config: RendererConfig<C>,
  context: RenderContext,
  _state: Record<string, unknown>,
  setState: (state: Partial<Record<string, unknown>>) => void,
  key?: string | number,
): ReactElement | null {
  const Comp = (config.components as Record<string, typeof config.components[C]>)[
    node.name
  ]
  if (!Comp) return null

  // Resolve props and wire events as callbacks
  const resolved = resolveComponentProps(node.props, context.data) ?? {}
  const events = node.events ?? []
  const flatProps: Record<string, unknown> = { key }

  for (const [propKey, value] of Object.entries(resolved)) {
    if (events.includes(propKey)) {
      // Event prop: wrap state patch or VegaFn as callback
      if (isVegaFn(value)) {
        flatProps[propKey] = () => setState(value(context.data) as Record<string, unknown>)
      } else if (typeof value === "object" && value !== null) {
        flatProps[propKey] = () => setState(value as Record<string, unknown>)
      }
    } else {
      flatProps[propKey] = value
    }
  }

  return createElement(Comp, flatProps)
}

/**
 * Create a typed renderer from a component map.
 * The renderer walks Vega node trees and renders the registered React component
 * for each node type. Fields are rendered by looking up their `.component` name
 * in the `components` map.
 *
 * @example
 * ```ts
 * const renderer = createRenderer({
 *   view: MyViewComponent,
 *   grid: MyGridComponent,
 *   menu: MyMenuComponent,
 *   components: {
 *     label: LabelComponent,
 *     badge: BadgeComponent,
 *   },
 * })
 *
 * // TypeScript ensures tree only uses registered components
 * renderer.render(config, { data, state, setState })
 * ```
 */
export function createRenderer<C extends string>(
  config: RendererConfig<C>,
): Renderer<C> {
  return {
    render(tree: AnyNode<C>, context: RenderContext = {}): ReactElement {
      return renderNode(tree, config, context)!
    },
  }
}
