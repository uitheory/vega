import type { DotNotation } from "../types/dot-notation.js"
import type {
  DynamicProps,
  GridNode,
  GridColumnNode,
  SourceDescriptor,
} from "../types/nodes.js"
import type { VegaFn } from "../fn.js"
import type { ComponentDef } from "./component.js"
import { SourceBuilder } from "./source.js"

/**
 * Fluent sub-builder for a single grid column.
 * `C` accumulates component name literals across the entire grid column chain.
 */
export class ColumnBuilder<T = unknown, C extends string = never> {
  /** @internal */
  _field: string
  private _label?: string
  private _format?: string | VegaFn<[value: unknown, data: unknown], string>
  private _sortable?: boolean
  private _pinned?: "left" | "right"
  private _width?: number
  private _component?: string
  private _componentProps?: Record<string, unknown>
  private _comparator?: VegaFn<[a: unknown, b: unknown], number>
  private _invertSort?: boolean

  /** @internal */
  readonly _grid: GridBuilder<T, C>

  constructor(grid: GridBuilder<T, C>, field: string) {
    this._grid = grid as GridBuilder<T, C>
    this._field = field
  }

  /** Set the column display label */
  label(label: string): this {
    this._label = label
    return this
  }

  /** Set the display format — a string hint or a VegaFn formatter */
  format(format: string | VegaFn<[value: unknown, data: unknown], string>): this {
    this._format = format
    return this
  }

  /** Mark this column as sortable */
  sortable(sortable = true): this {
    this._sortable = sortable
    return this
  }

  /** Pin this column to a side */
  pinned(side: "left" | "right"): this {
    this._pinned = side
    return this
  }

  /** Set a fixed column width in pixels */
  width(width: number): this {
    this._width = width
    return this
  }

  /** Set a custom comparator for sorting — must be a registered VegaFn */
  comparator(fn: VegaFn<[a: unknown, b: unknown], number>): this {
    this._comparator = fn
    return this
  }

  /** Invert the natural sort direction for this column */
  invertSort(invert = true): this {
    this._invertSort = invert
    return this
  }

  /** Assign a component to render this column's cells */
  component<TName extends string, TProps>(
    def: ComponentDef<TName, TProps>,
    props: DynamicProps<T, NoInfer<TProps>>,
  ): ColumnBuilder<T, C | TName>
  component<NC extends string>(name: NC): ColumnBuilder<T, C | NC>
  component<NC extends string>(
    name: NC,
    props: Record<string, unknown>,
  ): ColumnBuilder<T, C | NC>
  component(
    nameOrDef: string | ComponentDef,
    props?: Record<string, unknown>,
  ): ColumnBuilder<T, C | string> {
    if (typeof nameOrDef === "string") {
      this._component = nameOrDef
    } else {
      this._component = nameOrDef.name
    }
    if (props) {
      this._componentProps = props
    }
    return this as unknown as ColumnBuilder<T, C | string>
  }

  /**
   * Start a new column — finalizes this one and returns the new ColumnBuilder.
   * `C` carries forward so all component names accumulate across columns.
   */
  column<K extends string = string>(
    field: unknown extends T ? K : DotNotation<T> & string,
  ): ColumnBuilder<T, C> {
    (this._grid as GridBuilder<T, string>)._finalizeColumn(this as ColumnBuilder<T, string>)
    return new ColumnBuilder<T, C>(
      this._grid,
      field as string,
    )
  }

  /** Finalize this column and set the default sort on the grid */
  defaultSort(field: string, direction: "asc" | "desc" = "asc"): GridBuilder<T, C> {
    (this._grid as GridBuilder<T, string>)._finalizeColumn(this as ColumnBuilder<T, string>)
    return (this._grid as unknown as GridBuilder<T, C>).defaultSort(field, direction)
  }

  /** Finalize this column and set the page size on the grid */
  pageSize(size: number): GridBuilder<T, C> {
    (this._grid as GridBuilder<T, string>)._finalizeColumn(this as ColumnBuilder<T, string>)
    return (this._grid as unknown as GridBuilder<T, C>).pageSize(size)
  }

  /** Finalize this column and mark the grid as selectable */
  selectable(selectable = true): GridBuilder<T, C> {
    (this._grid as GridBuilder<T, string>)._finalizeColumn(this as ColumnBuilder<T, string>)
    return (this._grid as unknown as GridBuilder<T, C>).selectable(selectable)
  }

  /** Finalize this column and build the grid */
  build(): GridNode<C> {
    (this._grid as GridBuilder<T, string>)._finalizeColumn(this as ColumnBuilder<T, string>)
    return (this._grid as unknown as GridBuilder<T, C>).build()
  }

  /** @internal Build the column node */
  _build(): GridColumnNode<C> {
    const node = { field: this._field } as GridColumnNode<C>
    if (this._label !== undefined) node.label = this._label
    if (this._format !== undefined) node.format = this._format
    if (this._sortable !== undefined) node.sortable = this._sortable
    if (this._pinned !== undefined) node.pinned = this._pinned
    if (this._width !== undefined) node.width = this._width
    if (this._component !== undefined)
      (node as GridColumnNode<string>).component = this._component
    if (this._componentProps !== undefined) node.componentProps = this._componentProps
    if (this._comparator !== undefined) node.comparator = this._comparator
    if (this._invertSort !== undefined) node.invertSort = this._invertSort
    return node
  }
}

