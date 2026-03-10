import { describe, it, expect, afterEach } from "vitest"
import React from "react"
import { render, cleanup } from "@testing-library/react"
import { ui, bind } from "vega"
import type { ViewProps, GridProps, MenuProps } from "vega"
import { createRenderer } from "../src/index.js"

type Account = {
  name: string
  arr: number
  owner: { first: string }
}

// Simple test components — receive flat resolved props
const TestView = ({ node, children }: ViewProps & { children?: React.ReactNode }) => (
  <div data-testid="view" data-direction={node.direction}>
    {children}
  </div>
)

const TestLabel = ({ bind, label, text }: { bind?: string; label?: string; text?: string }) => (
  <span data-testid={`field-${bind ?? "label"}`} data-label={label}>
    {text ?? ""}
  </span>
)

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
  it("renders a view with component children", () => {
    const nameFn = ui.Fn.create("test:name", (d: Account) => d.name)

    const tree = ui.View.create<Account>()
      .direction("column")
      .child({ type: "component" as const, name: "label" as const, props: { text: nameFn, label: "Name" } })
      .build()

    const { getByTestId } = render(
      testRenderer.render(tree, {
        data: { name: "Acme Corp" },
      }),
    )

    expect(getByTestId("view").dataset.direction).toBe("column")
    expect(getByTestId("field-label").textContent).toBe("Acme Corp")
    expect(getByTestId("field-label").dataset.label).toBe("Name")
  })

  it("renders nested views", () => {
    const inner = ui.View.create<Account>()
      .direction("row")
      .child(ui.Label.create({ text: "Test" }))
      .build()

    const tree = ui.View.create<Account>()
      .direction("column")
      .child(inner)
      .build()

    const { getAllByTestId } = render(
      testRenderer.render(tree, { data: { name: "Test" } }),
    )

    const views = getAllByTestId("view")
    expect(views).toHaveLength(2)
    expect(views[0]!.dataset.direction).toBe("column")
    expect(views[1]!.dataset.direction).toBe("row")
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

  it("renders a view with no children", () => {
    const tree = ui.View.create()
      .direction("column")
      .build()

    const { container } = render(
      testRenderer.render(tree as Parameters<typeof testRenderer.render>[0]),
    )

    expect(container.querySelector("[data-testid='view']")).not.toBeNull()
    expect(container.querySelector("[data-testid^='field-']")).toBeNull()
  })

  it("passes state and setState through context", () => {
    const nameFn = ui.Fn.create("test:name2", (d: Account) => d.name)

    const tree = ui.View.create<Account>()
      .direction("column")
      .child(ui.Label.create({ text: nameFn }))
      .build()

    const mockSetState = () => {}
    const { getByTestId } = render(
      testRenderer.render(tree, {
        data: { name: "Test" },
        state: { $search: "foo" },
        setState: mockSetState,
      }),
    )

    expect(getByTestId("field-label").textContent).toBe("Test")
  })

  it("renders a component node", () => {
    const tree: Parameters<typeof testRenderer.render>[0] = {
      type: "view",
      children: [
        { type: "component", name: "label", props: { text: "Acme", label: "Name" } },
      ],
    }

    const { container } = render(
      testRenderer.render(tree, { data: { name: "Acme" } }),
    )

    const el = container.querySelector("[data-testid='field-label']")
    expect(el).not.toBeNull()
    expect(el!.textContent).toBe("Acme")
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

  it("resolves event props as callbacks", () => {
    let capturedState: Record<string, unknown> | null = null
    const TestButton = ({ label, onClick }: { label?: string; onClick?: () => void }) => (
      <button data-testid="button" onClick={onClick}>{label}</button>
    )

    const renderer = createRenderer({
      view: TestView,
      grid: TestGrid,
      menu: TestMenu,
      components: {
        label: TestLabel,
        button: TestButton,
      },
    })

    const tree: Parameters<typeof renderer.render>[0] = {
      type: "view",
      children: [
        {
          type: "component",
          name: "button",
          props: { label: "Open", onClick: { $panelOpen: true } },
          events: ["onClick"],
        },
      ],
    }

    const { getByTestId } = render(
      renderer.render(tree, {
        setState: (patch) => { capturedState = patch as Record<string, unknown> },
      }),
    )

    const button = getByTestId("button")
    expect(button.textContent).toBe("Open")
    button.click()
    expect(capturedState).toEqual({ $panelOpen: true })
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
