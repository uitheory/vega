# Getting Started

Vega is a TypeScript library for building serializable UI configuration trees. You describe **what** to render using a fluent builder API, and a renderer decides **how** to render it.

## Install

```bash
pnpm add vega
```

For React rendering:

```bash
pnpm add vega-react
```

For L3 constructs (Panel, Shell, Dashboard):

```bash
pnpm add vega-constructs
```

## Quick Example

```ts
import { ui } from "vega"

type Account = {
  name: string
  arr: number
  health: string
}

// Build a view with child components
const view = ui.View.create()
  .direction("column")
  .gap(8)
  .child(ui.Label.create({ text: "Account Details" }))
  .child(ui.Badge.create({ label: "Active", variant: "solid" }))
  .build()

// Build a typed data grid
const grid = ui.Grid.create<Account>()
  .column("name").label("Account").sortable()
  .column("arr").label("ARR").sortable()
    .format(ui.Fn.Formatters.currency)
    .comparator(ui.Fn.Comparators.number)
  .column("health").label("Health")
  .defaultSort("name", "asc")
  .pageSize(25)
  .build()
```

Both produce plain JSON-serializable objects that any renderer can consume.

## The `ui` Namespace

Everything is accessed through the `ui` namespace:

| Entry | Purpose |
|---|---|
| `ui.View` | Build view/layout nodes |
| `ui.Grid` | Build data grid nodes |
| `ui.Menu` | Build navigation menu nodes |
| `ui.Component` | Define typed component definitions |
| `ui.Fn` | Create serializable functions, built-in formatters & comparators |
| `ui.Label`, `ui.Badge`, ... | Built-in component definitions |

## Layers

Vega is organized into three layers — see [Layers (L1/L2/L3)](/guide/layers) for the full breakdown.

```
L3  →  Panel, Shell, Dashboard         (vega-constructs)
L2  →  ui.View, ui.Grid, ui.Label, ui.Fn   (vega)
L1  →  ViewNode, GridNode, ComponentNode    (vega)
```
