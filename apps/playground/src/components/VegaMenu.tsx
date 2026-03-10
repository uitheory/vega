import { Children, isValidElement, Fragment, type ReactNode } from "react"
import {
  Tabs,
  Tab,
  Box,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from "@mui/material"
import type { MenuProps } from "vega"
import { useViewId } from "./VegaView"

export function VegaMenu({
  node,
  state,
  setState,
  children,
}: MenuProps & { children?: ReactNode }) {
  const parentId = useViewId()

  const p = node.props as Record<string, unknown> | undefined
  const items = (p?.items ?? []) as { key: string; label?: string; items?: { key: string; label?: string }[] }[]

  // Determine which state key controls the active item
  const stateKeys = Object.keys(node.state ?? {})
  const activeKey = stateKeys.length > 0 ? stateKeys[0]! : "$activeTab"

  // Flatten sections into a flat list of selectable items
  const flatItems = items.flatMap((item) =>
    item.items?.length ? item.items : [item],
  )

  const activeTab =
    (state[activeKey] as string) ??
    (node.state?.[activeKey] as string) ??
    flatItems[0]?.key ??
    ""

  // Filter children to show only active item's content
  const childArray = Children.toArray(children)
  const activeContent = childArray.filter((child) => {
    if (isValidElement(child)) {
      return (child.props as Record<string, unknown>)["data-item-key"] === activeTab
    }
    return false
  })

  // Sidebar mode (inside a shell)
  if (parentId === "shell") {
    return (
      <Box sx={{ display: "flex", height: "100%", width: "100%" }}>
        <Box
          sx={{
            width: 240,
            minWidth: 240,
            borderRight: 1,
            borderColor: "divider",
            overflow: "auto",
          }}
        >
          <List>
            {items.map((item) => {
              if (item.items?.length) {
                // Section with sub-items
                return (
                  <Fragment key={item.key}>
                    <ListSubheader sx={{ lineHeight: "32px", mt: 1 }}>
                      {item.label ?? item.key}
                    </ListSubheader>
                    {item.items.map((sub) => (
                      <ListItemButton
                        key={sub.key}
                        selected={sub.key === activeTab}
                        onClick={() => setState({ [activeKey]: sub.key })}
                        sx={{ pl: 3 }}
                      >
                        <ListItemText primary={sub.label ?? sub.key} />
                      </ListItemButton>
                    ))}
                  </Fragment>
                )
              }
              // Regular item
              return (
                <ListItemButton
                  key={item.key}
                  selected={item.key === activeTab}
                  onClick={() => setState({ [activeKey]: item.key })}
                >
                  <ListItemText primary={item.label ?? item.key} />
                </ListItemButton>
              )
            })}
          </List>
        </Box>
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          {activeContent}
        </Box>
      </Box>
    )
  }

  // Tabs mode (default)
  const activeIndex = flatItems.findIndex((item) => item.key === activeTab)

  return (
    <Box>
      <Tabs
        value={activeIndex >= 0 ? activeIndex : 0}
        onChange={(_, newIndex: number) => {
          const item = flatItems[newIndex]
          if (item) setState({ [activeKey]: item.key })
        }}
      >
        {flatItems.map((item) => (
          <Tab key={item.key} label={item.label ?? item.key} />
        ))}
      </Tabs>
      {activeContent.length > 0 && <Box sx={{ pt: 2 }}>{activeContent}</Box>}
    </Box>
  )
}
