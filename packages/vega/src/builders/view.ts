import type {
  ComponentNode,
  SourceDescriptor,
} from "../types/nodes.js"
import { SourceBuilder } from "./source.js"

/**
 * Fluent builder for constructing a view ComponentNode.
 * Uses a component-based layout API: `.row()`, `.column()`, `.component()`.
 * `C` accumulates component name literals from children for compile-time renderer validation.
 */
export class ViewBuilder<T = unknown, C extends string = never> {
  private _id?: string
  private _direction?: "row" | "column"
  private _gap?: number
  private _padding?: number
  private _className?: string
  private _state?: Record<string, unknown>
  private _source?: SourceDescriptor
  private _children: ComponentNode<string>[] = []

  /** Create a new typed ViewBuilder */
  static create<T = unknown>(id?: string): ViewBuilder<T> {
    const builder = new ViewBuilder<T>()
    if (id) builder._id = id
    return builder
  }

  /** Hydrate a ViewBuilder from a raw ComponentNode */
  static from<T = unknown, C extends string = never>(
    node: ComponentNode<C | "view">,
  ): ViewBuilder<T, C> {
    const builder = new ViewBuilder<T, C>()
    builder._id = node.id
    const p = node.props as Record<string, unknown> | undefined
    builder._direction = p?.direction as "row" | "column" | undefined
    builder._gap = p?.gap as number | undefined
    builder._padding = p?.padding as number | undefined
    builder._className = p?.className as string | undefined
    builder._state = node.state
    builder._source = node.source
    if (node.children) builder._children = [...node.children]
    return builder
  }

  /** Set the flex direction */
  direction(direction: "row" | "column"): this {
    this._direction = direction
    return this
  }

  /** Add a nested row (horizontal) layout */
  row<NC extends string = never>(
    configure: (v: ViewBuilder<T, never>) => ViewBuilder<T, NC>,
  ): ViewBuilder<T, C | NC> {
    const nested = new ViewBuilder<T, never>()
    nested._direction = "row"
    const result = configure(nested)
    this._children.push(result.build())
    return this as unknown as ViewBuilder<T, C | NC>
  }

  /** Add a nested column (vertical) layout */
  column<NC extends string = never>(
    configure: (v: ViewBuilder<T, never>) => ViewBuilder<T, NC>,
  ): ViewBuilder<T, C | NC> {
    const nested = new ViewBuilder<T, never>()
    nested._direction = "column"
    const result = configure(nested)
    this._children.push(result.build())
    return this as unknown as ViewBuilder<T, C | NC>
  }

  /** Set gap between children */
  gap(gap: number): this {
    this._gap = gap
    return this
  }

  /** Set padding */
  padding(padding: number): this {
    this._padding = padding
    return this
  }

  /** Set CSS class name(s) */
  className(...classes: string[]): this {
    this._className = classes.join(" ")
    return this
  }

  /** Declare local state for this view */
  state(initial: Record<string, unknown>): this {
    this._state = { ...initial }
    return this
  }

  /** Configure the data source for this view */
  source(configure: (s: SourceBuilder) => SourceBuilder): this {
    const builder = new SourceBuilder()
    configure(builder)
    this._source = builder.build()
    return this
  }

  /** Add a pre-built child node */
  child<CC extends string>(node: ComponentNode<CC>): ViewBuilder<T, C | CC> {
    this._children.push(node)
    return this as unknown as ViewBuilder<T, C | CC>
  }

  /** Build the view component node */
  build(): ComponentNode<C | "view"> {
    const props: Record<string, unknown> = {}
    if (this._direction !== undefined) props.direction = this._direction
    if (this._gap !== undefined) props.gap = this._gap
    if (this._padding !== undefined) props.padding = this._padding
    if (this._className !== undefined) props.className = this._className

    const node = { type: "component" as const, name: "view" as const } as ComponentNode<C | "view">
    if (this._id !== undefined) node.id = this._id
    if (Object.keys(props).length > 0) node.props = props
    if (this._state !== undefined) node.state = this._state
    if (this._source !== undefined) node.source = this._source
    if (this._children.length > 0)
      node.children = [...this._children] as ComponentNode<C>[]
    return node
  }
}
