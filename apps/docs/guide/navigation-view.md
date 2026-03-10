# NavigationView

A `NavigationViewBuilder` creates a layout driven by a `Menu`. It compiles to a `ComponentNode` with `name: "view"`, an optional `id`, and a menu child. Use it to build shells, panels, or any navigation-driven layout.

```bash
pnpm add vega-constructs
```

## Basic Usage

```ts
import { ui } from "vega"
import { NavigationViewBuilder } from "vega-constructs"

const menu = ui.Menu.create()
  .item("overview", i => i.label("Overview").icon("dashboard"))
  .item("details", i => i.label("Details").icon("info"))
  .build()

const nav = NavigationViewBuilder.create()
  .direction("row")
  .menu(menu)
  .build()
```

## ID

Pass an `id` string to `create()` to identify the view:

```ts
const shell = NavigationViewBuilder.create("shell")
  .direction("row")
  .menu(shellMenu)
  .build()

const panel = NavigationViewBuilder.create("panel")
  .direction("column")
  .menu(panelMenu)
  .build()
```

The `id` is emitted on the resulting `ComponentNode`. Renderers can use it to apply layout-specific styles — a `"shell"` might get a full-height sidebar, while a `"panel"` gets horizontal tabs.

## Accepting a MenuBuilder

`.menu()` accepts either a pre-built `ComponentNode` or a `MenuBuilder` (it calls `.build()` automatically):

```ts
const nav = NavigationViewBuilder.create("shell")
  .direction("row")
  .menu(
    ui.Menu.create()
      .item("home", i => i.label("Home"))
      .section("admin", s => s
        .label("Admin")
        .item("users", i => i.label("Users"))
        .item("settings", i => i.label("Settings"))
      )
  )
  .build()
```

## API

| Method | Description |
|---|---|
| `NavigationViewBuilder.create(id?)` | Create a new builder with optional id |
| `.direction("row" \| "column")` | Set layout direction |
| `.menu(menuOrBuilder)` | Set the navigation menu (ComponentNode or MenuBuilder) |
| `.build()` | Returns a `ComponentNode<"view">` |

## Output

`.build()` returns a `ComponentNode`:

```json
{
  "type": "component",
  "name": "view",
  "id": "shell",
  "props": {
    "direction": "row"
  },
  "children": [
    {
      "type": "component",
      "name": "menu",
      "props": {
        "items": [
          { "key": "home", "label": "Home" },
          { "key": "admin", "label": "Admin", "items": [
            { "key": "users", "label": "Users" },
            { "key": "settings", "label": "Settings" }
          ]}
        ]
      }
    }
  ]
}
```

## Type Safety

Component names from menu item children propagate:

```ts
const nav = NavigationViewBuilder.create("panel")
  .menu(menuWithLabelChildren)
  .build()
// ComponentNode<"label" | "view">
```
