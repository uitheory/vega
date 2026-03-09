import { Button } from "@mui/material"
import type { FieldProps } from "vega"

export function VegaButton({ node, setState }: FieldProps) {
  const label = node.label ?? "Click"
  const stateKey = (node as Record<string, unknown>).stateKey as string | undefined

  return (
    <Button
      variant="contained"
      size="small"
      onClick={() => {
        if (stateKey) setState({ [stateKey]: true })
      }}
    >
      {label}
    </Button>
  )
}
