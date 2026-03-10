# Layers (L1 / L2 / L3)

Vega is organized into three distinct layers. Each layer builds on the one below it.

```
L3  →  NavigationView                    (vega-constructs)
L2  →  ui.View, ui.Grid, ui.Label, ui.Fn   (vega)
L1  →  ViewNode, GridNode, ComponentNode    (vega)
```

## L1 — Node Tree

The lowest layer is a set of plain TypeScript interfaces that describe UI structure as JSON-serializable data. This is what renderers consume and what gets stored or transmitted over the wire.

```ts
import type { ViewNode, GridNode, ComponentNode } from "vega"
```

Node types:

| Type | Purpose |
|---|---|
| `ViewNode` | Layout container with direction, gap, children |
| `GridNode` | Data grid with typed column definitions |
| `MenuNode` | Navigation items with children |
| `ComponentNode` | Named leaf node with props |
| `FieldNode` | Binds to a data path, renders via a named component |

A raw L1 node looks like this:

```json
{
  "type": "view",
  "direction": "column",
  "gap": 8,
  "children": [
    { "type": "component", "name": "label", "props": { "text": "Hello" } },
    { "type": "component", "name": "badge", "props": { "label": "Active" } }
  ]
}
```

All nodes carry a `C` generic parameter that tracks which component names are used, enabling compile-time validation against the renderer.

## L2 — Builder API

L2 provides fluent builder classes and component definitions that produce L1 node trees. This is the primary authoring API.

```ts
import { ui } from "vega"
```

### Builders

| Entry | Produces |
|---|---|
| `ui.View` | `ViewNode` — layouts with `.row()`, `.column()`, `.child()` |
| `ui.Grid` | `GridNode` — data grids with typed columns |
| `ui.Menu` | `MenuNode` — navigation menus |

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

// Produces the L1 ViewNode shown above
```

## L3 — Constructs

L3 constructs are opinionated compositions that compile entirely from L2 primitives down to L1 node trees. They live in a separate package.

```ts
import { NavigationViewBuilder } from "vega-constructs"
```

| Construct | Purpose | Compiles to |
|---|---|---|
| `NavigationViewBuilder` | Navigation-driven layout (shell, panel, etc.) | `ViewNode` with `MenuNode` child |

### NavigationView

A single construct that handles any navigation-driven layout. Use `id` to differentiate:

```ts
// App shell — horizontal nav with sidebar menu
const shell = NavigationViewBuilder.create("shell")
  .direction("row")
  .menu(shellMenu)
  .build()

// Panel — vertical tabs within a content area
const panel = NavigationViewBuilder.create("panel")
  .direction("column")
  .menu(panelMenu)
  .build()
```

Every `.build()` call returns a standard `ViewNode` — renderers don't need to know about L3 at all.

## When to Use Each Layer

| If you are... | Use |
|---|---|
| Writing a renderer | L1 types — consume node trees |
| Building UI configuration | L2 builders — author with type safety |
| Composing full-page layouts | L3 constructs — opinionated but standard output |
| Storing or transmitting config | L1 node trees — they're just JSON |
