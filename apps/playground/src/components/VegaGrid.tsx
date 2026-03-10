import { createElement, type ComponentType } from "react"
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community"
import type { ColDef, ICellRendererParams, ValueFormatterParams } from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"
import { resolveComponentProps, type GridProps, type GridColumnNode } from "vega"

ModuleRegistry.registerModules([AllCommunityModule])

/** Wraps a vega component as an AG Grid cellRenderer with flat resolved props */
function createCellRenderer(
  Comp: ComponentType<any>,
  col: GridColumnNode,
) {
  return (params: ICellRendererParams) => {
    const resolved = resolveComponentProps(col.componentProps, params.data) ?? {}
    return createElement(Comp, resolved)
  }
}

export function VegaGrid({ node, context, state, setState, components }: GridProps) {
  const rows = Array.isArray(context.data) ? context.data : []
  const compMap = (components ?? {}) as Record<string, ComponentType<any>>

  const colDefs: ColDef[] = node.columns.map((col) => {
    const sortEntry = node.defaultSort?.find((s) => s.field === col.field)
    const sortIndex = node.defaultSort?.findIndex((s) => s.field === col.field) ?? -1
    const Comp = col.component ? compMap[col.component] : undefined
    return {
      field: col.field,
      headerName: col.label ?? col.field,
      sortable: col.sortable ?? false,
      width: col.width,
      pinned: col.pinned,
      sort: sortEntry
        ? sortEntry.direction === "desc"
          ? ("desc" as const)
          : ("asc" as const)
        : undefined,
      sortIndex: sortIndex >= 0 && (node.defaultSort?.length ?? 0) > 1 ? sortIndex : undefined,
      cellRenderer: Comp ? createCellRenderer(Comp, col) : undefined,
      valueFormatter: typeof col.format === "function"
        ? (params: ValueFormatterParams) => (col.format as (value: unknown, data: unknown) => string)(params.value, params.data)
        : undefined,
      comparator: col.comparator
        ? (a: unknown, b: unknown) => {
            const result = col.comparator!(a, b)
            return col.invertSort ? -result : result
          }
        : undefined,
    }
  })

  return (
    <div style={{ height: 300, width: "100%" }}>
      <AgGridReact
        rowData={rows as Record<string, unknown>[]}
        columnDefs={colDefs}
        pagination={!!node.pageSize}
        paginationPageSize={node.pageSize}
        defaultColDef={{ flex: 1, minWidth: 100 }}
      />
    </div>
  )
}
