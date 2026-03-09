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
  FieldNode,
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
  FieldProps,
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
export { FieldBuilder } from "./builders/field.js"
export { ViewBuilder } from "./builders/view.js"
export { GridBuilder, ColumnBuilder } from "./builders/grid.js"
export { MenuBuilder, MenuItemBuilder } from "./builders/menu.js"
export { SourceBuilder } from "./builders/source.js"
export { defineComponent } from "./builders/component.js"

// Utilities
export { resolveComponentProps } from "./resolve-props.js"

// VegaFn
export type { VegaFn } from "./fn.js"
export {
  register,
  resolve,
  isVegaFn,
  deserialize,
  clearRegistry,
  Comparators,
  Formatters,
} from "./fn.js"

// Namespace
export { ui } from "./ui.js"
