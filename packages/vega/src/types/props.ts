import type {
  ViewNode,
  GridNode,
  MenuNode,
} from "./nodes.js"

/** Runtime context passed to rendered components */
export interface Context {
  data?: unknown
  [key: string]: unknown
}

/** Default state bag type */
export type State = Record<string, unknown>

/** Props passed to a View component by the renderer */
export interface ViewProps<TState = State> {
  node: ViewNode
  context: Context
  state: TState
  setState: (state: Partial<TState>) => void
  children?: unknown
}

/** Props passed to a Grid component by the renderer */
export interface GridProps<TState = State> {
  node: GridNode
  context: Context
  state: TState
  setState: (state: Partial<TState>) => void
  /** Component registry — maps component names to framework components */
  components?: Record<string, unknown>
}

/** Props passed to a Menu component by the renderer */
export interface MenuProps<TState = State> {
  node: MenuNode
  context: Context
  state: TState
  setState: (state: Partial<TState>) => void
}
