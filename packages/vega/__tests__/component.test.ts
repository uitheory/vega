import { describe, it, expect } from "vitest"
import { z } from "zod"
import { ui } from "../src/index.js"

describe("Component.define", () => {
  it("creates a component definition with typed schema", () => {
    const Badge = ui.Component.define(
      "badge",
      z.object({
        value: z.string(),
        color: z.enum(["red", "green", "yellow"]),
      }),
    )

    expect(Badge.name).toBe("badge")
    expect(Badge._brand).toBe("ComponentDef")
  })

  it("can be used in a field builder with typed mapper", () => {
    type Vuln = { severity: string; title: string }

    const Badge = ui.Component.define(
      "badge",
      z.object({
        value: z.string(),
        color: z.enum(["red", "green", "yellow"]),
      }),
    )

    const node = ui.View.create<Vuln>()
      .field((f) =>
        f
          .bind("severity")
          .label("Severity")
          .component(Badge, (data) => ({
            value: data.severity,
            color:
              data.severity === "critical"
                ? ("red" as const)
                : ("green" as const),
          })),
      )
      .build()

    const field = node.children![0]!
    expect(field).toMatchObject({
      type: "field",
      bind: "severity",
      label: "Severity",
      component: "badge",
    })
    // Mapper is stored in componentProps for the renderer
    expect(field.type).toBe("field")
  })

  it("can be used in a grid column with typed mapper", () => {
    type Account = { name: string; arr: number }

    const Currency = ui.Component.define(
      "currency",
      z.object({
        amount: z.number(),
        currency: z.string(),
      }),
    )

    const grid = ui.Grid.create<Account>()
      .column("name").label("Account")
      .column("arr").label("Revenue").component(Currency, (data) => ({
        amount: data.arr,
        currency: "USD",
      }))
      .build()

    expect(grid.columns).toHaveLength(2)
    expect(grid.columns[1]).toMatchObject({
      field: "arr",
      label: "Revenue",
      component: "currency",
    })
  })
})
