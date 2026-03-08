import { Typography, Box } from "@mui/material"
import type { FieldProps } from "vega"

export function VegaLabel({ node, context }: FieldProps) {
  const data = context.data as Record<string, unknown> | undefined
  const value = data ? getNestedValue(data, node.bind) : undefined

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      {node.label && (
        <Typography variant="body2" color="text.secondary">
          {node.label}:
        </Typography>
      )}
      <Typography variant="body1">{String(value ?? "")}</Typography>
    </Box>
  )
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key]
    return undefined
  }, obj)
}
