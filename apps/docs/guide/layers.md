# Layers (L1 / L2 / L3)

Vega is organized into three distinct layers. Each layer builds on the one below it.

```
L3  →  Grid, NavigationView                   (vega-constructs)
L2  →  ui.View, ui.Menu, ui.Label, ui.Button   (vega)
L1  →  ComponentNode, VegaFn                    (vega)
```

## L1 — Primitives

The lowest layer has two primitives:

- **`ComponentNode`** — the universal node type. Every UI element is a `ComponentNode` with a `name`, optional `props`, optional `children`, and optional `state`/`source`.
- **`VegaFn`** — serializable, callable functions that survive `JSON.stringify`.

```ts
import type { ComponentNode } from "vega"
import type { VegaFn } from "vega"
```

A raw L1 node looks like this:

```json
{
  "type": "component",
  "name": "view",
  "props": {
    "direction": "column",
    "gap": 8
  },
  "children": [
    { "type": "component", "name": "label", "props": { "text": "Hello" } },
    { "type": "component", "name": "badge", "props": { "label": "Active" } }
  ]
}
```

All nodes carry a `C` generic parameter that tracks which component names are used, enabling compile-time validation against the renderer.

## L2 — Builders

L2 provides fluent builder classes and component definitions that map to DOM/UI concepts and produce L1 `ComponentNode` trees. These are the basic building blocks that correspond to fundamental UI primitives.

```ts
import { ui } from "vega"
```

### Builders

| Entry | Produces | Description |
|---|---|---|
| `ui.View` | `ComponentNode<"view">` | Layout container with direction, gap, children |
| `ui.Menu` | `ComponentNode<"menu">` | Navigation menus with items and sections |

### Built-in Components

| Entry | Component Name | Props |
|---|---|---|
| `ui.Label` | `"label"` | `{ text: string \| number }` |
| `ui.Button` | `"button"` | `{ label: string; variant?; disabled? }` |
| `ui.Input` | `"input"` | `{ value: string; placeholder?; type? }` |
| `ui.Badge` | `"badge"` | `{ label: string; color?; variant? }` |
| `ui.Image` | `"image"` | `{ src: string; alt?; width?; height? }` |
| `ui.Icon` | `"icon"` | `{ name: string; size?; color? }` |

### Utilities

| Entry | Purpose |
|---|---|
| `ui.Component.define` | Create custom `ComponentDef` with optional Zod schema |
| `ui.Fn` | Serializable functions — `create`, `is`, `fromJSON`, built-in Formatters & Comparators |

### Example: L2 → L1

```ts
const view = ui.View.create()
  .direction("column")
  .gap(8)
  .child(ui.Label.create({ text: "Hello" }))
  .child(ui.Badge.create({ label: "Active" }))
  .build()

// Produces the L1 ComponentNode shown above
```

## L3 — Constructs

L3 constructs are opinionated compositions that do heavy lifting beyond basic DOM/UI mapping. They compile entirely from L2 primitives down to L1 `ComponentNode` trees. They live in a separate package.

```ts
import { GridBuilder, NavigationViewBuilder } from "vega-constructs"
```

| Construct | Purpose | Compiles to |
|---|---|---|
| `GridBuilder` | Data grid with typed columns, sorting, pagination | `ComponentNode<"grid">` |
| `NavigationViewBuilder` | Navigation-driven layout (shell, panel) | `ComponentNode<"view">` with menu child |

### Grid

An opinionated construct for data grids with column definitions, sorting, pagination, and cell components:

```ts
const grid = GridBuilder.create<Account>()
  .column("name").label("Account").sortable()
  .column("arr").label("ARR").format(ui.Fn.Formatters.currency)
  .defaultSort("name", "asc")
  .pageSize(25)
  .build()
```

### NavigationView

A construct for navigation-driven layouts:

```ts
const shell = NavigationViewBuilder.create("shell")
  .direction("row")
  .menu(shellMenu)
  .build()
```

Every `.build()` call returns a standard `ComponentNode` — renderers don't need to know about L3 at all.

## When to Use Each Layer

| If you are... | Use |
|---|---|
| Writing a renderer | L1 types — consume `ComponentNode` trees |
| Building basic UI configuration | L2 builders — author with type safety |
| Building data grids or full-page layouts | L3 constructs — opinionated but standard output |
| Storing or transmitting config | L1 node trees — they're just JSON |
