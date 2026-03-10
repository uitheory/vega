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
  label: LabelComponent,
  badge: BadgeComponent,
})
```

The renderer dispatches on `node.name`. Structural names (`view`, `grid`, `menu`) map to layout renderers. All other names are looked up as named components.

## Rendering a Tree

```tsx
import { ui } from "vega"

const config = ui.View.create<Account>()
  .child(ui.Label.create({ text: nameFn }))
  .child(ui.Badge.create({ label: healthFn }))
  .build()

function AccountDetail({ account }: { account: Account }) {
  return renderer.render(config, { data: account })
}
```

## Component Types

Each structural node name has a corresponding prop type:

| Name | Prop Type | Receives |
|---|---|---|
| `"view"` | `ViewProps` | `node`, `context`, `state`, `setState`, `children` |
| `"grid"` | `GridProps` | `node`, `context`, `state`, `setState`, `components` |
| `"menu"` | `MenuProps` | `node`, `context`, `state`, `setState`, `children` |

### Example Component

Named components receive flat resolved props:

```tsx
function BadgeComponent({ label, color }: { label: string; color?: string }) {
  return (
    <span className={`badge badge-${color ?? "default"}`}>
      {label}
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
.component(ui.Badge, { color: healthColor })

// At render time, the renderer calls healthColor(data)
// and passes the resolved value to the badge component
```

Your component receives already-resolved static values — no need to handle VegaFn in component code.

## Type Safety with `C` Generic

The renderer tracks which component names are registered via the `C` generic parameter. If a node tree references a component not in the renderer's config, TypeScript catches it:

```ts
const renderer = createRenderer({
  // ... only "label" and "badge" registered
  view: MyView, grid: MyGrid, menu: MyMenu,
  label: LabelComponent, badge: BadgeComponent,
})

// Tree uses "chart" — not registered
const Chart = ui.Component.define<"chart", { data: any }>("chart")

const tree = ui.View.create()
  .child(Chart.create({ data: dataFn }))
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
