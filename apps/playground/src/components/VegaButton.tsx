import { Button } from "@mui/material"

export function VegaButton({ label, onClick }: { label?: string; onClick?: () => void }) {
  return (
    <Button variant="contained" size="small" onClick={onClick}>
      {label ?? "Click"}
    </Button>
  )
}