/**
 * Fluent builder for constructing a {@link GridNode}.
 * `C` accumulates component name literals from columns for compile-time renderer validation.
 */
export class GridBuilder<T = unknown, C extends string = never> {
  private _id?: string
  private _columns: GridColumnNode<string>[] = []
  private _pendingColumn?: ColumnBuilder<T, C>
  private _state?: Record<string, unknown>
  private _source?: SourceDescriptor
  private _defaultSort: { field: string; direction: "asc" | "desc" }[] = []
  private _pageSize?: number
  private _selectable?: boolean

  /** Create a new typed GridBuilder */
  static create<T = unknown>(id?: string): GridBuilder<T> {
    const builder = new GridBuilder<T>()
    if (id) builder._id = id
    return builder
  }

  /**
   * Start defining a column.
   * Returns a {@link ColumnBuilder} for fluent column configuration.
   */
  column<K extends string = string>(
    field: unknown extends T ? K : DotNotation<T> & string,
  ): ColumnBuilder<T, C> {
    this._flushPending()
    const col = new ColumnBuilder<T, C>(this, field as string)
    this._pendingColumn = col
    return col
  }

  /** Declare local state for this grid */
  state(initial: Record<string, unknown>): this {
    this._state = { ...initial }
    return this
  }

  /** Configure the data source for this grid */
  source(configure: (s: SourceBuilder) => SourceBuilder): this {
    const builder = new SourceBuilder()
    configure(builder)
    this._source = builder.build()
    return this
  }

  /** Add a default sort column and direction (chainable for multi-sort) */
  defaultSort(field: string, direction: "asc" | "desc" = "asc"): this {
    this._defaultSort.push({ field, direction })
    return this
  }

  /** Set the page size for pagination */
  pageSize(size: number): this {
    this._pageSize = size
    return this
  }

  /** Mark the grid as having selectable rows */
  selectable(selectable = true): this {
    this._selectable = selectable
    return this
  }

  /**
   * Extend from a base grid configuration.
   * Deep-clones the base and adopts its properties as defaults.
   */
  extends<BC extends string>(base: GridNode<BC>): GridBuilder<T, C | BC> {
    this._columns = [...structuredClone(base.columns), ...this._columns]
    this._state = this._state ?? (base.state ? { ...base.state } : undefined)
    this._source = this._source ?? (base.source ? { ...base.source, params: { ...base.source.params } } : undefined)
    if (this._defaultSort.length === 0 && base.defaultSort) {
      this._defaultSort = base.defaultSort.map((s) => ({ ...s }))
    }
    this._pageSize = this._pageSize ?? base.pageSize
    this._selectable = this._selectable ?? base.selectable
    return this as unknown as GridBuilder<T, C | BC>
  }

  /**
   * Replace a column by its field name.
   * The replacer receives a fresh ColumnBuilder seeded from the matched column.
   */
  replace(
    field: string,
    replacer: (col: ColumnBuilder<T, C>) => ColumnBuilder<T, C>,
  ): this {
    const idx = this._columns.findIndex((c) => c.field === field)
    if (idx !== -1) {
      const col = new ColumnBuilder<T, C>(this, field)
      const existing = this._columns[idx]!
      if (existing.label) col.label(existing.label)
      if (existing.format) col.format(existing.format)
      if (existing.sortable) col.sortable(existing.sortable)
      if (existing.pinned) col.pinned(existing.pinned)
      if (existing.width) col.width(existing.width)
      replacer(col)
      this._columns[idx] = col._build()
    }
    return this
  }

  /** Remove a column by its field name */
  remove(field: string): this {
    this._columns = this._columns.filter((c) => c.field !== field)
    return this
  }

  /** @internal Called by ColumnBuilder when transitioning to a new column or grid method */
  _finalizeColumn(col: ColumnBuilder<T, string>): void {
    this._columns.push(col._build())
    if (this._pendingColumn === (col as unknown)) {
      this._pendingColumn = undefined
    }
  }

  private _flushPending(): void {
    if (this._pendingColumn) {
      this._columns.push(this._pendingColumn._build())
      this._pendingColumn = undefined
    }
  }

  /** Build the grid node tree */
  build(): GridNode<C> {
    this._flushPending()
    const node = {
      type: "grid" as const,
      columns: [...this._columns],
    } as GridNode<C>
    if (this._id !== undefined) node.id = this._id
    if (this._state !== undefined) node.state = this._state
    if (this._source !== undefined) node.source = this._source
    if (this._defaultSort.length > 0) node.defaultSort = [...this._defaultSort]
    if (this._pageSize !== undefined) node.pageSize = this._pageSize
    if (this._selectable !== undefined) node.selectable = this._selectable
    return node
  }
}
