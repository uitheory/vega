import { describe, it, expect } from "vitest"
import { ui, bind } from "../src/index.js"

type Account = {
  name: string
  arr: number
  health_score: number
  owner: {
    first: string
    last: string
  }
}

describe("GridBuilder", () => {
  it("creates a minimal grid with columns", () => {
    const node = ui.Grid.create<Account>()
      .column("name")
        .label("Account Name")
      .column("arr")
        .label("ARR")
        .format("currency")
        .sortable()
        .pinned("left")
        .width(200)
      .build()

    expect(node.type).toBe("grid")
    expect(node.columns).toEqual([
      { field: "name", label: "Account Name" },
      {
        field: "arr",
        label: "ARR",
        format: "currency",
        sortable: true,
        pinned: "left",
        width: 200,
      },
    ])
  })

  it("supports defaultSort, pageSize, selectable via column chain", () => {
    const node = ui.Grid.create<Account>()
      .column("name").label("Name")
      .column("arr").label("ARR")
      .defaultSort("arr", "desc")
      .pageSize(200)
      .selectable()
      .build()

    expect(node.defaultSort).toEqual([{ field: "arr", direction: "desc" }])
    expect(node.pageSize).toBe(200)
    expect(node.selectable).toBe(true)
  })

  it("supports grid-level defaultSort, pageSize, selectable", () => {
    const node = ui.Grid.create<Account>()
      .column("name").label("Name").build()

    // Call grid-level methods directly
    const node2 = ui.Grid.create<Account>()
      .column("name").label("Name")
      .defaultSort("name", "asc")
      .pageSize(50)
      .selectable()
      .build()

    expect(node.columns).toHaveLength(1)
    expect(node2.defaultSort).toEqual([{ field: "name", direction: "asc" }])
  })

  it("supports multi-field defaultSort", () => {
    const node = ui.Grid.create<Account>()
      .column("health_score").label("Health")
      .column("name").label("Name")
      .defaultSort("health_score", "asc")
      .defaultSort("name", "asc")
      .build()

    expect(node.defaultSort).toEqual([
      { field: "health_score", direction: "asc" },
      { field: "name", direction: "asc" },
    ])
  })

  it("configures a data source", () => {
    const node = ui.Grid.create<Account>()
      .source((s) => s.key("accounts").param("search", bind("$search")))
      .column("name").label("Name")
      .build()

    expect(node.source).toEqual({
      key: "accounts",
      params: { search: { bind: "$search" } },
    })
  })

  it("supports dot-notation column fields", () => {
    const node = ui.Grid.create<Account>()
      .column("owner.first").label("Owner First")
      .build()

    expect(node.columns[0]).toEqual({
      field: "owner.first",
      label: "Owner First",
    })
  })
})

describe("Grid inheritance", () => {
  const baseGrid = ui.Grid.create<Account>()
    .column("name").label("Account Name")
    .column("arr").label("ARR").format("currency")
    .column("health_score").label("Health Score")
    .defaultSort("name", "asc")
    .pageSize(100)
    .build()

  it("extends a base grid", () => {
    const derived = ui.Grid.create<Account>()
      .extends(baseGrid)
      .build()

    expect(derived.columns).toHaveLength(3)
    expect(derived.defaultSort).toEqual([{ field: "name", direction: "asc" }])
    expect(derived.pageSize).toBe(100)
  })

  it("removes a column from a base grid", () => {
    const derived = ui.Grid.create<Account>()
      .extends(baseGrid)
      .remove("health_score")
      .build()

    expect(derived.columns).toHaveLength(2)
    expect(derived.columns.find((c) => c.field === "health_score")).toBeUndefined()
  })

  it("replaces a column in a base grid", () => {
    const derived = ui.Grid.create<Account>()
      .extends(baseGrid)
      .replace("arr", (c) => c.label("Revenue"))
      .build()

    const arrCol = derived.columns.find((c) => c.field === "arr")
    expect(arrCol?.label).toBe("Revenue")
    expect(arrCol?.format).toBe("currency")
  })
})
