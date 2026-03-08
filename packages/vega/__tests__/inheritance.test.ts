import { describe, it, expect } from "vitest";
import { ui, bind } from "../src/index.js";

type Account = {
  name: string;
  arr: number;
  health_score: number;
};

describe("View inheritance", () => {
  const baseView = ui.View.create<Account>()
    .layout("grid")
    .state({ $search: "" })
    .source((s) => s.key("accounts").param("search", bind("$search")))
    .field((f) => f.bind("name").label("Account Name"))
    .field((f) => f.bind("arr").label("ARR"))
    .field((f) => f.bind("health_score").label("Health"))
    .build();

  it("extends a base view preserving all properties", () => {
    const derived = ui.View.create<Account>().extends(baseView).build();

    expect(derived.layout).toBe("grid");
    expect(derived.state).toEqual({ $search: "" });
    expect(derived.source?.key).toBe("accounts");
    expect(derived.children).toHaveLength(3);
  });

  it("allows overriding layout in derived view", () => {
    const derived = ui.View.create<Account>()
      .layout("stack")
      .extends(baseView)
      .build();

    expect(derived.layout).toBe("stack");
  });

  it("removes a field by bind key", () => {
    const derived = ui.View.create<Account>()
      .extends(baseView)
      .remove("health_score")
      .build();

    expect(derived.children).toHaveLength(2);
    expect(
      derived.children!.find(
        (c) => c.type === "field" && c.bind === "health_score",
      ),
    ).toBeUndefined();
  });

  it("replaces a field by bind key", () => {
    const derived = ui.View.create<Account>()
      .extends(baseView)
      .replace("arr", (f) => f.label("Revenue"))
      .build();

    const arrField = derived.children!.find(
      (c) => c.type === "field" && c.bind === "arr",
    );
    expect(arrField).toBeDefined();
    if (arrField?.type === "field") {
      expect(arrField.label).toBe("Revenue");
    }
  });

  it("does not mutate the base view", () => {
    const _derived = ui.View.create<Account>()
      .extends(baseView)
      .remove("health_score")
      .replace("arr", (f) => f.label("Revenue"))
      .build();

    // Base should be unchanged
    expect(baseView.children).toHaveLength(3);
    const baseArr = baseView.children!.find(
      (c) => c.type === "field" && c.bind === "arr",
    );
    if (baseArr?.type === "field") {
      expect(baseArr.label).toBe("ARR");
    }
  });
});
