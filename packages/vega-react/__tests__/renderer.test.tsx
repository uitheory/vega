import { describe, it, expect, afterEach } from "vitest"
import React from "react"
import { render, cleanup } from "@testing-library/react"
import { ui, bind } from "vega"
import type { ViewProps, FieldProps, GridProps, MenuProps } from "vega"
import { createRenderer } from "../src/index.js"

type Account = {
  name: string
  arr: number
  owner: { first: string }
}

// Simple test components
const TestView = ({ node, children }: ViewProps & { children?: React.ReactNode }) => (
  <div data-testid="view" data-layout={node.layout}>
    {children}
  </div>
)

const TestLabel = ({ node, context }: FieldProps) => {
  const data = context.data as Record<string, unknown> | undefined
  const value = data ? data[node.bind] : undefined
  return (
    <span data-testid={`field-${node.bind}`} data-label={node.label}>
      {String(value ?? "")}
    </span>
  )
}

const TestGrid = ({ node }: GridProps) => (
  <table data-testid="grid">
    <thead>
      <tr>
        {node.columns.map((col) => (
          <th key={col.field}>{col.label}</th>
        ))}
      </tr>
    </thead>
  </table>
)

const TestMenu = ({ node, children }: MenuProps & { children?: React.ReactNode }) => (
  <nav data-testid="menu">
    {node.items.map((item) => (
      <a key={item.key} data-testid={`menu-${item.key}`}>
        {item.label}
      </a>
    ))}
    {children}
  </nav>
)

const testRenderer = createRenderer({
  view: TestView,
  grid: TestGrid,
  menu: TestMenu,
  components: {
    label: TestLabel,
  },
})

afterEach(cleanup)

describe("createRenderer", () => {
  it("renders a view with field children", () => {
    const tree = ui.View.create<Account>()
      .layout("stack")
      .field((f) => f.bind("name").label("Name").component("label"))
      .build()

    const { getByTestId } = render(
      testRenderer.render(tree, {
        data: { name: "Acme Corp" },
      }),
    )

    expect(getByTestId("view").dataset.layout).toBe("stack")
    expect(getByTestId("field-name").textContent).toBe("Acme Corp")
    expect(getByTestId("field-name").dataset.label).toBe("Name")
  })

  it("renders nested views", () => {
    const inner = ui.View.create<Account>()
      .layout("inner")
      .field((f) => f.bind("name").label("Name").component("label"))
      .build()

    const tree = ui.View.create<Account>()
      .layout("outer")
      .child(inner)
      .build()

    const { getAllByTestId } = render(
      testRenderer.render(tree, { data: { name: "Test" } }),
    )

    const views = getAllByTestId("view")
    expect(views).toHaveLength(2)
    expect(views[0]!.dataset.layout).toBe("outer")
    expect(views[1]!.dataset.layout).toBe("inner")
  })

  it("renders a grid node", () => {
    const tree = ui.Grid.create<Account>()
      .column("name").label("Account")
      .column("arr").label("Revenue")
      .build()

    // Need to widen to AnyNode<"label"> for the test renderer
    const { getByTestId } = render(
      testRenderer.render(tree as Parameters<typeof testRenderer.render>[0]),
    )

    const grid = getByTestId("grid")
    const headers = grid.querySelectorAll("th")
    expect(headers).toHaveLength(2)
    expect(headers[0]!.textContent).toBe("Account")
    expect(headers[1]!.textContent).toBe("Revenue")
  })

  it("renders a menu node", () => {
    const tree = ui.Menu.create()
      .item("overview", (i) => i.label("Overview"))
      .item("details", (i) => i.label("Details"))
      .build()

    const { getByTestId } = render(
      testRenderer.render(tree as Parameters<typeof testRenderer.render>[0]),
    )

    expect(getByTestId("menu-overview").textContent).toBe("Overview")
    expect(getByTestId("menu-details").textContent).toBe("Details")
  })

  it("skips fields with no component", () => {
    const tree = ui.View.create<Account>()
      .field((f) => f.bind("name").label("Name"))
      .build()

    const { container } = render(
      testRenderer.render(tree as Parameters<typeof testRenderer.render>[0]),
    )

    // View renders but no field children (no component assigned)
    expect(container.querySelector("[data-testid^='field-']")).toBeNull()
  })

  it("passes state and setState through context", () => {
    const tree = ui.View.create<Account>()
      .field((f) => f.bind("name").component("label"))
      .build()

    const mockSetState = () => {}
    const { getByTestId } = render(
      testRenderer.render(tree, {
        data: { name: "Test" },
        state: { $search: "foo" },
        setState: mockSetState,
      }),
    )

    expect(getByTestId("field-name").textContent).toBe("Test")
  })

  it("renders a component node", () => {
    const tree: Parameters<typeof testRenderer.render>[0] = {
      type: "view",
      children: [
        { type: "component", name: "label", props: { bind: "name", label: "Name" } },
      ],
    }

    const { container } = render(
      testRenderer.render(tree, { data: { name: "Acme" } }),
    )

    expect(container.querySelector("[data-testid='field-name']")).not.toBeNull()
  })

  it("renders menu items with children", () => {
    const tree: Parameters<typeof testRenderer.render>[0] = {
      type: "menu",
      items: [
        {
          key: "overview",
          label: "Overview",
          children: [
            { type: "field", bind: "name", component: "label" },
          ],
        },
      ],
    }

    const { getByTestId, container } = render(
      testRenderer.render(tree, { data: { name: "Test" } }),
    )

    expect(getByTestId("menu-overview").textContent).toBe("Overview")
    expect(container.querySelector("[data-testid='field-name']")).not.toBeNull()
  })

  it("returns null for unknown node types", () => {
    const tree: Parameters<typeof testRenderer.render>[0] = {
      type: "view",
      children: [
        { type: "unknown" as "field", bind: "" },
      ],
    }

    const { container } = render(testRenderer.render(tree))

    expect(container.querySelector("[data-testid='view']")).not.toBeNull()
  })
})
