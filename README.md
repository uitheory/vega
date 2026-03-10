# Vega

A TypeScript library for building serializable UI configurations through code.

## The Problem

WYSIWYG editors work well when end users need to customize a UI. But when **developers** need to configure complex, data-driven interfaces — grids, dashboards, multi-panel layouts — a drag-and-drop canvas gets in the way. You lose type safety, version control, code review, and the ability to compose and extend configurations programmatically.

Vega gives developers a fluent, type-safe API to define UI structure as code. The output is a plain JSON node tree — fully serializable, storable in a database, and renderable by any framework.

## How It Works

1. **Define** your UI with a fluent builder API
2. **Build** to a plain JSON node tree
3. **Store** the JSON anywhere — database, file, API response
4. **Render** by mapping node names to your design system components

```ts
import { ui, fn } from "vega"
import { GridBuilder } from "vega-constructs"

// Define a data-driven grid
const grid = GridBuilder.create<Account>()
  .column("name").label("Account").sortable()
  .column("arr").label("Revenue").sortable()
    .format(ui.Fn.Formatters.currency)
  .column("health").label("Health")
    .component(ui.Badge, {
      label: fn("health-label", (d) => d.health),
      color: fn("health-color", (d) => d.health === "good" ? "success" : "error"),
    })
  .defaultSort("name", "asc")
  .pageSize(50)
  .build()
```

The `.build()` call produces a plain JSON object:

```json
{
  "type": "component",
  "name": "grid",
  "props": {
    "columns": [
      { "field": "name", "label": "Account", "sortable": true },
      { "field": "arr", "label": "Revenue", "sortable": true, "format": { "__fn": "builtin:formatter:currency" } },
      { "field": "health", "label": "Health", "component": "badge", "componentProps": { ... } }
    ],
    "defaultSort": [{ "field": "name", "direction": "asc" }],
    "pageSize": 50
  }
}
```

## Features

### Single Universal Node Type

Every builder produces a `ComponentNode` — a single, universal node type identified by `name`. Views, grids, menus, labels, badges — they're all `ComponentNode` under the hood. No classes, no functions, no framework dependencies in the output.

### Type-Safe Builders

Fluent API with full TypeScript inference. Dot-notation paths are validated against your data types. Component props are checked against their definitions.

```ts
import { GridBuilder } from "vega-constructs"

GridBuilder.create<Account>()
  .column("owner.first")  // ✅ valid path
  .column("owner.nope")   // ❌ type error
```

### Component Definitions

Register your design system components with typed props. Vega tracks which components are used and validates them against the renderer at compile time.

```ts
const Badge = defineComponent<"badge", { label: string; color?: string }>(
  "badge", { events: ["onClick"] }
)

// Use in any builder
ui.View.create()
  .child(Badge.create({ label: "Active", color: "green" }))
  .build()
```

### Dynamic Props with VegaFn

Resolve component props from row data at render time. VegaFns are named, serializable functions that travel with the configuration.

```ts
const healthColor = fn("health-color", (data: Account) =>
  data.health === "good" ? "success" : "error"
)

// Used in a grid column — resolved per-row by the renderer
.component(ui.Badge, { color: healthColor })
```

### Framework-Agnostic Core

The `vega` package has zero framework dependencies. Rendering is handled by adapter packages that map node names to framework components.

```ts
// vega-react adapter
import { createRenderer } from "vega-react"

const renderer = createRenderer({
  view: MyViewComponent,
  grid: MyGridComponent,
  menu: MyMenuComponent,
  label: LabelComponent,
  badge: BadgeComponent,
  button: ButtonComponent,
})

// Render any Vega node tree
renderer.render(grid, { data: accounts, state, setState })
```

### Composable Configurations

Extend, override, and compose configurations programmatically. Base configs can be shared across teams and customized per-context.

```ts
import { GridBuilder } from "vega-constructs"

const baseGrid = GridBuilder.create<Account>()
  .column("name").label("Account").sortable()
  .column("arr").label("Revenue").sortable()
  .build()

// Extend and customize
const customGrid = GridBuilder.create<Account>()
  .extends(baseGrid)
  .remove("arr")
  .replace("name", (col) => col.label("Company Name").pinned("left"))
  .column("health").label("Health")
  .build()
```

### Layout Primitives

Views, grids, and menus compose into complex layouts — all as serializable JSON.

```ts
ui.View.create("shell")
  .direction("row")
  .child(
    ui.Menu.create()
      .item("accounts", (i) => i.label("Accounts")
        .child(accountGrid)
      )
      .item("pipeline", (i) => i.label("Pipeline")
        .child(pipelineView)
      )
      .build()
  )
  .build()
```

### Local State & Data Sources

Declare local state and data source bindings directly in the configuration. The renderer resolves bindings at runtime.

```ts
ui.View.create()
  .state({ $search: "", $selectedId: null })
  .source((s) => s.key("accounts").param("search", bind("$search")))
  .build()
```

## Packages

| Package | Description |
|---|---|
| `vega` | Core library — types, builders, VegaFn. Zero dependencies. |
| `vega-constructs` | L3 constructs — GridBuilder, NavigationViewBuilder. |
| `vega-react` | React renderer — `createRenderer`, `useVegaState`, `useVegaSource`. |

## Install

```bash
npm install vega
# L3 constructs (grids, navigation views)
npm install vega-constructs
# React bindings
npm install vega-react
```
