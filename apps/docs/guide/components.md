# Components

Components are named rendering units. Vega tracks component names at the type level so the renderer can validate that every component used in a tree is registered.

## Defining Components

Use `ui.Component.define` with a Zod schema for typed props:

```ts
import { ui } from "vega"
import { z } from "zod"

const Badge = ui.Component.define(
  "badge",
  z.object({
    value: z.string(),
    color: z.enum(["red", "green", "yellow"]),
  }),
)
```

This creates a `ComponentDef<"badge", { value: string; color: "red" | "green" | "yellow" }>`.

## Using Components

Pass a `ComponentDef` to `.component()` on a field or grid column for type-safe props:

```ts
import { fn } from "vega"

type Vuln = { severity: string; title: string }

const severityValue = fn("severity-value", (data: Vuln) => data.severity)
const severityColor = fn("severity-color", (data: Vuln) =>
  data.severity === "critical" ? "red" as const : "green" as const
)

const view = ui.View.create<Vuln>()
  .field(f =>
    f.bind("severity")
      .label("Severity")
      .component(Badge, {
        value: severityValue,
        color: severityColor,
      })
  )
  .build()
```

TypeScript enforces that:
- Each prop matches the Zod schema's inferred type
- `VegaFn` return types match the expected prop type (e.g., `color` must return `"red" | "green" | "yellow"`)

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
.component(Badge, {
  value: severityValue,    // VegaFn<[Vuln], string>
  color: "red",            // static value
})
```

Plain inline functions are **not allowed** — this ensures the entire node tree is JSON-serializable.
