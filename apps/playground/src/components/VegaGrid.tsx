import { createElement, type ComponentType } from "react"
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community"
import type { ColDef, ICellRendererParams, ValueFormatterParams } from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"
import type { GridProps, FieldProps, GridColumnNode } from "vega"

ModuleRegistry.registerModules([AllCommunityModule])

/** Wraps a vega field component as an AG Grid cellRenderer */
function createCellRenderer(
  Comp: ComponentType<FieldProps>,
  col: GridColumnNode,
  state: Record<string, unknown>,
  setState: (state: Partial<Record<string, unknown>>) => void,
) {
  const mapper = col.componentProps?._mapper as
    | ((data: unknown) => Record<string, unknown>)
    | undefined

  return (params: ICellRendererParams) => {
    const mappedProps = mapper ? mapper(params.data) : undefined
    return createElement(Comp, {
      node: {
        type: "field" as const,
        bind: col.field,
        component: col.component,
        componentProps: mappedProps,
      },
      context: { data: params.data },
      state,
      setState,
    })
  }
}

export function VegaGrid({ node, context, state, setState, components }: GridProps) {
  const rows = Array.isArray(context.data) ? context.data : []
  const compMap = (components ?? {}) as Record<string, ComponentType<FieldProps>>

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
      cellRenderer: Comp ? createCellRenderer(Comp, col, state, setState) : undefined,
      valueFormatter: col.valueFormatter
        ? (params: ValueFormatterParams) => col.valueFormatter!(params.value, params.data)
        : undefined,
      comparator: col.comparator
        ? (a: unknown, b: unknown) => col.comparator!(a, b)
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
