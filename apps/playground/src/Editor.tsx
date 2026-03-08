import { useCallback } from "react"
import MonacoEditor, { type OnMount } from "@monaco-editor/react"
import { Box } from "@mui/material"

interface EditorProps {
  code: string
  onChange: (code: string) => void
}

export function Editor({ code, onChange }: EditorProps) {
  const handleMount: OnMount = useCallback((_editor, monaco) => {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    })
  }, [])

  const handleChange = useCallback(
    (value: string | undefined) => {
      onChange(value ?? "")
    },
    [onChange],
  )

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <MonacoEditor
        height="100%"
        language="javascript"
        theme="vs-dark"
        value={code}
        onChange={handleChange}
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          automaticLayout: true,
          padding: { top: 16 },
        }}
      />
    </Box>
  )
}
