# NavigationView

A `NavigationViewBuilder` creates a layout driven by a `Menu`. It compiles to a `ViewNode` with an optional `id` and a `MenuNode` child. Use it to build shells, panels, or any navigation-driven layout.

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

The `id` is emitted on the resulting `ViewNode`. Renderers can use it to apply layout-specific styles — a `"shell"` might get a full-height sidebar, while a `"panel"` gets horizontal tabs.

## Accepting a MenuBuilder

`.menu()` accepts either a pre-built `MenuNode` or a `MenuBuilder` (it calls `.build()` automatically):

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
| `.menu(menuOrBuilder)` | Set the navigation menu (MenuNode or MenuBuilder) |
| `.build()` | Returns a `ViewNode` |

## Output

`.build()` returns a `ViewNode`:

```json
{
  "type": "view",
  "id": "shell",
  "direction": "row",
  "children": [
    {
      "type": "menu",
      "items": [
        { "key": "home", "label": "Home" },
        { "key": "admin", "label": "Admin", "items": [
          { "key": "users", "label": "Users" },
          { "key": "settings", "label": "Settings" }
        ]}
      ]
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
// ViewNode<"label">
```
