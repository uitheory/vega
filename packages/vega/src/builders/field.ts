import type { DotNotation } from "../types/dot-notation.js"
import type { DynamicProps, FieldNode } from "../types/nodes.js"
import type { ComponentDef } from "./component.js"

/**
 * Fluent builder for constructing a {@link FieldNode}.
 * `C` accumulates component name literals for compile-time renderer validation.
 */
export class FieldBuilder<T = unknown, C extends string = never> {
  private _bind = ""
  private _label?: string
  private _component?: string
  private _componentProps?: Record<string, unknown>

  /**
   * Bind this field to a data path.
   * When `T` is known, only valid dot-notation paths are accepted.
   */
  bind<K extends string = string>(
    path: unknown extends T ? K : DotNotation<T> & string,
  ): this {
    this._bind = path as string
    return this
  }

  /** Set the display label */
  label(label: string): this {
    this._label = label
    return this
  }

  /**
   * Assign a component to render this field.
   * The component name literal is captured in `C` for type-safe renderer validation.
   */
  component<TName extends string, TProps>(
    def: ComponentDef<TName, TProps>,
    props: DynamicProps<T, NoInfer<TProps>>,
  ): FieldBuilder<T, C | TName>
  component<NC extends string>(name: NC): FieldBuilder<T, C | NC>
  component<NC extends string>(
    name: NC,
    props: Record<string, unknown>,
  ): FieldBuilder<T, C | NC>
  component(
    nameOrDef: string | ComponentDef,
    props?: Record<string, unknown>,
  ): FieldBuilder<T, C | string> {
    if (typeof nameOrDef === "string") {
      this._component = nameOrDef
    } else {
      this._component = nameOrDef.name
    }
    if (props) {
      this._componentProps = props
    }
    return this as unknown as FieldBuilder<T, C | string>
  }

  /** Build the field node */
  build(): FieldNode<C> {
    const node = {
      type: "field" as const,
      bind: this._bind,
    } as FieldNode<C>
    if (this._label !== undefined) node.label = this._label
    if (this._component !== undefined)
      (node as FieldNode<string>).component = this._component
    if (this._componentProps !== undefined) node.componentProps = this._componentProps
    return node
  }
}
