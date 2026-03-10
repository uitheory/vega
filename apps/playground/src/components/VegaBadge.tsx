import { Chip } from "@mui/material"

export function VegaBadge({ label, color }: { label?: string; color?: string }) {
  return (
    <Chip
      label={label ?? ""}
      color={(color ?? "default") as "default" | "success" | "warning" | "error"}
      size="small"
    />
  )
}
