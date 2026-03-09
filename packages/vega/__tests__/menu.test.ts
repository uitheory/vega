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

  it("creates a section with nested items", () => {
    const node = ui.Menu.create()
      .section("reports", (s) =>
        s
          .label("Reports")
          .icon("chart")
          .item("monthly", (i) => i.label("Monthly"))
          .item("quarterly", (i) => i.label("Quarterly")),
      )
      .build()

    expect(node.items).toHaveLength(1)
    const section = node.items[0]!
    expect(section.key).toBe("reports")
    expect(section.label).toBe("Reports")
    expect(section.icon).toBe("chart")
    expect(section.items).toHaveLength(2)
    expect(section.items![0]!.key).toBe("monthly")
    expect(section.items![0]!.label).toBe("Monthly")
    expect(section.items![1]!.key).toBe("quarterly")
  })

  it("mixes items and sections", () => {
    const node = ui.Menu.create()
      .item("home", (i) => i.label("Home"))
      .section("admin", (s) =>
        s
          .label("Admin")
          .item("users", (i) => i.label("Users"))
          .item("settings", (i) => i.label("Settings")),
      )
      .build()

    expect(node.items).toHaveLength(2)
    expect(node.items[0]!.key).toBe("home")
    expect(node.items[0]!.items).toBeUndefined()
    expect(node.items[1]!.key).toBe("admin")
    expect(node.items[1]!.items).toHaveLength(2)
  })

  it("supports child content in menu items", () => {
    const childView = ui.View.create().direction("column").build()
    const node = ui.Menu.create()
      .item("overview", (i) => i.label("Overview").child(childView))
      .build()

    expect(node.items[0]!.children).toEqual([
      { type: "view", direction: "column" },
    ])
  })
})
