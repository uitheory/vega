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

## Quick Example

```ts
import { ui } from "vega"

type Account = {
  name: string
  arr: number
  health: string
}

const grid = ui.Grid.create<Account>()
  .column("name").label("Account").sortable()
  .column("arr").label("ARR").sortable()
    .valueFormatter(ui.Fn.Formatters.currency)
    .comparator(ui.Fn.Comparators.number)
  .column("health").label("Health")
  .defaultSort("name", "asc")
  .pageSize(25)
  .build()
```

This produces a plain JSON-serializable object — a `GridNode` — that any renderer can consume.

## The `ui` Namespace

Everything is accessed through the `ui` namespace:

| Entry | Purpose |
|---|---|
| `ui.View` | Build view/layout nodes |
| `ui.Grid` | Build data grid nodes |
| `ui.Menu` | Build navigation menu nodes |
| `ui.Component` | Define typed component definitions |
| `ui.Fn` | Create serializable functions, built-in formatters & comparators |
