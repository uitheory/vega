// Types
export type {
  Primitive,
  DotNotation,
} from "./types/dot-notation.js"
export type {
  DynamicProps,
  SourceParam,
  SourceDescriptor,
  BaseNode,
  ViewNode,
  GridColumnNode,
  GridNode,
  MenuItemNode,
  MenuNode,
  ComponentNode,
  AnyNode,
} from "./types/nodes.js"
export type {
  Context,
  State,
  ViewProps,
  GridProps,
  MenuProps,
} from "./types/props.js"
export type {
  GridConfig,
  ViewConfig,
  DefaultsConfig,
  ModuleConfig,
} from "./types/config.js"

// Builders
export { bind } from "./builders/source.js"
export type { ComponentDef } from "./builders/component.js"
export { ViewBuilder } from "./builders/view.js"
export { GridBuilder, ColumnBuilder } from "./builders/grid.js"
export { MenuBuilder, MenuItemBuilder } from "./builders/menu.js"
export { SourceBuilder } from "./builders/source.js"
export { defineComponent } from "./builders/component.js"

// Built-in Components
export { Label, Button, Input, Badge, Image, Icon } from "./components.js"

// Utilities
export { resolveComponentProps } from "./resolve-props.js"

// VegaFn
export type { VegaFn } from "./fn.js"
export {
  fn,
  isVegaFn,
  deserialize,
  fromJSON,
  Comparators,
  Formatters,
  builtins,
} from "./fn.js"

// Namespace
export { ui } from "./ui.js"
