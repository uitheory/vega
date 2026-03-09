import { createRenderer } from "vega-react"
import { VegaView, VegaLabel, VegaBadge, VegaButton, VegaGrid, VegaMenu } from "./components"

export const renderer = createRenderer({
  view: VegaView,
  grid: VegaGrid,
  menu: VegaMenu,
  components: {
    label: VegaLabel,
    badge: VegaBadge,
    button: VegaButton,
  },
})
