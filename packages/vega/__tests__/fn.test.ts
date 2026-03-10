import { describe, it, expect } from "vitest"
import {
  ui,
  fn,
  isVegaFn,
  deserialize,
  fromJSON,
  Comparators,
  Formatters,
  builtins,
} from "../src/index.js"
import type { VegaFn } from "../src/index.js"

describe("VegaFn creation", () => {
  it("fn creates a callable VegaFn", () => {
    const double = fn("test:double", (x: number) => x * 2)
    expect(double(5)).toBe(10)
    expect(double._brand).toBe("VegaFn")
    expect(double._name).toBe("test:double")
  })

  it("same name can be used for multiple VegaFn instances", () => {
    const a = fn("same-name", () => 1)
    const b = fn("same-name", () => 2)
    expect(a()).toBe(1)
    expect(b()).toBe(2)
  })
})

describe("isVegaFn", () => {
  it("returns true for a VegaFn", () => {
    const f = fn("test:is-check", () => 0)
    expect(isVegaFn(f)).toBe(true)
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
    const f = fn("test:json", () => 0)
    expect(f.toJSON()).toEqual({ __fn: "test:json" })
  })

  it("JSON.stringify produces __fn reference", () => {
    const f = fn("test:stringify", () => 0)
    expect(JSON.stringify(f)).toBe('{"__fn":"test:stringify"}')
  })

  it("VegaFn survives JSON.stringify in an object", () => {
    const f = fn("test:in-obj", (a: unknown, b: unknown) => Number(a) - Number(b))
    const obj = { comparator: f, label: "Test" }
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
  it("restores a __fn reference to the provided VegaFn", () => {
    const triple = fn("test:deser", (x: number) => x * 3)
    const restored = deserialize({ __fn: "test:deser" }, { fns: [triple] })
    expect(isVegaFn(restored)).toBe(true)
    expect((restored as VegaFn<[number], number>)(4)).toBe(12)
  })

  it("recursively restores __fn in nested objects", () => {
    const f = fn("test:nested-fn", () => 0)
    const input = {
      columns: [
        { field: "a", comparator: { __fn: "test:nested-fn" } },
        { field: "b" },
      ],
    }
    const result = deserialize(input, { fns: [f] }) as typeof input
    expect(isVegaFn(result.columns[0]!.comparator)).toBe(true)
  })

  it("recursively restores __fn in arrays", () => {
    const f = fn("test:arr-fn", () => 0)
    const input = [{ __fn: "test:arr-fn" }, "plain", 42] as unknown[]
    const result = deserialize(input, { fns: [f] })
    expect(isVegaFn(result[0])).toBe(true)
    expect(result[1]).toBe("plain")
    expect(result[2]).toBe(42)
  })

  it("throws for missing __fn name", () => {
    expect(() => deserialize({ __fn: "test:missing" }, { fns: [] })).toThrow(
      'VegaFn "test:missing" not found in provided functions',
    )
  })

  it("does not treat objects with extra keys as __fn sentinels", () => {
    const input = { __fn: "anything", other: "key" }
    const result = deserialize(input, { fns: [] })
    expect(result).toEqual({ __fn: "anything", other: "key" })
  })

  it("passes through primitives unchanged", () => {
    expect(deserialize(42, { fns: [] })).toBe(42)
    expect(deserialize("hello", { fns: [] })).toBe("hello")
    expect(deserialize(null, { fns: [] })).toBeNull()
    expect(deserialize(true, { fns: [] })).toBe(true)
  })
})

describe("fromJSON", () => {
  it("parses JSON and restores VegaFn instances", () => {
    const f = fn("test:from-json", (x: number) => x + 1)
    const json = '{"value":{"__fn":"test:from-json"},"label":"hi"}'
    const result = fromJSON<{ value: VegaFn<[number], number>; label: string }>(json, { fns: [f] })
    expect(isVegaFn(result.value)).toBe(true)
    expect(result.value(2)).toBe(3)
    expect(result.label).toBe("hi")
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

describe("builtins", () => {
  it("contains all comparators and formatters", () => {
    expect(builtins).toContain(Comparators.number)
    expect(builtins).toContain(Formatters.currency)
    expect(builtins).toHaveLength(7)
  })
})

describe("ui.Fn namespace", () => {
  it("exposes create, is, fromJSON", () => {
    expect(typeof ui.Fn.create).toBe("function")
    expect(typeof ui.Fn.is).toBe("function")
    expect(typeof ui.Fn.fromJSON).toBe("function")
  })

  it("exposes Comparators, Formatters, builtins", () => {
    expect(ui.Fn.Comparators.number).toBe(Comparators.number)
    expect(ui.Fn.Formatters.currency).toBe(Formatters.currency)
    expect(ui.Fn.builtins).toContain(Comparators.number)
  })
})

