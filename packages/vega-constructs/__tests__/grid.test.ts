import { describe, it, expect } from "vitest"
import { ui, bind, fn, isVegaFn, fromJSON, Comparators, Formatters, builtins } from "vega"
import type { VegaFn } from "vega"
import { z } from "zod"
import { GridBuilder } from "../src/grid.js"

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
    const node = GridBuilder.create<Account>()
      .column("name")
        .label("Account Name")
      .column("arr")
        .label("ARR")
        .format("currency")
        .sortable()
        .pinned("left")
        .width(200)
      .build()

    expect(node.name).toBe("grid")
    expect(node.props?.columns).toEqual([
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
    const node = GridBuilder.create<Account>()
      .column("name").label("Name")
      .column("arr").label("ARR")
      .defaultSort("arr", "desc")
      .pageSize(200)
      .selectable()
      .build()

    expect(node.props?.defaultSort).toEqual([{ field: "arr", direction: "desc" }])
    expect(node.props?.pageSize).toBe(200)
    expect(node.props?.selectable).toBe(true)
  })

  it("supports grid-level defaultSort, pageSize, selectable", () => {
    const node = GridBuilder.create<Account>()
      .column("name").label("Name").build()

    // Call grid-level methods directly
    const node2 = GridBuilder.create<Account>()
      .column("name").label("Name")
      .defaultSort("name", "asc")
      .pageSize(50)
      .selectable()
      .build()

    expect((node.props as Record<string, unknown>)?.columns).toHaveLength(1)
    expect(node2.props?.defaultSort).toEqual([{ field: "name", direction: "asc" }])
  })

  it("supports multi-field defaultSort", () => {
    const node = GridBuilder.create<Account>()
      .column("health_score").label("Health")
      .column("name").label("Name")
      .defaultSort("health_score", "asc")
      .defaultSort("name", "asc")
      .build()

    expect(node.props?.defaultSort).toEqual([
      { field: "health_score", direction: "asc" },
      { field: "name", direction: "asc" },
    ])
  })

  it("configures a data source", () => {
    const node = GridBuilder.create<Account>()
      .source((s) => s.key("accounts").param("search", bind("$search")))
      .column("name").label("Name")
      .build()

    expect(node.source).toEqual({
      key: "accounts",
      params: { search: { bind: "$search" } },
    })
  })

  it("supports dot-notation column fields", () => {
    const node = GridBuilder.create<Account>()
      .column("owner.first").label("Owner First")
      .build()

    expect((node.props as Record<string, unknown>)?.columns).toEqual([{
      field: "owner.first",
      label: "Owner First",
    }])
  })
})

describe("Grid inheritance", () => {
  const baseGrid = GridBuilder.create<Account>()
    .column("name").label("Account Name")
    .column("arr").label("ARR").format("currency")
    .column("health_score").label("Health Score")
    .defaultSort("name", "asc")
    .pageSize(100)
    .build()

  it("extends a base grid", () => {
    const derived = GridBuilder.create<Account>()
      .extends(baseGrid)
      .build()

    expect((derived.props as Record<string, unknown>)?.columns).toHaveLength(3)
    expect(derived.props?.defaultSort).toEqual([{ field: "name", direction: "asc" }])
    expect(derived.props?.pageSize).toBe(100)
  })

  it("removes a column from a base grid", () => {
    const derived = GridBuilder.create<Account>()
      .extends(baseGrid)
      .remove("health_score")
      .build()

    const columns = (derived.props as Record<string, unknown>)?.columns as any[]
    expect(columns).toHaveLength(2)
    expect(columns.find((c: any) => c.field === "health_score")).toBeUndefined()
  })

  it("replaces a column in a base grid", () => {
    const derived = GridBuilder.create<Account>()
      .extends(baseGrid)
      .replace("arr", (c) => c.label("Revenue"))
      .build()

    const columns = (derived.props as Record<string, unknown>)?.columns as any[]
    const arrCol = columns.find((c: any) => c.field === "arr")
    expect(arrCol?.label).toBe("Revenue")
    expect(arrCol?.format).toBe("currency")
  })
})

