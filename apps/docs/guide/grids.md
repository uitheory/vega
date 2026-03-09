# Grids

A `GridNode` defines a data grid with typed columns, sorting, pagination, and cell components.

## Basic Grid

```ts
import { ui } from "vega"

type Account = { name: string; arr: number; health: string }

const grid = ui.Grid.create<Account>()
  .column("name").label("Account").sortable()
  .column("arr").label("ARR").sortable()
  .column("health").label("Health")
  .build()
```

## Formatters & Comparators

Use built-in `VegaFn` instances for formatting and sorting:

```ts
const grid = ui.Grid.create<Account>()
  .column("name").label("Account").sortable()
  .column("arr")
    .label("ARR")
    .sortable()
    .valueFormatter(ui.Fn.Formatters.currency)
    .comparator(ui.Fn.Comparators.number)
  .build()
```

Built-in formatters: `currency`, `percent`, `number`

Built-in comparators: `number`, `string`, `date`, `boolean`

## Column Components

Render cells with a named component:

```ts
import { ui, fn } from "vega"

const healthColor = fn("health-color", (data: Account) =>
  data.health === "good" ? "success" : "error"
)

const grid = ui.Grid.create<Account>()
  .column("health")
    .label("Health")
    .component("badge", {
      label: healthLabel,
      color: healthColor,
    })
  .build()
```

## Sorting & Pagination

```ts
const grid = ui.Grid.create<Account>()
  .column("name").label("Account").sortable()
  .column("arr").label("ARR").sortable()
    .comparator(ui.Fn.Comparators.number)
    .invertSort()  // higher numbers first
  .defaultSort("arr", "desc")
  .defaultSort("name", "asc")  // multi-sort
  .pageSize(25)
  .selectable()
  .build()
```

## Data Source

```ts
const grid = ui.Grid.create<Account>()
  .source(s => s.key("accounts").param("team", { bind: "$team" }))
  .state({ team: "all" })
  .column("name").label("Account")
  .build()
```

## Inheritance

Extend a base grid, then replace or remove columns:

```ts
const base = ui.Grid.create<Account>()
  .column("name").label("Account").sortable()
  .column("arr").label("ARR").sortable()
  .column("health").label("Health")
  .build()

const extended = ui.Grid.create<Account>()
  .extends(base)
  .remove("health")
  .replace("arr", col => col.label("Revenue"))
  .build()
```
