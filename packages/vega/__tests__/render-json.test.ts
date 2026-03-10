import { describe, it, expect } from "vitest"
import { renderToJson } from "../src/test.js"
import { ui, bind } from "../src/index.js"

type Account = {
  name: string
  arr: number
  owner: { first: string; last: string }
}

describe("renderToJson", () => {
  it("renders a view builder to a node tree", () => {
    const builder = ui.View.create()
      .direction("column")
      .gap(8)
      .child(ui.Label.create({ text: "Hello" }))

    const json = renderToJson(builder)

    expect(json).toEqual({
      type: "component",
      name: "view",
      props: {
        direction: "column",
        gap: 8,
      },
      children: [
        { type: "component", name: "label", props: { text: "Hello" }, events: ["onClick"] },
      ],
    })
  })

  it("passes through a pre-built node", () => {
    const node = ui.View.create().direction("row").build()
    const json = renderToJson(node)
    expect(json).toEqual({ type: "component", name: "view", props: { direction: "row" } })
  })

})
