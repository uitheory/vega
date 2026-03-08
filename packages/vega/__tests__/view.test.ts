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

  it("sets layout", () => {
    const node = ui.View.create().layout("grid").build()
    expect(node.layout).toBe("grid")
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

  it("adds field children with typed bindings", () => {
    const node = ui.View.create<Account>()
      .field((f) => f.bind("name").label("Account Name").component("label"))
      .field((f) => f.bind("owner.first").label("First Name"))
      .build()

    expect(node.children).toHaveLength(2)
    expect(node.children![0]).toEqual({
      type: "field",
      bind: "name",
      label: "Account Name",
      component: "label",
    })
    expect(node.children![1]).toEqual({
      type: "field",
      bind: "owner.first",
      label: "First Name",
    })
  })

  it("adds pre-built child nodes", () => {
    const inner = ui.View.create().layout("stack").build()
    const node = ui.View.create().child(inner).build()
    expect(node.children).toEqual([{ type: "view", layout: "stack" }])
  })

  it("produces a full node tree matching the spec example", () => {
    const node = ui.View.create<Account>()
      .layout("grid")
      .state({ $search: "" })
      .source((s) => s.key("accounts").param("search", bind("$search")))
      .field((f) => f.bind("name").label("Account Name").component("label"))
      .build()

    expect(node).toEqual({
      type: "view",
      layout: "grid",
      state: { $search: "" },
      source: {
        key: "accounts",
        params: { search: { bind: "$search" } },
      },
      children: [
        {
          type: "field",
          bind: "name",
          label: "Account Name",
          component: "label",
        },
      ],
    })
  })
})
