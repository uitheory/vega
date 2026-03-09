# Views

A `ViewNode` is a container that holds child nodes in a layout.

## Basic View

```ts
import { ui } from "vega"

const view = ui.View.create()
  .layout("stack")
  .field(f => f.bind("name").label("Name").component("label"))
  .field(f => f.bind("email").label("Email").component("label"))
  .build()
```

## Typed Views

Pass a type parameter for dot-notation path safety:

```ts
type Account = {
  name: string
  owner: { first: string; last: string }
}

const view = ui.View.create<Account>()
  .field(f => f.bind("name").label("Name").component("label"))
  .field(f => f.bind("owner.first").label("Owner").component("label"))
  // f.bind("invalid") → TypeScript error
  .build()
```

## State & Sources

Views can declare local state and a data source:

```ts
const view = ui.View.create<Account>()
  .state({ search: "" })
  .source(s => s.key("accounts").param("q", { bind: "$search" }))
  .layout("stack")
  .field(f => f.bind("name").label("Name").component("label"))
  .build()
```

- `$search` binds to local state (`$` prefix)
- Params without `$` bind to context values

## Inheritance

Extend a base view, then replace or remove fields:

```ts
const base = ui.View.create()
  .field(f => f.bind("name").label("Name").component("label"))
  .field(f => f.bind("email").label("Email").component("label"))
  .build()

const extended = ui.View.create()
  .extends(base)
  .remove("email")
  .replace("name", f => f.label("Full Name"))
  .build()
```
