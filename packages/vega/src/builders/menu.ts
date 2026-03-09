import type { MenuNode, MenuItemNode, AnyNode } from "../types/nodes.js"

/** Fluent builder for constructing a menu item */
export class MenuItemBuilder<C extends string = never> {
  private _key: string
  private _label?: string
  private _icon?: string
  private _items: MenuItemBuilder<string>[] = []
  private _children: AnyNode<string>[] = []

  constructor(key: string) {
    this._key = key
  }

  /** Set the display label */
  label(label: string): this {
    this._label = label
    return this
  }

  /** Set the icon identifier */
  icon(icon: string): this {
    this._icon = icon
    return this
  }

  /** Add a nested sub-item (for sections) */
  item(key: string, configure?: (item: MenuItemBuilder) => void): this {
    const sub = new MenuItemBuilder(key)
    if (configure) configure(sub)
    this._items.push(sub)
    return this
  }

  /** Add child content to this menu item */
  child<CC extends string>(node: AnyNode<CC>): MenuItemBuilder<C | CC> {
    this._children.push(node)
    return this as unknown as MenuItemBuilder<C | CC>
  }

  /** Build the menu item node */
  build(): MenuItemNode<C> {
    const node = { key: this._key } as MenuItemNode<C>
    if (this._label !== undefined) node.label = this._label
    if (this._icon !== undefined) node.icon = this._icon
    if (this._items.length > 0)
      node.items = this._items.map((i) => i.build()) as MenuItemNode<C>[]
    if (this._children.length > 0)
      node.children = [...this._children] as AnyNode<C>[]
    return node
  }
}

/**
 * Fluent builder for constructing a {@link MenuNode}.
 * `C` accumulates component names from menu item children.
 */
export class MenuBuilder<_T = unknown, C extends string = never> {
  private _id?: string
  private _items: MenuItemBuilder<string>[] = []
  private _state?: Record<string, unknown>

  /** Create a new typed MenuBuilder */
  static create<T = unknown>(id?: string): MenuBuilder<T> {
    const builder = new MenuBuilder<T>()
    if (id) builder._id = id
    return builder
  }

  /** Add a menu item, optionally configuring it with a callback */
  item(key: string, configure?: (item: MenuItemBuilder) => void): this {
    const item = new MenuItemBuilder(key)
    if (configure) configure(item)
    this._items.push(item)
    return this
  }

  /** Add a section — a grouping of sub-items with optional label/icon */
  section(key: string, configure: (section: MenuItemBuilder) => void): this {
    const section = new MenuItemBuilder(key)
    configure(section)
    this._items.push(section)
    return this
  }

  /** Declare local state for this menu */
  state(initial: Record<string, unknown>): this {
    this._state = { ...initial }
    return this
  }

  /** Build the menu node */
  build(): MenuNode<C> {
    const node = {
      type: "menu" as const,
      items: this._items.map((i) => i.build()),
    } as MenuNode<C>
    if (this._id !== undefined) node.id = this._id
    if (this._state !== undefined) node.state = this._state
    return node
  }
}
