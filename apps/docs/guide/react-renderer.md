# React Renderer

The `vega-react` package provides `createRenderer` — a typed bridge that walks a Vega node tree and maps each node to a React component.

## Installation

```bash
pnpm add vega vega-react
```

## Creating a Renderer

```ts
import { createRenderer } from "vega-react"

const renderer = createRenderer({
  view: MyViewComponent,
  grid: MyGridComponent,
  menu: MyMenuComponent,
  components: {
    label: LabelComponent,
    badge: BadgeComponent,
  },
})
```

The `components` map registers named components. When a field specifies `.component("badge", {...})`, the renderer looks up `"badge"` in this map.

## Rendering a Tree

```tsx
import { ui } from "vega"

const config = ui.View.create<Account>()
  .field((f) => f.bind("name").label("Name").component("label"))
  .field((f) => f.bind("health").label("Health").component("badge"))
  .build()

function AccountDetail({ account }: { account: Account }) {
  return renderer.render(config, { data: account })
}
```

## Component Types

Each structural node type has a corresponding prop type:

| Node | Prop Type | Receives |
|---|---|---|
| `view` | `ViewProps` | `node`, `context`, `state`, `setState`, `children` |
| `grid` | `GridProps` | `node`, `context`, `state`, `setState`, `components` |
| `menu` | `MenuProps` | `node`, `context`, `state`, `setState`, `children` |
| field components | `FieldProps` | `node`, `context`, `state`, `setState` |

### Example Component

```tsx
import type { FieldProps } from "vega"

function BadgeComponent({ node, context }: FieldProps) {
  const value = context.data?.[node.bind]
  const props = node.componentProps ?? {}

  return (
    <span className={`badge badge-${props.color ?? "default"}`}>
      {props.label ?? value}
    </span>
  )
}
```

## Component Props Resolution

When a field uses VegaFn instances in its component props, the renderer resolves them automatically using the row data:

```ts
const healthColor = fn("health-color", (data: { health: string }) =>
  data.health === "good" ? "success" : "error"
)

// In the config
.component("badge", { color: healthColor })

// At render time, the renderer calls healthColor(data)
// and passes the resolved value to the badge component
```

Your component receives already-resolved static values — no need to handle VegaFn in component code.

## Type Safety with `C` Generic

The renderer tracks which component names are registered via the `C` generic parameter. If a node tree references a component not in the renderer's config, TypeScript catches it:

```ts
const renderer = createRenderer({
  // ... only "label" and "badge" registered
  components: { label: LabelComponent, badge: BadgeComponent },
})

// Tree uses "chart" — not registered
const tree = ui.View.create()
  .field((f) => f.bind("data").component("chart"))
  .build()

renderer.render(tree) // ❌ Type error: "chart" not in "label" | "badge"
```

## RenderContext

The second argument to `render()` provides runtime context:

```ts
renderer.render(tree, {
  data: account,           // Row/record data for field binding
  state: currentState,     // Local UI state
  setState: updateState,   // State updater function
})
```

## Hooks

`vega-react` also exports hooks for state and data fetching:

- **`useVegaState(initial)`** — React state wrapper with merge semantics
- **`useVegaSource(descriptor, fetcher)`** — Fetches data based on a source descriptor, resolving `$`-prefixed params from state
