import { Chip } from "@mui/material"
import type { FieldProps } from "vega"

export function VegaBadge({ node, context }: FieldProps) {
  const props = node.componentProps as Record<string, string> | undefined

  // If mapper provided componentProps, use them directly
  if (props?.label !== undefined) {
    const color = (props.color ?? "default") as "default" | "success" | "warning" | "error"
    return <Chip label={props.label} color={color} size="small" />
  }

  // Fallback: resolve value from data via node.bind
  const data = context.data as Record<string, unknown> | undefined
  const value = data ? String(data[node.bind] ?? "") : ""
  return <Chip label={value} color={mapColor(value)} size="small" />
}

function mapColor(
  value: string,
): "default" | "success" | "warning" | "error" {
  switch (value) {
    case "good":
      return "success"
    case "at-risk":
      return "error"
    case "churned":
      return "warning"
    default:
      return "default"
  }
}
