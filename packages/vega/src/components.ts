import { defineComponent } from "./builders/component.js"

/** Text display component */
export const Label = defineComponent<"label", { text: string | number }>("label")

/** Interactive button component */
export const Button = defineComponent<
  "button",
  {
    label: string
    variant?: "primary" | "secondary" | "ghost"
    disabled?: boolean
  }
>("button")

/** Text input component */
export const Input = defineComponent<
  "input",
  {
    value: string
    placeholder?: string
    type?: "text" | "number" | "email" | "password"
  }
>("input")

/** Status indicator component */
export const Badge = defineComponent<
  "badge",
  {
    label: string
    color?: string
    variant?: "solid" | "outline" | "subtle"
  }
>("badge")

/** Image display component */
export const Image = defineComponent<
  "image",
  {
    src: string
    alt?: string
    width?: number
    height?: number
  }
>("image")

/** Icon display component */
export const Icon = defineComponent<
  "icon",
  {
    name: string
    size?: number
    color?: string
  }
>("icon")
