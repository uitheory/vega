import { ViewBuilder } from "./builders/view.js"
import { MenuBuilder } from "./builders/menu.js"
import { defineComponent } from "./builders/component.js"
import {
  fn,
  isVegaFn,
  fromJSON,
  Comparators,
  Formatters,
  builtins,
} from "./fn.js"
import { Label, Button, Input, Badge, Image, Icon } from "./components.js"

/**
 * Main entry namespace for building Vega node trees.
 *
 * @example
 * ```ts
 * import { ui } from "vega"
 *
 * const view = ui.View.create<Account>()
 *   .row(r => r
 *     .child(ui.Label.create({ text: "Hello" }))
 *   )
 *   .build()
 * ```
 */
export const ui = {
  View: ViewBuilder,
  Menu: MenuBuilder,
  Component: { define: defineComponent },
  Fn: {
    create: fn,
    is: isVegaFn,
    fromJSON,
    Comparators,
    Formatters,
    builtins,
  },
  Label,
  Button,
  Input,
  Badge,
  Image,
  Icon,
} as const
