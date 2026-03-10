import { defineComponent } from "./builders/component.js"

/** Base event props shared by all components */
type ClickEvent = { onClick?: Record<string, unknown> }

/** Text display component */
export const Label = defineComponent<"label", { text: string | number } & ClickEvent>(
  "label",
  { events: ["onClick"] },
)

/** Interactive button component */
export const Button = defineComponent<
  "button",
  {
    label: string
    variant?: "primary" | "secondary" | "ghost"
    disabled?: boolean
  } & ClickEvent
>("button", { events: ["onClick"] })

/** Text input component */
export const Input = defineComponent<
  "input",
  {
    value: string
    placeholder?: string
    type?: "text" | "number" | "email" | "password"
  } & ClickEvent
>("input", { events: ["onClick"] })

/** Status indicator component */
export const Badge = defineComponent<
  "badge",
  {
    label: string
    color?: string
    variant?: "solid" | "outline" | "subtle"
  } & ClickEvent
>("badge", { events: ["onClick"] })

/** Image display component */
export const Image = defineComponent<
  "image",
  {
    src: string
    alt?: string
    width?: number
    height?: number
  } & ClickEvent
>("image", { events: ["onClick"] })

/** Icon display component */
export const Icon = defineComponent<
  "icon",
  {
    name: string
    size?: number
    color?: string
  } & ClickEvent
>("icon", { events: ["onClick"] })
