import { describe, it, expect } from "vitest"
import { bind, SourceBuilder } from "../src/index.js"

describe("bind()", () => {
  it("creates a binding reference", () => {
    expect(bind("$search")).toEqual({ bind: "$search" })
  })
})

describe("SourceBuilder", () => {
  it("builds a source descriptor", () => {
    const source = new SourceBuilder()
      .key("accounts")
      .param("search", bind("$search"))
      .param("limit", 50)
      .build()

    expect(source).toEqual({
      key: "accounts",
      params: {
        search: { bind: "$search" },
        limit: 50,
      },
    })
  })
})
