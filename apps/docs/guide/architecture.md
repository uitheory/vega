# Architecture

## Overview

Vega separates UI **configuration** from UI **rendering** into two distinct layers:

```
Builder API  →  Node Tree (JSON)  →  Renderer
   (vega)          (data)           (vega-react, etc.)
```

1. **Builders** — Fluent TypeScript classes that produce node trees
2. **Node trees** — Plain, serializable objects describing the UI structure
3. **Renderers** — Framework-specific code that turns node trees into actual UI

## Monorepo Structure

```
packages/
  vega/           # Core: types, builders, ui namespace. Zero dependencies.
  vega-react/     # React bindings: createRenderer, hooks
apps/
  playground/     # Live preview app
  docs/           # This documentation
```

## Node Types

Every UI element is represented as a typed node:

| Node | Purpose |
|---|---|
| `ViewNode` | Container/layout with children |
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
- **Inheritance**: `.extends(baseNode)` deep-clones, `.replace(key, fn)` / `.remove(key)` modify by field name
