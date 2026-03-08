import { describe, it, expect } from "vitest"
import { renderToJson } from "../src/test.js"
import { ui, bind } from "../src/index.js"

type Account = {
  name: string
  arr: number
  owner: { first: string; last: string }
}

describe("renderToJson", () => {
  it("renders a builder to a node tree", () => {
    const builder = ui.View.create<Account>()
      .layout("grid")
      .state({ $search: "" })
      .source((s) => s.key("accounts").param("search", bind("$search")))
      .field((f) => f.bind("name").label("Account Name").component("label"))

    const json = renderToJson(builder)

    expect(json).toEqual({
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

  it("passes through a pre-built node", () => {
    const node = ui.View.create().layout("stack").build()
    const json = renderToJson(node)
    expect(json).toEqual({ type: "view", layout: "stack" })
  })

  it("renders a grid builder", () => {
    const builder = ui.Grid.create<Account>()
      .column("name").label("Name")
      .column("arr").label("ARR").format("currency")
      .defaultSort("arr", "desc")
      .pageSize(50)

    const json = renderToJson(builder)

    expect(json).toEqual({
      type: "grid",
      columns: [
        { field: "name", label: "Name" },
        { field: "arr", label: "ARR", format: "currency" },
      ],
      defaultSort: [{ field: "arr", direction: "desc" }],
      pageSize: 50,
    })
  })
})
