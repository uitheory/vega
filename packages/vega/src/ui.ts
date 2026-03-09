import { ViewBuilder } from "./builders/view.js"
import { GridBuilder } from "./builders/grid.js"
import { MenuBuilder } from "./builders/menu.js"
import { defineComponent } from "./builders/component.js"
import {
  register,
  resolve,
  isVegaFn,
  deserialize,
  Comparators,
  Formatters,
} from "./fn.js"

/**
 * Main entry namespace for building Vega node trees.
 *
 * @example
 * ```ts
 * import { ui } from "vega"
 *
 * const view = ui.View.create<Account>()
 *   .layout("grid")
 *   .field(f => f.bind("name").label("Name"))
 *   .build()
 * ```
 */
export const ui = {
  View: ViewBuilder,
  Grid: GridBuilder,
  Menu: MenuBuilder,
  Component: { define: defineComponent },
  Fn: {
    register,
    resolve,
    is: isVegaFn,
    deserialize,
    Comparators,
    Formatters,
  },
} as const
