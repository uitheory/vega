import { describe, it, expect } from "vitest"
import { ui, bind } from "../src/index.js"

type Account = {
  name: string
  arr: number
  owner: {
    first: string
    last: string
  }
}

describe("ViewBuilder", () => {
  it("creates a minimal view node", () => {
    const node = ui.View.create().build()
    expect(node).toEqual({ type: "component", name: "view" })
  })

  it("sets id via create", () => {
    const node = ui.View.create("shell").build()
    expect(node.id).toBe("shell")
  })

  it("omits id when not set", () => {
    const node = ui.View.create().build()
    expect(node.id).toBeUndefined()
  })

  it("sets direction", () => {
    const node = ui.View.create().direction("row").build()
    expect(node.props?.direction).toBe("row")
  })

  it("sets gap and padding", () => {
    const node = ui.View.create().gap(8).padding(16).build()
    expect(node.props?.gap).toBe(8)
    expect(node.props?.padding).toBe(16)
  })

  it("sets className", () => {
    const node = ui.View.create().className("card", "elevated").build()
    expect(node.props?.className).toBe("card elevated")
  })

  it("sets state with $ prefixed keys", () => {
    const node = ui.View.create()
      .state({ $search: "", $page: 1 })
      .build()
    expect(node.state).toEqual({ $search: "", $page: 1 })
  })

  it("configures a data source with bound params", () => {
    const node = ui.View.create()
      .source((s) =>
        s.key("accounts").param("search", bind("$search")),
      )
      .build()
    expect(node.source).toEqual({
      key: "accounts",
      params: { search: { bind: "$search" } },
    })
  })

  it("adds component children via .child()", () => {
    const node = ui.View.create()
      .child(ui.Label.create({ text: "Hello" }))
      .child(ui.Badge.create({ label: "Active", color: "green" }))
      .build()

    expect(node.children).toHaveLength(2)
    expect(node.children![0]).toEqual({
      type: "component",
      name: "label",
      props: { text: "Hello" },
      events: ["onClick"],
    })
    expect(node.children![1]).toEqual({
      type: "component",
      name: "badge",
      props: { label: "Active", color: "green" },
      events: ["onClick"],
    })
  })

  it("creates nested row/column layouts", () => {
    const node = ui.View.create()
      .row((r) =>
        r
          .column((c) => c.child(ui.Label.create({ text: "Left" })))
          .column((c) => c.child(ui.Label.create({ text: "Right" }))),
      )
      .build()

    expect(node.children).toHaveLength(1)
    const row = node.children![0]!
    expect(row).toMatchObject({ type: "component", name: "view", props: { direction: "row" } })
    expect(row.children).toHaveLength(2)
    expect(row.children![0]).toMatchObject({ type: "component", name: "view", props: { direction: "column" } })
    expect(row.children![1]).toMatchObject({ type: "component", name: "view", props: { direction: "column" } })
  })

  it("adds pre-built child nodes", () => {
    const inner = ui.View.create().direction("column").build()
    const node = ui.View.create().child(inner).build()
    expect(node.children).toEqual([{ type: "component", name: "view", props: { direction: "column" } }])
  })

  it("produces a full node tree", () => {
    const node = ui.View.create()
      .direction("column")
      .gap(8)
      .padding(16)
      .row((r) =>
        r
          .child(ui.Label.create({ text: "Name" }))
          .child(ui.Badge.create({ label: "Active" })),
      )
      .build()

    expect(node).toMatchObject({
      type: "component",
      name: "view",
      props: {
        direction: "column",
        gap: 8,
        padding: 16,
      },
    })
    expect(node.children).toHaveLength(1)
    const row = node.children![0]!
    expect(row.props?.direction).toBe("row")
    expect(row.children).toHaveLength(2)
  })
})
