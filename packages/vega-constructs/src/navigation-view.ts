import type { ComponentNode } from "vega"
import type { MenuBuilder } from "vega"

/**
 * L3 construct: navigation-aware view container.
 * Compiles to a view ComponentNode with an optional id and a menu as its child.
 */
export class NavigationViewBuilder<T = unknown, C extends string = never> {
  private _id?: string
  private _direction?: "row" | "column"
  private _menu?: ComponentNode<string>

  static create<T = unknown>(id?: string): NavigationViewBuilder<T> {
    const builder = new NavigationViewBuilder<T>()
    if (id) builder._id = id
    return builder
  }

  /** Set the flex direction */
  direction(direction: "row" | "column"): this {
    this._direction = direction
    return this
  }

  /** Set the menu — accepts a ComponentNode or a MenuBuilder (calls .build()) */
  menu<MC extends string>(
    menuOrBuilder: ComponentNode<MC> | MenuBuilder<unknown, MC>,
  ): NavigationViewBuilder<T, C | MC> {
    if ("build" in menuOrBuilder && typeof menuOrBuilder.build === "function") {
      this._menu = menuOrBuilder.build()
    } else {
      this._menu = menuOrBuilder as ComponentNode<string>
    }
    return this as unknown as NavigationViewBuilder<T, C | MC>
  }

  /** Build the navigation view as a ComponentNode */
  build(): ComponentNode<C | "view"> {
    const props: Record<string, unknown> = {}
    if (this._direction !== undefined) props.direction = this._direction

    const node = { type: "component" as const, name: "view" as const } as ComponentNode<C | "view">
    if (this._id !== undefined) node.id = this._id
    if (Object.keys(props).length > 0) node.props = props
    if (this._menu) node.children = [this._menu] as ComponentNode<C>[]
    return node
  }
}
