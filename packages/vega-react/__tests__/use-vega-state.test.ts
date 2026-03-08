import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useVegaState } from "../src/index.js"

describe("useVegaState", () => {
  it("initializes with provided state", () => {
    const { result } = renderHook(() =>
      useVegaState({ $search: "", $page: 1 }),
    )

    expect(result.current[0]).toEqual({ $search: "", $page: 1 })
  })

  it("initializes with empty object when no state provided", () => {
    const { result } = renderHook(() => useVegaState())

    expect(result.current[0]).toEqual({})
  })

  it("merges partial updates", () => {
    const { result } = renderHook(() =>
      useVegaState({ $search: "", $page: 1, $filter: "all" }),
    )

    act(() => {
      result.current[1]({ $search: "test" })
    })

    expect(result.current[0]).toEqual({
      $search: "test",
      $page: 1,
      $filter: "all",
    })
  })

  it("handles multiple sequential updates", () => {
    const { result } = renderHook(() =>
      useVegaState({ $search: "", $page: 1 }),
    )

    act(() => {
      result.current[1]({ $search: "foo" })
    })
    act(() => {
      result.current[1]({ $page: 2 })
    })

    expect(result.current[0]).toEqual({ $search: "foo", $page: 2 })
  })
})
