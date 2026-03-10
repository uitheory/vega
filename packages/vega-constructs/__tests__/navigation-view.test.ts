import { describe, it, expect } from "vitest"
import { NavigationViewBuilder } from "../src/navigation-view.js"
import { ui } from "vega"
import type { ComponentNode } from "vega"

describe("NavigationViewBuilder", () => {
  it("builds a minimal navigation view", () => {
    const node = NavigationViewBuilder.create().build()
    expect(node).toEqual({ type: "component", name: "view" })
  })

  it("sets id from create argument", () => {
    const node = NavigationViewBuilder.create("shell").build()
    expect(node.id).toBe("shell")
  })

  it("sets direction", () => {
    const node = NavigationViewBuilder.create().direction("row").build()
    expect(node.props?.direction).toBe("row")
  })

  it("accepts a pre-built menu ComponentNode", () => {
    const menu: ComponentNode = {
      type: "component",
      name: "menu",
      props: {
        items: [
          { key: "overview", label: "Overview" },
          { key: "details", label: "Details" },
        ],
      },
    }

    const node = NavigationViewBuilder.create("shell")
      .direction("row")
      .menu(menu)
      .build()

    expect(node.name).toBe("view")
    expect(node.id).toBe("shell")
    expect(node.props?.direction).toBe("row")
    expect(node.children).toHaveLength(1)
    expect(node.children![0]).toEqual(menu)
  })

  it("accepts a MenuBuilder and calls .build()", () => {
    const menuBuilder = ui.Menu.create()
      .item("overview", (i) => i.label("Overview"))
      .item("details", (i) => i.label("Details"))

    const node = NavigationViewBuilder.create("panel")
      .direction("column")
      .menu(menuBuilder)
      .build()

    expect(node.id).toBe("panel")
    expect(node.props?.direction).toBe("column")
    expect(node.children).toHaveLength(1)
    const menu = node.children![0]!
    expect(menu.name).toBe("menu")
    const items = (menu.props as Record<string, unknown>)?.items as any[]
    expect(items).toHaveLength(2)
    expect(items[0]!.key).toBe("overview")
  })

  it("omits id when not provided", () => {
    const node = NavigationViewBuilder.create().build()
    expect(node.id).toBeUndefined()
  })

  it("omits children when no menu set", () => {
    const node = NavigationViewBuilder.create("shell").build()
    expect(node.children).toBeUndefined()
  })
})
