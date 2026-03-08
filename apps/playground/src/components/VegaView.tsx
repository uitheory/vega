import { Box, Card, CardContent } from "@mui/material"
import type { ViewProps } from "vega"
import type { ReactNode } from "react"

export function VegaView({ children }: ViewProps & { children?: ReactNode }) {
  return (
    <Card variant="outlined" sx={{ my: 1 }}>
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  )
}
