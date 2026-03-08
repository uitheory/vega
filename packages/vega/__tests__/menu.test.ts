import { describe, it, expect } from "vitest"
import { ui } from "../src/index.js"

describe("MenuBuilder", () => {
  it("creates a menu with items", () => {
    const node = ui.Menu.create()
      .item("overview", (i) => i.label("Overview").icon("dashboard"))
      .item("details", (i) => i.label("Details").icon("info"))
      .build()

    expect(node).toEqual({
      type: "menu",
      items: [
        { key: "overview", label: "Overview", icon: "dashboard" },
        { key: "details", label: "Details", icon: "info" },
      ],
    })
  })

  it("supports menu state", () => {
    const node = ui.Menu.create()
      .state({ $activeTab: "overview" })
      .item("overview", (i) => i.label("Overview"))
      .build()

    expect(node.state).toEqual({ $activeTab: "overview" })
  })

  it("supports child content in menu items", () => {
    const childView = ui.View.create().layout("stack").build()
    const node = ui.Menu.create()
      .item("overview", (i) => i.label("Overview").child(childView))
      .build()

    expect(node.items[0]!.children).toEqual([
      { type: "view", layout: "stack" },
    ])
  })
})
