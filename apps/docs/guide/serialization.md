# Serialization

Vega node trees are plain JSON-compatible objects. `JSON.stringify` works out of the box — VegaFn instances serialize to `{ __fn: "name" }` sentinels automatically via `toJSON()`. To restore a tree from JSON, use `fromJSON` with the functions that belong to that tree.

## Serialize

```ts
import { ui, fn, Formatters, Comparators } from "vega"

const healthColor = fn("health-color", (data: { health: string }) =>
  data.health === "good" ? "success" : "error"
)

const grid = ui.Grid.create()
  .column("arr").label("ARR")
    .format(Formatters.currency)
    .comparator(Comparators.number)
  .column("health").label("Health")
    .component("badge", { color: healthColor })
  .build()

const json = JSON.stringify(grid, null, 2)
```

The output is pure JSON — no functions, no class instances:

```json
{
  "type": "grid",
  "columns": [
    {
      "field": "arr",
      "label": "ARR",
      "format": { "__fn": "builtin:formatter:currency" },
      "comparator": { "__fn": "builtin:comparator:number" }
    },
    {
      "field": "health",
      "label": "Health",
      "component": "badge",
      "componentProps": {
        "color": { "__fn": "health-color" }
      }
    }
  ]
}
```

## Deserialize

Use `fromJSON` to parse JSON and restore `{ __fn }` sentinels back to live VegaFn instances. Pass in the functions that belong to that tree:

```ts
import { fromJSON, builtins } from "vega"

// builtins includes all built-in Comparators and Formatters
const restored = fromJSON(json, [...builtins, healthColor])

// Functions are live again
restored.columns[0].format(1234) // → "$1,234"
```

### Scoped Functions

There's no global registry. You hold VegaFn instances as variables and pass them explicitly. This keeps function resolution scoped to each tree:

```ts
// View A has its own functions
const viewATree = fromJSON(viewAJson, [...builtins, fnA1, fnA2])

// View B has different functions
const viewBTree = fromJSON(viewBJson, [...builtins, fnB1, fnB2])
```

### Missing Functions

If a `{ __fn }` sentinel references a name not in the provided array, `fromJSON` throws:

```ts
fromJSON('{"value":{"__fn":"unknown"}}', [])
// ❌ Error: VegaFn "unknown" not found in provided functions
```

## Low-Level: `deserialize`

If you already have a parsed object (not a JSON string), use `deserialize` directly:

```ts
import { deserialize, builtins } from "vega"

const parsed = JSON.parse(json)
const restored = deserialize(parsed, [...builtins, healthColor])
```

## Storing and Transmitting

Because node trees are pure JSON, you can:

- Store them in a database column
- Send them over an API
- Cache them in localStorage
- Version them in a config file

The rendering side just needs the matching VegaFn instances to restore the tree before use.