describe("Grid with ComponentDef", () => {
  it("can be used in a grid column with typed props", () => {
    type Acct = { name: string; arr: number }

    const Currency = ui.Component.define(
      "currency",
      z.object({
        amount: z.number(),
        currency: z.string(),
      }),
    )

    const amountFn = ui.Fn.create("test:amount", (data: Acct) => data.arr)

    const grid = GridBuilder.create<Acct>()
      .column("name").label("Account")
      .column("arr").label("Revenue").component(Currency, {
        amount: amountFn,
        currency: "USD",
      })
      .build()

    const columns = (grid.props as Record<string, unknown>)?.columns as any[]
    expect(columns).toHaveLength(2)
    expect(columns[1]).toMatchObject({
      field: "arr",
      label: "Revenue",
      component: "currency",
    })
    expect(ui.Fn.is(columns[1]!.componentProps!.amount)).toBe(true)
    expect(columns[1]!.componentProps!.currency).toBe("USD")
  })

  it("requires ComponentDef (not string) for column component", () => {
    const statusLabel = ui.Fn.create(
      "test:status-label",
      (data: Record<string, string>) => data.status,
    )

    const grid = GridBuilder.create()
      .column("status").label("Status").component(ui.Badge, {
        label: statusLabel,
        color: "green",
      })
      .build()

    const columns = (grid.props as Record<string, unknown>)?.columns as any[]
    expect(columns[0]).toMatchObject({
      field: "status",
      label: "Status",
      component: "badge",
    })
    expect(ui.Fn.is(columns[0]!.componentProps!.label)).toBe(true)
    expect(columns[0]!.componentProps!.color).toBe("green")
  })
})

describe("VegaFn with grid builder", () => {
  it("VegaFn is accepted by format and comparator", () => {
    const grid = GridBuilder.create()
      .column("amount")
      .label("Amount")
      .format(Formatters.currency)
      .comparator(Comparators.number)
      .build()

    const columns = (grid.props as Record<string, unknown>)?.columns as any[]
    expect(columns[0]!.format).toBe(Formatters.currency)
    expect(columns[0]!.comparator).toBe(Comparators.number)
  })

  it("VegaFn round-trips through fromJSON", () => {
    const grid = GridBuilder.create()
      .column("amount")
      .label("Amount")
      .format(Formatters.currency)
      .comparator(Comparators.number)
      .build()

    const json = JSON.stringify(grid)
    const parsed = JSON.parse(json)

    expect(parsed.props.columns[0].format).toEqual({
      __fn: "builtin:formatter:currency",
    })
    expect(parsed.props.columns[0].comparator).toEqual({
      __fn: "builtin:comparator:number",
    })

    const restored = fromJSON<typeof grid>(json, { fns: builtins })
    const restoredColumns = (restored.props as Record<string, unknown>)?.columns as any[]
    expect(isVegaFn(restoredColumns[0].format)).toBe(true)
    expect((restoredColumns[0].format as VegaFn<[unknown], string>)(1234)).toBe("$1,234")
  })
})

describe("invertSort on ColumnBuilder", () => {
  it("sets invertSort on the column node", () => {
    const grid = GridBuilder.create()
      .column("score")
      .label("Score")
      .comparator(Comparators.number)
      .invertSort()
      .build()

    const columns = (grid.props as Record<string, unknown>)?.columns as any[]
    expect(columns[0]!.invertSort).toBe(true)
  })

  it("invertSort defaults to true when called without argument", () => {
    const grid = GridBuilder.create()
      .column("score")
      .invertSort()
      .build()

    const columns = (grid.props as Record<string, unknown>)?.columns as any[]
    expect(columns[0]!.invertSort).toBe(true)
  })

  it("invertSort can be set to false", () => {
    const grid = GridBuilder.create()
      .column("score")
      .invertSort(false)
      .build()

    const columns = (grid.props as Record<string, unknown>)?.columns as any[]
    expect(columns[0]!.invertSort).toBe(false)
  })

  it("invertSort is omitted when not set", () => {
    const grid = GridBuilder.create()
      .column("score")
      .build()

    const columns = (grid.props as Record<string, unknown>)?.columns as any[]
    expect(columns[0]!.invertSort).toBeUndefined()
  })
})
