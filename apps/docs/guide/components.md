# Components

Components are named rendering units. Vega tracks component names at the type level so the renderer can validate that every component used in a tree is registered.

## Built-in Components

Vega ships with common component definitions that work without Zod:

| Component | Name | Props |
|---|---|---|
| `ui.Label` | `"label"` | `{ text: string \| number }` |
| `ui.Button` | `"button"` | `{ label: string; variant?: "primary" \| "secondary" \| "ghost"; disabled?: boolean }` |
| `ui.Input` | `"input"` | `{ value: string; placeholder?: string; type?: "text" \| "number" \| "email" \| "password" }` |
| `ui.Badge` | `"badge"` | `{ label: string; color?: string; variant?: "solid" \| "outline" \| "subtle" }` |
| `ui.Image` | `"image"` | `{ src: string; alt?: string; width?: number; height?: number }` |
| `ui.Icon` | `"icon"` | `{ name: string; size?: number; color?: string }` |

Use them directly in view builders via `.child()`:

```ts
const view = ui.View.create()
  .direction("column")
  .child(ui.Label.create({ text: "Hello" }))
  .child(ui.Badge.create({ label: "Active", variant: "solid" }))
  .child(ui.Button.create({ label: "Submit", variant: "primary" }))
  .build()
```

## Defining Custom Components

Use `ui.Component.define` with a Zod schema for typed props:

```ts
import { ui } from "vega"
import { z } from "zod"

const StatusBadge = ui.Component.define(
  "status-badge",
  z.object({
    value: z.string(),
    color: z.enum(["red", "green", "yellow"]),
  }),
)
```

This creates a `ComponentDef<"status-badge", { value: string; color: "red" | "green" | "yellow" }>`.

Or define without a schema (type-only):

```ts
const Avatar = ui.Component.define<"avatar", { src: string; size?: number }>("avatar")
```

## Using Components in Views

```ts
import { fn } from "vega"

type Vuln = { severity: string; title: string }

const severityValue = fn("severity-value", (data: Vuln) => data.severity)
const severityColor = fn("severity-color", (data: Vuln) =>
  data.severity === "critical" ? "red" as const : "green" as const
)

const view = ui.View.create<Vuln>()
  .direction("column")
  .child(StatusBadge.create({
    value: severityValue,
    color: severityColor,
  }))
  .build()
```

TypeScript enforces that:
- Each prop matches the schema's inferred type
- `VegaFn` return types match the expected prop type

## Using Components in Grids

```ts
const grid = ui.Grid.create<Vuln>()
  .column("severity")
    .label("Severity")
    .component(StatusBadge, {
      value: severityValue,
      color: severityColor,
    })
  .build()
```

## String Names (Untyped)

You can also use a plain string name with untyped props:

```ts
.component("badge", { label: myFn, size: "small" })
```

This still tracks `"badge"` in the `C` generic for renderer validation, but props aren't type-checked against a schema.

## DynamicProps

When using a `ComponentDef`, each prop can be:
- A **static value** — stored as-is
- A **VegaFn** — called at render time with the row data

```ts
.component(StatusBadge, {
  value: severityValue,    // VegaFn<[Vuln], string>
  color: "red",            // static value
})
```

Plain inline functions are **not allowed** — this ensures the entire node tree is JSON-serializable.
