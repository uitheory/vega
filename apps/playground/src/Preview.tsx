import { Box, Typography, Alert } from "@mui/material"
import type { AnyNode } from "vega"
import { renderer } from "./renderer"

interface PreviewProps {
  node: AnyNode<string> | null
  error: string | null
  data: unknown
  state: Record<string, unknown>
  setState: (partial: Partial<Record<string, unknown>>) => void
}

export function Preview({ node, error, data, state, setState }: PreviewProps) {
  if (error) {
    return (
      <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
        <Alert
          severity="error"
          sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
        >
          {error}
        </Alert>
      </Box>
    )
  }

  if (!node) {
    return (
      <Box
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">
          Enter builder code in the editor to see a preview.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
      {renderer.render(
        node as AnyNode<"label" | "badge">,
        { data, state, setState },
      )}
    </Box>
  )
}
