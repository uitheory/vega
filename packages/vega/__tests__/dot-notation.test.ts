import { describe, it, expectTypeOf } from "vitest"
import type { DotNotation } from "../src/index.js"

type Account = {
  name: string
  arr: number
  active: boolean
  owner: {
    first: string
    last: string
    address: {
      city: string
      state: string
    }
  }
  tags: string[]
}

describe("DotNotation type", () => {
  it("produces correct paths for nested types", () => {
    type Paths = DotNotation<Account>

    // Valid paths
    expectTypeOf<"name">().toMatchTypeOf<Paths>()
    expectTypeOf<"arr">().toMatchTypeOf<Paths>()
    expectTypeOf<"active">().toMatchTypeOf<Paths>()
    expectTypeOf<"owner">().toMatchTypeOf<Paths>()
    expectTypeOf<"owner.first">().toMatchTypeOf<Paths>()
    expectTypeOf<"owner.last">().toMatchTypeOf<Paths>()
    expectTypeOf<"owner.address">().toMatchTypeOf<Paths>()
    expectTypeOf<"owner.address.city">().toMatchTypeOf<Paths>()
    expectTypeOf<"owner.address.state">().toMatchTypeOf<Paths>()
    expectTypeOf<"tags">().toMatchTypeOf<Paths>()
  })

  it("rejects invalid paths", () => {
    type Paths = DotNotation<Account>

    expectTypeOf<"invalid">().not.toMatchTypeOf<Paths>()
    expectTypeOf<"owner.invalid">().not.toMatchTypeOf<Paths>()
    expectTypeOf<"name.deep">().not.toMatchTypeOf<Paths>()
  })
})
