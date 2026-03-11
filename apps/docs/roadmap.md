# Roadmap

## Templates (`ui.Template.define`)

**Status:** Planned

Composable, named Vega node trees — distinct from Components which map to framework-level implementations.

```ts
const AccountCard = ui.Template.define("account-card",
  ui.View.create()
    .direction("column")
    .child(ui.Label.create({ text: nameFn }))
    .child(ui.Badge.create({ label: statusFn }))
    .build()
)

// Usage — same as any other node:
ui.View.create()
  .child(AccountCard.create())
  .build()
```

### Key distinctions

| | Component | Template |
|---|---|---|
| Implementation | Framework component (React, etc) | Vega node tree |
| Owned by | Renderer | Vega core |
| Node type | `{ type: "component", name }` | `{ type: "template", name }` |

### Design considerations

- **Data flow:** Template VegaFns resolve from the parent data context by default. If the template needs different data, props passed via `.create()` become the template's `data` context.
- **Renderer integration:** The renderer needs a `templates` registry (or reads templates from the definition) so it can expand template nodes into their subtrees during rendering.
- **Serialization:** Templates are fully serializable — a template is just a named reference to another node tree.

## Actions / Typed onClick

**Status:** Under consideration

Currently `onClick` takes a plain state-mutation object (`{ $panelOpen: true }`), which the renderer merges into state. This works but is implicit — the renderer just "knows" that onClick values are state updates.

### The question

Should actions be formalized with a helper like `set()` to make the intent explicit and typed?

```ts
import { set } from "vega"

ui.Button.create({ label: "Open Panel", onClick: set({ $panelOpen: true }) })
```

### Why not a full event system?

A pub/sub model (`action.dispatch("open-panel")`) would require emitters, handlers, bubbling semantics, and serialization of all of that — essentially building a framework. The current state-mutation approach is already a dispatch in disguise: `$panelOpen: true` is effectively "emit event `panelOpen` with payload `true`" where the handler is always "merge into state."

### Design considerations

- **Naming:** `set` is minimal and reads naturally — "on click, set panel open to true." Avoids React-specific `setState` connotation. Other candidates: `update`, `merge`, `patch`.
- **Typing:** A `set()` helper could return a typed `VegaAction` object (e.g. `{ type: "set", values: {...} }`), making it distinguishable from raw data in props.
- **Extensibility:** If other action types are needed later (navigate, fetch), the `VegaAction` type can be extended with a discriminated union without breaking existing `set()` usage.
- **Serialization:** Actions serialize as plain JSON — `{ type: "set", values: { $panelOpen: true } }`.
- **Current approach still works:** Plain objects could remain supported as sugar, deserialized into `set()` actions by the renderer.

## FieldNode (forms)

**Status:** Removed (may reintroduce)

`FieldNode` was removed in favor of `ComponentNode` + VegaFn for read-only display. If a forms layer is needed (two-way data binding via `bind`), FieldNode could be reintroduced with write-back semantics.
