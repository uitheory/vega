import type { DotNotation } from "vega"
import type {
  DynamicProps,
  ComponentNode,
  GridColumnNode,
  SourceDescriptor,
} from "vega"
import type { VegaFn } from "vega"
import type { ComponentDef } from "vega"
import { SourceBuilder } from "vega"

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
    props?: DynamicProps<T, NoInfer<TProps>>,
  ): ColumnBuilder<T, C | TName> {
    this._component = def.name
    if (props) {
      this._componentProps = props as Record<string, unknown>
    }
    return this as unknown as ColumnBuilder<T, C | TName>
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
  build(): ComponentNode<C | "grid"> {
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
 * L3 construct: Fluent builder for constructing a grid ComponentNode.
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

  /** Hydrate a GridBuilder from a raw ComponentNode */
  static from<T = unknown, C extends string = never>(
    node: ComponentNode<C | "grid">,
  ): GridBuilder<T, C> {
    const builder = new GridBuilder<T, C>()
    builder._id = node.id
    const p = node.props as Record<string, unknown> | undefined
    if (p?.columns) builder._columns = structuredClone(p.columns as GridColumnNode<string>[])
    if (p?.defaultSort) builder._defaultSort = [...(p.defaultSort as { field: string; direction: "asc" | "desc" }[])]
    builder._pageSize = p?.pageSize as number | undefined
    builder._selectable = p?.selectable as boolean | undefined
    builder._state = node.state
    builder._source = node.source
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
  extends<BC extends string>(base: ComponentNode<BC | "grid">): GridBuilder<T, C | BC> {
    const bp = base.props as Record<string, unknown> | undefined
    const baseColumns = bp?.columns as GridColumnNode<string>[] | undefined
    if (baseColumns) {
      this._columns = [...structuredClone(baseColumns), ...this._columns]
    }
    this._state = this._state ?? (base.state ? { ...base.state } : undefined)
    this._source = this._source ?? (base.source ? { ...base.source, params: { ...base.source.params } } : undefined)
    const baseDefaultSort = bp?.defaultSort as { field: string; direction: "asc" | "desc" }[] | undefined
    if (this._defaultSort.length === 0 && baseDefaultSort) {
      this._defaultSort = baseDefaultSort.map((s) => ({ ...s }))
    }
    this._pageSize = this._pageSize ?? (bp?.pageSize as number | undefined)
    this._selectable = this._selectable ?? (bp?.selectable as boolean | undefined)
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

  /** Build the grid component node */
  build(): ComponentNode<C | "grid"> {
    this._flushPending()
    const props: Record<string, unknown> = {
      columns: [...this._columns],
    }
    if (this._defaultSort.length > 0) props.defaultSort = [...this._defaultSort]
    if (this._pageSize !== undefined) props.pageSize = this._pageSize
    if (this._selectable !== undefined) props.selectable = this._selectable

    const node = { type: "component" as const, name: "grid" as const } as ComponentNode<C | "grid">
    if (this._id !== undefined) node.id = this._id
    node.props = props
    if (this._state !== undefined) node.state = this._state
    if (this._source !== undefined) node.source = this._source
    return node
  }
}
