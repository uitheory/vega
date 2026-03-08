import type { ViewNode, AnyNode, SourceDescriptor } from "../types/nodes.js"
import { FieldBuilder } from "./field.js"
import { SourceBuilder } from "./source.js"

/**
 * Fluent builder for constructing a {@link ViewNode}.
 * `C` accumulates component name literals from children for compile-time renderer validation.
 */
export class ViewBuilder<T = unknown, C extends string = never> {
  private _layout?: string
  private _state?: Record<string, unknown>
  private _source?: SourceDescriptor
  private _children: AnyNode<string>[] = []

  /** Create a new typed ViewBuilder */
  static create<T = unknown>(): ViewBuilder<T> {
    return new ViewBuilder<T>()
  }

  /** Set the layout hint (e.g. "grid", "stack", "split") */
  layout(layout: string): this {
    this._layout = layout
    return this
  }

  /**
   * Declare local state for this view.
   * Keys prefixed with `$` are local state; unprefixed keys bind to context.
   */
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

  /** Add a field child, configured via callback */
  field<FC extends string = never>(
    configure: (f: FieldBuilder<T>) => FieldBuilder<T, FC>,
  ): ViewBuilder<T, C | FC> {
    const builder = new FieldBuilder<T>()
    configure(builder)
    this._children.push(builder.build())
    return this as unknown as ViewBuilder<T, C | FC>
  }

  /** Add an arbitrary child node (pre-built) */
  child<CC extends string>(node: AnyNode<CC>): ViewBuilder<T, C | CC> {
    this._children.push(node)
    return this as unknown as ViewBuilder<T, C | CC>
  }

  /**
   * Extend from a base view configuration.
   * Deep-clones the base and adopts its properties as defaults.
   */
  extends<BC extends string>(base: ViewNode<BC>): ViewBuilder<T, C | BC> {
    this._layout = this._layout ?? base.layout
    this._state = this._state ?? (base.state ? { ...base.state } : undefined)
    this._source = this._source ?? (base.source ? { ...base.source, params: { ...base.source.params } } : undefined)
    if (base.children) {
      this._children = [...structuredClone(base.children), ...this._children]
    }
    return this as unknown as ViewBuilder<T, C | BC>
  }

  /**
   * Replace a child node identified by its `bind` (for fields).
   * The replacer receives a fresh builder seeded from the matched child.
   */
  replace(
    key: string,
    replacer: (f: FieldBuilder<T>) => FieldBuilder<T, C>,
  ): this {
    const idx = this._children.findIndex(
      (c) => c.type === "field" && c.bind === key,
    )
    if (idx !== -1) {
      const builder = new FieldBuilder<T>()
      const existing = this._children[idx]!
      if (existing.type === "field") {
        builder.bind(existing.bind as never).label(existing.label ?? "")
        if (existing.component) builder.component(existing.component)
      }
      replacer(builder)
      this._children[idx] = builder.build()
    }
    return this
  }

  /** Remove a child node by its bind key */
  remove(key: string): this {
    this._children = this._children.filter(
      (c) => !(c.type === "field" && c.bind === key),
    )
    return this
  }

  /** Build the view node tree */
  build(): ViewNode<C> {
    const node = { type: "view" as const } as ViewNode<C>
    if (this._layout !== undefined) node.layout = this._layout
    if (this._state !== undefined) node.state = this._state
    if (this._source !== undefined) node.source = this._source
    if (this._children.length > 0)
      node.children = [...this._children] as AnyNode<C>[]
    return node
  }
}
