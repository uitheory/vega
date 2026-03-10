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

## FieldNode (forms)

**Status:** Removed (may reintroduce)

`FieldNode` was removed in favor of `ComponentNode` + VegaFn for read-only display. If a forms layer is needed (two-way data binding via `bind`), FieldNode could be reintroduced with write-back semantics.
