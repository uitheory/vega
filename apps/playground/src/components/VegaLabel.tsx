import { Typography } from "@mui/material"

export function VegaLabel({ text }: { text?: string | number }) {
  return <Typography variant="body1">{String(text ?? "")}</Typography>
}
