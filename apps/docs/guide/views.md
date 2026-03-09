# Views

A `ViewNode` is a layout container that holds child nodes. Use `ui.View` to build views with a component-based layout API.

## Basic View

```ts
import { ui } from "vega"

const view = ui.View.create()
  .direction("column")
  .gap(8)
  .component("label", { text: "Hello" })
  .component("badge", { label: "Active" })
  .build()
```

## ID

All nodes can have an optional `id` — a user-defined identifier passed as the first argument to `create()`:

```ts
const shell = ui.View.create("shell")
  .direction("row")
  .child(navMenu)
  .child(bodyView)
  .build()
```

The `id` is a free-form string. The renderer can use it to apply layout-specific styles or behavior. Common values: `"shell"`, `"panel"`, `"sidebar"`, `"toolbar"`.

## Direction & Spacing

```ts
const row = ui.View.create()
  .direction("row")
  .gap(16)
  .padding(12)
  .component("label", { text: "Left" })
  .component("label", { text: "Right" })
  .build()
```

## Typed Components

Pass a `ComponentDef` for type-safe props:

```ts
const view = ui.View.create()
  .direction("column")
  .component(ui.Label, { text: "Account Name" })
  .component(ui.Badge, { label: "Active", variant: "solid" })
  .build()
```

See [Components](/guide/components) for defining custom components with Zod schemas.

## Nested Layouts

Use `.row()` and `.column()` to create nested layouts:

```ts
const view = ui.View.create()
  .direction("column")
  .row(v => v
    .component(ui.Label, { text: "Left" })
    .component(ui.Label, { text: "Right" })
  )
  .column(v => v
    .component(ui.Badge, { label: "Status" })
    .component(ui.Button, { label: "Action" })
  )
  .build()
```

Each `.row()` / `.column()` creates a nested `ViewBuilder` with `direction` preset. Component names propagate to the parent's `C` generic for renderer validation.

## CSS Class Names

```ts
const view = ui.View.create()
  .direction("column")
  .className("card", "shadow-md")
  .component("label", { text: "Styled" })
  .build()
```

## State & Sources

Views can declare local state and a data source:

```ts
type Account = { name: string; health: string }

const view = ui.View.create<Account>()
  .state({ search: "" })
  .source(s => s.key("accounts").param("q", { bind: "$search" }))
  .direction("column")
  .component(ui.Label, { text: "Results" })
  .build()
```

- `$search` binds to local state (`$` prefix)
- Params without `$` bind to context values

## Pre-built Children

Add any pre-built node as a child:

```ts
const grid = ui.Grid.create<Account>()
  .column("name").label("Name")
  .build()

const view = ui.View.create()
  .direction("column")
  .component(ui.Label, { text: "Header" })
  .child(grid)
  .build()
```
