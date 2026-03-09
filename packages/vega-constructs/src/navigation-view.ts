import type { ViewNode, MenuNode, AnyNode } from "vega"
import type { MenuBuilder } from "vega"

/**
 * L3 construct: navigation-aware view container.
 * Compiles to a ViewNode with an optional id and a menu as its child.
 */
export class NavigationViewBuilder<T = unknown, C extends string = never> {
  private _id?: string
  private _direction?: "row" | "column"
  private _menu?: MenuNode<string>

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

  /** Set the menu — accepts a MenuNode or a MenuBuilder (calls .build()) */
  menu<MC extends string>(
    menuOrBuilder: MenuNode<MC> | MenuBuilder<unknown, MC>,
  ): NavigationViewBuilder<T, C | MC> {
    if ("build" in menuOrBuilder && typeof menuOrBuilder.build === "function") {
      this._menu = menuOrBuilder.build()
    } else {
      this._menu = menuOrBuilder as MenuNode<string>
    }
    return this as unknown as NavigationViewBuilder<T, C | MC>
  }

  /** Build the navigation view as a ViewNode */
  build(): ViewNode<C> {
    const children: AnyNode<string>[] = []
    if (this._menu) children.push(this._menu)

    const node = { type: "view" as const } as ViewNode<C>
    if (this._id !== undefined) node.id = this._id
    if (this._direction !== undefined) node.direction = this._direction
    if (children.length > 0) node.children = children as AnyNode<C>[]
    return node
  }
}
