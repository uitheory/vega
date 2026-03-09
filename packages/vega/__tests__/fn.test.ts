import { describe, it, expect } from "vitest"
import {
  ui,
  register,
  resolve,
  isVegaFn,
  deserialize,
  Comparators,
  Formatters,
} from "../src/index.js"
import type { VegaFn } from "../src/index.js"

describe("VegaFn registration", () => {
  it("register creates a callable VegaFn", () => {
    const fn = register("test:double", (x: number) => x * 2)
    expect(fn(5)).toBe(10)
    expect(fn._brand).toBe("VegaFn")
    expect(fn._name).toBe("test:double")
  })

  it("register throws on duplicate name", () => {
    register("test:unique", () => 0)
    expect(() => register("test:unique", () => 1)).toThrow(
      'VegaFn "test:unique" is already registered',
    )
  })

  it("resolve returns a registered VegaFn", () => {
    const fn = register("test:resolve-me", (x: number) => x + 1)
    expect(resolve("test:resolve-me")).toBe(fn)
  })

  it("resolve returns undefined for unregistered name", () => {
    expect(resolve("test:nonexistent")).toBeUndefined()
  })
})

describe("isVegaFn", () => {
  it("returns true for a VegaFn", () => {
    const fn = register("test:is-check", () => 0)
    expect(isVegaFn(fn)).toBe(true)
  })

  it("returns false for a plain function", () => {
    expect(isVegaFn(() => 0)).toBe(false)
  })

  it("returns false for non-functions", () => {
    expect(isVegaFn(42)).toBe(false)
    expect(isVegaFn("hello")).toBe(false)
    expect(isVegaFn(null)).toBe(false)
    expect(isVegaFn({ _brand: "VegaFn" })).toBe(false)
  })
})

describe("toJSON serialization", () => {
  it("VegaFn serializes to { __fn: name }", () => {
    const fn = register("test:json", () => 0)
    expect(fn.toJSON()).toEqual({ __fn: "test:json" })
  })

  it("JSON.stringify produces __fn reference", () => {
    const fn = register("test:stringify", () => 0)
    expect(JSON.stringify(fn)).toBe('{"__fn":"test:stringify"}')
  })

  it("VegaFn survives JSON.stringify in an object", () => {
    const fn = register("test:in-obj", (a: unknown, b: unknown) => Number(a) - Number(b))
    const obj = { comparator: fn, label: "Test" }
    const json = JSON.stringify(obj)
    expect(JSON.parse(json)).toEqual({
      comparator: { __fn: "test:in-obj" },
      label: "Test",
    })
  })

  it("plain functions are omitted by JSON.stringify", () => {
    const obj = { fn: () => 0, label: "Test" }
    const json = JSON.stringify(obj)
    expect(JSON.parse(json)).toEqual({ label: "Test" })
  })
})

describe("deserialize", () => {
  it("restores a __fn reference to the registered VegaFn", () => {
    const fn = register("test:deser", (x: number) => x * 3)
    const restored = deserialize({ __fn: "test:deser" })
    expect(isVegaFn(restored)).toBe(true)
    expect((restored as VegaFn<[number], number>)(4)).toBe(12)
  })

  it("recursively restores __fn in nested objects", () => {
    register("test:nested-fn", () => 0)
    const input = {
      columns: [
        { field: "a", comparator: { __fn: "test:nested-fn" } },
        { field: "b" },
      ],
    }
    const result = deserialize(input) as typeof input
    expect(isVegaFn(result.columns[0]!.comparator)).toBe(true)
  })

  it("recursively restores __fn in arrays", () => {
    register("test:arr-fn", () => 0)
    const input = [{ __fn: "test:arr-fn" }, "plain", 42] as unknown[]
    const result = deserialize(input)
    expect(isVegaFn(result[0])).toBe(true)
    expect(result[1]).toBe("plain")
    expect(result[2]).toBe(42)
  })

  it("throws for unregistered __fn name", () => {
    expect(() => deserialize({ __fn: "test:missing" })).toThrow(
      'VegaFn "test:missing" not found in registry',
    )
  })

  it("does not treat objects with extra keys as __fn sentinels", () => {
    const input = { __fn: "anything", other: "key" }
    const result = deserialize(input)
    expect(result).toEqual({ __fn: "anything", other: "key" })
  })

  it("passes through primitives unchanged", () => {
    expect(deserialize(42)).toBe(42)
    expect(deserialize("hello")).toBe("hello")
    expect(deserialize(null)).toBeNull()
    expect(deserialize(true)).toBe(true)
  })
})

