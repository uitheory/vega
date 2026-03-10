import { createContext, useContext, type ReactNode } from "react"
import { Box, Card, CardContent, Drawer, IconButton } from "@mui/material"
import type { ViewProps } from "vega"

export const VegaViewIdContext = createContext<string | undefined>(undefined)
export const useViewId = () => useContext(VegaViewIdContext)

/** True when rendered inside a shell — lets panels render as drawers */
export const VegaShellContext = createContext(false)

export function VegaView({ node, state, setState, children }: ViewProps & { children?: ReactNode }) {
  const id = node.id
  const isInShell = useContext(VegaShellContext)

  if (id === "shell") {
    return (
      <VegaShellContext.Provider value={true}>
        <VegaViewIdContext.Provider value={id}>
          <Box sx={{ display: "flex", flexDirection: "row", height: "100%" }}>
            {children}
          </Box>
        </VegaViewIdContext.Provider>
      </VegaShellContext.Provider>
    )
  }

  if (id === "panel" && isInShell) {
    const isOpen = state?.$panelOpen === true

    return (
      <VegaViewIdContext.Provider value={id}>
        <Drawer
          anchor="right"
          open={isOpen}
          variant="temporary"
          onClose={() => setState({ $panelOpen: false })}
          PaperProps={{ sx: { width: 480 } }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
            <IconButton onClick={() => setState({ $panelOpen: false })} size="small" aria-label="close">
              ✕
            </IconButton>
          </Box>
          <Box sx={{ px: 2, pb: 2 }}>
            {children}
          </Box>
        </Drawer>
      </VegaViewIdContext.Provider>
    )
  }

  if (id === "panel") {
    return (
      <VegaViewIdContext.Provider value={id}>
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {children}
        </Box>
      </VegaViewIdContext.Provider>
    )
  }

  return (
    <VegaViewIdContext.Provider value={id}>
      <Card variant="outlined" sx={{ my: 1 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: (node.props?.direction as string) ?? "column",
              gap: node.props?.gap ? `${node.props.gap}px` : 1,
            }}
          >
            {children}
          </Box>
        </CardContent>
      </Card>
    </VegaViewIdContext.Provider>
  )
}
