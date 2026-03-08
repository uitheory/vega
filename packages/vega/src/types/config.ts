import type { GridNode, ViewNode } from "./nodes.js"

/** Configuration for a grid view */
export type GridConfig<C extends string = string> = GridNode<C>

/** Configuration for a view */
export type ViewConfig<C extends string = string> = ViewNode<C>

/** Default settings for a config module */
export interface DefaultsConfig {
  pageSize?: number
  [key: string]: unknown
}

/** Standard shape exported by every config module */
export interface ModuleConfig<C extends string = string> {
  grid: GridConfig<C>
  panel: ViewConfig<C>
  dashboard: ViewConfig<C>
  defaults: DefaultsConfig
}