describe("built-in Comparators", () => {
  it("number comparator sorts numerically", () => {
    expect(Comparators.number(10, 2)).toBeGreaterThan(0)
    expect(Comparators.number(2, 10)).toBeLessThan(0)
    expect(Comparators.number(5, 5)).toBe(0)
  })

  it("string comparator sorts lexicographically", () => {
    expect(Comparators.string("apple", "banana")).toBeLessThan(0)
    expect(Comparators.string("banana", "apple")).toBeGreaterThan(0)
  })

  it("date comparator sorts chronologically", () => {
    expect(Comparators.date("2024-01-01", "2024-06-01")).toBeLessThan(0)
    expect(Comparators.date("2024-06-01", "2024-01-01")).toBeGreaterThan(0)
  })

  it("boolean comparator sorts false before true", () => {
    expect(Comparators.boolean(true, false)).toBeGreaterThan(0)
    expect(Comparators.boolean(false, true)).toBeLessThan(0)
  })

  it("all comparators are VegaFn instances", () => {
    expect(isVegaFn(Comparators.number)).toBe(true)
    expect(isVegaFn(Comparators.string)).toBe(true)
    expect(isVegaFn(Comparators.date)).toBe(true)
    expect(isVegaFn(Comparators.boolean)).toBe(true)
  })

  it("comparators serialize to __fn", () => {
    expect(Comparators.number.toJSON()).toEqual({
      __fn: "builtin:comparator:number",
    })
  })
})

describe("built-in Formatters", () => {
  it("currency formatter", () => {
    expect(Formatters.currency(1234)).toBe("$1,234")
  })

  it("percent formatter", () => {
    expect(Formatters.percent(85)).toBe("85%")
  })

  it("number formatter", () => {
    expect(Formatters.number(1234567)).toBe("1,234,567")
  })

  it("all formatters are VegaFn instances", () => {
    expect(isVegaFn(Formatters.currency)).toBe(true)
    expect(isVegaFn(Formatters.percent)).toBe(true)
    expect(isVegaFn(Formatters.number)).toBe(true)
  })
})

describe("ui.Fn namespace", () => {
  it("exposes register, resolve, is, deserialize", () => {
    expect(typeof ui.Fn.register).toBe("function")
    expect(typeof ui.Fn.resolve).toBe("function")
    expect(typeof ui.Fn.is).toBe("function")
    expect(typeof ui.Fn.deserialize).toBe("function")
  })

  it("exposes Comparators and Formatters", () => {
    expect(ui.Fn.Comparators.number).toBe(Comparators.number)
    expect(ui.Fn.Formatters.currency).toBe(Formatters.currency)
  })
})

describe("VegaFn with grid builder", () => {
  it("VegaFn is accepted by valueFormatter and comparator", () => {
    const grid = ui.Grid.create()
      .column("amount")
      .label("Amount")
      .valueFormatter(Formatters.currency)
      .comparator(Comparators.number)
      .build()

    expect(grid.columns[0]!.valueFormatter).toBe(Formatters.currency)
    expect(grid.columns[0]!.comparator).toBe(Comparators.number)
  })

  it("VegaFn round-trips through JSON serialization", () => {
    const grid = ui.Grid.create()
      .column("amount")
      .label("Amount")
      .valueFormatter(Formatters.currency)
      .comparator(Comparators.number)
      .build()

    const json = JSON.stringify(grid)
    const parsed = JSON.parse(json)

    expect(parsed.columns[0].valueFormatter).toEqual({
      __fn: "builtin:formatter:currency",
    })
    expect(parsed.columns[0].comparator).toEqual({
      __fn: "builtin:comparator:number",
    })

    const restored = deserialize(parsed)
    expect(isVegaFn(restored.columns[0].valueFormatter)).toBe(true)
    expect(restored.columns[0].valueFormatter(1234)).toBe("$1,234")
  })
})

describe("invertSort on ColumnBuilder", () => {
  it("sets invertSort on the column node", () => {
    const grid = ui.Grid.create()
      .column("score")
      .label("Score")
      .comparator(Comparators.number)
      .invertSort()
      .build()

    expect(grid.columns[0]!.invertSort).toBe(true)
  })

  it("invertSort defaults to true when called without argument", () => {
    const grid = ui.Grid.create()
      .column("score")
      .invertSort()
      .build()

    expect(grid.columns[0]!.invertSort).toBe(true)
  })

  it("invertSort can be set to false", () => {
    const grid = ui.Grid.create()
      .column("score")
      .invertSort(false)
      .build()

    expect(grid.columns[0]!.invertSort).toBe(false)
  })

  it("invertSort is omitted when not set", () => {
    const grid = ui.Grid.create()
      .column("score")
      .build()

    expect(grid.columns[0]!.invertSort).toBeUndefined()
  })
})
