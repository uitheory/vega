import { describe, it, expect, vi } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useVegaSource } from "../src/index.js"
import type { SourceDescriptor } from "vega"

describe("useVegaSource", () => {
  it("returns initial state when no source provided", () => {
    const { result } = renderHook(() =>
      useVegaSource(undefined, {}, {}, {}),
    )

    expect(result.current.data).toBeUndefined()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("fetches data using the correct fetcher", async () => {
    const source: SourceDescriptor = {
      key: "accounts",
      params: { limit: 10 },
    }
    const mockFetcher = vi.fn().mockResolvedValue([{ name: "Acme" }])

    const { result } = renderHook(() =>
      useVegaSource(source, {}, {}, { accounts: mockFetcher }),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockFetcher).toHaveBeenCalledWith({ limit: 10 })
    expect(result.current.data).toEqual([{ name: "Acme" }])
    expect(result.current.error).toBeNull()
  })

  it("resolves $-prefixed binds from state", async () => {
    const source: SourceDescriptor = {
      key: "accounts",
      params: { search: { bind: "$search" } },
    }
    const mockFetcher = vi.fn().mockResolvedValue([])

    renderHook(() =>
      useVegaSource(
        source,
        { $search: "acme" },
        {},
        { accounts: mockFetcher },
      ),
    )

    await waitFor(() => {
      expect(mockFetcher).toHaveBeenCalledWith({ search: "acme" })
    })
  })

  it("resolves unprefixed binds from context", async () => {
    const source: SourceDescriptor = {
      key: "accounts",
      params: { orgId: { bind: "orgId" } },
    }
    const mockFetcher = vi.fn().mockResolvedValue([])

    renderHook(() =>
      useVegaSource(
        source,
        {},
        { orgId: "org-123" },
        { accounts: mockFetcher },
      ),
    )

    await waitFor(() => {
      expect(mockFetcher).toHaveBeenCalledWith({ orgId: "org-123" })
    })
  })

  it("handles fetch errors", async () => {
    const source: SourceDescriptor = {
      key: "accounts",
      params: {},
    }
    const mockFetcher = vi.fn().mockRejectedValue(new Error("Network error"))

    const { result } = renderHook(() =>
      useVegaSource(source, {}, {}, { accounts: mockFetcher }),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error!.message).toBe("Network error")
    expect(result.current.data).toBeUndefined()
  })

  it("wraps non-Error rejections in an Error", async () => {
    const source: SourceDescriptor = {
      key: "accounts",
      params: {},
    }
    const mockFetcher = vi.fn().mockRejectedValue("string error")

    const { result } = renderHook(() =>
      useVegaSource(source, {}, {}, { accounts: mockFetcher }),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error!.message).toBe("string error")
  })

  it("ignores stale responses after refetch", async () => {
    const source: SourceDescriptor = {
      key: "accounts",
      params: { search: { bind: "$search" } },
    }

    let resolveFirst!: (value: unknown) => void
    const firstPromise = new Promise((resolve) => { resolveFirst = resolve })
    const mockFetcher = vi
      .fn()
      .mockReturnValueOnce(firstPromise)
      .mockResolvedValueOnce([{ name: "Beta" }])

    const { result, rerender } = renderHook(
      ({ state }) =>
        useVegaSource(source, state, {}, { accounts: mockFetcher }),
      { initialProps: { state: { $search: "first" } as Record<string, unknown> } },
    )

    // Trigger a second fetch before first resolves
    rerender({ state: { $search: "second" } })

    await waitFor(() => {
      expect(result.current.data).toEqual([{ name: "Beta" }])
    })

    // Now resolve the stale first request — it should be ignored
    resolveFirst([{ name: "Stale" }])

    // Data should still be from the second request
    expect(result.current.data).toEqual([{ name: "Beta" }])
  })

  it("does nothing when fetcher key is not found", () => {
    const source: SourceDescriptor = {
      key: "unknown",
      params: {},
    }

    const { result } = renderHook(() =>
      useVegaSource(source, {}, {}, {}),
    )

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeUndefined()
  })

  it("refetches when bound state params change", async () => {
    const source: SourceDescriptor = {
      key: "accounts",
      params: { search: { bind: "$search" } },
    }
    const mockFetcher = vi
      .fn()
      .mockResolvedValueOnce([{ name: "Acme" }])
      .mockResolvedValueOnce([{ name: "Beta" }])

    const { result, rerender } = renderHook(
      ({ state }) =>
        useVegaSource(source, state, {}, { accounts: mockFetcher }),
      { initialProps: { state: { $search: "acme" } as Record<string, unknown> } },
    )

    await waitFor(() => {
      expect(result.current.data).toEqual([{ name: "Acme" }])
    })

    rerender({ state: { $search: "beta" } })

    await waitFor(() => {
      expect(result.current.data).toEqual([{ name: "Beta" }])
    })

    expect(mockFetcher).toHaveBeenCalledTimes(2)
  })
})
