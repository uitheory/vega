import { defineConfig } from "vitepress"

export default defineConfig({
  title: "Vega",
  description: "Fluent builder API for serializable UI configuration trees",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Architecture", link: "/guide/architecture" },
        ],
      },
      {
        text: "Core Concepts",
        items: [
          { text: "Views", link: "/guide/views" },
          { text: "Grids", link: "/guide/grids" },
          { text: "Menus", link: "/guide/menus" },
          { text: "Components", link: "/guide/components" },
          { text: "Functions (VegaFn)", link: "/guide/functions" },
          { text: "Serialization", link: "/guide/serialization" },
        ],
      },
      {
        text: "React",
        items: [
          { text: "Renderer", link: "/guide/react-renderer" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/uitheory/vega" },
    ],
  },
})
