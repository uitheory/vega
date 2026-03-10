# Menus

Menus define navigable items — rendered as tabs, sidebars, or any navigation pattern. The result is a `ComponentNode` with `name: "menu"` and items stored in `props.items`.

## Basic Menu

```ts
import { ui } from "vega"

const menu = ui.Menu.create()
  .item("details", i => i.label("Details"))
  .item("health", i => i.label("Health"))
  .item("contacts", i => i.label("Contacts"))
  .build()
```

## Icons

```ts
const menu = ui.Menu.create()
  .item("details", i => i.label("Details").icon("info"))
  .item("health", i => i.label("Health").icon("heart"))
  .build()
```

## Sections

Group related items under a section header using `.section()`:

```ts
const menu = ui.Menu.create()
  .item("home", i => i.label("Home").icon("dashboard"))
  .section("reports", s => s
    .label("Reports")
    .icon("chart")
    .item("monthly", i => i.label("Monthly"))
    .item("quarterly", i => i.label("Quarterly"))
  )
  .build()
```

A section is a `MenuItemNode` with nested `items`. The renderer decides how to display it — collapsible group, header with divider, etc.

## Nested Content

Menu items can contain child nodes that render when the item is active:

```ts
const menu = ui.Menu.create()
  .item("details", i =>
    i.label("Details").child(
      ui.View.create()
        .direction("column")
        .child(ui.Label.create({ text: "Detail View" }))
        .build()
    )
  )
  .build()
```

## Hydration

Use `MenuBuilder.from()` to create a builder from an existing `ComponentNode`:

```ts
const builder = ui.Menu.from(existingMenuNode)
  // modify and rebuild
  .build()
```
