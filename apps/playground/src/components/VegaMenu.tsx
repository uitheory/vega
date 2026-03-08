import { Tabs, Tab, Box } from "@mui/material"
import type { MenuProps } from "vega"
import type { ReactNode } from "react"

export function VegaMenu({
  node,
  state,
  setState,
  children,
}: MenuProps & { children?: ReactNode }) {
  const activeTab = (state.$activeTab as string) ?? node.items[0]?.key ?? ""
  const activeIndex = node.items.findIndex((item) => item.key === activeTab)

  return (
    <Box>
      <Tabs
        value={activeIndex >= 0 ? activeIndex : 0}
        onChange={(_, newIndex: number) => {
          const item = node.items[newIndex]
          if (item) setState({ $activeTab: item.key })
        }}
      >
        {node.items.map((item) => (
          <Tab key={item.key} label={item.label ?? item.key} />
        ))}
      </Tabs>
      {children && <Box sx={{ pt: 2 }}>{children}</Box>}
    </Box>
  )
}
