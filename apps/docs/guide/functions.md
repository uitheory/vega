# Functions (VegaFn)

Plain JavaScript functions can't survive `JSON.stringify`. VegaFn solves this — it's a callable function that serializes to `{ __fn: "name" }` and can be restored from JSON.

## Creating Functions

```ts
import { fn } from "vega"
// or: ui.Fn.create(...)

const healthColor = fn("health-color", (data: { health: string }) =>
  data.health === "good" ? "success" : "error"
)

// Callable like a normal function
healthColor({ health: "good" }) // → "success"

// Serializes to JSON
JSON.stringify(healthColor) // → '{"__fn":"health-color"}'
```

## Using in Builders

VegaFn instances are used wherever the old API accepted inline functions:

```ts
import { GridBuilder } from "vega-constructs"

const grid = GridBuilder.create<Account>()
  .column("arr")
    .format(ui.Fn.Formatters.currency)
    .comparator(ui.Fn.Comparators.number)
  .column("health")
    .component(ui.Badge, {
      color: healthColor,  // VegaFn, not an inline function
    })
  .build()
```

## Built-in Functions

Vega ships with common formatters and comparators:

### Formatters

| Name | Serializes as | Example |
|---|---|---|
| `ui.Fn.Formatters.currency` | `builtin:formatter:currency` | `1234` → `"$1,234"` |
| `ui.Fn.Formatters.percent` | `builtin:formatter:percent` | `85` → `"85%"` |
| `ui.Fn.Formatters.number` | `builtin:formatter:number` | `1234567` → `"1,234,567"` |

### Comparators

| Name | Serializes as |
|---|---|
| `ui.Fn.Comparators.number` | `builtin:comparator:number` |
| `ui.Fn.Comparators.string` | `builtin:comparator:string` |
| `ui.Fn.Comparators.date` | `builtin:comparator:date` |
| `ui.Fn.Comparators.boolean` | `builtin:comparator:boolean` |

## Type Safety

VegaFn carries type parameters `<TArgs, TReturn>`. If you pass a VegaFn with the wrong return type, TypeScript catches it:

```ts
const numFn = fn("bad", () => 42)

.component(Badge, {
  color: numFn, // ❌ Type error: number is not "red" | "green" | "yellow"
})
```

## No Global State

VegaFn instances are just variables — there's no global registry. You hold them, pass them to builders, and provide them to `fromJSON` for deserialization. See [Serialization](/guide/serialization) for the full round-trip.
