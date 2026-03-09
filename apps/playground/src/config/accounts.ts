import { ui, fn } from "vega";

export const healthLabel = fn(
  "account:health-label",
  (data: { health: string }) => data.health,
);
export const healthColor = fn(
  "account:health-color",
  (data: { health: string }) =>
    data.health === "good"
      ? "success"
      : data.health === "at-risk"
        ? "error"
        : "warning",
);

export interface Account {
  id: string;
  name: string;
  arr: number;
  health: string;
  owner: {
    first: string;
    last: string;
  };
}

export const fakeAccounts: Account[] = [
  {
    id: "1",
    name: "Acme Corp",
    arr: 120000,
    health: "good",
    owner: { first: "Alice", last: "Smith" },
  },
  {
    id: "2",
    name: "Globex Inc",
    arr: 85000,
    health: "at-risk",
    owner: { first: "Bob", last: "Jones" },
  },
  {
    id: "3",
    name: "Initech",
    arr: 340000,
    health: "good",
    owner: { first: "Carol", last: "Lee" },
  },
  {
    id: "4",
    name: "Umbrella Co",
    arr: 52000,
    health: "churned",
    owner: { first: "Dan", last: "Kim" },
  },
  {
    id: "5",
    name: "Stark Industries",
    arr: 990000,
    health: "good",
    owner: { first: "Eve", last: "Park" },
  },
];

// View config: detail panel for a single account
export const accountViewConfig = ui.View.create<Account>()
  .direction("column")
  .gap(8)
  .component("label", { text: "Account Name" })
  .component("label", { text: "Owner" })
  .component("badge", { label: "Health" })
  .build();

// Grid config: list of accounts
export const accountGridConfig = ui.Grid.create<Account>()
  .column("name")
  .label("Account")
  .sortable()
  .column("arr")
  .label("ARR")
  .sortable()
  .format(ui.Fn.Formatters.currency)
  .comparator(ui.Fn.Comparators.number)
  .column("health")
  .label("Health")
  .sortable()
  .component("badge", {
    label: healthLabel,
    color: healthColor,
  })
  .column("owner.first")
  .label("Owner")
  .defaultSort("health", "asc")
  .defaultSort("name", "asc")
  .pageSize(10)
  .build();

// Menu config: tabbed navigation
export const accountMenuConfig = ui.Menu.create()
  .item("details", (i) => i.label("Details"))
  .item("health", (i) => i.label("Health"))
  .item("contacts", (i) => i.label("Contacts"))
  .build();

// --- Playground examples with editable code strings ---

export interface PlaygroundExample {
  key: string;
  label: string;
  defaultCode: string;
  getData: () => unknown;
}

export const examples: PlaygroundExample[] = [
  {
    key: "view",
    label: "View",
    defaultCode: `ui.View.create()
  .direction("column")
  .gap(8)
  .component("label", { text: "Account Name" })
  .component("label", { text: "Owner" })
  .component("badge", { label: "Health" })
  .build()`,
    getData: () => fakeAccounts[0],
  },
  {
    key: "grid",
    label: "Grid",
    defaultCode: `ui.Grid.create()
  .column("name").label("Account").sortable()
  .column("arr").label("ARR").sortable()
    .format(ui.Fn.Formatters.currency)
    .comparator(ui.Fn.Comparators.number)
  .column("health").label("Health").sortable().component("badge", {
    label: healthLabel,
    color: healthColor,
  })
  .column("owner.first").label("Owner")
  .defaultSort("health", "desc")
  .defaultSort("name", "asc")
  .pageSize(50)
  .build()`,
    getData: () => fakeAccounts,
  },
  {
    key: "menu",
    label: "Menu",
    defaultCode: `ui.Menu.create()
  .item("details", (i) => i.label("Details"))
  .item("health", (i) => i.label("Health"))
  .item("contacts", (i) => i.label("Contacts"))
  .build()`,
    getData: () => fakeAccounts[0],
  },
  {
    key: "shell",
    label: "Shell",
    defaultCode: `ui.View.create("shell")
  .direction("row")
  .child(
    ui.Menu.create()
      .item("accounts", (i) => i.label("Accounts")
        .child(
          ui.Grid.create("accounts-grid")
            .column("name").label("Account").sortable()
            .column("arr").label("ARR").sortable()
            .column("health").label("Health").sortable()
            .column("owner.first").label("Owner")
            .defaultSort("name", "asc")
            .pageSize(10)
            .build()
        )
      )
      .item("pipeline", (i) => i.label("Pipeline")
        .child(
          ui.View.create()
            .direction("column")
            .gap(8)
            .component("label", { text: "Pipeline details" })
            .component("button", { label: "Open Pipeline", stateKey: "$panelOpen" })
            .child(
              ui.View.create("panel")
                .direction("column")
                .child(
                  ui.Menu.create()
                    .state({ $panelTab: "overview" })
                    .item("overview", (i) => i.label("Overview")
                      .child(
                        ui.View.create()
                          .direction("column")
                          .gap(8)
                          .component("label", { text: "Pipeline Overview" })
                          .component("badge", { label: "Q1 2024" })
                          .component("label", { text: "Total pipeline value: $2.4M" })
                          .build()
                      )
                    )
                    .item("forecast", (i) => i.label("Forecast")
                      .child(
                        ui.View.create()
                          .direction("column")
                          .gap(8)
                          .component("label", { text: "Revenue Forecast" })
                          .component("label", { text: "$1.2M projected this quarter" })
                          .component("badge", { label: "On Track" })
                          .build()
                      )
                    )
                    .build()
                )
                .build()
            )
            .build()
        )
      )
      .section("admin", (s) => s.label("Admin")
        .item("settings", (i) => i.label("Settings")
          .child(
            ui.View.create()
              .direction("column")
              .gap(8)
              .component("label", { text: "Application Settings" })
              .component("label", { text: "Configure your workspace preferences" })
              .build()
          )
        )
        .item("users", (i) => i.label("Users")
          .child(
            ui.View.create()
              .direction("column")
              .gap(8)
              .component("label", { text: "User Management" })
              .component("badge", { label: "5 active users" })
              .build()
          )
        )
      )
      .build()
  )
  .build()`,
    getData: () => fakeAccounts,
  },
];
