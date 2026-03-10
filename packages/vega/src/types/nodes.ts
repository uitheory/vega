import type { VegaFn } from "../fn.js"

/**
 * A props object where each value is either a static value
 * or a VegaFn that resolves the value from row/record data.
 * Plain inline functions are disallowed to ensure full serializability.
 */
export type DynamicProps<T, TProps> = {
  [K in keyof TProps]: TProps[K] | VegaFn<[T], TProps[K]>
}

/**
 * Source parameter — either a literal value or a binding reference.
 * A binding reference is an object with a `bind` key pointing to a state or context path.
 */
export type SourceParam = { bind: string } | string | number | boolean

/** Descriptor for a data source — stored in the node tree as plain data */
export interface SourceDescriptor {
  key: string
  params: Record<string, SourceParam>
}

/** Base fields shared by all node types */
export interface BaseNode {
  type: string
  id?: string
}

/**
 * Field node — binds to a data path and renders via a named component.
 * `C` tracks which component names are used for compile-time renderer validation.
 */
export interface FieldNode<C extends string = string> extends BaseNode {
  type: "field"
  bind: string
  label?: string
  component?: C
  componentProps?: Record<string, unknown>
}

/**
 * View node — layout container primitive.
 * `C` propagates through children.
 */
export interface ViewNode<C extends string = string> extends BaseNode {
  type: "view"
  direction?: "row" | "column"
  gap?: number
  padding?: number
  className?: string
  state?: Record<string, unknown>
  source?: SourceDescriptor
  children?: AnyNode<C>[]
}

/**
 * Column definition within a grid.
 * `C` tracks component names used for cell rendering.
 */
export interface GridColumnNode<C extends string = string> {
  field: string
  label?: string
  /** Display format — a string hint (e.g. "currency") or a VegaFn formatter */
  format?: string | VegaFn<[value: unknown, data: unknown], string>
  sortable?: boolean
  pinned?: "left" | "right"
  width?: number
  component?: C
  componentProps?: Record<string, unknown>
  /** Custom sort comparator — must be a registered VegaFn for serializability */
  comparator?: VegaFn<[a: unknown, b: unknown], number>
  /** When true, the renderer should invert the sort direction for this column */
  invertSort?: boolean
}

/**
 * Grid node — data-aware grid with column definitions.
 * `C` propagates through columns.
 */
export interface GridNode<C extends string = string> extends BaseNode {
  type: "grid"
  columns: GridColumnNode<C>[]
  state?: Record<string, unknown>
  source?: SourceDescriptor
  defaultSort?: { field: string; direction: "asc" | "desc" }[]
  pageSize?: number
  selectable?: boolean
}

/** Individual menu item. `C` propagates through children. */
export interface MenuItemNode<C extends string = string> {
  key: string
  label?: string
  icon?: string
  items?: MenuItemNode<C>[]
  children?: AnyNode<C>[]
}

/** Menu node — navigable items rendered as tabs, sidebar, etc. */
export interface MenuNode<C extends string = string> extends BaseNode {
  type: "menu"
  items: MenuItemNode<C>[]
  state?: Record<string, unknown>
}

/** Component node — named leaf node with typed props */
export interface ComponentNode<C extends string = string> extends BaseNode {
  type: "component"
  name: C
  props?: Record<string, unknown>
  /** Event prop names — the renderer wraps these as callbacks */
  events?: readonly string[]
}

/** Union of all node types */
export type AnyNode<C extends string = string> =
  | ViewNode<C>
  | FieldNode<C>
  | GridNode<C>
  | MenuNode<C>
  | ComponentNode<C>
