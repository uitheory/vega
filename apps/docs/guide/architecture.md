# Architecture

## Overview

Vega is organized into three layers. See [Layers (L1/L2/L3)](/guide/layers) for full details.

```
L3  →  Panel, Shell, Dashboard         (vega-constructs)
L2  →  ui.View, ui.Grid, ui.Label, ui.Fn   (vega)
L1  →  ViewNode, GridNode, ComponentNode    (vega)
```

1. **L1 — Node Tree** — Plain, serializable objects describing UI structure
2. **L2 — Builders** — Fluent TypeScript classes and component definitions that produce L1 trees
3. **L3 — Constructs** — Opinionated compositions (Panel, Shell, Dashboard) that compile to L1 trees

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

## Node Types (L1)

Every UI element is represented as a typed node:

| Node | Purpose |
|---|---|
| `ViewNode` | Layout container with direction, gap, children |
| `FieldNode` | Binds to a data path, renders via a named component |
| `GridNode` | Data grid with column definitions |
| `MenuNode` | Navigation with menu items |
| `ComponentNode` | Named leaf node with typed props |

All nodes carry a `C` generic parameter that tracks which component names are used, enabling compile-time validation against the renderer.

## Component Name Type Safety

The `C` generic flows through the entire system:

```ts
// Builder accumulates component names via union
const grid = ui.Grid.create<Account>()
  .column("health").component("badge", { ... })  // C becomes "badge"
  .column("arr").component("currency", { ... })   // C becomes "badge" | "currency"
  .build()
// grid: GridNode<"badge" | "currency">

// Renderer declares which components it provides
const renderer = createRenderer<"badge" | "currency" | "label">({
  components: { badge: Badge, currency: Currency, label: Label },
  // ...
})

// .render() only accepts trees whose C is a subset of the renderer's C
renderer.render(grid, context) // ✅ TypeScript is happy
```

If a node uses a component not registered in the renderer, you get a compile error — not a runtime crash.

## Serialization

Node trees are fully JSON-serializable. Functions use `VegaFn` — named, callable objects that serialize to `{ __fn: "name" }` and can be restored via `fromJSON`. See [Functions (VegaFn)](/guide/functions) and [Serialization](/guide/serialization) for details.

## Design Decisions

- **Builders are classes**, `.build()` returns plain JSON-compatible objects
- **No runtime framework dependency** in the core `vega` package
- **`$` prefix** = local state binding, no prefix = context binding
- **Grid column sub-DSL**: `.column()` returns a `ColumnBuilder`, grid methods auto-finalize the pending column
- **L3 constructs compile to L1**: renderers only need to understand node types, not constructs
