import { createElement, type ComponentType, type ReactElement, type ReactNode } from "react"
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
const STRUCTURAL_KEYS = new Set(["view", "grid", "menu"])

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
  components: Record<string, ComponentType<any>>,
  context: RenderContext,
  key?: string | number,
): ReactElement | null {
  const state = context.state ?? {}
  const setState = context.setState ?? noop

  switch (node.type) {
    case "view":
      return renderView(node, config, components, context, key)
    case "grid":
      return renderGrid(node, config, components, context, state, setState, key)
    case "menu":
      return renderMenu(node, config, components, context, key)
    case "component":
      return renderComponent(node, components, context, state, setState, key)
    default:
      return null
  }
}

function renderView<C extends string>(
  node: ViewNode<C>,
  config: RendererConfig<C>,
  components: Record<string, ComponentType<any>>,
  context: RenderContext,
  key?: string | number,
): ReactElement {
  const state = context.state ?? {}
  const setState = context.setState ?? noop

  const children: ReactNode[] | undefined = node.children?.map((child, i) =>
    renderNode(child, config, components, context, i),
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
  components: Record<string, ComponentType<any>>,
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
    components,
  })
}

/** Recursively collect item children, wrapping each item's children in a keyed div */
function collectItemChildren<C extends string>(
  items: MenuItemNode<C>[],
  config: RendererConfig<C>,
  components: Record<string, ComponentType<any>>,
  context: RenderContext,
): ReactNode[] {
  return items.flatMap((item) => {
    const results: ReactNode[] = []
    if (item.children?.length) {
      const rendered = item.children.map((child, j) =>
        renderNode(child, config, components, context, j),
      )
      results.push(
        createElement("div", { key: item.key, "data-item-key": item.key }, ...rendered),
      )
    }
    if (item.items?.length) {
      results.push(...collectItemChildren(item.items, config, components, context))
    }
    return results
  })
}

function renderMenu<C extends string>(
  node: MenuNode<C>,
  config: RendererConfig<C>,
  components: Record<string, ComponentType<any>>,
  context: RenderContext,
  key?: string | number,
): ReactElement {
  const state = context.state ?? {}
  const setState = context.setState ?? noop

  // Group children per item for active-item filtering
  const groupedChildren = collectItemChildren(node.items, config, components, context)

  return createElement(
    config.menu,
    { key, node: node as MenuNode, context, state, setState },
    ...(groupedChildren.length > 0 ? groupedChildren : []),
  )
}

function renderComponent<C extends string>(
  node: ComponentNode<C>,
  components: Record<string, ComponentType<any>>,
  context: RenderContext,
  _state: Record<string, unknown>,
  setState: (state: Partial<Record<string, unknown>>) => void,
  key?: string | number,
): ReactElement | null {
  const Comp = components[node.name]
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
 * Create a typed renderer from a flat component map.
 * Structural keys (`view`, `grid`, `menu`) map to layout renderers.
 * All other keys are named components looked up by `ComponentNode.name`.
 *
 * @example
 * ```ts
 * const renderer = createRenderer({
 *   view: MyViewComponent,
 *   grid: MyGridComponent,
 *   menu: MyMenuComponent,
 *   label: LabelComponent,
 *   badge: BadgeComponent,
 * })
 *
 * // TypeScript ensures tree only uses registered components
 * renderer.render(config, { data, state, setState })
 * ```
 */
export function createRenderer<C extends string>(
  config: RendererConfig<C>,
): Renderer<C> {
  const components: Record<string, ComponentType<any>> = {}
  for (const key of Object.keys(config)) {
    if (!STRUCTURAL_KEYS.has(key)) {
      components[key] = (config as Record<string, any>)[key]
    }
  }

  return {
    render(tree: AnyNode<C>, context: RenderContext = {}): ReactElement {
      return renderNode(tree, config, components, context)!
    },
  }
}
