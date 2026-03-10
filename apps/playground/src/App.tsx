import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { Box, Tabs, Tab, Typography } from "@mui/material"
import { ui, bind } from "vega"
import type { AnyNode } from "vega"
import { GridBuilder } from "vega-constructs"
import { useVegaState } from "vega-react"
import { Editor } from "./Editor"
import { Preview } from "./Preview"
import { examples, healthLabel, healthColor } from "./config/accounts"

const DEBOUNCE_MS = 300

function evaluateCode(code: string): AnyNode<string> {
  const fn = new Function("ui", "bind", "Grid", "healthLabel", "healthColor", "return (\n" + code + "\n)")
  const result = fn(ui, bind, GridBuilder, healthLabel, healthColor)

  if (!result || typeof result !== "object" || !("type" in result)) {
    throw new Error(
      "Code must return a Vega node (an object with a `type` property).\n" +
        "Make sure your code ends with .build()",
    )
  }

  return result as AnyNode<string>
}

export default function App() {
  const [exampleIndex, setExampleIndex] = useState(0)
  const [code, setCode] = useState(examples[0]!.defaultCode)
  const [node, setNode] = useState<AnyNode<string> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useVegaState({ $search: "", $activeTab: "details", $panelTab: "overview", $panelOpen: false })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentExample = examples[exampleIndex]!

  const evaluate = useCallback((source: string) => {
    try {
      const result = evaluateCode(source)
      setNode(result)
      setError(null)
    } catch (err) {
      setNode(null)
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [])

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => evaluate(newCode), DEBOUNCE_MS)
    },
    [evaluate],
  )

  const handleExampleChange = useCallback(
    (_: React.SyntheticEvent, newIndex: number) => {
      setExampleIndex(newIndex)
      const newCode = examples[newIndex]!.defaultCode
      setCode(newCode)
      evaluate(newCode)
    },
    [evaluate],
  )

  // Initial evaluation
  useEffect(() => {
    evaluate(code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const data = useMemo(() => currentExample.getData(), [currentExample])

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexShrink: 0,
        }}
      >
        <Typography variant="h6" sx={{ whiteSpace: "nowrap" }}>
          Vega Playground
        </Typography>
        <Tabs
          value={exampleIndex}
          onChange={handleExampleChange}
          sx={{ minHeight: 0 }}
        >
          {examples.map((ex) => (
            <Tab key={ex.key} label={ex.label} sx={{ minHeight: 0, py: 1 }} />
          ))}
        </Tabs>
      </Box>

      {/* Split panel */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Box
          sx={{
            flex: 1,
            borderRight: 1,
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Editor code={code} onChange={handleCodeChange} />
        </Box>
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <Preview
            node={node}
            error={error}
            data={data}
            state={state}
            setState={setState}
          />
        </Box>
      </Box>
    </Box>
  )
}
