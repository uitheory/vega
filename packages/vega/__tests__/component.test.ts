import { describe, it, expect } from "vitest"
import { z } from "zod"
import { ui } from "../src/index.js"
import { resolveComponentProps } from "../src/resolve-props.js"

describe("Component.define", () => {
  it("creates a schema-less component definition", () => {
    const Label = ui.Component.define("label") as ReturnType<typeof ui.Component.define>
    expect(Label.name).toBe("label")
    expect(Label._brand).toBe("ComponentDef")
    expect(Label.schema).toBeUndefined()
  })

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

  it("can be used in a view builder via .child(def.create())", () => {
    type Vuln = { severity: string; title: string }

    const Badge = ui.Component.define(
      "badge",
      z.object({
        value: z.string(),
        color: z.enum(["red", "green", "yellow"]),
      }),
    )

    const severityValue = ui.Fn.create("test:severity-value", (data: Vuln) => data.severity)
    const severityColor = ui.Fn.create("test:severity-color", (data: Vuln) =>
      data.severity === "critical"
        ? ("red" as const)
        : ("green" as const),
    )

    const node = ui.View.create<Vuln>()
      .child(Badge.create({
        value: severityValue,
        color: severityColor,
      }))
      .build()

    const comp = node.children![0]!
    expect(comp).toMatchObject({
      type: "component",
      name: "badge",
    })
    if (comp.type === "component") {
      expect(comp.props).toBeDefined()
      expect(ui.Fn.is(comp.props!.value)).toBe(true)
      expect(ui.Fn.is(comp.props!.color)).toBe(true)
    }
  })

  it("can be used in a grid column with typed props", () => {
    type Account = { name: string; arr: number }

    const Currency = ui.Component.define(
      "currency",
      z.object({
        amount: z.number(),
        currency: z.string(),
      }),
    )

    const amountFn = ui.Fn.create("test:amount", (data: Account) => data.arr)

    const grid = ui.Grid.create<Account>()
      .column("name").label("Account")
      .column("arr").label("Revenue").component(Currency, {
        amount: amountFn,
        currency: "USD",
      })
      .build()

    expect(grid.columns).toHaveLength(2)
    expect(grid.columns[1]).toMatchObject({
      field: "arr",
      label: "Revenue",
      component: "currency",
    })
    expect(ui.Fn.is(grid.columns[1]!.componentProps!.amount)).toBe(true)
    expect(grid.columns[1]!.componentProps!.currency).toBe("USD")
  })

  it("supports string name with untyped props", () => {
    const statusLabel = ui.Fn.create(
      "test:status-label",
      (data: Record<string, string>) => data.status,
    )

    const grid = ui.Grid.create()
      .column("status").label("Status").component("badge", {
        label: statusLabel,
        size: "small",
      })
      .build()

    expect(grid.columns[0]).toMatchObject({
      field: "status",
      label: "Status",
      component: "badge",
    })
    expect(ui.Fn.is(grid.columns[0]!.componentProps!.label)).toBe(true)
    expect(grid.columns[0]!.componentProps!.size).toBe("small")
  })
})

describe("ComponentDef.create", () => {
  it("creates a ComponentNode with props", () => {
    const node = ui.Label.create({ text: "Hello" })
    expect(node).toEqual({
      type: "component",
      name: "label",
      props: { text: "Hello" },
    })
  })

  it("creates a ComponentNode with id and props", () => {
    const node = ui.Label.create("my-label", { text: "Hello" })
    expect(node).toEqual({
      type: "component",
      name: "label",
      id: "my-label",
      props: { text: "Hello" },
    })
  })

  it("creates a ComponentNode with no props", () => {
    const node = ui.Label.create()
    expect(node).toEqual({
      type: "component",
      name: "label",
    })
  })

  it("includes events from definition", () => {
    const node = ui.Button.create({ label: "Click", onClick: { $open: true } })
    expect(node).toEqual({
      type: "component",
      name: "button",
      props: { label: "Click", onClick: { $open: true } },
      events: ["onClick"],
    })
  })

  it("creates a reusable node variable", () => {
    const openBtn = ui.Button.create({ label: "Open", onClick: { $panelOpen: true } })
    const node = ui.View.create()
      .child(openBtn)
      .build()

    expect(node.children).toHaveLength(1)
    expect(node.children![0]).toMatchObject({
      type: "component",
      name: "button",
      props: { label: "Open", onClick: { $panelOpen: true } },
    })
  })
})

describe("resolveComponentProps", () => {
  it("resolves VegaFn-valued props with data", () => {
    const labelFn = ui.Fn.create(
      "test:resolve-label",
      (data: { name: string }) => data.name,
    )
    const props = {
      label: labelFn,
      size: "small",
    }
    const result = resolveComponentProps(props, { name: "Acme" })
    expect(result).toEqual({ label: "Acme", size: "small" })
  })

  it("returns undefined for undefined props", () => {
    expect(resolveComponentProps(undefined, {})).toBeUndefined()
  })

  it("passes through all-static props unchanged", () => {
    const props = { label: "Hello", color: "red" }
    const result = resolveComponentProps(props, {})
    expect(result).toEqual({ label: "Hello", color: "red" })
  })
})
