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
    expect(node).toEqual({ type: "view" })
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
    expect(node.direction).toBe("row")
  })

  it("sets gap and padding", () => {
    const node = ui.View.create().gap(8).padding(16).build()
    expect(node.gap).toBe(8)
    expect(node.padding).toBe(16)
  })

  it("sets className", () => {
    const node = ui.View.create().className("card", "elevated").build()
    expect(node.className).toBe("card elevated")
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

  it("adds component children", () => {
    const node = ui.View.create()
      .component("label", { text: "Hello" })
      .component("badge", { label: "Active", color: "green" })
      .build()

    expect(node.children).toHaveLength(2)
    expect(node.children![0]).toEqual({
      type: "component",
      name: "label",
      props: { text: "Hello" },
    })
    expect(node.children![1]).toEqual({
      type: "component",
      name: "badge",
      props: { label: "Active", color: "green" },
    })
  })

  it("adds typed component children via ComponentDef", () => {
    const node = ui.View.create<Account>()
      .component(ui.Label, { text: "Hello" })
      .build()

    expect(node.children![0]).toEqual({
      type: "component",
      name: "label",
      props: { text: "Hello" },
    })
  })

  it("creates nested row/column layouts", () => {
    const node = ui.View.create()
      .row((r) =>
        r
          .column((c) => c.component("label", { text: "Left" }))
          .column((c) => c.component("label", { text: "Right" })),
      )
      .build()

    expect(node.children).toHaveLength(1)
    const row = node.children![0]!
    expect(row).toMatchObject({ type: "view", direction: "row" })
    if (row.type === "view") {
      expect(row.children).toHaveLength(2)
      expect(row.children![0]).toMatchObject({ type: "view", direction: "column" })
      expect(row.children![1]).toMatchObject({ type: "view", direction: "column" })
    }
  })

  it("adds pre-built child nodes", () => {
    const inner = ui.View.create().direction("column").build()
    const node = ui.View.create().child(inner).build()
    expect(node.children).toEqual([{ type: "view", direction: "column" }])
  })

  it("produces a full node tree", () => {
    const node = ui.View.create()
      .direction("column")
      .gap(8)
      .padding(16)
      .row((r) =>
        r
          .component(ui.Label, { text: "Name" })
          .component(ui.Badge, { label: "Active" }),
      )
      .build()

    expect(node).toMatchObject({
      type: "view",
      direction: "column",
      gap: 8,
      padding: 16,
    })
    expect(node.children).toHaveLength(1)
    const row = node.children![0]!
    if (row.type === "view") {
      expect(row.direction).toBe("row")
      expect(row.children).toHaveLength(2)
    }
  })
})
