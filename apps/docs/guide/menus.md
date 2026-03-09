# Menus

A `MenuNode` defines navigable items — rendered as tabs, sidebars, or any navigation pattern.

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

## Nested Content

Menu items can contain child nodes that render when the item is active:

```ts
const menu = ui.Menu.create()
  .item("details", i =>
    i.label("Details").child(
      ui.View.create()
        .field(f => f.bind("name").label("Name").component("label"))
        .build()
    )
  )
  .build()
```
