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

/** Individual menu item. `C` propagates through children. */
export interface MenuItemNode<C extends string = string> {
  key: string
  label?: string
  icon?: string
  items?: MenuItemNode<C>[]
  children?: ComponentNode<C>[]
}

/**
 * The universal node primitive.
 * Every node in the tree is a ComponentNode — structural (view, grid, menu)
 * and leaf (label, button, etc.) alike.
 *
 * `C` tracks which component names are used for compile-time renderer validation.
 */
export interface ComponentNode<C extends string = string> extends BaseNode {
  type: "component"
  name: C
  props?: Record<string, unknown>
  /** Event prop names — the renderer wraps these as callbacks */
  events?: readonly string[]
  /** Child nodes for structural components */
  children?: ComponentNode<C>[]
  /** Local state for this node */
  state?: Record<string, unknown>
  /** Data source descriptor */
  source?: SourceDescriptor
}

/** Union of all node types — now just ComponentNode */
export type AnyNode<C extends string = string> = ComponentNode<C>

/** @deprecated Use ComponentNode directly */
export type ViewNode<C extends string = string> = ComponentNode<C>

/** @deprecated Use ComponentNode directly */
export type GridNode<C extends string = string> = ComponentNode<C>

/** @deprecated Use ComponentNode directly */
export type MenuNode<C extends string = string> = ComponentNode<C>
