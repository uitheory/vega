import type { ComponentType, ReactNode } from "react"
import type {
  ViewProps,
  GridProps,
  MenuProps,
  Context,
} from "vega"

/** A React component that renders a Vega node type */
export type VegaComponent<TProps> = ComponentType<TProps>

/** Configuration map for {@link createRenderer} */
export type RendererConfig<C extends string> = {
  /** Component that renders `view` nodes */
  view: VegaComponent<ViewProps & { children?: ReactNode }>
  /** Component that renders `grid` nodes */
  grid: VegaComponent<GridProps>
  /** Component that renders `menu` nodes */
  menu: VegaComponent<MenuProps & { children?: ReactNode }>
} & { [K in C]: ComponentType<any> }

/** Runtime context passed to {@link Renderer.render} */
export interface RenderContext extends Context {
  state?: Record<string, unknown>
  setState?: (state: Partial<Record<string, unknown>>) => void
}

/** A function that fetches data given resolved params */
export type SourceFetcher = (
  params: Record<string, unknown>,
) => Promise<unknown>
