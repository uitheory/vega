import type { SourceDescriptor, SourceParam } from "../types/nodes.js"

/**
 * Creates a binding reference for use in source params.
 *
 * @example
 * ```ts
 * bind("$search") // { bind: "$search" }
 * ```
 */
export function bind(path: string): { bind: string } {
  return { bind: path }
}

/** Fluent builder for constructing a {@link SourceDescriptor} */
export class SourceBuilder {
  private _key = ""
  private _params: Record<string, SourceParam> = {}

  /** Set the source key (identifies which fetcher to call) */
  key(key: string): this {
    this._key = key
    return this
  }

  /** Add a parameter to the source descriptor */
  param(name: string, value: SourceParam): this {
    this._params[name] = value
    return this
  }

  /** Build the source descriptor */
  build(): SourceDescriptor {
    return {
      key: this._key,
      params: { ...this._params },
    }
  }
}
