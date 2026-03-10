# Architecture

## Overview

Vega is organized into three layers. See [Layers (L1/L2/L3)](/guide/layers) for full details.

```
L3  →  Grid, NavigationView                   (vega-constructs)
L2  →  ui.View, ui.Menu, ui.Label, ui.Button   (vega)
L1  →  ComponentNode, VegaFn                    (vega)
```

1. **L1 — Primitives** — `ComponentNode` (the universal node type) and `VegaFn` (serializable functions)
2. **L2 — Builders** — Fluent builders and component definitions that map to DOM/UI concepts and produce L1 trees
3. **L3 — Constructs** — Opinionated compositions (Grid, NavigationView) that compile to L1 trees

Renderers consume L1 node trees and turn them into actual UI.

## Monorepo Structure

```
packages/
  vega/               # L1 types + L2 builders. Zero dependencies.
  vega-constructs/    # L3 constructs. Depends on vega.
  vega-react/         # React bindings: createRenderer, hooks
apps/
  playground/         # Live preview app
  docs/               # This documentation
```

## The Universal Node: ComponentNode (L1)

Every UI element is represented as a single type — `ComponentNode`:

```ts
import type { ComponentNode } from "vega"
```

A `ComponentNode` has a `name` that identifies what it is:

| Name | What it represents |
|---|---|
| `"view"` | Layout container |
| `"menu"` | Navigation items |
| `"grid"` | Data grid |
| `"label"` | Text display |
| `"badge"` | Status indicator |
| Any string | Your custom component |

All structural data lives in `node.props`. A raw L1 node looks like this:

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

## Component Name Type Safety

The `C` generic flows through the entire system:

```ts
import { GridBuilder } from "vega-constructs"

// Builder accumulates component names via union
const grid = GridBuilder.create<Account>()
  .column("health").component(Badge, { ... })     // C becomes "badge"
  .column("arr").component(Currency, { ... })      // C becomes "badge" | "currency"
  .build()
// grid: ComponentNode<"badge" | "currency" | "grid">

// Renderer declares which components it provides
const renderer = createRenderer({
  view: MyView, grid: MyGrid, menu: MyMenu,
  badge: Badge, currency: Currency, label: Label,
})

// .render() only accepts trees whose C is a subset of the renderer's C
renderer.render(grid, context) // ✅ TypeScript is happy
```

If a node uses a component not registered in the renderer, you get a compile error — not a runtime crash.

## Serialization

Node trees are fully JSON-serializable. Functions use `VegaFn` — named, callable objects that serialize to `{ __fn: "name" }` and can be restored via `fromJSON`. See [Functions (VegaFn)](/guide/functions) and [Serialization](/guide/serialization) for details.

## Design Decisions

- **Builders are classes**, `.build()` returns plain JSON-compatible objects
- **Single node type** — `ComponentNode` is the universal primitive; `name` differentiates nodes
- **No runtime framework dependency** in the core `vega` package
- **`$` prefix** = local state binding, no prefix = context binding
- **Grid is an L3 construct** — opinionated column sub-DSL lives in `vega-constructs`
- **L3 constructs compile to L1**: renderers only need to understand `ComponentNode`, not constructs
